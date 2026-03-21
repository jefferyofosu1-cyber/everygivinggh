/**
 * Fund Distribution Status & Analytics Endpoint
 * GET /api/fundraiser/fund-distribution
 *
 * Provides:
 * - Total funds raised
 * - Net amount available
 * - Distribution history
 * - Real-time campaign stats
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Mark route as dynamic since it requires authentication
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ========================================================================
    // 1. GET ALL CAMPAIGNS FOR THIS FUNDRAISER
    // ========================================================================

    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, goal_amount, raised_amount, donor_count')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (campaignError) {
      console.error('Campaign fetch error:', campaignError)
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      )
    }

    // ========================================================================
    // 2. GET TRANSACTION LEDGER FOR ANALYSIS
    // ========================================================================

    const { data: ledger, error: ledgerError } = await supabase
      .from('transaction_ledger')
      .select('id, donation_id, campaign_id, type, amount, status, created_at')
      .eq('fundraiser_id', user.id)
      .order('created_at', { ascending: false })

    if (ledgerError) {
      console.error('Ledger fetch error:', ledgerError)
      return NextResponse.json(
        { error: 'Failed to fetch ledger' },
        { status: 500 }
      )
    }

    // ========================================================================
    // 3. GET DISTRIBUTION HISTORY
    // ========================================================================

    const { data: distributions, error: distributionError } = await supabase
      .from('fund_distributions')
      .select('id, campaign_id, total_amount, num_donations, status, distributed_at')
      .eq('fundraiser_id', user.id)
      .order('distributed_at', { ascending: false })
      .limit(10)

    if (distributionError) {
      console.error('Distribution history error:', distributionError)
      return NextResponse.json(
        { error: 'Failed to fetch distribution history' },
        { status: 500 }
      )
    }

    // ========================================================================
    // 4. CALCULATE AGGREGATED STATS
    // ========================================================================

    const stats = {
      totalRaised: 0,
      totalNetAmount: 0,
      totalFees: 0,
      completedDonations: 0,
      totalDonors: 0,
      campaignCount: campaigns?.length || 0,
    }

    if (ledger) {
      for (const entry of ledger) {
        if (entry.status === 'processed') {
          if (entry.type === 'net_amount') {
            stats.totalNetAmount += entry.amount
          } else if (entry.type === 'fee') {
            stats.totalFees += entry.amount
          }
        }
      }
      stats.totalRaised = stats.totalNetAmount + stats.totalFees
      stats.completedDonations = ledger.filter((e) => e.type === 'net_amount').length

      // Count unique donors
      const donationIds = new Set(
        ledger.filter((e) => e.type === 'net_amount').map((e) => e.donation_id)
      )
      stats.totalDonors = donationIds.size
    }

    // ========================================================================
    // 5. FORMAT RESPONSE
    // ========================================================================

    const campaignStats = (campaigns || []).map((campaign) => {
      const campaignLedger = (ledger || []).filter(
        (e) => e.campaign_id === campaign.id && e.status === 'processed'
      )
      const netAmount = campaignLedger
        .filter((e) => e.type === 'net_amount')
        .reduce((sum, e) => sum + e.amount, 0)

      return {
        id: campaign.id,
        title: campaign.title,
        goalAmount: campaign.goal_amount,
        totalRaised: campaign.raised_amount,
        totalDonors: campaign.donor_count,
        subaccountCode: (campaign as any).subaccount_code || null,
        progressPercent: Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100),
      }
    })

    return NextResponse.json({
      success: true,
      summary: {
        totalGHSRaised: (stats.totalRaised / 100).toFixed(2),
        totalGHSNet: (stats.totalNetAmount / 100).toFixed(2),
        totalGHSFees: (stats.totalFees / 100).toFixed(2),
        totalDonations: stats.completedDonations,
        totalDonors: stats.totalDonors,
        campaignCount: stats.campaignCount,
      },
      campaigns: campaignStats,
      recentDistributions: (distributions || []).map((d) => ({
        id: d.id,
        campaignId: d.campaign_id,
        amount: (d.total_amount / 100).toFixed(2),
        donations: d.num_donations,
        status: d.status,
        distributedAt: d.distributed_at,
      })),
    })
  } catch (error) {
    console.error('[Fund Distribution] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fund distribution data' },
      { status: 500 }
    )
  }
}
