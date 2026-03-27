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
      const currency = data.currency || 'GHS'
      const countryCode = data.authorization?.country_code || 'GH'
      const supabase = await getAdminClient()

      // 3. Handle Verification Fee Payment
      if (metadata.type === 'verification') {
        const campaignId = metadata.campaign_id
        await supabase
          .from('campaigns')
          .update({ 
            verification_paid: true,
            status: 'pending' // Transition to review
          })
          .eq('id', campaignId)
        
        console.log('[Webhook] Verification fee paid for campaign:', campaignId)
        return NextResponse.json({ received: true })
      }

      // 4. Handle Donation Payment
      // Update donation status, currency and country_code
      await supabase
        .from('donations')
        .update({ 
          status: 'completed',
          currency,
          country_code: countryCode
        })
        .eq('paystack_reference', reference)
        .eq('status', 'pending')

      // Recompute campaign raised_amount from completed donations
      const campaignId = metadata.campaign_id
      if (campaignId) {
        const { raised, goal, phone, donorCount } = await syncCampaignRaisedAmount(supabase, campaignId)
        
        // Trigger Behavioral Prompts (Diaspora & Milestones)
        await handleBehavioralPrompts(supabase, campaignId, { 
          raised, 
          goal, 
          phone, 
          countryCode, 
          donorCount 
        })
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
 * Handle Diaspora and Milestone nudges
 */
async function handleBehavioralPrompts(supabase: any, campaignId: string, data: any) {
  const { raised, goal, phone, countryCode } = data
  if (!phone) return

  const { data: campaign } = await supabase.from('campaigns').select('*').eq('id', campaignId).single()
  if (!campaign) return

  const NotificationService = (await import('@/lib/notifications')).NotificationService

  // 1. Diaspora Nudge (First international donation)
  if (countryCode !== 'GH' && !campaign.nudge_diaspora_sent) {
    await NotificationService.sendNudgeDiaspora(phone)
    await supabase.from('campaigns').update({ nudge_diaspora_sent: true }).eq('id', campaignId)
  }

  // 2. Milestone Nudges (25%, 50%, 75%)
  const percentage = goal > 0 ? (raised / goal) * 100 : 0
  
  if (percentage >= 100 && !campaign.nudge_fully_funded_sent) {
    // Notify Team: Fully Funded
    await NotificationService.sendEmail({
      to: 'team@everygiving.org',
      subject: `CONGRATS: Campaign Fully Funded - ${campaign.title}`,
      htmlContent: `
        <p>A campaign has reached its 100% goal! Please reach out to the organizer to guide them on the withdrawal and impact process.</p>
        <ul>
          <li><strong>Campaign:</strong> ${campaign.title}</li>
          <li><strong>Organizer:</strong> ${campaign.profiles?.full_name || 'N/A'}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Final Amount:</strong> ₵${raised.toLocaleString()} / ₵${goal.toLocaleString()}</li>
        </ul>
      `
    })
    await supabase.from('campaigns').update({ nudge_fully_funded_sent: true }).eq('id', campaignId)
  } else if (percentage >= 75 && !campaign.nudge_milestone_75_sent) {
    await NotificationService.sendNudgeMilestone(phone, 75)
    await supabase.from('campaigns').update({ nudge_milestone_75_sent: true }).eq('id', campaignId)
  } else if (percentage >= 50 && !campaign.nudge_milestone_50_sent) {
    await NotificationService.sendNudgeMilestone(phone, 50)
    await supabase.from('campaigns').update({ nudge_milestone_50_sent: true }).eq('id', campaignId)
  } else if (percentage >= 25 && !campaign.nudge_milestone_25_sent) {
    await NotificationService.sendNudgeMilestone(phone, 25)
    await supabase.from('campaigns').update({ nudge_milestone_25_sent: true }).eq('id', campaignId)
  }

  // 3. First Large Donation (₵1,000+)
  // We'll check the current donation amount from the recomputed total or we could pass the NEW donation amount.
  // For simplicity, we'll check if a large donation exists and nudge_large_donation_sent is false.
  // The webhook data has the amount.
  const donationAmount = (data.amount || 0) / 100 // Convert pesewas to GHS
  if (donationAmount >= 1000 && !campaign.nudge_large_donation_sent) {
    await NotificationService.sendEmail({
      to: 'team@everygiving.org',
      subject: `URGENT: First Large Donation Received - ${campaign.title}`,
      htmlContent: `
        <p>A large donation of ₵${donationAmount.toLocaleString()} has been received for "${campaign.title}". Please call the organizer to celebrate and advise on how to leverage this momentum.</p>
        <ul>
          <li><strong>Organizer:</strong> ${campaign.profiles?.full_name || 'N/A'}</li>
          <li><strong>Phone:</strong> ${phone}</li>
        </ul>
      `
    })
    await supabase.from('campaigns').update({ nudge_large_donation_sent: true }).eq('id', campaignId)
  }
}

/**
 * Recompute raised_amount by summing all completed donations for a campaign.
 * This is idempotent — safe even if both callback and webhook fire.
 */
async function syncCampaignRaisedAmount(supabase: any, campaignId: string) {
  const { data: campaign, error: cError } = await supabase
    .from('campaigns')
    .select('*, profiles(phone)')
    .eq('id', campaignId)
    .single()

  if (cError || !campaign) {
    console.error('[syncCampaignRaisedAmount] Error fetching campaign:', cError)
    return { raised: 0, goal: 0, phone: null, donorCount: 0 }
  }

  const { data: donations, error } = await supabase
    .from('donations')
    .select('amount')
    .eq('campaign_id', campaignId)
    .in('status', ['completed', 'success'])

  if (error) {
    console.error('[syncCampaignRaisedAmount] Error fetching donations:', error)
    return { raised: campaign.raised_amount, goal: campaign.goal_amount, phone: campaign.profiles?.phone, donorCount: campaign.donor_count }
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

  return { 
    raised: totalGHS, 
    goal: campaign.goal_amount, 
    phone: campaign.profiles?.phone, 
    donorCount 
  }
}
