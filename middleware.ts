import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ─── Rate limiting store (in-memory, resets on cold start) ───────────────────
// For production scale use Upstash Redis, but this covers launch traffic fine
const rateMap = new Map<string, { count: number; resetAt: number }>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }
  if (entry.count >= limit) return false // blocked
  entry.count++
  return true // allowed
}

// Clean up old entries every 500 requests to prevent memory leak
let cleanupCounter = 0
function maybeCleanup() {
  cleanupCounter++
  if (cleanupCounter < 500) return
  cleanupCounter = 0
  const now = Date.now()
  for (const [key, val] of rateMap.entries()) {
    if (now > val.resetAt) rateMap.delete(key)
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  maybeCleanup()

  // ── 1. Rate limiting on API routes ──────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    // Strict limit on campaign submit: 5 per hour per IP
    if (pathname === '/api/campaign-submit') {
      if (!rateLimit(`submit:${ip}`, 5, 60 * 60 * 1000)) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '3600' },
        })
      }
    }
    // CRM/email: 10 per hour per IP
    if (pathname === '/api/crm' || pathname === '/api/send-status-email') {
      if (!rateLimit(`email:${ip}`, 10, 60 * 60 * 1000)) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests.' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '3600' },
        })
      }
    }
    // General API: 60 per minute per IP
    if (!rateLimit(`api:${ip}`, 60, 60 * 1000)) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // ── 2. Admin route protection (server-side) ──────────────────────────────────
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const response = NextResponse.next()

    // Build a server Supabase client that can read cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) { return request.cookies.get(name)?.value },
          set(name, value, options) { response.cookies.set({ name, value, ...options }) },
          remove(name, options) { response.cookies.set({ name, value: '', ...options }) },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // No session → redirect to admin login
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Has session → check is_admin flag in profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      // Signed in but not admin → boot them out
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'access_denied')
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  // ── 3. Protect dashboard  -  must be authenticated ─────────────────────────────
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/create')) {
    const response = NextResponse.next()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) { return request.cookies.get(name)?.value },
          set(name, value, options) { response.cookies.set({ name, value, ...options }) },
          remove(name, options) { response.cookies.set({ name, value: '', ...options }) },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return response
  }

  // ── 4. Security headers on all responses ────────────────────────────────────
  const response = NextResponse.next()
  const headers = response.headers

  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
      "connect-src 'self' https://*.supabase.co https://api.brevo.com https://api.hubtel.com",
      "frame-ancestors 'none'",
    ].join('; ')
  )

  return response
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}
