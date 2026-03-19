import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NotificationService } from '@/lib/notifications'

/**
 * Send campaign update to all donors
 * Requires authentication and authorization
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaign_id, title, content } = body

    if (!campaign_id || !title || !content) {
      return NextResponse.json(
        { error: 'Campaign ID, title, and content are required' },
        { status: 400 }
      )
    }

    if (title.length > 100 || content.length > 2000) {
      return NextResponse.json(
        { error: 'Title must be 100 chars, content 2000 chars max' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, user_id, title')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    if (campaign.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this campaign' },
        { status: 403 }
      )
    }

    // Get all donors who have completed donations
    const { data: donations, error: donationError } = await supabase
      .from('donations')
      .select('donor_email, donor_name')
      .eq('campaign_id', campaign_id)
      .eq('status', 'completed')
      .neq('donor_email', null)

    if (donationError) {
      return NextResponse.json(
        { error: 'Failed to fetch donors' },
        { status: 500 }
      )
    }

    if (!donations || donations.length === 0) {
      return NextResponse.json(
        { error: 'No donors found for this campaign' },
        { status: 400 }
      )
    }

    // Send update email to all donors
    const failedEmails = []
    for (const donation of donations) {
      try {
        await NotificationService.sendCampaignUpdate(
          donation.donor_email,
          donation.donor_name,
          campaign.title,
          title,
          content,
          campaign_id
        )
      } catch (error) {
        failedEmails.push(donation.donor_email)
        console.error(`Failed to email ${donation.donor_email}:`, error)
      }
    }

    // Record campaign update
    await supabase.from('campaign_updates').insert({
      campaign_id,
      title,
      content,
      sent_to_donors: donations.length - failedEmails.length,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        success: true,
        sent: donations.length - failedEmails.length,
        failed: failedEmails.length,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined,
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Campaign update error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
