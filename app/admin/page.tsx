'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Stats = {
  totalCampaigns: number
  pendingCampaigns: number
  activeCampaigns: number
  totalUsers: number
  totalDonations: number
  totalRaised: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([])
  const [recentDonations, setRecentDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    Promise.all([
      supabase.from('campaigns').select('id, status', { count: 'exact' }),
      supabase.from('campaigns').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('campaigns').select('id', { count: 'exact' }).eq('status', 'approved'),
      supabase.from('profiles').select('id', { count: 'exact' }),
      supabase.from('donations').select('id, amount', { count: 'exact' }).eq('status', 'success'),
      supabase.from('campaigns').select('id, title, status, verification_tier, created_at, profiles(full_name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('donations').select('id, amount, donor_name, created_at, campaigns(title)').eq('status', 'success').order('created_at', { ascending: false }).limit(5),
    ]).then(([all, pending, active, users, donations, recent, recentDon]) => {
      const totalRaised = (donations.data || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0)
      setStats({
        totalCampaigns: all.count || 0,
        pendingCampaigns: pending.count || 0,
        activeCampaigns: active.count || 0,
        totalUsers: users.count || 0,
        totalDonations: donations.count || 0,
        totalRaised,
      })
      setRecentCampaigns(recent.data || [])
      setRecentDonations(recentDon.data || [])
      setLoading(false)
    })
  }, [])

  const STAT_CARDS = stats ? [
    { label: 'Total campaigns', val: stats.totalCampaigns, icon: '📋', color: 'text-blue-400', href: '/admin/campaigns' },
    { label: 'Pending review', val: stats.pendingCampaigns, icon: '⏳', color: 'text-amber-400', href: '/admin/campaigns?status=pending', urgent: stats.pendingCampaigns > 0 },
    { label: 'Active campaigns', val: stats.activeCampaigns, icon: '✅', color: 'text-primary', href: '/admin/campaigns?status=approved' },
    { label: 'Registered users', val: stats.totalUsers, icon: '👥', color: 'text-purple-400', href: '/admin/users' },
    { label: 'Successful donations', val: stats.totalDonations, icon: '💚', color: 'text-primary', href: '/admin/donations' },
    { label: 'Total raised', val: `₵${stats.totalRaised.toLocaleString()}`, icon: '💰', color: 'text-amber-400', href: '/admin/donations' },
  ] : []

  const tierColor: Record<string, string> = {
    basic: 'bg-gray-700 text-gray-300',
    standard: 'bg-primary/20 text-primary',
    premium: 'bg-amber-500/20 text-amber-400',
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    approved: 'bg-primary/20 text-primary',
    rejected: 'bg-red-500/20 text-red-400',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-nunito font-black text-white text-2xl mb-1">Dashboard</h1>
        <p className="text-white/30 text-sm">Overview of Every Giving platform activity.</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white/5 rounded-2xl h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {STAT_CARDS.map((s, i) => (
            <Link key={i} href={s.href}
              className={`bg-gray-900 border rounded-2xl p-5 hover:bg-gray-800 transition-all group ${s.urgent ? 'border-amber-500/30 shadow-lg shadow-amber-500/5' : 'border-white/5'}`}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{s.icon}</span>
                {s.urgent && <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
              </div>
              <div className={`font-nunito font-black text-2xl mb-1 ${s.color}`}>{s.val}</div>
              <div className="text-white/30 text-xs">{s.label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Recent activity */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent campaigns */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-nunito font-black text-white text-base">Recent campaigns</div>
            <Link href="/admin/campaigns" className="text-primary text-xs font-bold hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)}</div>
          ) : recentCampaigns.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-6">No campaigns yet</div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentCampaigns.map((c: any) => (
                <Link key={c.id} href={`/admin/campaigns?id=${c.id}`}
                  className="flex items-center justify-between gap-3 hover:bg-white/5 rounded-xl px-2 py-1.5 -mx-2 transition-all group">
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate group-hover:text-primary transition-colors">{c.title}</div>
                    <div className="text-white/30 text-xs">{c.profiles?.full_name || 'Unknown'}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tierColor[c.verification_tier] || 'bg-gray-700 text-gray-300'}`}>{c.verification_tier}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[c.status] || ''}`}>{c.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent donations */}
        <div className="bg-gray-900 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="font-nunito font-black text-white text-base">Recent donations</div>
            <Link href="/admin/donations" className="text-primary text-xs font-bold hover:underline">View all →</Link>
          </div>
          {loading ? (
            <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)}</div>
          ) : recentDonations.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-6">No donations yet</div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentDonations.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate">{d.donor_name || 'Anonymous'}</div>
                    <div className="text-white/30 text-xs truncate">{d.campaigns?.title}</div>
                  </div>
                  <div className="font-nunito font-black text-primary text-sm flex-shrink-0">₵{d.amount?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 bg-gray-900 border border-white/5 rounded-2xl p-6">
        <div className="font-nunito font-black text-white text-base mb-4">Quick actions</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Review pending campaigns', href: '/admin/campaigns?status=pending', icon: '⏳', color: 'border-amber-500/20 hover:border-amber-500/40 text-amber-400' },
            { label: 'View all users', href: '/admin/users', icon: '👥', color: 'border-white/10 hover:border-white/20 text-white/60' },
            { label: 'Export donations', href: '/admin/donations', icon: '📊', color: 'border-white/10 hover:border-white/20 text-white/60' },
            { label: 'View live site', href: '/', icon: '🌐', color: 'border-primary/20 hover:border-primary/40 text-primary' },
          ].map((action, i) => (
            <Link key={i} href={action.href}
              className={`border-2 rounded-xl p-4 text-center transition-all hover:-translate-y-0.5 ${action.color}`}>
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-xs font-bold leading-snug">{action.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
