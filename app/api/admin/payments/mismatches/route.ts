import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission } from '@/lib/api-security'

export async function GET() {
  const auth = await requirePermission('payments.manage')
  if (auth.error) return auth.error

  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('payment_events')
    .select('*')
    .or('status.eq.failed,processed.eq.false')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const mismatches = (data ?? []).map((evt: any) => ({
    id: evt.id,
    externalEventId: evt.external_event_id,
    status: evt.status,
    processed: evt.processed,
    amount: evt.amount,
    created_at: evt.created_at,
  }))

  return NextResponse.json({ mismatches })
}
