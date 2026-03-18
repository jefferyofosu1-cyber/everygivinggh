import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NotificationService } from '@/lib/notifications'
import crypto from 'crypto'

/**
 * Paystack webhook handler for payment confirmations
 * Receives POST from Paystack when payment is successful
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature from Paystack
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.warn('Invalid Paystack webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    // Only process successful charge events
    if (event.event !== 'charge.success') {
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const { data } = event
    const reference = data.reference || data.metadata?.reference
    const donationId = data.metadata?.donationId

    if (!donationId) {
      console.warn('No donation ID in Paystack metadata')
      return NextResponse.json({ error: 'No donation ID' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Update donation status to completed
    const { data: donation, error: updateErr } = await supabase
      .from('donations')
      .update({
        status: 'completed',
        transaction_id: reference,
        paid_at: new Date().toISOString(),
      })
      .eq('id', donationId)
      .select('*, campaigns(title, id)')
      .single()

    if (updateErr) {
      console.error('Donation update error:', updateErr)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    // Send donation confirmation email
    try {
      await NotificationService.sendDonationConfirmation(
        donation.donor_email,
        donation.donor_name,
        donation.campaigns.title,
        donation.amount_paid,
        reference
      )
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError)
      // Don't fail the webhook for email issues
    }

    // Check for campaign milestones
    try {
      await NotificationService.checkAndSendMilestoneAlerts(
        donation.campaign_id
      )
    } catch (milestoneError) {
      console.error('Milestone check failed:', milestoneError)
      // Don't fail the webhook
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Paystack webhook error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
