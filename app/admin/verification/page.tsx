'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ─── INDIVIDUAL VERIFICATION TYPES ────────────────────────────────────────────

type VerifyItem = {
  id: string; name: string; phone: string; campaign: string; category: string;
  submitted: string; status: string; rejectReason?: string; front: string; back: string;
}

const MOCK_QUEUE: VerifyItem[] = [
  { id:'v1', name:'Kwame Mensah', phone:'024 123 4567', campaign:'Help Ama get kidney surgery', category:'Medical', submitted:'2 hrs ago', status:'pending', front:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=70', back:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70' },
  { id:'v2', name:'Ama Boateng', phone:'020 987 6543', campaign:'School supplies for Volta children', category:'Education', submitted:'5 hrs ago', status:'pending', front:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=70', back:'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300&q=70' },
  { id:'v3', name:'Pastor Isaac Asare', phone:'027 555 4444', campaign:'New roof for Bethel Assembly', category:'Faith', submitted:'1 day ago', status:'pending', front:'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=300&q=70', back:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&q=70' },
  { id:'v4', name:'Efua Owusu', phone:'026 111 2222', campaign:'Community borehole project', category:'Community', submitted:'2 days ago', status:'approved', front:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=70', back:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70' },
]

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
  const [queue, setQueue] = useState<VerifyItem[]>(MOCK_QUEUE)
  const [selected, setSelected] = useState<string|null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [filter, setFilter] = useState('pending')

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

  useEffect(() => { if (tab === 'organisations') fetchOrgs() }, [tab, fetchOrgs])

  const filteredIndivid = queue.filter(q => filter==='all' || q.status===filter)
  const item = queue.find(q => q.id===selected) || null

  function approveIndividual(id: string) {
    setQueue(prev => prev.map(q => q.id===id ? {...q,status:'approved'} : q))
    setSelected(null)
  }
  function rejectIndividual(id: string) {
    if (!rejectReason.trim()) return
    setQueue(prev => prev.map(q => q.id===id ? {...q,status:'rejected',rejectReason} : q))
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
                {filteredIndivid.map(q => (
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
                    <div style={{ fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:4 }}>Campaign</div>
                    <div style={{ fontSize:13,fontWeight:600,color:'#1A1A18' }}>{item.campaign}</div>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8 }}>ID document</div>
                    <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
                      <div><div style={{ fontSize:10,color:'#8A8A82',marginBottom:4 }}>Front</div><img src={item.front} style={{ width:'100%',height:110,objectFit:'cover',borderRadius:7 }} alt="Front"/></div>
                      <div><div style={{ fontSize:10,color:'#8A8A82',marginBottom:4 }}>Back</div><img src={item.back} style={{ width:'100%',height:110,objectFit:'cover',borderRadius:7 }} alt="Back"/></div>
                    </div>
                  </div>
                  {item.status==='pending' && !showReject && (
                    <div style={{ display:'flex',gap:8 }}>
                      <button style={{ ...BTN, flex:2, background:'#0A6B4B', color:'#fff' }} onClick={() => approveIndividual(item.id)}>Approve ✓</button>
                      <button style={{ ...BTN, flex:1, background:'transparent', color:'#C0392B', border:'1px solid #C0392B' }} onClick={() => setShowReject(true)}>Reject</button>
                    </div>
                  )}
                  {showReject && (
                    <div>
                      <label style={{ fontSize:12,fontWeight:600,color:'#4A4A44',display:'block',marginBottom:6 }}>Reason for rejection</label>
                      <textarea style={{ width:'100%',padding:'10px 12px',border:'1.5px solid #C0392B',borderRadius:8,fontSize:13,minHeight:80,resize:'vertical',marginBottom:8 }}
                        placeholder="e.g. Photo too blurry — please retake with better lighting"
                        value={rejectReason} onChange={e => setRejectReason(e.target.value)}/>
                      <div style={{ display:'flex',gap:8 }}>
                        <button style={{ ...BTN, flex:1, background:'#C0392B', color:'#fff', opacity: rejectReason.trim()?1:.45 }} disabled={!rejectReason.trim()} onClick={() => rejectIndividual(item.id)}>Send rejection</button>
                        <button style={{ ...BTN, background:'transparent', border:'1px solid #E8E4DC' }} onClick={() => setShowReject(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                  {item.status==='approved' && <div style={{ fontSize:13,color:'#0A6B4B',background:'#E8F5EF',padding:'10px 12px',borderRadius:8,textAlign:'center' }}>✓ Approved</div>}
                  {item.status==='rejected' && <div style={{ fontSize:13,color:'#C0392B',background:'#FCEBEB',padding:'10px 12px',borderRadius:8 }}>Rejected: {item.rejectReason}</div>}
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
