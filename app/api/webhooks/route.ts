import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || ''
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verify Paystack webhook signature
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(body)
    .digest('hex')
  return hash === signature
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature') || ''

  if (!verifySignature(rawBody, signature)) {
    console.error('[webhook] Invalid Paystack signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
  }

  const { event: eventType, data } = event

  // Log all webhook events
  await supabase.from('payment_events').insert({
    external_event_id: data?.id?.toString() || data?.reference || null,
    event_type: eventType,
    status: data?.status || 'received',
    amount: data?.amount ? Math.round(data.amount / 100) : null,
    payload: event,
    processed: false,
  }).select().single()

  // ── Handle charge.success ─────────────────────────────────────────────────
  if (eventType === 'charge.success') {
    const reference = data.reference
    const amountGHS = Math.round(data.amount / 100) // Paystack sends pesewas

    // Find the donation record
    const { data: donation } = await supabase
      .from('donations')
      .select('id, campaign_id, amount, donor_name, donor_email, user_id')
      .eq('paystack_reference', reference)
      .single()

    if (donation) {
      // Mark donation as confirmed
      await supabase
        .from('donations')
        .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
        .eq('id', donation.id)

      // Update campaign raised_amount and donor_count
      await supabase.rpc('confirm_donation', {
        p_campaign_id: donation.campaign_id,
        p_amount: amountGHS,
      }).catch(() => {
        // Fallback if RPC doesn't exist: manual update
        supabase.from('campaigns').select('raised_amount, donor_count').eq('id', donation.campaign_id).single()
          .then(({ data: camp }) => {
            if (camp) {
              supabase.from('campaigns').update({
                raised_amount: (camp.raised_amount || 0) + amountGHS,
                donor_count: (camp.donor_count || 0) + 1,
              }).eq('id', donation.campaign_id)
            }
          })
      })

      // Send confirmation email via Brevo
      if (donation.donor_email && process.env.BREVO_API_KEY) {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'EveryGiving', email: 'noreply@everygiving.org' },
            to: [{ email: donation.donor_email, name: donation.donor_name || 'Donor' }],
            subject: `Your donation of ₵${amountGHS.toLocaleString()} was received ✓`,
            htmlContent: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111">
                <div style="font-size:32px;margin-bottom:16px">✓</div>
                <h2 style="font-size:20px;margin-bottom:12px">Thank you, ${donation.donor_name || 'friend'}!</h2>
                <p style="color:#555;line-height:1.7;margin-bottom:16px">
                  Your donation of <strong>₵${amountGHS.toLocaleString()}</strong> has been received and confirmed.
                  It will be applied to the campaign within 24 hours.
                </p>
                <p style="font-size:12px;color:#9CA3AF;">Reference: ${reference}</p>
              </div>
            `,
          }),
        }).catch(err => console.error('[webhook] Email error:', err))
      }
    }

    // Mark event as processed
    await supabase
      .from('payment_events')
      .update({ processed: true })
      .eq('external_event_id', data.id?.toString())
  }

  // ── Handle transfer.success (MoMo payout) ────────────────────────────────
  if (eventType === 'transfer.success') {
    await supabase
      .from('milestone_payouts')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('paystack_transfer_code', data.transfer_code)
  }

  // ── Handle transfer.failed ────────────────────────────────────────────────
  if (eventType === 'transfer.failed') {
    await supabase
      .from('milestone_payouts')
      .update({ status: 'failed', reject_note: `Transfer failed: ${data.reason || 'Unknown'}` })
      .eq('paystack_transfer_code', data.transfer_code)
  }

  return NextResponse.json({ received: true })
=======
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

  } catch (err) {
    console.error('Error processing webhook event:', err)
    // We still return 200 OK so Paystack doesn't retry endlessly for logical errors
  }

  // Always return 200 OK to acknowledge receipt
  return NextResponse.json({ received: true }, { status: 200 })
>>>>>>> main
}
