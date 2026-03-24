/**
 * Paystack Webhook Handler
 * POST /api/paystack/webhook
 *
 * Receives server-to-server event notifications from Paystack.
 * This is the reliable way to confirm payments (vs callback which depends on browser redirect).
 *
 * Set this URL in your Paystack Dashboard → Settings → API Keys & Webhooks → Webhook URL
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { verifyPaystackSignature } from '@/lib/paystack-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-paystack-signature') || ''

    // 1. Verify webhook signature
    if (!verifyPaystackSignature(body, signature)) {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)
    console.log('[Webhook] Event received:', event.event)

    // 2. Handle charge.success event
    if (event.event === 'charge.success') {
      const data = event.data
      const reference = data.reference
      const status = data.status // 'success'
      const amountPesewas = data.amount
      const metadata = data.metadata || {}

      const supabase = await getAdminClient()

      // Update donation status
      const { data: donation, error: updateError } = await supabase
        .from('donations')
        .update({ status: 'completed' })
        .eq('paystack_reference', reference)
        .eq('status', 'pending') // Only update if still pending (idempotent)
        .select('id, campaign_id, amount_paid')
        .single()

      if (updateError) {
        // Could be already completed by callback — not necessarily an error
        console.log('[Webhook] Donation update skipped (may already be completed):', updateError.message)
      }

      // Update campaign raised_amount if donation was updated
      if (donation?.campaign_id) {
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('raised_amount')
          .eq('id', donation.campaign_id)
          .single()

        if (campaign) {
          await supabase
            .from('campaigns')
            .update({
              raised_amount: (campaign.raised_amount || 0) + (donation.amount_paid || amountPesewas),
            })
            .eq('id', donation.campaign_id)
        }
      }

      console.log('[Webhook] Payment confirmed:', reference)
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] Error:', error.message)
    // Still return 200 to prevent Paystack from retrying
    return NextResponse.json({ received: true })
  }
}
