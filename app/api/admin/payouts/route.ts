import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function GET() {
  const auth = await requirePermission('payouts.manage')
  if (auth.error) return auth.error

  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('payout_requests')
    .select('*')
    .order('requested_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ payouts: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission('payouts.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const amount = Number(body?.amount)
  const campaignId = body?.campaign_id ? String(body.campaign_id).trim() : null
  const fundraiserUserId = body?.fundraiser_user_id ? String(body.fundraiser_user_id).trim() : null
  const destination = body?.destination ?? {}
  const notes = body?.notes ? String(body.notes).trim() : null

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
  }

  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('payout_requests')
    .insert({
      campaign_id: campaignId,
      fundraiser_user_id: fundraiserUserId,
      amount,
      destination,
      notes,
      status: 'requested',
      requested_at: new Date().toISOString(),
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('payout_events').insert({ payout_request_id: data.id, event_type: 'created', payload: { notes: notes ?? '' } })
  await logAdminAudit({ actorUserId: auth.user.id, action: 'payout.create', entityType: 'payout_request', entityId: data.id, afterState: data })

  return NextResponse.json({ payout: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const auth = await requirePermission('payouts.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const id = body?.id as string
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const supabase = await getAdminClient()
  const { data: before } = await supabase.from('payout_requests').select('*').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Payout not found' }, { status: 404 })

  const { error } = await supabase.from('payout_requests').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('payout_events').insert({ payout_request_id: id, event_type: 'deleted', payload: {} })
  await logAdminAudit({ actorUserId: auth.user.id, action: 'payout.delete', entityType: 'payout_request', entityId: id, beforeState: before })

  return NextResponse.json({ deleted: true, id })
}
