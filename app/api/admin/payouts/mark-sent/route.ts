import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function POST(request: NextRequest) {
  const auth = await requirePermission('payouts.manage')
  if (auth.error) return auth.error

  const { id, reference } = await request.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const supabase = await getAdminClient()
  const { data: before } = await supabase.from('payout_requests').select('*').eq('id', id).maybeSingle()

  const { data, error } = await supabase
    .from('payout_requests')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('payout_events').insert({ payout_request_id: id, event_type: 'sent', payload: { reference: reference ?? '' } })
  await logAdminAudit({ actorUserId: auth.user.id, action: 'payout.mark_sent', entityType: 'payout_request', entityId: id, beforeState: before, afterState: data })

  return NextResponse.json({ payout: data })
}
