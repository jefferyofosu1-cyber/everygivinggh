import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAdminClient } from '@/lib/supabase-admin'
import { NotificationService } from '@/lib/notifications'

// EveryGiving Paystack Webhook Handler
// Listens for 'charge.success', 'transfer.success', 'transfer.failed' Events

export async function POST(req: NextRequest) {
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
  if (!PAYSTACK_SECRET) {
    console.error('PAYSTACK_SECRET_KEY is missing')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  // 1. Get raw body & signature signature
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 })
  }

  // 2. Verify signature
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(rawBody).digest('hex')

  if (hash !== signature) {
    console.error('Webhook signature mismatch')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  const { event, data } = payload
  if (!event || !data) {
    return NextResponse.json({ error: 'Malformed payload' }, { status: 400 })
  }

  const supabase = await getAdminClient()

  // 3. Log the event to payment_events
  await supabase.from('payment_events').insert({
    external_event_id: String(data.id || data.reference || 'unknown'),
    event_type: event,
    status: data.status,
    amount: (data.amount || 0) / 100,
    payload: payload,
    processed: false,
  })

  // 4. Handle Specific Events
  try {
    // ━━━━━ DONATION SUCCESS ━━━━━
    if (event === 'charge.success') {
      const campaignId = data.metadata?.campaign_id
      const donationId = data.metadata?.donation_id
      const amountGHS = data.amount / 100

      if (donationId) {
        // Step 1: Confirm the donation status
        const { data: updatedDonation, error: updateErr } = await supabase
          .from('donations')
          .update({ 
            status: 'confirmed',
            paystack_reference: data.reference
          })
          .eq('id', donationId)
          .select('amount')
          .single()

        if (updateErr) {
          console.error('Error updating donation:', updateErr)
        }

        // Step 2: Recompute campaign raised_amount from completed donations
        if (campaignId) {
          await syncCampaignRaisedAmount(supabase, campaignId)

          // Mark event as processed
          await supabase.from('payment_events')
            .update({ processed: true })
            .eq('external_event_id', String(data.id))
            .eq('event_type', event)
        }
      } else if (campaignId) {
        // Fallback if there is no donation_id metadata — still recompute
        await syncCampaignRaisedAmount(supabase, campaignId)

        // Mark event as processed
        await supabase.from('payment_events')
          .update({ processed: true })
          .eq('external_event_id', String(data.id))
          .eq('event_type', event)
      }

      // Step 3: Send donation receipt email
      if (data.customer?.email && process.env.BREVO_API_KEY) {
        try {
          await NotificationService.sendDonationConfirmation(
            data.customer.email,
            data.customer.first_name || data.customer.last_name || 'Valued Supporter',
            campaignId,
            data.metadata?.campaign_title || 'Campaign',
            data.amount || 0,
            data.reference || '',
          )
        } catch (emailErr) {
          console.error('Donation receipt email failed:', emailErr)
        }
      }

    // ━━━━━ DONATION FAILED ━━━━━
    } else if (event === 'charge.failed') {
      const donationId = data.metadata?.donation_id

      if (donationId) {
        await supabase
          .from('donations')
          .update({ 
            status: 'failed',
            rejection_reason: data.gateway_response || 'Payment declined'
          })
          .eq('id', donationId)

        // Mark event as processed
        await supabase.from('payment_events')
          .update({ processed: true })
          .eq('external_event_id', String(data.id))
          .eq('event_type', event)
      }

    // ━━━━━ PAYOUT SUCCESS ━━━━━
    } else if (event === 'transfer.success') {
      const transferCode = data.transfer_code
      if (transferCode) {
        await supabase.from('milestone_payouts')
          .update({ 
            status: 'paid', 
            paid_at: new Date().toISOString() 
          })
          .eq('paystack_transfer_code', transferCode)

        // Mark event as processed
        await supabase.from('payment_events')
          .update({ processed: true })
          .eq('external_event_id', String(data.id || data.reference))
          .eq('event_type', event)
      }

    // ━━━━━ PAYOUT FAILED / REVERSED ━━━━━
    } else if (event === 'transfer.failed' || event === 'transfer.reversed') {
      const transferCode = data.transfer_code
      if (transferCode) {
        await supabase.from('milestone_payouts')
          .update({ 
            status: 'failed', 
            reject_note: data.reason || 'Paystack transfer failed' 
          })
          .eq('paystack_transfer_code', transferCode)

        // Mark event as processed
        await supabase.from('payment_events')
          .update({ processed: true })
          .eq('external_event_id', String(data.id || data.reference))
          .eq('event_type', event)
      }
    }

  } catch (error) {
    console.warn('Failed to log webhook attempt:', error)
    // We still return 200 OK so Paystack doesn't retry endlessly for logical errors
  }

  // Always return 200 OK to acknowledge receipt
  return NextResponse.json({ received: true }, { status: 200 })
}

/**
 * Recompute raised_amount by summing all completed/confirmed donations for a campaign.
 * This is idempotent — safe even if callback and webhook both fire.
 */
async function syncCampaignRaisedAmount(supabase: any, campaignId: string) {
  const { data: donations, error } = await supabase
    .from('donations')
    .select('amount')
    .eq('campaign_id', campaignId)
    .in('status', ['completed', 'confirmed'])

  if (error) {
    console.error('[syncCampaignRaisedAmount] Error:', error)
    return
  }

  const totalGHS = (donations || []).reduce(
    (sum: number, d: { amount: number }) => sum + (d.amount || 0),
    0
  )
  const donorCount = (donations || []).length

  await supabase
    .from('campaigns')
    .update({ raised_amount: totalGHS, donor_count: donorCount })
    .eq('id', campaignId)
}
