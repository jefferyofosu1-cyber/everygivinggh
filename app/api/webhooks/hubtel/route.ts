import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })

  const externalEventId = String(body?.TransactionId || body?.eventId || body?.id || '')
  if (!externalEventId) {
    return NextResponse.json({ error: 'Missing external event identifier' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const payload = {
    provider: 'hubtel',
    external_event_id: externalEventId,
    event_type: String(body?.eventType || body?.Status || 'payment_event'),
    status: String(body?.Status || body?.status || 'pending').toLowerCase(),
    amount: Number(body?.Amount || body?.amount || 0),
    currency: String(body?.Currency || body?.currency || 'GHS'),
    payload: body,
    processed: false,
  }

  const { error } = await supabase
    .from('payment_events')
    .upsert(payload, { onConflict: 'external_event_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
