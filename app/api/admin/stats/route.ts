import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-security'
import { getAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const supabase = await getAdminClient()

  const [all, pending, active, users, donationsRes, recent, recentDon, pendingPayouts, openDisputes, paymentMismatches, verificationsRes] = await Promise.all([
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('donations').select('id, amount, platform_fee, paystack_fee, donor_tip, everygiving_revenue', { count: 'exact' }).eq('status', 'confirmed'),
    supabase.from('campaigns')
      .select('id, title, status, verification_tier, created_at, profiles(full_name)')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('donations')
      .select('id, amount, donor_name, created_at, campaigns(title)')
      .eq('status', 'confirmed').order('created_at', { ascending: false }).limit(5),
    supabase.from('payout_requests').select('id', { count: 'exact', head: true }).eq('status', 'requested'),
    supabase.from('donation_disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('payment_events').select('id', { count: 'exact', head: true }).or('status.eq.failed,processed.eq.false'),
    supabase.from('verifications').select('verification_fee').eq('payment_status', 'paid')
  ])

  const donations = donationsRes.data || []
  const verifications = verificationsRes.data || []

  const totalRaised = donations.reduce((s, d) => s + (d.amount || 0), 0)
  const totalPlatformFees = donations.reduce((s, d) => s + (d.platform_fee || 0), 0)
  const totalPaystackFees = donations.reduce((s, d) => s + (d.paystack_fee || 0), 0)
  const totalTips = donations.reduce((s, d) => s + (d.donor_tip || 0), 0)
  const totalVerificationRevenue = verifications.reduce((s, v) => s + (v.verification_fee || 0), 0)
  
  const netProfit = donations.reduce((s, d) => s + (d.everygiving_revenue || 0), 0) + totalVerificationRevenue

  return NextResponse.json({
    stats: {
      totalCampaigns:    all.count ?? 0,
      pendingCampaigns:  pending.count ?? 0,
      activeCampaigns:   active.count ?? 0,
      totalUsers:        users.count ?? 0,
      totalDonations:    donationsRes.count ?? 0,
      totalRaised,
      totalPlatformFees,
      totalPaystackFees,
      totalTips,
      totalVerificationRevenue,
      netProfit,
      pendingPayouts:    pendingPayouts.count ?? 0,
      openDisputes:      openDisputes.count ?? 0,
      paymentMismatches: paymentMismatches.count ?? 0,
    },
    recentCampaigns: recent.data ?? [],
    recentDonations: recentDon.data ?? [],
  })
}
