import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

export async function POST(request: NextRequest) {
  const auth = await requirePermission('payments.manage')
  if (auth.error) return auth.error

  const { eventId } = await request.json()
  if (!eventId) return NextResponse.json({ error: 'eventId is required' }, { status: 400 })

  const supabase = await getAdminClient()
  const { data: before } = await supabase.from('payment_events').select('*').eq('id', eventId).maybeSingle()

  const { data, error } = await supabase
    .from('payment_events')
    .update({ processed: false, status: 'pending' })
    .eq('id', eventId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'payments.retry_event',
    entityType: 'payment_event',
    entityId: eventId,
    beforeState: before,
    afterState: data,
  })

  return NextResponse.json({ event: data })
}
