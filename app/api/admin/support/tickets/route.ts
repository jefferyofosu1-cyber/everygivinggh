import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function GET(request: NextRequest) {
  const auth = await requirePermission('support.manage')
  if (auth.error) return auth.error

  const status = new URL(request.url).searchParams.get('status') || 'all'
  const supabase = createAdminClient()
  let query = supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ tickets: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission('support.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const type = String(body?.type || '').trim()
  const subject = String(body?.subject || '').trim()
  const message = String(body?.message || '').trim()
  const priority = String(body?.priority || 'normal').trim()
  const requesterUserId = body?.requester_user_id ? String(body.requester_user_id).trim() : null
  const email = body?.email ? String(body.email).trim() : null

  if (!type || !subject || !message) {
    return NextResponse.json({ error: 'type, subject and message are required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      requester_user_id: requesterUserId,
      email,
      type,
      subject,
      message,
      priority,
      status: 'open',
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'support.ticket_create',
    entityType: 'support_ticket',
    entityId: data.id,
    afterState: data,
  })

  return NextResponse.json({ ticket: data }, { status: 201 })
}
