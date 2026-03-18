import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function GET() {
  const auth = await requirePermission('users.read')
  if (auth.error) return auth.error

  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('admin_roles')
    .select('id, user_id, role, permissions, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ roles: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const auth = await requirePermission('users.read')
  if (auth.error) return auth.error

  const body = await request.json()
  const userId = body?.userId as string
  const role = body?.role as string
  const permissions = body?.permissions as string[] | undefined

  if (!userId || !role) {
    return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data: before } = await supabase
    .from('admin_roles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const payload = {
    user_id: userId,
    role,
    permissions: permissions ?? [],
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('admin_roles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'roles.update',
    entityType: 'admin_role',
    entityId: userId,
    beforeState: before,
    afterState: data,
  })

  return NextResponse.json({ role: data })
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission('users.read')
  if (auth.error) return auth.error

  const body = await request.json()
  const userId = body?.userId as string
  const role = body?.role as string
  const permissions = body?.permissions as string[] | undefined

  if (!userId || !role) {
    return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data: existing } = await supabase
    .from('admin_roles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Role assignment already exists. Use PATCH to update.' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('admin_roles')
    .insert({
      user_id: userId,
      role,
      permissions: permissions ?? [],
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'roles.create',
    entityType: 'admin_role',
    entityId: userId,
    afterState: data,
  })

  return NextResponse.json({ role: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const auth = await requirePermission('users.read')
  if (auth.error) return auth.error

  const body = await request.json()
  const userId = body?.userId as string
  if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 })

  const supabase = await getAdminClient()
  const { data: before } = await supabase
    .from('admin_roles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (!before) return NextResponse.json({ error: 'Role assignment not found' }, { status: 404 })

  const { error } = await supabase.from('admin_roles').delete().eq('user_id', userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'roles.delete',
    entityType: 'admin_role',
    entityId: userId,
    beforeState: before,
  })

  return NextResponse.json({ deleted: true, userId })
}
