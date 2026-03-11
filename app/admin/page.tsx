'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Stats {
  totalCampaigns:   number
  pendingCampaigns: number
  activeCampaigns:  number
  totalUsers:       number
  totalDonations:   number
  totalRaised:      number
}

interface RecentCampaign {
  id:                string
  title:             string
  status:            string
  verification_tier: string
  created_at:        string
  profiles:          { full_name: string | null } | null
}

interface RecentDonation {
  id:         string
  amount:     number
  donor_name: string | null
  created_at: string
  campaigns:  { title: string } | null
}

const TIER_COLOR: Record<string, string> = {
  basic:    'bg-gray-700 text-gray-300',
  standard: 'bg-green-500/20 text-green-400',
  premium:  'bg-amber-500/20 text-amber-400',
  gold:     'bg-yellow-500/20 text-yellow-400',
  diamond:  'bg-purple-500/20 text-purple-400',
}

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-amber-500/20 text-amber-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}

export default function AdminDashboard() {
  const [stats,           setStats]           = useState<Stats | null>(null)
  const [recentCampaigns, setRecentCampaigns] = useState<RecentCampaign[]>([])
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([])
  const [loading,         setLoading]         = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('campaigns').select('id', { count: 'exact', head: true }),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('donations').select('id, amount').eq('status', 'success'),
      supabase.from('campaigns')
        .select('id, title, status, verification_tier, created_at, profiles(full_name)')
        .order('created_at', { ascending: false }).limit(5),
      supabase.from('donations')
        .select('id, amount, donor_name, created_at, campaigns(title)')
        .eq('status', 'success').order('created_at', { ascending: false }).limit(5),
    ]).then(([all, pending, active, users, donations, recent, recentDon]) => {
      const raised = ((donations.data ?? []) as { amount: number }[])
        .reduce((s, d) => s + (d.amount ?? 0), 0)
      setStats({
        totalCampaigns:   all.count      ?? 0,
        pendingCampaigns: pending.count  ?? 0,
        activeCampaigns:  active.count   ?? 0,
        totalUsers:       users.count    ?? 0,
        totalDonations:   donations.count ?? 0,
        totalRaised:      raised,
      })
      setRecentCampaigns((recent.data ?? []) as RecentCampaign[])
      setRecentDonations((recentDon.data ?? []) as RecentDonation[])
      setLoading(false)
    })
  }, [])

  const STAT_CARDS = stats ? [
    { label: 'Total campaigns',  val: stats.totalCampaigns,                        color: 'text-blue-400',   href: '/admin/campaigns',                urgent: false },
    { label: 'Pending review',   val: stats.pendingCampaigns,                      color: 'text-amber-400',  href: '/admin/campaigns?status=pending', urgent: stats.pendingCampaigns > 0 },
    { label: 'Active campaigns', val: stats.activeCampaigns,                       color: 'text-green-400',  href: '/admin/campaigns',                urgent: false },
    { label: 'Registered users', val: stats.totalUsers,                            color: 'text-purple-400', href: '/admin/users',                    urgent: false },
    { label: 'Total donations',  val: stats.totalDonations,                        color: 'text-green-400',  href: '/admin/donations',                urgent: false },
    { label: 'Total raised',     val: `GH${String.fromCharCode(8373)}${stats.totalRaised.toLocaleString()}`, color: 'text-amber-400', href: '/admin/donations', urgent: false },
  ] : []

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-nunito font-black text-white text-2xl mb-1">Dashboard</h1>
        <p className="text-white/30 text-sm">Overview of EveryGiving platform activity.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {STAT_CARDS.map((s, i) => (
            <Link key={i} href={s.href}
              className={`bg-gray-900 border rounded-2xl p-5 hover:bg-gray-800 transition-all ${
                s.urgent ? 'border-amber-500/30 shadow-lg shadow-amber-500/5' : 'border-white/5'
              }`}>
              {s.urgent && (
                <div className="flex justify-end mb-1">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                </div>
              )}
              <div className={`font-nunito font-black text-2xl mb-1 ${s.color}`}>{s.val}</div>
              <div className="text-white/30 text-xs">{s.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-nunito font-black text-white">Recent campaigns</p>
            <Link href="/admin/campaigns" className="text-primary text-xs font-bold hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : recentCampaigns.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-6">No campaigns yet</p>
          ) : (
            <div className="space-y-2">
              {recentCampaigns.map(c => (
                <Link key={c.id} href="/admin/campaigns"
                  className="flex items-center justify-between gap-3 hover:bg-white/5 rounded-xl px-2 py-1.5 -mx-2 transition-all group">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate group-hover:text-primary transition-colors">{c.title}</p>
                    <p className="text-white/30 text-xs">{c.profiles?.full_name ?? 'Unknown'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLOR[c.verification_tier] ?? 'bg-gray-700 text-gray-300'}`}>
                      {c.verification_tier}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLOR[c.status] ?? ''}`}>
                      {c.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="font-nunito font-black text-white">Recent donations</p>
            <Link href="/admin/donations" className="text-primary text-xs font-bold hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)}
            </div>
          ) : recentDonations.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-6">No donations yet</p>
          ) : (
            <div className="space-y-3">
              {recentDonations.map(d => (
                <div key={d.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{d.donor_name ?? 'Anonymous'}</p>
                    <p className="text-white/30 text-xs truncate">{d.campaigns?.title}</p>
                  </div>
                  <p className="font-nunito font-black text-primary text-sm flex-shrink-0">
                    GH{String.fromCharCode(8373)}{d.amount?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
