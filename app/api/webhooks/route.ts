import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAdminClient } from '@/lib/supabase-admin'

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

        const baseDonationGHS = updatedDonation?.amount || amountGHS

        // Step 2: Update campaign totals and mark event as processed
        if (campaignId) {
          const { error: rpcErr } = await supabase.rpc('confirm_donation', {
            p_campaign_id: campaignId,
            p_amount: baseDonationGHS
          })
          
          if (rpcErr) {
            console.error('Error in confirm_donation RPC:', rpcErr)
            // Update campaign manually if RPC doesn't exist
            const { data: campaign } = await supabase
              .from('campaigns')
              .select('raised_amount, donor_count')
              .eq('id', campaignId)
              .single()

            if (campaign) {
              await supabase
                .from('campaigns')
                .update({
                  raised_amount: (campaign.raised_amount || 0) + baseDonationGHS,
                  donor_count: (campaign.donor_count || 0) + 1
                })
                .eq('id', campaignId)
            }
          }

          // Mark event as processed
          await supabase.from('payment_events')
            .update({ processed: true })
            .eq('external_event_id', String(data.id))
            .eq('event_type', event)
        }
      } else if (campaignId) {
        // Fallback if there is no donation_id metadata
        const { error: rpcErr } = await supabase.rpc('confirm_donation', {
          p_campaign_id: campaignId,
          p_amount: amountGHS
        })

        // Mark event as processed
        await supabase.from('payment_events')
          .update({ processed: true })
          .eq('external_event_id', String(data.id))
          .eq('event_type', event)
      }

      // Step 3: Send receipt email here via Brevo or Resend (optional)
      if (data.customer?.email && process.env.BREVO_API_KEY) {
        // e.g. await sendDonorReceipt(data.customer.email, amountGHS, data.metadata?.campaign_title)
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
