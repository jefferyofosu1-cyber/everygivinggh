'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Milestone { id: string; name: string; amountGHS: number; status: 'released'|'collecting'|'proof_submitted'|'pending' }
interface Campaign {
  id: string; title: string; category: string; status: 'draft'|'pending_verification'|'live'|'funded'|'closed'
  goalGHS: number; raisedGHS: number; donorCount: number; daysLeft: number; lastUpdate: number
  milestones: Milestone[]; slug: string; createdAt: string; urgentAction: string|null
}
interface User { name: string; initials: string; phone: string; verificationStatus: 'not_submitted'|'pending'|'verified'|'rejected'; joinedDate: string }
interface Donor { name: string; amount: number; network: string; time: string; campaign: string; isNew: boolean }
interface Notif { id: string; type: 'donation'|'milestone'|'update_prompt'|'system'; text: string; time: string; read: boolean }

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// TODO: Replace with Supabase queries: SELECT * FROM campaigns WHERE user_id=session.user.id

const MOCK_USER: User = {
  name: 'Kwame Mensah', initials: 'KM', phone: '024 123 4567',
  verificationStatus: 'verified', joinedDate: 'January 2026',
}
const MOCK_CAMPAIGNS: Campaign[] = [
  { id:'c1', title:'Help Ama get life-saving kidney surgery at Korle Bu', category:'medical', status:'live', goalGHS:20000, raisedGHS:14400, donorCount:143, daysLeft:12, lastUpdate:3, slug:'ama-kidney-surgery', createdAt:'2026-03-04', urgentAction:'post_update',
    milestones:[{id:'m1',name:'Hospital deposit',amountGHS:5000,status:'released'},{id:'m2',name:'Surgery fees',amountGHS:12000,status:'collecting'},{id:'m3',name:'Post-op care',amountGHS:3000,status:'pending'}] },
  { id:'c2', title:'School supplies for 120 children in Volta Region', category:'education', status:'funded', goalGHS:4500, raisedGHS:4500, donorCount:54, daysLeft:0, lastUpdate:1, slug:'esi-school-supplies', createdAt:'2026-02-10', urgentAction:'submit_proof',
    milestones:[{id:'m4',name:'Buy supplies',amountGHS:4500,status:'proof_submitted'}] },
]
const MOCK_DONORS: Donor[] = [
  { name:'Efua Owusu', amount:200, network:'MTN MoMo', time:'2 min ago', campaign:"Ama's surgery", isNew:true },
  { name:'Kofi Asante', amount:500, network:'Vodafone Cash', time:'18 min ago', campaign:"Ama's surgery", isNew:true },
  { name:'Anonymous', amount:100, network:'MTN MoMo', time:'1 hr ago', campaign:"Ama's surgery", isNew:false },
  { name:'Abena Boateng', amount:50, network:'AirtelTigo', time:'3 hrs ago', campaign:"Ama's surgery", isNew:false },
]
const MOCK_NOTIFS: Notif[] = [
  { id:'n1', type:'donation', text:"Kofi Asante donated ₵500 to Ama's surgery", time:'18 min ago', read:false },
  { id:'n2', type:'milestone', text:'Milestone 1 (₵5,000 deposit) was released to your MTN MoMo', time:'2 days ago', read:false },
  { id:'n3', type:'update_prompt', text:"It's been 3 days since your last update. Post one to re-engage donors", time:'1 hr ago', read:false },
  { id:'n4', type:'donation', text:"Efua Owusu donated ₵200 to Ama's surgery", time:'2 min ago', read:true },
  { id:'n5', type:'system', text:'Your Ghana Card verification was approved', time:'5 days ago', read:true },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function pct(r: number, g: number) { return Math.min(100, Math.round((r/g)*100)) }
function fmt(n: number) { return n >= 1000 ? `₵${(n/1000).toFixed(n%1000===0?0:1)}k` : `₵${n.toLocaleString()}` }

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

function CampaignCard({ campaign, onAction }: { campaign: Campaign; onAction: (c: Campaign, action: string) => void }) {
  const p = pct(campaign.raisedGHS, campaign.goalGHS)
  const st = STATUS_CFG[campaign.status]
  const action = campaign.urgentAction ? ACTION_CFG[campaign.urgentAction] : null
  const needsUpdate = campaign.lastUpdate >= 3 && campaign.status === 'live'
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden' }}>
      <div style={{ position:'relative', height:130, background:'linear-gradient(135deg,#1A5276,#2E86C1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>
        🏥
        <div style={{ position:'absolute', top:8, right:8, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, color:st.color, background:st.bg }}>{st.label}</div>
        {campaign.daysLeft > 0 && campaign.daysLeft <= 5 && (
          <div style={{ position:'absolute', top:8, left:8, fontSize:10, fontWeight:700, color:'#B85C00', background:'#FEF3E2', padding:'2px 8px', borderRadius:20, display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#B85C00', animation:'pulse 1.5s infinite', display:'inline-block' }} />
            {campaign.daysLeft}d left
          </div>
        )}
      </div>
      <div style={{ padding:14 }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase' as const, color:'#0A6B4B', marginBottom:4 }}>{campaign.category}</div>
        <div style={{ fontSize:13, fontWeight:600, color:'#1A1A18', lineHeight:1.4, marginBottom:12 }}>{campaign.title}</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:5 }}>
          <span style={{ fontSize:16, fontWeight:700, color:'#1A1A18' }}>{fmt(campaign.raisedGHS)}</span>
          <span style={{ fontSize:11, color:'#8A8A82' }}>of {fmt(campaign.goalGHS)} · {p}%</span>
        </div>
        <div style={{ height:4, background:'#E8E4DC', borderRadius:2, overflow:'hidden', marginBottom:6 }}>
          <div style={{ height:'100%', width:`${p}%`, borderRadius:2, background:campaign.status==='funded'?'#185FA5':'#0A6B4B', transition:'width .6s ease' }} />
        </div>
        <div style={{ display:'flex', gap:12, fontSize:11, color:'#8A8A82', marginBottom:10 }}>
          <span>{campaign.donorCount} donors</span>
          {campaign.daysLeft > 0 ? <span>{campaign.daysLeft} days left</span> : <span>Campaign ended</span>}
        </div>
        {needsUpdate && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:6, background:'#FEF3E2', borderRadius:7, padding:'7px 9px', marginBottom:8 }}>
            <span style={{ fontSize:12, flexShrink:0 }}>💬</span>
            <span style={{ fontSize:11, color:'#B85C00', lineHeight:1.5 }}>{campaign.lastUpdate} days since last update — donors are waiting</span>
          </div>
        )}
        {action && (
          <button style={{ display:'block', width:'100%', padding:'8px 10px', borderRadius:7, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', textAlign:'center' as const, marginBottom:8, fontFamily:'inherit', color:action.color, background:action.bg }}
            onClick={()=>onAction(campaign, campaign.urgentAction!)}>
            {action.icon} {action.label} →
          </button>
        )}
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' as const }}>
          {[['View',`/campaigns/${campaign.slug}`],['Update',`/dashboard/campaigns/${campaign.id}/update`],['Edit',`/dashboard/campaigns/${campaign.id}/edit`]].map(([l,h]) => (
            <Link key={l} href={h} style={{ fontSize:11, fontWeight:500, color:'#4A4A44', background:'#F5F4F0', padding:'4px 8px', borderRadius:5 }}>{l}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Withdraw modal (stashed changes) ───────────────────────────────────────────

type PayMode = 'momo' | 'bank'
type WStep = 'form' | 'sent'

// Provide a stub of WithdrawModal so the stashed payout logic is preserved
export function WithdrawModal({ available, profile, onClose }: {
  available: number
  profile:   any | null
  onClose:   () => void
}) {
  const [method,  setMethod]  = useState<PayMode>((profile?.payout_method as PayMode) ?? 'momo')
  const [amount,  setAmount]  = useState('')
  const [wStep,   setWStep]   = useState<WStep>('form')
  const [loading, setLoading] = useState(false)

  const amtNum  = parseFloat(amount) || 0
  const fee     = +(amtNum * 0.02 + 0.25).toFixed(2)
  const receive = +(amtNum - fee).toFixed(2)

  async function handleConfirm() {
    setLoading(true)
    const res = await fetch('/api/dashboard/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amtNum, method })
    })

    if (!res.ok) {
      const { error } = await res.json()
      alert(error || 'Failed to request withdrawal')
      setLoading(false)
      return
    }

    setLoading(false)
    setWStep('sent')
  }

  return null
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyDashboard({ verificationStatus }: { verificationStatus: User['verificationStatus'] }) {
  return (
    <div style={{ position:'relative', borderRadius:16, overflow:'hidden', height:320, background:'linear-gradient(135deg,#1A1A18,#2C3E50)' }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(10,10,8,.85), rgba(10,10,8,.3))' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'28px' }}>
        <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:'#fff', marginBottom:8 }}>Ready to raise?</h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,.65)', lineHeight:1.65, marginBottom:20, maxWidth:440 }}>
          {verificationStatus==='verified'?'Your identity is verified. Start your first campaign in under 15 minutes.':'Verify your identity first — it takes under 5 minutes and helps you raise 3× more.'}
        </p>
        <div style={{ display:'flex', gap:10 }}>
          <Link href={verificationStatus==='verified'?'/create':'/verify'} style={{ fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'10px 20px', borderRadius:8 }}>
            {verificationStatus==='verified'?'Start a campaign →':'Verify your identity →'}
          </Link>
          <Link href="/campaigns" style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,.7)', background:'rgba(255,255,255,.1)', padding:'10px 20px', borderRadius:8, border:'1px solid rgba(255,255,255,.2)' }}>Browse campaigns</Link>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  // TODO: Replace with real data from Supabase session + queries
  const user = MOCK_USER
  const campaigns = MOCK_CAMPAIGNS
  const donors = MOCK_DONORS

  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS)
  const [tab, setTab] = useState('campaigns')

  const unread = notifs.filter(n=>!n.read).length
  const totalRaised = campaigns.reduce((a,c)=>a+c.raisedGHS, 0)
  const totalDonors = campaigns.reduce((a,c)=>a+c.donorCount, 0)
  const activeCampaigns = campaigns.filter(c=>c.status==='live').length
  const pendingPayouts = campaigns.flatMap(c=>c.milestones).filter(m=>m.status==='proof_submitted').length

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id===id ? {...n,read:true} : n))
  const markAllRead = () => setNotifs(prev => prev.map(n => ({...n,read:true})))

  const handleAction = (campaign: Campaign, action: string) => {
    if (action==='post_update') router.push(`/dashboard/campaigns/${campaign.id}/update`)
    if (action==='submit_proof') {
      const ms = campaign.milestones.find(m=>m.status==='collecting')
      if (ms) router.push(`/dashboard/campaigns/${campaign.id}/milestones/${ms.id}`)
    }
  }

  const allMilestones = campaigns.flatMap(c => c.milestones.map(m => ({ ...m, campaignTitle: c.title.slice(0,30)+'…' })))

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .side-nav-btn:hover{background:#F5F4F0 !important}
        .quick-link:hover{background:#E8F5EF !important;color:#0A6B4B !important}
        .notif-row:hover{background:#F5F4F0}
        .new-cam-card:hover{border-color:#B7DEC9 !important;background:#FDFAF5 !important}
      ` }} />
      {/* VERIFICATION BANNERS */}
      {user.verificationStatus === 'pending' && (
        <div style={{ background:'#E8F5EF', borderBottom:'1px solid #B7DEC9', padding:'10px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' as const }}>
          <span style={{ fontSize:13, color:'#0A6B4B' }}>Your Ghana Card is under review — usually approved within 24 hours.</span>
          <Link href="/verify" style={{ fontSize:13, fontWeight:600, color:'#0A6B4B', whiteSpace:'nowrap' as const }}>Check status →</Link>
        </div>
      )}
      {user.verificationStatus === 'rejected' && (
        <div style={{ background:'#FCEBEB', borderBottom:'1px solid #F0B0B0', padding:'10px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' as const }}>
          <span style={{ fontSize:13, color:'#C0392B' }}>Your ID verification was unsuccessful. Please resubmit with a clearer photo.</span>
          <Link href="/verify" style={{ fontSize:13, fontWeight:600, color:'#C0392B', whiteSpace:'nowrap' as const }}>Resubmit →</Link>
        </div>
      )}
      {user.verificationStatus === 'not_submitted' && (
        <div style={{ background:'#FAEEDA', borderBottom:'1px solid #F5CBA7', padding:'10px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' as const }}>
          <span style={{ fontSize:13, color:'#B85C00' }}>Verify your identity to go live. Verified campaigns raise 3× more.</span>
          <Link href="/verify" style={{ fontSize:13, fontWeight:600, color:'#B85C00', whiteSpace:'nowrap' as const }}>Verify now →</Link>
        </div>
      )}

      {/* LAYOUT */}
      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', minHeight:'calc(100vh - 56px)', alignItems:'start' }}>

        {/* SIDEBAR */}
        <aside style={{ background:'#fff', borderRight:'1px solid #E8E4DC', padding:'24px 16px', position:'sticky' as const, top:56, height:'calc(100vh - 56px)', overflowY:'auto' as const, display:'flex', flexDirection:'column' as const }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, padding:'0 4px' }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'#0A6B4B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>{user.initials}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#1A1A18' }}>{user.name}</div>
              <div style={{ fontSize:11, color:'#8A8A82', marginTop:1 }}>{user.phone}</div>
            </div>
          </div>
          {user.verificationStatus === 'verified' && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600, color:'#0A6B4B', background:'#E8F5EF', padding:'3px 9px', borderRadius:20, marginBottom:20, marginLeft:4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#0A6B4B" strokeWidth="2.5" strokeLinecap="round"/></svg>
              Ghana Card Verified
            </div>
          )}
          <nav style={{ display:'flex', flexDirection:'column' as const, gap:2, flex:1 }}>
            {([
              ['campaigns','My campaigns', campaigns.length],
              ['milestones','Milestones & payouts', pendingPayouts],
              ['donors','Recent donors', 0],
              ['notifications','Notifications', unread],
            ] as [string,string,number][]).map(([id,label,count]) => (
              <button key={id} className="side-nav-btn"
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 10px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontFamily:'inherit', textAlign:'left' as const, width:'100%', transition:'all .15s', background:tab===id?'#E8F5EF':'transparent', color:tab===id?'#0A6B4B':'#4A4A44', fontWeight:tab===id?600:400 }}
                onClick={()=>setTab(id)}>
                <span>{label}</span>
                {count > 0 && <span style={{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:10, transition:'all .15s', background:tab===id?'#0A6B4B':'#E8E4DC', color:tab===id?'#fff':'#4A4A44' }}>{count}</span>}
              </button>
            ))}
          </nav>
          <div style={{ display:'flex', flexDirection:'column' as const, gap:2, paddingTop:16, borderTop:'1px solid #E8E4DC', marginTop:16 }}>
            {[['How it works','/how-it-works'],['Fees','/fees']].map(([l,h]) => (
              <Link key={l} href={h} style={{ fontSize:12, color:'#8A8A82', padding:'6px 10px', borderRadius:6 }}>{l}</Link>
            ))}
            <Link href="/auth/login" style={{ fontSize:12, color:'#C0392B', padding:'6px 10px', borderRadius:6 }}>Sign out</Link>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ padding:'28px 28px 56px', maxWidth:900 }}>
          {/* WELCOME */}
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:24, flexWrap:'wrap' as const }}>
            <div>
              <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:'#1A1A18', marginBottom:4 }}>Good morning, {user.name.split(' ')[0]}</h1>
              <p style={{ fontSize:13, color:'#8A8A82' }}>Here&#39;s how your campaigns are doing</p>
            </div>
            <Link href="/create" style={{ fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'10px 18px', borderRadius:9, whiteSpace:'nowrap' as const }}>+ Start new campaign</Link>
          </div>

          {/* STATS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
            {([
              ['Total raised', fmt(totalRaised), 'across all campaigns', '#0A6B4B'],
              ['Active campaigns', String(activeCampaigns), `${campaigns.length} total`, '#1A1A18'],
              ['Total donors', String(totalDonors), 'across all campaigns', '#1A1A18'],
              ['Pending payouts', String(pendingPayouts), 'awaiting review', pendingPayouts>0?'#185FA5':'#1A1A18'],
            ] as [string,string,string,string][]).map(([label,value,sub,color]) => (
              <div key={label} style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, lineHeight:1, marginBottom:6, color }}>{value}</div>
                <div style={{ fontSize:13, fontWeight:500, color:'#1A1A18', marginBottom:2 }}>{label}</div>
                <div style={{ fontSize:11, color:'#8A8A82' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* CAMPAIGNS TAB */}
          {tab==='campaigns' && (
            <div style={{ animation:'fadeup .25s ease both' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18' }}>My campaigns</h2>
                <Link href="/create" style={{ fontSize:13, fontWeight:600, color:'#0A6B4B' }}>+ New campaign</Link>
              </div>
              {campaigns.length === 0 ? (
                <EmptyDashboard verificationStatus={user.verificationStatus} />
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                  {campaigns.map(c => <CampaignCard key={c.id} campaign={c} onAction={handleAction} />)}
                  <Link href="/create" className="new-cam-card" style={{ border:'1.5px dashed #E8E4DC', borderRadius:14, background:'#fff', display:'flex', flexDirection:'column' as const, alignItems:'center', justifyContent:'center', padding:24, minHeight:220, transition:'all .15s' }}>
                    <div style={{ fontSize:28, color:'#0A6B4B', fontWeight:300, width:48, height:48, border:'1.5px dashed #B7DEC9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>+</div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#1A1A18', marginBottom:4 }}>Start a new campaign</div>
                    <div style={{ fontSize:11, color:'#8A8A82', textAlign:'center' as const }}>Free to create · verified by our team</div>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* MILESTONES TAB */}
          {tab==='milestones' && (
            <div style={{ animation:'fadeup .25s ease both' }}>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18', marginBottom:16 }}>Milestones &amp; payouts</h2>
              <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
                <div style={{ display:'flex', gap:12, padding:'10px 16px', background:'#F5F4F0', borderBottom:'1px solid #E8E4DC' }}>
                  {['Milestone','Amount','Status'].map(h => <span key={h} style={{ fontSize:10, fontWeight:700, color:'#8A8A82', letterSpacing:'.06em', textTransform:'uppercase' as const, flex:1 }}>{h}</span>)}
                </div>
                {allMilestones.map((m, i) => {
                  const ms = MS_CFG[m.status] ?? MS_CFG.pending
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #E8E4DC' }}>
                      <div style={{ width:12, height:12, borderRadius:'50%', flexShrink:0, background:m.status==='released'?'#0A6B4B':m.status==='collecting'?'#B85C00':'#E8E4DC', border:m.status==='collecting'?'2px solid #B85C00':'none' }} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:'#1A1A18' }}>{m.name}</div>
                        <div style={{ fontSize:11, color:'#8A8A82', marginTop:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{m.campaignTitle}</div>
                      </div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1A1A18', flexShrink:0 }}>{fmt(m.amountGHS)}</div>
                      <div style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, flexShrink:0, color:ms.color, background:ms.bg }}>{ms.label}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:10, padding:'12px 16px', fontSize:13, color:'#4A4A44', lineHeight:1.65 }}>
                <strong>How payouts work:</strong> When a milestone amount is collected, submit proof (receipt, photo, or document) from your campaign page. Our team reviews within a few hours and releases funds to your MoMo wallet same day.
              </div>
            </div>
          )}

          {/* DONORS TAB */}
          {tab==='donors' && (
            <div style={{ animation:'fadeup .25s ease both' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18' }}>Recent donors</h2>
                <span style={{ fontSize:13, color:'#8A8A82' }}>{totalDonors} total donors</span>
              </div>
              <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
                {donors.map((d, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', borderBottom:i<donors.length-1?'1px solid #E8E4DC':'none' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'#E8F5EF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#0A6B4B', flexShrink:0 }}>{d.name==='Anonymous'?'?':d.name[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:500, color:'#1A1A18', display:'flex', alignItems:'center', gap:6 }}>
                        {d.name}
                        {d.isNew && <span style={{ fontSize:10, fontWeight:700, color:'#fff', background:'#0A6B4B', padding:'1px 6px', borderRadius:10 }}>New</span>}
                      </div>
                      <div style={{ fontSize:11, color:'#8A8A82', marginTop:1 }}>{d.network} · {d.campaign}</div>
                    </div>
                    <div style={{ fontSize:14, fontWeight:600, color:'#1A1A18', flexShrink:0 }}>₵{d.amount.toLocaleString()}</div>
                    <div style={{ fontSize:11, color:'#8A8A82', flexShrink:0, minWidth:50, textAlign:'right' as const }}>{d.time}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:10, padding:'12px 16px', fontSize:13, color:'#4A4A44', lineHeight:1.65 }}>
                Thank your donors with a personal update — it costs nothing and converts them into repeat givers.
                <Link href="/dashboard/campaigns/c1/update" style={{ color:'#0A6B4B', fontWeight:600, marginLeft:6 }}>Post an update →</Link>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {tab==='notifications' && (
            <div style={{ animation:'fadeup .25s ease both' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18' }}>Notifications</h2>
                {unread > 0 && <button style={{ fontSize:12, fontWeight:600, color:'#0A6B4B', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }} onClick={markAllRead}>Mark all read</button>}
              </div>
              <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden' }}>
                {notifs.map(n => {
                  const cfg = NOTIF_CFG[n.type] ?? NOTIF_CFG.system
                  return (
                    <div key={n.id} className="notif-row"
                      style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px', borderBottom:'1px solid #E8E4DC', cursor:'pointer', transition:'background .15s', background:n.read?'transparent':'#FDFAF5' }}
                      onClick={()=>markRead(n.id)}>
                      <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0, color:cfg.color, background:cfg.bg }}>{cfg.icon}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:13, color:'#1A1A18', lineHeight:1.5, fontWeight:n.read?400:500 }}>{n.text}</div>
                        <div style={{ fontSize:11, color:'#8A8A82', marginTop:2 }}>{n.time}</div>
                      </div>
                      {!n.read && <div style={{ width:7, height:7, borderRadius:'50%', background:'#0A6B4B', flexShrink:0, marginTop:5 }} />}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
