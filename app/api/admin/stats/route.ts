import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/api-security'
import { getAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const supabase = await getAdminClient()

  const [all, pending, active, users, donations, recent, recentDon, pendingPayouts, openDisputes, paymentMismatches] = await Promise.all([
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('donations').select('id, amount', { count: 'exact' }).eq('status', 'success'),
    supabase.from('campaigns')
      .select('id, title, status, verification_tier, created_at, profiles(full_name)')
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('donations')
      .select('id, amount, donor_name, created_at, campaigns(title)')
      .eq('status', 'success').order('created_at', { ascending: false }).limit(5),
    supabase.from('payout_requests').select('id', { count: 'exact', head: true }).eq('status', 'requested'),
    supabase.from('donation_disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('payment_events').select('id', { count: 'exact', head: true }).or('status.eq.failed,processed.eq.false'),
  ])

  const raised = ((donations.data ?? []) as { amount: number }[])
    .reduce((s, d) => s + (d.amount ?? 0), 0)

  return NextResponse.json({
    stats: {
      totalCampaigns:    all.count ?? 0,
      pendingCampaigns:  pending.count ?? 0,
      activeCampaigns:   active.count ?? 0,
      totalUsers:        users.count ?? 0,
      totalDonations:    donations.count ?? 0,
      totalRaised:       raised,
      pendingPayouts:    pendingPayouts.count ?? 0,
      openDisputes:      openDisputes.count ?? 0,
      paymentMismatches: paymentMismatches.count ?? 0,
    },
    recentCampaigns: recent.data ?? [],
    recentDonations: recentDon.data ?? [],
  })
}
