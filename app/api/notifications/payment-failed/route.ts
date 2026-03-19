import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NotificationService } from '@/lib/notifications'

/**
 * Handle failed payment notifications
 * Can be triggered by admin or payment processor webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { donation_id } = body

    if (!donation_id) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get donation
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select('*, campaigns(id, title, slug)')
      .eq('id', donation_id)
      .single()

    if (donationError || !donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    // Only send alert if status is pending/failed
    if (
      donation.status !== 'pending' &&
      donation.status !== 'failed'
    ) {
      return NextResponse.json(
        { error: 'Donation must be in pending or failed state' },
        { status: 400 }
      )
    }

    // Build retry URL
    const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/donate?retry=${donation_id}&campaign=${donation.campaign_id}`

    // Send payment failure alert
    await NotificationService.sendPaymentFailureAlert(
      donation.donor_email,
      donation.donor_name,
      donation.campaigns.title,
      donation.amount_paid,
      retryUrl
    )

    // Update donation status to failed
    await supabase
      .from('donations')
      .update({ status: 'failed' })
      .eq('id', donation_id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Payment failure alert error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
