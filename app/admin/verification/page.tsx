'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ─── INDIVIDUAL VERIFICATION TYPES ────────────────────────────────────────────

type VerifyItem = {
  id: string; name: string; email: string; phone: string; campaign: string; category: string;
  submitted: string; status: string; rejectReason?: string; adminNote?: string;
  front: string; back: string; story?: string; goalAmount?: number;
  momoNumber?: string; momoName?: string;
}



const statusStyle = (s: string): React.CSSProperties => ({
  color: s==='approved'?'#0A6B4B':s==='rejected'?'#C0392B':s==='more_info'?'#185FA5':'#B85C00',
  background: s==='approved'?'#E8F5EF':s==='rejected'?'#FCEBEB':s==='more_info'?'#E6F1FB':'#FEF3E2',
  fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, flexShrink:0,
})

const TIER_OPTS = ['none','basic','standard','premium'] as const
const TIER_COLORS: Record<string, string> = { none:'#9CA3AF', basic:'#1D4ED8', standard:'#065F46', premium:'#5B21B6' }

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function AdminVerificationPage() {
  const [tab, setTab] = useState<'individuals'|'organisations'>('individuals')

  // INDIVIDUAL state
  const [queue, setQueue] = useState<VerifyItem[]>([])
  const [indivLoading, setIndivLoading] = useState(false)
  const [selected, setSelected] = useState<string|null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [rejectAction, setRejectAction] = useState<'reject'|'more_info'>('reject')
  const [filter, setFilter] = useState('pending')

  const fetchIndividuals = useCallback(async () => {
    setIndivLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('campaigns').select('id, title, category, created_at, id_front_url, selfie_url, verified, status, admin_note, story, goal_amount, profiles(full_name, email, phone, momo_number, momo_name)').not('id_front_url', 'is', null).order('created_at', { ascending: false })
    if (data) {
      setQueue(data.map((c: any) => ({
        id: c.id,
        name: c.profiles?.full_name || 'Unknown',
        email: c.profiles?.email || '',
        phone: c.profiles?.phone || 'No phone',
        campaign: c.title,
        category: c.category || 'General',
        submitted: new Date(c.created_at).toLocaleDateString(),
        status: c.verified ? 'approved' : c.status === 'rejected' ? 'rejected' : c.status === 'more_info' ? 'more_info' : 'pending',
        adminNote: c.admin_note || '',
        front: c.id_front_url || '',
        back: c.selfie_url || c.id_front_url || '',
        story: c.story || '',
        goalAmount: c.goal_amount || 0,
        momoNumber: c.profiles?.momo_number || '',
        momoName: c.profiles?.momo_name || ''
      })))
    }
    setIndivLoading(false)
  }, [])

  // ORGANISATION state
  const [orgs, setOrgs] = useState<any[]>([])
  const [orgsLoading, setOrgsLoading] = useState(false)
  const [selectedOrg, setSelectedOrg] = useState<any|null>(null)
  const [orgFilter, setOrgFilter] = useState('pending')
  const [orgTier, setOrgTier] = useState<string>('basic')
  const [orgNote, setOrgNote] = useState('')
  const [orgAction, setOrgAction] = useState<'approve'|'reject'|'more_info'|null>(null)
  const [orgSaving, setOrgSaving] = useState(false)

  const fetchOrgs = useCallback(async () => {
    setOrgsLoading(true)
    const supabase = createClient()
    const q = supabase.from('organisations').select('*').order('created_at', { ascending: false })
    if (orgFilter !== 'all') q.eq('status', orgFilter)
    const { data } = await q
    setOrgs(data || [])
    setOrgsLoading(false)
  }, [orgFilter])

  useEffect(() => { 
    if (tab === 'organisations') fetchOrgs() 
    if (tab === 'individuals') fetchIndividuals()
  }, [tab, fetchOrgs, fetchIndividuals])

  const filteredIndivid = queue.filter(q => filter==='all' || q.status===filter)
  const item = queue.find(q => q.id===selected) || null

  async function approveIndividual(item: VerifyItem) {
    const supabase = createClient()
    await supabase.from('campaigns').update({ 
      verified: true, 
      status: 'approved',
      activated_at: new Date().toISOString()
    }).eq('id', item.id)
    
    // Trigger Activation Notifications
    const slug = item.campaign.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    import('@/lib/notifications').then(({ NotificationService }) => {
      NotificationService.sendCampaignLiveSMS(item.phone, item.campaign, slug).catch(console.error)
      if (item.email) {
        NotificationService.sendCampaignLiveEmail(item.email, item.name, item.campaign, slug).catch(console.error)
      }
    })

    setQueue(prev => prev.map(q => q.id===item.id ? {...q,status:'approved'} : q))
    setSelected(null)
  }

  async function rejectIndividual(item: VerifyItem) {
    if (!rejectReason.trim()) return
    const supabase = createClient()
    await supabase.from('campaigns').update({ verified: false, status: 'rejected', admin_note: rejectReason }).eq('id', item.id)
    
    // Soft communication even on reject (matches supportive goal)
    import('@/lib/notifications').then(({ NotificationService }) => {
      // For hard reject, still use the "Action Required" template as it's more encouraging
      if (item.email) {
        NotificationService.sendCampaignActionRequiredEmail(item.email, item.name, item.campaign, rejectReason).catch(console.error)
      }
    })

    setQueue(prev => prev.map(q => q.id===item.id ? {...q,status:'rejected',adminNote:rejectReason} : q))
    setSelected(null); setRejectReason(''); setShowReject(false)
  }

  async function requestMoreInfoIndividual(item: VerifyItem) {
    if (!rejectReason.trim()) return
    const supabase = createClient()
    await supabase.from('campaigns').update({ status: 'more_info', admin_note: rejectReason }).eq('id', item.id)
    
    // Trigger Info Request Notifications
    import('@/lib/notifications').then(({ NotificationService }) => {
      NotificationService.sendCampaignMoreInfoSMS(item.phone, rejectReason).catch(console.error)
      if (item.email) {
        NotificationService.sendCampaignActionRequiredEmail(item.email, item.name, item.campaign, rejectReason).catch(console.error)
      }
    })

    setQueue(prev => prev.map(q => q.id===item.id ? {...q,status:'more_info',adminNote:rejectReason} : q))
    setSelected(null); setRejectReason(''); setShowReject(false)
  }

  const saveOrgDecision = async () => {
    if (!selectedOrg || !orgAction) return
    setOrgSaving(true)
    const supabase = createClient()
    const updates: any = { status: orgAction === 'approve' ? 'approved' : orgAction === 'reject' ? 'rejected' : 'more_info', admin_note: orgNote || null, updated_at: new Date().toISOString() }
    if (orgAction === 'approve') updates.verification_tier = orgTier
    await supabase.from('organisations').update(updates).eq('id', selectedOrg.id)
    setSelectedOrg(null); setOrgAction(null); setOrgNote(''); setOrgSaving(false)
    fetchOrgs()
  }

  const BTN: React.CSSProperties = { border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea,select{font-family:'DM Sans',sans-serif}
        textarea:focus,input:focus,select:focus{outline:none;border-color:#0A6B4B!important}
      ` }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 64px' }}>
        {/* PAGE HEADER */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 24, color: '#1A1A18', marginBottom: 4 }}>Admin — Verification</h1>
          <p style={{ fontSize: 13, color: '#8A8A82' }}>Review identity submissions and organisation applications.</p>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #E8E4DC', paddingBottom: 0 }}>
          {(['individuals', 'organisations'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 14, fontWeight: 600, padding: '10px 16px',
              color: tab === t ? '#0A6B4B' : '#8A8A82',
              borderBottom: tab === t ? '2px solid #0A6B4B' : '2px solid transparent',
              marginBottom: -1, transition: 'color .15s',
            }}>
              {t === 'individuals' ? 'Individuals' : 'Organisations'}
            </button>
          ))}
        </div>

        {/* ── INDIVIDUALS TAB ──────────────────────────────── */}
        {tab === 'individuals' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
            {/* Left list */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {['pending','approved','rejected','all'].map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                      fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                      background: filter===f?'#1A1A18':'transparent', color: filter===f?'#fff':'#8A8A82',
                      border: `1px solid ${filter===f?'#1A1A18':'#E8E4DC'}`,
                    }}>
                      {f} {f!=='all' && <span style={{fontSize:10,marginLeft:3}}>{queue.filter(q=>q.status===f).length}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {indivLoading ? <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div> : filteredIndivid.length === 0 ? <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No {filter === 'all' ? '' : filter} individuals yet.</div> : filteredIndivid.map(q => (
                  <div key={q.id}
                    style={{ display:'flex', alignItems:'center', gap:10, background:selected===q.id?'#E8F5EF':'#fff', border:`1.5px solid ${selected===q.id?'#0A6B4B':'#E8E4DC'}`, borderRadius:11, padding:'11px 12px', cursor:'pointer', transition:'all .15s' }}
                    onClick={() => setSelected(q.id)}>
                    <div style={{ width:34,height:34,borderRadius:'50%',background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#0A6B4B',flexShrink:0 }}>{q.name[0]}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:600,color:'#1A1A18' }}>{q.name}</div>
                      <div style={{ fontSize:11,color:'#8A8A82',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{q.campaign.slice(0,45)}{q.campaign.length>45?'…':''}</div>
                      <div style={{ fontSize:10,color:'#C8C4BC' }}>{q.phone} · {q.submitted}</div>
                    </div>
                    <div style={statusStyle(q.status)}>{q.status}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Right review */}
            <div style={{ position:'sticky', top:72 }}>
              {item ? (
                <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:12, padding:'18px 16px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:14, paddingBottom:14, borderBottom:'1px solid #E8E4DC' }}>
                    <div>
                      <div style={{ fontSize:16,fontWeight:700,color:'#1A1A18',marginBottom:3 }}>{item.name}</div>
                      <div style={{ fontSize:11,color:'#8A8A82',lineHeight:1.5 }}>{item.phone} · {item.category} · Submitted {item.submitted}</div>
                    </div>
                    <div style={statusStyle(item.status)}>{item.status}</div>
                  </div>
                   <div style={{ background:'#F5F4F0',borderRadius:8,padding:'10px 12px',marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <div style={{ fontSize:11,fontWeight:600,color:'#8A8A82' }}>Campaign</div>
                      <div style={{ fontSize:11,fontWeight:700,color:'#0A6B4B' }}>GH₵ {item.goalAmount?.toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize:13,fontWeight:600,color:'#1A1A18',marginBottom:6 }}>{item.campaign}</div>
                    <div style={{ fontSize:11,color:'#4A4A44',lineHeight:1.6,maxHeight:80,overflowY:'auto',background:'rgba(255,255,255,0.5)',padding:8,borderRadius:6 }}>{item.story}</div>
                  </div>

                  <div style={{ background:'#E6F1FB',borderRadius:8,padding:'10px 12px',marginBottom:14 }}>
                    <div style={{ fontSize:10,fontWeight:700,color:'#185FA5',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4 }}>MoMo Payout Details</div>
                    <div style={{ display:'flex',justifyContent:'space-between',fontSize:12 }}>
                      <div style={{ color:'#4A4A44' }}>Number: <strong>{item.momoNumber || 'Not set'}</strong></div>
                      <div style={{ color:'#4A4A44' }}>Name: <strong>{item.momoName || 'Not set'}</strong></div>
                    </div>
                  </div>

                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8 }}>ID document</div>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                      <a href={item.front} target="_blank" rel="noreferrer"><div><div style={{ fontSize:10,color:'#8A8A82',marginBottom:4 }}>Front</div><img src={item.front} style={{ width:'100%',height:110,objectFit:'cover',borderRadius:7 }} alt="Front"/></div></a>
                      <a href={item.back} target="_blank" rel="noreferrer"><div><div style={{ fontSize:10,color:'#8A8A82',marginBottom:4 }}>Back/Selfie</div><img src={item.back} style={{ width:'100%',height:110,objectFit:'cover',borderRadius:7 }} alt="Back"/></div></a>
                    </div>
                  </div>
                    {item.status==='pending' && !showReject && (
                      <div style={{ display:'flex',gap:8 }}>
                        <button style={{ ...BTN, flex:2, background:'#0A6B4B', color:'#fff' }} onClick={() => approveIndividual(item)}>Approve ✓</button>
                        <button style={{ ...BTN, flex:1, background:'#EEF2FF', color:'#3730A3' }} onClick={() => { setShowReject(true); setRejectAction('more_info') }}>Request Info</button>
                        <button style={{ ...BTN, background:'transparent', color:'#C0392B', border:'1px solid #C0392B' }} onClick={() => { setShowReject(true); setRejectAction('reject') }}>Correction Required</button>
                      </div>
                    )}
                  {showReject && (
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:'#4A4A44',display:'block',marginBottom:6 }}>{rejectAction === 'reject' ? 'Reason for rejection' : 'What additional information is needed?'}</label>
                      <textarea style={{ width:'100%',padding:'10px 12px',border:`1.5px solid ${rejectAction==='reject'?'#C0392B':'#185FA5'}`,borderRadius:8,fontSize:13,minHeight:80,resize:'vertical',marginBottom:8 }}
                        placeholder={rejectAction === 'reject' ? "e.g. Campaign violates terms..." : "e.g. Photo too blurry — please retake with better lighting"}
                        value={rejectReason} onChange={e => setRejectReason(e.target.value)}/>
                      <div style={{ display:'flex',gap:8 }}>
                        <button style={{ ...BTN, flex:1, background:rejectAction==='reject'?'#C0392B':'#185FA5', color:'#fff', opacity: rejectReason.trim()?1:.45 }} disabled={!rejectReason.trim()} onClick={() => rejectAction === 'reject' ? rejectIndividual(item) : requestMoreInfoIndividual(item)}>
                          {rejectAction === 'reject' ? 'Submit Correction' : 'Send Info Request'}
                        </button>
                        <button style={{ ...BTN, background:'transparent', border:'1px solid #E8E4DC' }} onClick={() => setShowReject(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {item.status==='approved' && <div style={{ fontSize:13,color:'#0A6B4B',background:'#E8F5EF',padding:'10px 12px',borderRadius:8,textAlign:'center' }}>✓ Live</div>}
                  {item.status==='rejected' && <div style={{ fontSize:13,color:'#C0392B',background:'#FCEBEB',padding:'10px 12px',borderRadius:8 }}>Correction Required: {item.adminNote}</div>}
                  {item.status==='more_info' && <div style={{ fontSize:13,color:'#185FA5',background:'#E6F1FB',padding:'10px 12px',borderRadius:8 }}>Information Requested: {item.adminNote}</div>}
                </div>
              ) : (
                <div style={{ background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:40,textAlign:'center',color:'#8A8A82',fontSize:13 }}>Select a submission to review</div>
              )}
            </div>
          </div>
        )}

        {/* ── ORGANISATIONS TAB ─────────────────────────────── */}
        {tab === 'organisations' && (
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>
            {/* Left list */}
            <div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {['pending','approved','rejected','more_info','all'].map(f => (
                    <button key={f} onClick={() => setOrgFilter(f)} style={{
                      fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                      background: orgFilter===f?'#1A1A18':'transparent', color: orgFilter===f?'#fff':'#8A8A82',
                      border: `1px solid ${orgFilter===f?'#1A1A18':'#E8E4DC'}`,
                    }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              {orgsLoading ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
              ) : orgs.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                  No {orgFilter === 'all' ? '' : orgFilter} applications yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {orgs.map(org => (
                    <div key={org.id}
                      style={{ display:'flex', alignItems:'center', gap:10, background:selectedOrg?.id===org.id?'#E8F5EF':'#fff', border:`1.5px solid ${selectedOrg?.id===org.id?'#0A6B4B':'#E8E4DC'}`, borderRadius:11, padding:'11px 12px', cursor:'pointer', transition:'all .15s' }}
                      onClick={() => { setSelectedOrg(org); setOrgAction(null); setOrgNote(''); setOrgTier('basic') }}>
                      <div style={{ width:36,height:36,borderRadius:8,background:org.logo_url?'transparent':'#E8F5EF',overflow:'hidden',flexShrink:0 }}>
                        {org.logo_url ? <img src={org.logo_url} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt="" /> : <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#0A6B4B',fontSize:14 }}>{org.name?.[0]}</div>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:600,color:'#1A1A18',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{org.name}</div>
                        <div style={{ fontSize:11,color:'#8A8A82' }}>{org.type} · {org.location}</div>
                        <div style={{ fontSize:10,color:'#C8C4BC' }}>{org.email}</div>
                      </div>
                      <div style={statusStyle(org.status)}>{org.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right review */}
            <div style={{ position:'sticky', top:72 }}>
              {selectedOrg ? (
                <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:12, padding:'20px 20px', display:'flex', flexDirection:'column', gap:16 }}>
                  {/* Org header */}
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', paddingBottom:14, borderBottom:'1px solid #E8E4DC' }}>
                    <div>
                      <div style={{ fontSize:17,fontWeight:700,color:'#1A1A18',marginBottom:3 }}>{selectedOrg.name}</div>
                      <div style={{ fontSize:12,color:'#8A8A82' }}>{selectedOrg.type} · {selectedOrg.location} · {selectedOrg.email}</div>
                      {selectedOrg.phone && <div style={{ fontSize:12,color:'#8A8A82' }}>{selectedOrg.phone}</div>}
                    </div>
                    <div style={statusStyle(selectedOrg.status)}>{selectedOrg.status}</div>
                  </div>

                  {/* Details grid */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { label:'Contact', value:selectedOrg.contact_name },
                      { label:'Reg. Number', value:selectedOrg.reg_number || '—' },
                      { label:'Tax ID', value:selectedOrg.tax_id || '—' },
                      { label:'MoMo', value:selectedOrg.momo_number || '—' },
                      { label:'Website', value:selectedOrg.website || '—' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background:'#F9FAFB', borderRadius:8, padding:'8px 12px' }}>
                        <div style={{ fontSize:10,fontWeight:600,color:'#9CA3AF',marginBottom:2 }}>{label}</div>
                        <div style={{ fontSize:12,fontWeight:600,color:'#1A1A18' }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  {selectedOrg.description && (
                    <div>
                      <div style={{ fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:4 }}>Description</div>
                      <div style={{ fontSize:12,color:'#4B5563',lineHeight:1.65 }}>{selectedOrg.description}</div>
                    </div>
                  )}

                  {/* Cert */}
                  {selectedOrg.reg_cert_url && (
                    <div>
                      <div style={{ fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:6 }}>Registration certificate</div>
                      <a href={selectedOrg.reg_cert_url} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:12,color:'#0A6B4B',fontWeight:600,border:'1px solid #0A6B4B',padding:'6px 12px',borderRadius:7 }}>
                        📄 View document
                      </a>
                    </div>
                  )}

                  {/* Past projects */}
                  {selectedOrg.past_projects && (
                    <div>
                      <div style={{ fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:4 }}>Past projects</div>
                      <div style={{ fontSize:12,color:'#4B5563',lineHeight:1.65 }}>{selectedOrg.past_projects}</div>
                    </div>
                  )}

                  {/* Actions */}
                  {selectedOrg.status === 'pending' && !orgAction && (
                    <div style={{ display:'flex', gap:8, borderTop:'1px solid #E8E4DC', paddingTop:14 }}>
                      <button style={{ ...BTN, flex:2, background:'#0A6B4B', color:'#fff' }} onClick={() => setOrgAction('approve')}>Approve →</button>
                      <button style={{ ...BTN, flex:1, background:'#EEF2FF', color:'#3730A3' }} onClick={() => setOrgAction('more_info')}>More info</button>
                      <button style={{ ...BTN, background:'transparent', color:'#C0392B', border:'1px solid #C0392B' }} onClick={() => setOrgAction('reject')}>Reject</button>
                    </div>
                  )}

                  {/* Approve form */}
                  {orgAction === 'approve' && (
                    <div style={{ borderTop:'1px solid #E8E4DC', paddingTop:14, display:'flex', flexDirection:'column', gap:12 }}>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:6 }}>Assign verification tier</label>
                        <div style={{ display:'flex', gap:8 }}>
                          {TIER_OPTS.map(t => (
                            <button key={t} onClick={() => setOrgTier(t)} style={{
                              flex:1, padding:'8px 4px', border:`1.5px solid ${orgTier===t?TIER_COLORS[t]:'#E5E7EB'}`,
                              borderRadius:8, background:orgTier===t?`${TIER_COLORS[t]}15`:'transparent',
                              color:orgTier===t?TIER_COLORS[t]:'#6B7280', fontSize:11, fontWeight:700, cursor:'pointer',
                            }}>
                              {t === 'none' ? 'None' : t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize:12,fontWeight:600,color:'#374151',display:'block',marginBottom:6 }}>Admin note (optional)</label>
                        <textarea value={orgNote} onChange={e => setOrgNote(e.target.value)} rows={2}
                          style={{ width:'100%',border:'1.5px solid #E5E7EB',borderRadius:8,padding:'8px 12px',fontSize:12,resize:'none',fontFamily:'inherit' }}
                          placeholder="Any notes for the organisation..." />
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <button style={{ ...BTN, flex:2, background:'#0A6B4B', color:'#fff', opacity: orgSaving ? 0.5 : 1 }} disabled={orgSaving} onClick={saveOrgDecision}>{orgSaving?'Saving…':'Confirm approval ✓'}</button>
                        <button style={{ ...BTN, background:'transparent', border:'1px solid #E5E7EB' }} onClick={() => setOrgAction(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Reject / More info form */}
                  {(orgAction === 'reject' || orgAction === 'more_info') && (
                    <div style={{ borderTop:'1px solid #E8E4DC', paddingTop:14, display:'flex', flexDirection:'column', gap:10 }}>
                      <label style={{ fontSize:12,fontWeight:600,color:'#374151',display:'block' }}>
                        {orgAction === 'reject' ? 'Reason for rejection' : 'What additional information is needed?'}
                      </label>
                      <textarea value={orgNote} onChange={e => setOrgNote(e.target.value)} rows={3}
                        style={{ width:'100%',border:`1.5px solid ${orgAction==='reject'?'#C0392B':'#185FA5'}`,borderRadius:8,padding:'8px 12px',fontSize:12,resize:'none',fontFamily:'inherit' }}
                        placeholder={orgAction==='reject'?'Reason sent to the organisation…':'Documents or info needed from the organisation…'} />
                      <div style={{ display:'flex', gap:8 }}>
                        <button style={{ ...BTN, flex:2, background:orgAction==='reject'?'#C0392B':'#185FA5', color:'#fff', opacity: (orgNote.trim() && !orgSaving) ? 1 : 0.5 }}
                          disabled={!orgNote.trim()||orgSaving} onClick={saveOrgDecision}>{orgSaving?'Saving…':orgAction==='reject'?'Send rejection':'Send request'}</button>
                        <button style={{ ...BTN, background:'transparent', border:'1px solid #E5E7EB' }} onClick={() => setOrgAction(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {selectedOrg.status !== 'pending' && (
                    <div style={{ background:'#F9FAFB', border:'1px solid #E5E7EB', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#6B7280' }}>
                      Status: <strong style={{ color:'#111827' }}>{selectedOrg.status}</strong>
                      {selectedOrg.verification_tier && selectedOrg.verification_tier !== 'none' && (
                        <> · Tier: <strong style={{ color: TIER_COLORS[selectedOrg.verification_tier] }}>{selectedOrg.verification_tier}</strong></>
                      )}
                      {selectedOrg.admin_note && <><br/>Note: {selectedOrg.admin_note}</>}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:40,textAlign:'center',color:'#8A8A82',fontSize:13 }}>
                  Select an organisation application to review
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
