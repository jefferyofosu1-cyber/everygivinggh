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
      const metadata = data.metadata || {}
      const campaignId = metadata.campaign_id

      const supabase = await getAdminClient()

      // Update donation status (only if still pending — idempotent)
      await supabase
        .from('donations')
        .update({ status: 'completed' })
        .eq('paystack_reference', reference)
        .eq('status', 'pending')

      // Recompute campaign raised_amount from completed donations
      if (campaignId) {
        await syncCampaignRaisedAmount(supabase, campaignId)
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

/**
 * Recompute raised_amount by summing all completed donations for a campaign.
 * This is idempotent — safe even if both callback and webhook fire.
 */
async function syncCampaignRaisedAmount(supabase: any, campaignId: string) {
  const { data: donations, error } = await supabase
    .from('donations')
    .select('amount')
    .eq('campaign_id', campaignId)
    .in('status', ['completed', 'confirmed'])

  if (error) {
    console.error('[syncCampaignRaisedAmount] Error fetching donations:', error)
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
