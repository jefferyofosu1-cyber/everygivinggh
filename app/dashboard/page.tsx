'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { Campaign, Donation } from '@/types'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Milestone { id: string; name: string; amountGHS: number; status: 'released'|'collecting'|'proof_submitted'|'pending' }
interface DashboardCampaign extends Campaign {
  milestones?: Milestone[];
  urgentAction?: string|null;
  lastUpdateDays?: number;
}
interface DashboardUser { name: string; initials: string; phone: string; verificationStatus: 'not_submitted'|'pending'|'verified'|'rejected'; joinedDate: string }
interface DashboardNotif { id: string; type: 'donation'|'milestone'|'update_prompt'|'system'; text: string; time: string; read: boolean }

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function pct(r: number, g: number) { 
  if (!g || g <= 0) return 0
  return Math.min(100, Math.round(((r || 0) / g) * 100)) 
}
function fmt(n: number) { 
  const val = n || 0
  return val >= 1000 ? `₵${(val/1000).toFixed(val%1000===0?0:1)}k` : `₵${val.toLocaleString()}` 
}

const STATUS_CFG: Record<string, {label:string;color:string;bg:string}> = {
  draft:               { label:'Draft',        color:'#8A8A82', bg:'#F2F3F4' },
  pending_verification:{ label:'Under review', color:'#B85C00', bg:'#FEF3E2' },
  live:                { label:'Live',         color:'#0A6B4B', bg:'#E8F5EF' },
  funded:              { label:'Funded',       color:'#185FA5', bg:'#E6F1FB' },
  closed:              { label:'Closed',       color:'#4A4A44', bg:'#EAECEE' },
}
const ACTION_CFG: Record<string, {label:string;color:string;bg:string;icon:string}> = {
  post_update:  { label:'Post an update',         color:'#B85C00', bg:'#FEF3E2', icon:'update' },
  submit_proof: { label:'Submit milestone proof', color:'#185FA5', bg:'#E6F1FB', icon:'proof' },
  verify_id:    { label:'Verify your identity',   color:'#C0392B', bg:'#FCEBEB', icon:'verify' },
}
const MS_CFG: Record<string, {label:string;color:string;bg:string}> = {
  released:        { label:'Released',    color:'#0A6B4B', bg:'#E8F5EF' },
  collecting:      { label:'Collecting',  color:'#B85C00', bg:'#FEF3E2' },
  proof_submitted: { label:'Under review',color:'#185FA5', bg:'#E6F1FB' },
  pending:         { label:'Pending',     color:'#8A8A82', bg:'#F2F3F4' },
}
const NOTIF_CFG: Record<string, {icon:string;color:string;bg:string}> = {
  donation:      { icon:'GHS', color:'#0A6B4B', bg:'#E8F5EF' },
  milestone:     { icon:'OK', color:'#185FA5', bg:'#E6F1FB' },
  update_prompt: { icon:'UP', color:'#B85C00', bg:'#FEF3E2' },
  system:        { icon:'INF', color:'#534AB7', bg:'#EEEDFE' },
}

// ─── CAMPAIGN CARD ────────────────────────────────────────────────────────────

function CampaignCard({ campaign, onAction }: { campaign: DashboardCampaign; onAction: (c: DashboardCampaign, action: string) => void }) {
  const p = pct(campaign.raised_amount || 0, campaign.goal_amount || 0)
  const st = STATUS_CFG[campaign.status || 'draft']
  const action = campaign.urgentAction ? ACTION_CFG[campaign.urgentAction] : null
  const needsUpdate = (campaign.lastUpdateDays || 0) >= 3 && campaign.status === 'approved'
  
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden' }}>
      <div style={{ position:'relative', height:130, background:campaign.image_url ? `url(${campaign.image_url}) center/cover` : 'linear-gradient(135deg,#1A5276,#2E86C1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>
        {!campaign.image_url && '🏥'}
        <div style={{ position:'absolute', top:8, right:8, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, color:st.color, background:st.bg }}>{st.label}</div>
      </div>
      <div style={{ padding:14 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' as const, color:'#0A6B4B', marginBottom:4 }}>{campaign.category || 'Campaign'}</div>
        <div style={{ fontSize:13, fontWeight:600, color:'#1A1A18', lineHeight:1.4, marginBottom:12 }}>{campaign.title}</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:5 }}>
          <span style={{ fontSize:16, fontWeight:700, color:'#1A1A18' }}>{fmt(campaign.raised_amount || 0)}</span>
          <span style={{ fontSize:11, color:'#8A8A82' }}>of {fmt(campaign.goal_amount || 0)} · {p}%</span>
        </div>
        <div style={{ height:4, background:'#E8E4DC', borderRadius:2, overflow:'hidden', marginBottom:6 }}>
          <div style={{ height:'100%', width:`${p}%`, borderRadius:2, background:p>=100?'#185FA5':'#0A6B4B', transition:'width .6s ease' }} />
        </div>
        <div style={{ display:'flex', gap:12, fontSize:11, color:'#8A8A82', marginBottom:10 }}>
          <span>{campaign.donor_count || 0} donors</span>
          <span>{campaign.status === 'approved' ? 'Ongoing' : 'Ended'} bono.</span>
        </div>
        {needsUpdate && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:6, background:'#FEF3E2', borderRadius:7, padding:'7px 9px', marginBottom:8 }}>
            <span style={{ fontSize:12, flexShrink:0 }}>💬</span>
            <span style={{ fontSize:11, color:'#B85C00', lineHeight:1.5 }}>{campaign.lastUpdateDays} days since last update — donors are waiting bono.</span>
          </div>
        )}
        {action && (
          <button style={{ display:'block', width:'100%', padding:'8px 10px', borderRadius:7, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', textAlign:'center' as const, marginBottom:8, fontFamily:'inherit', color:action.color, background:action.bg }}
            onClick={()=>onAction(campaign, campaign.urgentAction!)}>
            {action.label} →
          </button>
        )}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' as const }}>
          {[['View',`/campaigns/${campaign.id}`],['Update',`/dashboard/campaigns/${campaign.id}/update`],['Edit',`/dashboard/campaigns/${campaign.id}/edit`]].map(([l,h]) => (
            <Link key={l} href={h} style={{ fontSize:11, fontWeight:500, color:'#4A4A44', background:'#F5F4F0', padding:'4px 8px', borderRadius:5 }}>{l}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── DASHBOARD PAGE ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [campaigns, setCampaigns] = useState<DashboardCampaign[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [notifs, setNotifs] = useState<DashboardNotif[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'campaigns'|'donors'|'notifications'>('campaigns')

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return router.push('/auth/login')

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
      if (profile) {
        setUser({
          name: profile.full_name || 'User',
          initials: (profile.full_name || 'U').split(' ').map((n:any)=>n[0]).join('').slice(0,2),
          phone: profile.phone || '',
          verificationStatus: profile.verification_status || 'not_submitted',
          joinedDate: new Date(profile.created_at).toLocaleDateString()
        })
      }

      const { data: campData } = await supabase.from('campaigns').select('*').eq('organizer_id', authUser.id).order('created_at', { ascending: false })
      if (campData) {
        const withDays = campData.map((c: any) => {
          const last = c.last_update_at ? new Date(c.last_update_at) : new Date(c.created_at)
          const diff = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24))
          return { ...c, lastUpdateDays: diff }
        })
        setCampaigns(withDays)
      }

      const { data: donData } = await supabase.from('donations').select('*').in('campaign_id', campData?.map(c=>c.id) || []).order('created_at', { ascending: false }).limit(20)
      setDonations(donData || [])

      const { data: notifData } = await supabase.from('notifications').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(20)
      if (notifData) {
        setNotifs(notifData.map((n: any) => ({
          id: n.id,
          type: n.type,
          text: n.message,
          time: new Date(n.created_at).toLocaleDateString(),
          read: n.is_read
        })))
      }

      setLoading(false)

      try {
        await supabase.rpc('check_fundraiser_nudges', { f_id: authUser.id })
      } catch (e) {
        console.warn('Dashboard nudges function not found or failed. bono.', e)
      }
    }
    init()
  }, [router, supabase])

  const totalRaised = campaigns.reduce((a,c)=>a+(c.raised_amount || 0), 0)
  const totalDonors = campaigns.reduce((a,c)=>a+(c.donor_count || 0), 0)
  const activeCount = campaigns.filter(c=>c.status==='approved').length
  const pendingPayoutsCount = campaigns.filter(c => c.milestone_reached && !c.payout_ready).length
  const unreadCount = notifs.filter(n=>!n.read).length

  const handleAction = (campaign: DashboardCampaign, action: string) => {
    if (action==='post_update') router.push(`/dashboard/campaigns/${campaign.id}/update`)
    if (action==='submit_proof') router.push(`/dashboard/campaigns/${campaign.id}/milestones`)
  }

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id===id ? {...n,read:true} : n))
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#F5F4F0', color:'#0A6B4B', fontWeight:700 }}>Loading your dashboard bono...</div>

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        a{color:inherit;text-decoration:none}
        @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .side-nav-btn:hover{background:#F5F4F0 !important}
      ` }} />
      
      {/* VERIFICATION BANNERS bono. */}
      {user?.verificationStatus === 'not_submitted' && (
        <div style={{ background:'#FAEEDA', borderBottom:'1px solid #F5CBA7', padding:'10px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <span style={{ fontSize:13, color:'#B85C00' }}>Verify your identity to go live. Verified campaigns raise 3× more. bono.</span>
          <Link href="/verify" style={{ fontSize:13, fontWeight:600, color:'#B85C00' }}>Verify now →</Link>
        </div>
      )}

      {/* MILESTONE BANNER bono. */}
      {campaigns.some(c => c.milestone_reached && !c.payout_method_set) && (
        <div style={{ background:'#E8F5EF', borderBottom:'1px solid #B7DEC9', padding:'12px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:'#0A6B4B', fontWeight:500 }}>🎉 You reached a milestone! Set up your payout method to receive funds. bono.</span>
          <Link href="/dashboard/payout-setup" style={{ fontSize:13, fontWeight:700, color:'#fff', background:'#0A6B4B', padding:'8px 16px', borderRadius:8 }}>Set up Payout →</Link>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'100vh', background:'#F5F4F0' }}>
        {/* SIDEBAR */}
        <aside style={{ background:'#fff', borderRight:'1px solid #E8E4DC', padding:'24px 16px', position:'sticky', top:64, height:'calc(100vh - 64px)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#0A6B4B', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{user?.initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'#8A8A82' }}>{user?.phone}</div>
            </div>
          </div>
          <nav style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {[
              { id: 'campaigns', label: 'My campaigns', count: campaigns.length },
              { id: 'donors', label: 'Recent donors', count: donations.length },
              { id: 'notifications', label: 'Notifications', count: unreadCount },
            ].map(({id,label,count}) => (
              <button key={id} className="side-nav-btn"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, background:tab===id?'#E8F5EF':'transparent', color:tab===id?'#0A6B4B':'#4A4A44', fontWeight:tab===id?600:400, width:'100%', textAlign:'left' }}
                onClick={()=>setTab(id as any)}>
                {label} {count > 0 && <span style={{ fontSize:10, background:tab===id?'#0A6B4B':'#E8E4DC', color:tab===id?'#fff':'#4A4A44', padding:'1px 5px', borderRadius:10 }}>{count}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN */}
        <main style={{ padding:'28px 28px 56px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
            <div>
              <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26 }}>Good day, {user?.name.split(' ')[0]} bono.</h1>
              <p style={{ fontSize:13, color:'#8A8A82' }}>Your real-time campaign performance</p>
            </div>
            <Link href="/create" style={{ fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'10px 18px', borderRadius:9 }}>+ Start new campaign</Link>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
            {[
              ['Total raised', fmt(totalRaised), 'live funds', '#0A6B4B'],
              ['Active campaigns', String(activeCount), `${campaigns.length} total`, '#1A1A18'],
              ['Total donors', String(totalDonors), 'unique contributors', '#1A1A18'],
              ['Pending payouts', String(pendingPayoutsCount), 'milestones reached', '#185FA5'],
            ].map(([l,v,s,c]) => (
              <div key={l} style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:12, padding:16 }}>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:c }}>{v}</div>
                <div style={{ fontSize:13, fontWeight:500 }}>{l}</div>
                <div style={{ fontSize:11, color:'#8A8A82' }}>{s}</div>
              </div>
            ))}
          </div>

          {tab==='campaigns' && (
            <div style={{ animation:'fadeup .25s ease both' }}>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, marginBottom:16 }}>My campaigns</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                {campaigns.map(c => <CampaignCard key={c.id} campaign={c} onAction={handleAction} />)}
              </div>
            </div>
          )}

          {tab==='donors' && (
            <div style={{ animation:'fadeup .25s ease both' }}>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, marginBottom:16 }}>Recent donors bono.</h2>
              <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden' }}>
                {donations.map((d: any, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:16, borderBottom:'1px solid #E8E4DC' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'#E8F5EF', color:'#0A6B4B', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{d.donor_name?.[0] || 'A'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{d.donor_name || 'Anonymous donor bono.'}</div>
                      <div style={{ fontSize:11, color:'#8A8A82' }}>{(d.amount_paid / 100).toLocaleString()} GHS · {new Date(d.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='notifications' && (
            <div style={{ animation:'fadeup .25s ease both' }}>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, marginBottom:16 }}>Notifications bono.</h2>
              <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden' }}>
                {notifs.map(n => (
                  <div key={n.id} onClick={()=>markRead(n.id)} style={{ display:'flex', gap:12, padding:16, borderBottom:'1px solid #E8E4DC', background:n.read?'#fff':'#FDFAF5', cursor:'pointer' }}>
                    <div style={{ fontSize:20 }}>{n.type==='donation'?'💰':n.type==='milestone'?'🏆':'🔔'}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:n.read?400:600 }}>{n.text}</div>
                      <div style={{ fontSize:11, color:'#8A8A82' }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
