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

  if (!before) {
    return NextResponse.json({ error: 'Payout request not found' }, { status: 404 })
  }

  if (before.status === 'sent') {
    return NextResponse.json({ error: 'Payout already sent' }, { status: 400 })
  }

  // Initiate Paystack Transfer
  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret || secret.includes('REPLACE')) {
    // Demo mode: just mark as sent
    const { data, error } = await supabase
      .from('payout_requests')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('payout_events').insert({ payout_request_id: id, event_type: 'sent', payload: { reference: 'demo_ref' } })
    await logAdminAudit({ actorUserId: auth.user.id, action: 'payout.mark_sent', entityType: 'payout_request', entityId: id, beforeState: before, afterState: data })

    return NextResponse.json({ payout: data })
  }

  try {
    const amountInPesewas = Math.round(parseFloat(before.amount) * 100)
    let bankCode = ''
    let accNumber = ''
    let type = 'mobile_money'
    let bankNameStr = ''

    if (before.destination?.type === 'momo') {
        type = 'mobile_money'
        accNumber = before.destination.number
        const net = (before.destination.network || '').toLowerCase()
        if (net.includes('mtn')) bankCode = 'MTN'
        else if (net.includes('vodafone') || net.includes('telecel')) bankCode = 'VOD'
        else if (net.includes('airteltigo') || net.includes('at')) bankCode = 'ATL'
        else bankCode = 'MTN' // fallback
        bankNameStr = net
    } else {
        type = 'nuban'
        accNumber = before.destination.account
        bankCode = before.destination.bank // Paystack requires a 3-digit bank code or slug. Admin will need to ensure users provide valid bank codes.
        bankNameStr = before.destination.bank
    }

    // 1. Create Transfer Recipient
    const rcRes = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type,
        name: `EveryGiving Payout ${before.fundraiser_user_id}`,
        account_number: accNumber,
        bank_code: bankCode,
        currency: 'GHS'
      })
    })

    const rcData = await rcRes.json()
    if (!rcData.status) {
      console.error('Paystack Transfer Recipient Error:', rcData)
      return NextResponse.json({ error: rcData.message || 'Failed to create transfer recipient' }, { status: 500 })
    }

    const recipientCode = rcData.data.recipient_code

    // 2. Initiate Transfer
    const trRes = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: 'balance',
        amount: amountInPesewas,
        recipient: recipientCode,
        reason: `Withdrawal for EveryGiving payout ${id}`
      })
    })

    const trData = await trRes.json()
    if (!trData.status) {
      console.error('Paystack Transfer Error:', trData)
      return NextResponse.json({ error: trData.message || 'Failed to initiate transfer' }, { status: 500 })
    }

    const reference = trData.data.reference

    const { data, error } = await supabase
      .from('payout_requests')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await supabase.from('payout_events').insert({ payout_request_id: id, event_type: 'sent', payload: { reference, paystack_response: trData.data } })
    await logAdminAudit({ actorUserId: auth.user.id, action: 'payout.mark_sent', entityType: 'payout_request', entityId: id, beforeState: before, afterState: data })

    return NextResponse.json({ payout: data })

  } catch (err: any) {
    console.error('Paystack payout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
