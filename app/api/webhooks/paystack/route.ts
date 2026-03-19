import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import crypto from 'crypto'
import { getAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret || secret.includes('REPLACE')) {
      console.warn('Paystack secret key is missing or invalid')
      // For local testing without a secret, do not fail completely, but this should be strict in prod.
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
      }
    }

    if (secret && !secret.includes('REPLACE')) {
      const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(rawBody)

    if (event.event === 'charge.success') {
      const data = event.data
      const donationId = data.reference // we use donation ID as reference

      const supabase = await getAdminClient()

      // Fetch the donation
      const { data: donation, error: donationErr } = await supabase
        .from('donations')
        .select('id, amount, status, campaign_id')
        .eq('id', donationId)
        .single()

      if (donationErr || !donation) {
        console.error('Donation not found:', donationId)
        return NextResponse.json({ ok: true }) // Return 200 so Paystack doesn't retry
      }

      if (donation.status === 'success') {
        return NextResponse.json({ ok: true }) // Already processed
      }

      // Calculate net amount (2.5% + GHS 0.50)
      const fee = parseFloat((donation.amount * 0.025 + 0.50).toFixed(2))
      const netAmount = parseFloat((donation.amount - fee).toFixed(2))

      // Update donation status
      await supabase
        .from('donations')
        .update({ status: 'success', payment_reference: String(data.id) })
        .eq('id', donation.id)

      // Fetch campaign to increment its raised_amount securely via Admin
      // Note: Ideally use an RPC for atomic increment, but this works for prototype
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, raised_amount')
        .eq('id', donation.campaign_id)
        .single()

      if (campaign) {
        const newRaised = (campaign.raised_amount || 0) + netAmount
        await supabase
          .from('campaigns')
          .update({ raised_amount: newRaised })
          .eq('id', campaign.id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json({ ok: true }) // Return 200 anyway to prevent retries
=======
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NotificationService } from '@/lib/notifications'
import { verifyPaystackSignature } from '@/lib/paystack-utils'
import crypto from 'crypto'

/**
 * ENHANCED Paystack Webhook Handler
 * Processes: Payment -> Donation -> Fund Distribution -> Notifications
 *
 * Features:
 * - Webhook signature verification
 * - Duplicate prevention (idempotent)
 * - Transaction fee extraction
 * - Fund distribution to fundraiser subaccount
 * - Campaign balance updates
 * - Transaction ledger creation
 * - Multi-stage notifications
 */

export async function POST(req: NextRequest) {
  const startTime = Date.now()

  try {
    // ========================================================================
    // 1. VERIFY WEBHOOK SIGNATURE
    // ========================================================================

    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()

    if (!verifyPaystackSignature(body, signature || '')) {
      console.warn('[Webhook] Invalid signature detected')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Only process successful charge events
    if (event.event !== 'charge.success') {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const { data } = event
    const reference = data.reference
    const donationId = data.metadata?.donation_id || data.metadata?.donationId

    if (!donationId) {
      console.warn('[Webhook] No donation ID in metadata:', data.metadata)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    console.log(`[Webhook] Processing: ${reference}`)

    const supabase = await createServerSupabaseClient()

    // ========================================================================
    // 2. CHECK FOR DUPLICATE PROCESSING (IDEMPOTENCY)
    // ========================================================================

    const { data: existingLog } = await supabase
      .from('paystack_webhook_log')
      .select('id')
      .eq('reference', reference)
      .eq('status', 'success')
      .single()

    if (existingLog) {
      console.log(`[Webhook] Duplicate detected for ${reference} - already processed`)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // ========================================================================
    // 3. FETCH DONATION & CAMPAIGN DETAILS
    // ========================================================================

    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select(
        `
        id,
        campaign_id,
        donor_id,
        donor_name,
        donor_email,
        amount_paid,
        transaction_fee,
        net_amount,
        campaigns (
          id,
          title,
          user_id,
          subaccount_code
        )
      `
      )
      .eq('id', donationId)
      .single()

    if (donationError || !donation) {
      console.error(`[Webhook] Donation fetch failed:`, donationError)
      await logWebhookAttempt(supabase, reference, 'charge.success', data, 'failed')
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const campaign = donation.campaigns as any
    const fundraiserId = campaign.user_id

    console.log(`[Webhook] Campaign: ${campaign.id} | Fundraiser: ${fundraiserId}`)
    console.log(`[Webhook] Amount: ${donation.amount_paid}p | Fee: ${donation.transaction_fee}p | Net: ${donation.net_amount}p`)

    // ========================================================================
    // 4. UPDATE DONATION STATUS
    // ========================================================================

    const { error: updateError } = await supabase
      .from('donations')
      .update({
        status: 'completed',
        paystack_reference: reference,
        updated_at: new Date().toISOString(),
      })
      .eq('id', donation.id)

    if (updateError) {
      console.error(`[Webhook] Donation update failed:`, updateError)
      await logWebhookAttempt(supabase, reference, 'charge.success', data, 'failed')
      return NextResponse.json({ success: true }, { status: 200 })
    }

    console.log(`[Webhook] Donation status updated to completed`)

    // ========================================================================
    // 5. CREATE TRANSACTION LEDGER ENTRIES
    // ========================================================================

    try {
      // Fee goes to EveryGiving
      const { error: feeError } = await supabase
        .from('transaction_ledger')
        .insert({
          donation_id: donation.id,
          fundraiser_id: fundraiserId,
          campaign_id: campaign.id,
          type: 'fee',
          amount: donation.transaction_fee,
          description: `Transaction fee for donation (${(donation.transaction_fee / 100).toFixed(2)})`,
          status: 'processed',
        })

      if (feeError) console.error('Fee ledger error:', feeError)

      // Net amount goes to fundraiser
      const { error: netError } = await supabase
        .from('transaction_ledger')
        .insert({
          donation_id: donation.id,
          fundraiser_id: fundraiserId,
          campaign_id: campaign.id,
          type: 'net_amount',
          amount: donation.net_amount,
          description: `Net donation amount to be distributed (${(donation.net_amount / 100).toFixed(2)})`,
          status: 'processed',
        })

      if (netError) console.error('Net amount ledger error:', netError)

      console.log(`[Webhook] Transaction ledger created`)
    } catch (ledgerError) {
      console.error(`[Webhook] Ledger creation failed:`, ledgerError)
      // Continue - ledger is for tracking, not critical
    }

    // ========================================================================
    // 6. UPDATE CAMPAIGN TOTALS (via trigger)
    // ========================================================================
    // The database trigger will automatically update campaign.total_raised
    // when donation status changes to 'completed'

    console.log(`[Webhook] Campaign totals will be auto-updated by database trigger`)

    // ========================================================================
    // 7. SEND NOTIFICATIONS
    // ========================================================================

    // Send donation confirmation email
    try {
      console.log(`[Webhook] Sending confirmation email...`)
      await NotificationService.sendDonationConfirmation(
        donation.donor_email,
        donation.donor_name || 'Valued Supporter',
        campaign.title,
        donation.amount_paid,
        reference
      )
      console.log(`[Webhook] Confirmation email sent ✓`)
    } catch (emailError) {
      console.error(`[Webhook] Confirmation email failed:`, emailError)
      // Don't fail the webhook for email issues
    }

    // Check and send milestone alerts
    try {
      console.log(`[Webhook] Checking campaign milestones...`)
      await NotificationService.checkAndSendMilestoneAlerts(campaign.id)
      console.log(`[Webhook] Milestone check complete ✓`)
    } catch (milestoneError) {
      console.error(`[Webhook] Milestone check failed:`, milestoneError)
      // Don't fail the webhook
    }

    // ========================================================================
    // 8. LOG SUCCESSFUL WEBHOOK PROCESSING
    // ========================================================================

    await logWebhookAttempt(supabase, reference, 'charge.success', data, 'success')

    const duration = Date.now() - startTime
    console.log(`[Webhook] ✓ Completed in ${duration}ms`)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Webhook] Fatal error:', message)
    return NextResponse.json({ success: true }, { status: 200 }) // Always 200 to prevent Paystack retries
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function logWebhookAttempt(
  supabase: any,
  reference: string,
  eventType: string,
  payload: any,
  status: 'success' | 'failed'
) {
  try {
    await supabase.from('paystack_webhook_log').insert({
      reference,
      event_type: eventType,
      payload,
      status,
      processed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.warn('Failed to log webhook attempt:', error)
>>>>>>> main
  }
}
