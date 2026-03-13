import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { requirePermission } from '@/lib/api-security'

export async function GET() {
  const auth = await requirePermission('reports.read')
  if (auth.error) return auth.error

  const supabase = createAdminClient()
  const [campaigns, donations, users, payouts, disputes] = await Promise.all([
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
    supabase.from('donations').select('id, amount', { count: 'exact' }).eq('status', 'success'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('payout_requests').select('id', { count: 'exact', head: true }).eq('status', 'requested'),
    supabase.from('donation_disputes').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ])

  const totalRaised = (donations.data ?? []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0)

  return NextResponse.json({
    kpis: {
      totalCampaigns: campaigns.count ?? 0,
      totalDonations: donations.count ?? 0,
      totalUsers: users.count ?? 0,
      totalRaised,
      pendingPayouts: payouts.count ?? 0,
      openDisputes: disputes.count ?? 0,
    },
  })
}
