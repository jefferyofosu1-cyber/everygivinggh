/**
 * Sync Campaign raised_amount
 * POST /api/admin/sync-raised
 *
 * Recomputes raised_amount for all campaigns from their completed donations.
 * Use this to fix campaigns showing 0 when they have completed donations.
 */

import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'

export async function POST() {
  try {
    const supabase = await getAdminClient()

    // Get all campaigns
    const { data: campaigns, error: campError } = await supabase
      .from('campaigns')
      .select('id')

    if (campError || !campaigns) {
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 })
    }

    let updated = 0

    for (const campaign of campaigns) {
      // Sum completed/confirmed donations for this campaign
      const { data: donations, error: donError } = await supabase
        .from('donations')
        .select('amount')
        .eq('campaign_id', campaign.id)
        .in('status', ['completed', 'confirmed'])

      if (donError) continue

      const totalGHS = (donations || []).reduce(
        (sum: number, d: { amount: number }) => sum + (d.amount || 0),
        0
      )
      const donorCount = (donations || []).length

      if (totalGHS > 0) {
        await supabase
          .from('campaigns')
          .update({ raised_amount: totalGHS, donor_count: donorCount })
          .eq('id', campaign.id)

        updated++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${updated} campaigns out of ${campaigns.length} total`,
    })
  } catch (error: any) {
    console.error('[sync-raised] Error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
