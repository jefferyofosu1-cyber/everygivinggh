import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NotificationService } from '@/lib/notifications'

/**
 * Admin endpoint to manually check and send milestone alerts
 * Checks if a campaign has reached 25%, 50%, or 100% of goal
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaign_id } = body

    if (!campaign_id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get current user (verify it's an admin)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Optional: verify user is admin
    // (you might want to add an admin check here)

    // Check milestones
    await NotificationService.checkAndSendMilestoneAlerts(campaign_id)

    return NextResponse.json(
      { success: true, message: 'Milestone check completed' },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Milestone check error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
