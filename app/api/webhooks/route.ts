import { NextRequest, NextResponse } from 'next/server'
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
}
