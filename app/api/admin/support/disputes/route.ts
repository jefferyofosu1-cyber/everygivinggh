import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function GET(request: NextRequest) {
  const auth = await requirePermission('disputes.manage')
  if (auth.error) return auth.error

  const status = new URL(request.url).searchParams.get('status') || 'all'
  const supabase = createAdminClient()
  let query = supabase.from('donation_disputes').select('*').order('created_at', { ascending: false })
  if (status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ disputes: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission('disputes.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const reason = String(body?.reason || '').trim()
  const donationId = body?.donation_id ? String(body.donation_id).trim() : null
  const ticketId = body?.ticket_id ? String(body.ticket_id).trim() : null

  if (!reason) return NextResponse.json({ error: 'reason is required' }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('donation_disputes')
    .insert({
      donation_id: donationId,
      ticket_id: ticketId,
      reason,
      status: 'open',
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'support.dispute_create',
    entityType: 'donation_dispute',
    entityId: data.id,
    afterState: data,
  })

  return NextResponse.json({ dispute: data }, { status: 201 })
}
