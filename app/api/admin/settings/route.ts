import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function GET() {
  const auth = await requirePermission('content.manage')
  if (auth.error) return auth.error

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('platform_settings')
    .select('key, value, updated_by, updated_at')
    .order('key', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ settings: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const auth = await requirePermission('content.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const key = body?.key as string
  const value = body?.value
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: before } = await supabase.from('platform_settings').select('*').eq('key', key).maybeSingle()

  const { data, error } = await supabase
    .from('platform_settings')
    .upsert({ key, value, updated_by: auth.user.id, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'settings.update', entityType: 'platform_setting', entityId: key, beforeState: before, afterState: data })
  return NextResponse.json({ setting: data })
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission('content.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const key = body?.key as string
  const value = body?.value
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: existing } = await supabase.from('platform_settings').select('*').eq('key', key).maybeSingle()
  if (existing) return NextResponse.json({ error: 'Setting already exists. Use PATCH to update.' }, { status: 409 })

  const { data, error } = await supabase
    .from('platform_settings')
    .insert({ key, value, updated_by: auth.user.id, updated_at: new Date().toISOString() })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'settings.create', entityType: 'platform_setting', entityId: key, afterState: data })
  return NextResponse.json({ setting: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const auth = await requirePermission('content.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const key = body?.key as string
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: before } = await supabase.from('platform_settings').select('*').eq('key', key).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Setting not found' }, { status: 404 })

  const { error } = await supabase.from('platform_settings').delete().eq('key', key)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({ actorUserId: auth.user.id, action: 'settings.delete', entityType: 'platform_setting', entityId: key, beforeState: before })
  return NextResponse.json({ deleted: true, key })
}
