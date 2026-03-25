'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Campaign, Donation } from '@/types'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface DashboardCampaign extends Campaign {
  lastUpdateDays?: number;
}

interface DashboardUser {
  firstName: string;
  fullName: string;
  email: string;
  initials: string;
  phone: string;
  avatarUrl: string | null;
  verificationStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  joinedDate: string;
  joinedRelative: string;
  campaignCount: number;
  totalRaised: number;
  totalDonors: number;
}

interface DashboardNotif {
  id: string;
  type: 'donation' | 'milestone' | 'update_prompt' | 'system';
  title: string;
  text: string;
  time: string;
  timeRelative: string;
  read: boolean;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function pct(r: number, g: number) {
  if (!g || g <= 0) return 0
  return Math.min(100, Math.round(((r || 0) / g) * 100))
}

function fmtGHS(n: number) {
  const val = n || 0
  if (val >= 100000) return `GHS ${(val / 1000).toFixed(0)}k`
  return `GHS ${val.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getVerificationConfig(status: string) {
  switch (status) {
    case 'verified': return { label: 'Verified', color: '#0A6B4B', bg: '#E8F5EF', icon: '✓' }
    case 'pending': return { label: 'Under Review', color: '#B85C00', bg: '#FEF3E2', icon: '⏳' }
    case 'rejected': return { label: 'Rejected', color: '#C0392B', bg: '#FCEBEB', icon: '✕' }
    default: return { label: 'Not Verified', color: '#8A8A82', bg: '#F2F3F4', icon: '○' }
  }
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: '#8A8A82', bg: '#F2F3F4' },
  pending: { label: 'Pending', color: '#B85C00', bg: '#FEF3E2' },
  pending_verification: { label: 'Under Review', color: '#B85C00', bg: '#FEF3E2' },
  approved: { label: 'Live', color: '#0A6B4B', bg: '#E8F5EF' },
  live: { label: 'Live', color: '#0A6B4B', bg: '#E8F5EF' },
  funded: { label: 'Funded', color: '#185FA5', bg: '#E6F1FB' },
  closed: { label: 'Closed', color: '#4A4A44', bg: '#EAECEE' },
  rejected: { label: 'Rejected', color: '#C0392B', bg: '#FCEBEB' },
}

// ─── CAMPAIGN CARD ────────────────────────────────────────────────────────────

function CampaignCard({ campaign }: { campaign: DashboardCampaign }) {
  const p = pct(campaign.raised_amount || 0, campaign.goal_amount || 0)
  const st = STATUS_CFG[campaign.status || 'draft'] || STATUS_CFG.draft
  const needsUpdate = (campaign.lastUpdateDays || 0) >= 3 && campaign.status === 'approved'
  const createdDate = new Date(campaign.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow .2s ease, transform .2s ease' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}>
      <div style={{ position: 'relative', height: 140, background: campaign.image_url ? `url(${campaign.image_url}) center/cover` : 'linear-gradient(135deg,#1A5276,#2E86C1)' }}>
        {!campaign.image_url && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, opacity: .5, color: '#fff', fontWeight: 600 }}>No image</div>}
        <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: st.color, background: st.bg, backdropFilter: 'blur(4px)' }}>{st.label}</div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, color: '#0A6B4B', marginBottom: 6 }}>{campaign.category || 'Uncategorized'}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', lineHeight: 1.4, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>{campaign.title}</div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A18' }}>{fmtGHS(campaign.raised_amount || 0)}</span>
          <span style={{ fontSize: 11, color: '#8A8A82' }}>of {fmtGHS(campaign.goal_amount || 0)}</span>
        </div>

        <div style={{ height: 5, background: '#E8E4DC', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${p}%`, borderRadius: 3, background: p >= 100 ? 'linear-gradient(90deg,#185FA5,#2E86C1)' : 'linear-gradient(90deg,#0A6B4B,#27AE60)', transition: 'width .8s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8A82', marginBottom: 12 }}>
          <span>{p}% funded</span>
          <span>{campaign.donor_count || 0} donor{(campaign.donor_count || 0) !== 1 ? 's' : ''}</span>
        </div>

        {needsUpdate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FEF3E2', borderRadius: 7, padding: '7px 10px', marginBottom: 10, border: '1px solid #F5CBA7' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#B85C00' }}>!</span>
            <span style={{ fontSize: 11, color: '#B85C00', lineHeight: 1.4 }}>{campaign.lastUpdateDays} days without an update — post one to keep donors engaged</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 6, borderTop: '1px solid #F2F0EB', paddingTop: 12, marginTop: 4 }}>
          <Link href={`/campaigns/${campaign.id}`} style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#0A6B4B', background: '#E8F5EF', padding: '7px 0', borderRadius: 6, textAlign: 'center' }}>View</Link>
          <Link href={`/dashboard/campaigns/${campaign.id}/update`} style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#185FA5', background: '#E6F1FB', padding: '7px 0', borderRadius: 6, textAlign: 'center' }}>Update</Link>
          <Link href={`/dashboard/campaigns/${campaign.id}/edit`} style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#4A4A44', background: '#F5F4F0', padding: '7px 0', borderRadius: 6, textAlign: 'center' }}>Edit</Link>
        </div>

        <div style={{ fontSize: 10, color: '#B0AEA6', marginTop: 8 }}>Created {createdDate}</div>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, description, actionLabel, actionHref }: { icon: string; title: string; description: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, padding: '48px 32px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A18', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#8A8A82', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 16px' }}>{description}</div>
      {actionLabel && actionHref && (
        <Link href={actionHref} style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '10px 20px', borderRadius: 8 }}>{actionLabel}</Link>
      )}
    </div>
  )
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

type TabId = 'overview' | 'campaigns' | 'donors' | 'notifications' | 'profile'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [campaigns, setCampaigns] = useState<DashboardCampaign[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [notifs, setNotifs] = useState<DashboardNotif[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabId>('overview')

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return router.push('/auth/login')

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()

      // Fetch campaigns
      const { data: campData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('organizer_id', authUser.id)
        .order('created_at', { ascending: false })

      const processedCamps: DashboardCampaign[] = (campData || []).map((c: any) => {
        const last = c.last_update_at ? new Date(c.last_update_at) : new Date(c.created_at)
        const diff = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24))
        return { ...c, lastUpdateDays: diff }
      })
      setCampaigns(processedCamps)

      // Build user from real auth + profile data
      const fullName = profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Fundraiser'
      const totalRaised = processedCamps.reduce((a, c) => a + (c.raised_amount || 0), 0)
      const totalDonors = processedCamps.reduce((a, c) => a + (c.donor_count || 0), 0)

      setUser({
        firstName: fullName.split(' ')[0],
        fullName,
        email: authUser.email || profile?.email || '',
        initials: fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
        phone: profile?.phone || '',
        avatarUrl: profile?.avatar_url || null,
        verificationStatus: profile?.verification_status || 'not_submitted',
        joinedDate: new Date(profile?.created_at || authUser.created_at).toLocaleDateString('en-GH', { month: 'long', day: 'numeric', year: 'numeric' }),
        joinedRelative: timeAgo(profile?.created_at || authUser.created_at),
        campaignCount: processedCamps.length,
        totalRaised,
        totalDonors,
      })

      // Fetch donations
      const campaignIds = processedCamps.map(c => c.id)
      if (campaignIds.length > 0) {
        const { data: donData } = await supabase
          .from('donations')
          .select('*')
          .in('campaign_id', campaignIds)
          .eq('status', 'success')
          .order('created_at', { ascending: false })
          .limit(25)
        setDonations(donData || [])
      }

      // Fetch notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(25)

      if (notifData) {
        setNotifs(notifData.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title || 'Notification',
          text: n.message,
          time: new Date(n.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          timeRelative: timeAgo(n.created_at),
          read: n.is_read,
        })))
      }

      setLoading(false)

      // Fire background nudge check (non-blocking)
      try {
        await supabase.rpc('check_fundraiser_nudges', { f_id: authUser.id })
      } catch (_) { /* nudge function may not exist yet */ }
    }
    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalRaised = campaigns.reduce((a, c) => a + (c.raised_amount || 0), 0)
  const totalDonors = campaigns.reduce((a, c) => a + (c.donor_count || 0), 0)
  const liveCount = campaigns.filter(c => c.status === 'approved').length
  const unreadCount = notifs.filter(n => !n.read).length

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: 12 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #E8E4DC', borderTopColor: '#0A6B4B', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
        <div style={{ fontSize: 14, fontWeight: 500, color: '#8A8A82' }}>Loading your dashboard...</div>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes spin{to{transform:rotate(360deg)}}' }} />
      </div>
    )
  }

  const verif = getVerificationConfig(user?.verificationStatus || '')

  const sidebarItems: { id: TabId; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: '' },
    { id: 'campaigns', label: 'Campaigns', icon: '', badge: campaigns.length },
    { id: 'donors', label: 'Donors', icon: '', badge: donations.length },
    { id: 'notifications', label: 'Notifications', icon: '', badge: unreadCount },
    { id: 'profile', label: 'My Account', icon: '' },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .eg-sidebar-btn{transition:all .15s ease;border:none;cursor:pointer;font-family:inherit;width:100%;text-align:left}
        .eg-sidebar-btn:hover{background:#F5F4F0!important}
        .eg-stat-card{transition:transform .2s ease,box-shadow .2s ease}
        .eg-stat-card:hover{transform:translateY(-2px);box-shadow:0 4px 16px rgba(0,0,0,.06)}
        a{color:inherit;text-decoration:none}
      ` }} />

      {/* CONTEXTUAL BANNERS */}
      {user?.verificationStatus === 'not_submitted' && (
        <div style={{ background: 'linear-gradient(90deg,#FEF3E2,#FAEEDA)', borderBottom: '1px solid #F5CBA7', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            
            <span style={{ fontSize: 13, color: '#B85C00' }}><strong>Verify your identity</strong> to publish campaigns. Verified fundraisers raise 3× more.</span>
          </div>
          <Link href="/verify" style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: '#B85C00', padding: '7px 14px', borderRadius: 7, whiteSpace: 'nowrap' }}>Verify Now →</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: 'calc(100vh - 64px)' }}>
        {/* ─── SIDEBAR ──────────────────────────────────────────────── */}
        <aside style={{ background: '#fff', borderRight: '1px solid #E8E4DC', padding: '24px 16px', position: 'sticky', top: 64, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
          {/* Profile card */}
          <div onClick={() => setTab('profile')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', marginBottom: 8, borderRadius: 10, background: '#FAFAF8', border: '1px solid #F0EDE8' }}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#0A6B4B,#27AE60)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{user?.initials}</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullName}</div>
              <div style={{ fontSize: 11, color: '#8A8A82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            </div>
          </div>

          {/* Nav buttons */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            {sidebarItems.map(item => (
              <button key={item.id} className="eg-sidebar-btn"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, fontSize: 13, background: tab === item.id ? '#E8F5EF' : 'transparent', color: tab === item.id ? '#0A6B4B' : '#4A4A44', fontWeight: tab === item.id ? 600 : 400 }}
                onClick={() => setTab(item.id)}>
                {item.icon && <span style={{ fontSize: 15 }}>{item.icon}</span>}
                <span style={{ flex: 1 }}>{item.label}</span>
                {(item.badge || 0) > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: tab === item.id ? '#0A6B4B' : '#E8E4DC', color: tab === item.id ? '#fff' : '#4A4A44', padding: '2px 7px', borderRadius: 10 }}>{item.badge}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom CTA */}
          <Link href="/create" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg,#0A6B4B,#27AE60)', padding: '11px 0', borderRadius: 9, marginTop: 16 }}>
            + New Campaign
          </Link>
        </aside>

        {/* ─── MAIN CONTENT ─────────────────────────────────────────── */}
        <main style={{ padding: '28px 32px 56px', background: '#F5F4F0' }}>

          {/* HEADER */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: '#1A1A18', marginBottom: 4 }}>{getGreeting()}, {user?.firstName} </h1>
            <p style={{ fontSize: 14, color: '#8A8A82' }}>Here&apos;s what&apos;s happening with your fundraising campaigns</p>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* OVERVIEW TAB */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {tab === 'overview' && (
            <div style={{ animation: 'fadeup .25s ease both' }}>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
                {[
                  { label: 'Total Raised', value: fmtGHS(totalRaised), sub: 'across all campaigns', color: '#0A6B4B', icon: '' },
                  { label: 'Live Campaigns', value: String(liveCount), sub: `${campaigns.length} total`, color: '#1A1A18', icon: '' },
                  { label: 'Total Donors', value: String(totalDonors), sub: 'unique supporters', color: '#185FA5', icon: '' },
                  { label: 'Notifications', value: String(unreadCount), sub: unreadCount === 0 ? 'all caught up' : 'unread', color: unreadCount > 0 ? '#B85C00' : '#8A8A82', icon: '' },
                ].map(card => (
                  <div key={card.label} className="eg-stat-card" style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 12, padding: '18px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A82', textTransform: 'uppercase', letterSpacing: '.04em' }}>{card.label}</div>
                    </div>
                    <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 30, color: card.color, marginBottom: 2 }}>{card.value}</div>
                    <div style={{ fontSize: 11, color: '#B0AEA6' }}>{card.sub}</div>
                  </div>
                ))}
              </div>

              {/* Quick glance: Recent activity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Recent donations */}
                <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #F2F0EB' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18' }}>Recent Donations</div>
                    <button onClick={() => setTab('donors')} style={{ fontSize: 11, fontWeight: 600, color: '#0A6B4B', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                  </div>
                  {donations.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8A8A82', fontSize: 13 }}>No donations yet — share your campaign link to start receiving support!</div>
                  ) : (
                    donations.slice(0, 4).map((d: any, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: i < 3 ? '1px solid #F8F7F5' : 'none' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#E8F5EF,#B7DEC9)', color: '#0A6B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{(d.donor_name || 'A')[0].toUpperCase()}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>{d.donor_name || 'Anonymous'}</div>
                          <div style={{ fontSize: 11, color: '#8A8A82' }}>{timeAgo(d.created_at)}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0A6B4B' }}>GHS {((d.amount_paid || 0) / 100).toFixed(2)}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Recent notifications */}
                <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #F2F0EB' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18' }}>Activity Feed</div>
                    <button onClick={() => setTab('notifications')} style={{ fontSize: 11, fontWeight: 600, color: '#0A6B4B', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                  </div>
                  {notifs.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#8A8A82', fontSize: 13 }}>No activity yet — you&apos;ll see donation alerts and milestone updates here.</div>
                  ) : (
                    notifs.slice(0, 4).map((n, i) => (
                      <div key={n.id} style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: i < 3 ? '1px solid #F8F7F5' : 'none', background: n.read ? '#fff' : '#FEFCF8' }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{n.type === 'donation' ? 'GHS' : n.type === 'milestone' ? 'MS' : 'N'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: '#1A1A18', lineHeight: 1.4 }}>{n.text}</div>
                          <div style={{ fontSize: 10, color: '#B0AEA6', marginTop: 2 }}>{n.timeRelative}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* CAMPAIGNS TAB */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {tab === 'campaigns' && (
            <div style={{ animation: 'fadeup .25s ease both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22 }}>My Campaigns</h2>
                <Link href="/create" style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '8px 16px', borderRadius: 7 }}>+ New Campaign</Link>
              </div>
              {campaigns.length === 0 ? (
                <EmptyState icon="" title="No campaigns yet" description="Start your first fundraising campaign and begin accepting donations from supporters." actionLabel="Create Campaign" actionHref="/create" />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                  {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* DONORS TAB */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {tab === 'donors' && (
            <div style={{ animation: 'fadeup .25s ease both' }}>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, marginBottom: 20 }}>Recent Donors</h2>
              {donations.length === 0 ? (
                <EmptyState icon="" title="No donations yet" description="When supporters donate to your campaigns, they'll appear here. Share your campaign to get started!" />
              ) : (
                <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, overflow: 'hidden' }}>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', padding: '10px 16px', background: '#FAFAF8', borderBottom: '1px solid #E8E4DC', fontSize: 10, fontWeight: 700, color: '#8A8A82', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    <span>Donor</span><span>Campaign</span><span>Amount</span><span>Date</span>
                  </div>
                  {donations.map((d: any, i) => {
                    const camp = campaigns.find(c => c.id === d.campaign_id)
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #F8F7F5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#E8F5EF,#B7DEC9)', color: '#0A6B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{(d.donor_name || 'A')[0].toUpperCase()}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>{d.donor_name || 'Anonymous'}</div>
                            <div style={{ fontSize: 11, color: '#B0AEA6' }}>{d.donor_email || ''}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#4A4A44', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{camp?.title || 'Unknown'}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0A6B4B' }}>GHS {((d.amount_paid || 0) / 100).toFixed(2)}</div>
                        <div style={{ fontSize: 11, color: '#8A8A82' }}>{timeAgo(d.created_at)}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* NOTIFICATIONS TAB */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {tab === 'notifications' && (
            <div style={{ animation: 'fadeup .25s ease both' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22 }}>Notifications</h2>
                {unreadCount > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: '#B85C00', background: '#FEF3E2', padding: '4px 10px', borderRadius: 20 }}>{unreadCount} unread</span>}
              </div>
              {notifs.length === 0 ? (
                <EmptyState icon="" title="No notifications" description="You'll receive alerts when donors contribute to your campaigns and when milestones are reached." />
              ) : (
                <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, overflow: 'hidden' }}>
                  {notifs.map(n => (
                    <div key={n.id} onClick={() => markRead(n.id)} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F8F7F5', background: n.read ? '#fff' : '#FEFCF8', cursor: 'pointer', transition: 'background .15s ease' }}
                      onMouseEnter={e => { if (!n.read) e.currentTarget.style.background = '#FEF8F0' }}
                      onMouseLeave={e => { e.currentTarget.style.background = n.read ? '#fff' : '#FEFCF8' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, color: n.type === 'donation' ? '#0A6B4B' : n.type === 'milestone' ? '#185FA5' : '#B85C00', background: n.type === 'donation' ? '#E8F5EF' : n.type === 'milestone' ? '#E6F1FB' : '#FEF3E2' }}>
                        {n.type === 'donation' ? 'GHS' : n.type === 'milestone' ? 'MS' : 'N'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: '#1A1A18', lineHeight: 1.5 }}>{n.text}</div>
                        <div style={{ fontSize: 11, color: '#B0AEA6', marginTop: 2 }}>{n.time} · {n.timeRelative}</div>
                      </div>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0A6B4B', flexShrink: 0, marginTop: 6 }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PROFILE TAB */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {tab === 'profile' && (
            <div style={{ animation: 'fadeup .25s ease both' }}>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, marginBottom: 20 }}>My Account</h2>

              {/* Profile hero card */}
              <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
                <div style={{ background: 'linear-gradient(135deg,#0A6B4B,#27AE60)', height: 80 }} />
                <div style={{ padding: '0 24px 24px', marginTop: -30 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.1)' }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#1A5276,#2E86C1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.1)', flexShrink: 0 }}>{user?.initials}</div>
                    )}
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1A18' }}>{user?.fullName}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: verif.color, background: verif.bg, marginTop: 4 }}>
                        <span>{verif.icon}</span> {verif.label}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                    {[
                      { label: 'Campaigns', value: String(user?.campaignCount || 0), icon: '' },
                      { label: 'Total Raised', value: fmtGHS(user?.totalRaised || 0), icon: '' },
                      { label: 'Total Donors', value: String(user?.totalDonors || 0), icon: '' },
                    ].map(s => (
                      <div key={s.label} style={{ background: '#FAFAF8', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: '#1A1A18' }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: '#8A8A82' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Details card */}
              <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A18', marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid #F2F0EB' }}>Account Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {[
                    { label: 'Full Name', value: user?.fullName, icon: '' },
                    { label: 'Email Address', value: user?.email || 'Not provided', icon: '' },
                    { label: 'Phone Number', value: user?.phone || 'Not provided', icon: '' },
                    { label: 'Member Since', value: user?.joinedDate, icon: '' },
                  ].map(field => (
                    <div key={field.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#B0AEA6', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }}>{field.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: '#1A1A18' }}>{field.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}
