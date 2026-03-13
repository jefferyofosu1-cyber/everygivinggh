import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { requirePermission } from '@/lib/api-security'

export async function GET() {
  const auth = await requirePermission('reports.read')
  if (auth.error) return auth.error

  const supabase = await getAdminClient()
  const [users, campaigns, approved, donors] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }),
    supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('donations').select('id', { count: 'exact', head: true }).eq('status', 'success'),
  ])

  return NextResponse.json({
    funnel: {
      signups: users.count ?? 0,
      campaignsCreated: campaigns.count ?? 0,
      campaignsApproved: approved.count ?? 0,
      successfulDonations: donors.count ?? 0,
    },
  })
}
