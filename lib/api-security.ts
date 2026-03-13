import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from './supabase-server'
import { createAdminClient } from './supabase-admin'

export const ADMIN_PERMISSION_MAP = {
  super_admin: ['*'],
  moderator: ['campaigns.review', 'verification.review', 'reports.read'],
  finance: ['donations.read', 'payments.manage', 'payouts.manage', 'reports.read'],
  content_editor: ['content.manage', 'media.manage', 'reports.read'],
  support: ['support.manage', 'disputes.manage', 'users.read'],
} as const

type AdminRole = keyof typeof ADMIN_PERMISSION_MAP

function hasPermission(role: AdminRole, permission: string): boolean {
  const perms = [...(ADMIN_PERMISSION_MAP[role] ?? [])] as string[]
  return perms.includes('*') || perms.includes(permission)
}

// ─── Input sanitisation ──────────────────────────────────────────────────────

export function sanitiseString(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return ''
  return val.trim().slice(0, maxLen)
}

export function sanitiseNumber(val: unknown, min = 0, max = 999999): number | null {
  const n = parseFloat(String(val))
  if (isNaN(n) || n < min || n > max) return null
  return n
}

export function sanitiseEmail(val: unknown): string | null {
  const s = sanitiseString(val, 254)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(s) ? s.toLowerCase() : null
}

// ─── Donation amount validation ──────────────────────────────────────────────

export const DONATION_MIN = 1
export const DONATION_MAX = 50000
export const TIP_MAX = 500

export function validateDonationAmount(amount: unknown): {
  valid: boolean
  error?: string
  value?: number
} {
  const n = sanitiseNumber(amount, DONATION_MIN, DONATION_MAX)
  if (n === null) {
    return {
      valid: false,
      error: `Donation must be between GH₵${DONATION_MIN} and GH₵${DONATION_MAX.toLocaleString()}`,
    }
  }
  return { valid: true, value: n }
}

// ─── File upload validation ──────────────────────────────────────────────────
// Works server-side: accepts a plain object with type and size fields
// so it is compatible with both browser File objects and server-parsed multipart data

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const MAX_FILE_SIZE_MB = 5
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export function validateImageFile(file: { type: string; size: number }): {
  valid: boolean
  error?: string
} {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG and WebP images are allowed.' }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `Image must be under ${MAX_FILE_SIZE_MB}MB.` }
  }
  return { valid: true }
}

// ─── Require authenticated user ──────────────────────────────────────────────

export async function requireAuth(): Promise<{ user: any; error?: NextResponse }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
      }
    }
    return { user }
  } catch {
    return {
      user: null,
      error: NextResponse.json({ error: 'Authentication check failed.' }, { status: 500 }),
    }
  }
}

// ─── Require admin user ──────────────────────────────────────────────────────

export async function requireAdmin(): Promise<{ user: any; error?: NextResponse }> {
  return requirePermission()
}

export async function requirePermission(permission?: string): Promise<{ user: any; error?: NextResponse; role?: string }> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        user: null,
        error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }),
      }
    }

    // Check DB is_admin OR env var root admin email
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const isEnvAdmin = !!(adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase())

    if (isEnvAdmin) {
      return { user, role: 'super_admin' }
    }

    const adminDb = createAdminClient()

    const { data: roleRow } = await adminDb
      .from('admin_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    const role = (roleRow?.role || '').toLowerCase() as AdminRole
    const knownRole = !!ADMIN_PERMISSION_MAP[role]

    const { data: profile } = await adminDb
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (!profile?.is_admin && !knownRole) {
      return {
        user: null,
        error: NextResponse.json({ error: 'Admin access required.' }, { status: 403 }),
      }
    }

    const effectiveRole: AdminRole = knownRole ? role : 'moderator'

    if (permission && !hasPermission(effectiveRole, permission)) {
      return {
        user: null,
        error: NextResponse.json({ error: 'Insufficient permission.' }, { status: 403 }),
      }
    }

    return { user, role: effectiveRole }
  } catch {
    return {
      user: null,
      error: NextResponse.json({ error: 'Auth check failed.' }, { status: 500 }),
    }
  }
}

export async function logAdminAudit(params: {
  actorUserId: string
  action: string
  entityType: string
  entityId: string
  beforeState?: unknown
  afterState?: unknown
  ip?: string
  userAgent?: string
}) {
  try {
    const adminDb = createAdminClient()
    await adminDb.from('admin_audit_logs').insert({
      actor_user_id: params.actorUserId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      before_state: params.beforeState ?? null,
      after_state: params.afterState ?? null,
      ip: params.ip ?? null,
      user_agent: params.userAgent ?? null,
    })
  } catch {
    // Audit logging should never block admin operations.
  }
}

// ─── Standard response helpers ───────────────────────────────────────────────

export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess(data: object, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}
