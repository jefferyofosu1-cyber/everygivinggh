import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NotificationService } from '@/lib/notifications'

/**
 * Send thank you message from fundraiser to donor
 * Requires authentication and authorization
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { donation_id, message } = body

    if (!donation_id || !message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Donation ID and message are required' },
        { status: 400 }
      )
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message must be 500 characters or less' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get donation and verify ownership
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .select('*, campaigns(id, title, user_id)')
      .eq('id', donation_id)
      .single()

    if (donationError || !donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
    }

    // Verify user owns the campaign
    if (donation.campaigns.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to send this message' },
        { status: 403 }
      )
    }

    // Get fundraiser name from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const fundraiserName = profile?.full_name || 'A fundraiser'

    // Send thank you email
    await NotificationService.sendThankYouMessage(
      donation.donor_email,
      donation.donor_name,
      fundraiserName,
      donation.campaigns.title,
      message
    )

    // Record thank you message sent
    await supabase.from('thank_you_messages').insert({
      donation_id,
      campaign_id: donation.campaign_id,
      message,
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Thank you message error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
