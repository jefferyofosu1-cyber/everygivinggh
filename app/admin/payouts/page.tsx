'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

type ProofItem = {
  id: string
  campaign_title: string
  organiser_name: string
  milestone_title: string
  amount: number
  momo_network: string
  momo_number: string
  created_at: string
  status: string
  proof_url: string
  note: string
  reject_note?: string
}

const statusStyle = (s: string): React.CSSProperties => ({
  color: s==='approved'?'#0A6B4B':s==='rejected'?'#C0392B':'#B85C00',
  background: s==='approved'?'#E8F5EF':s==='rejected'?'#FCEBEB':'#FEF3E2',
  fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:20, flexShrink:0,
})

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? 's' : ''} ago`
}

export default function AdminPayoutsPage() {
  const [proofs, setProofs] = useState<ProofItem[]>([])
  const [selected, setSelected] = useState<string|null>(null)
  const [filter, setFilter] = useState('pending')
  const [rejectNote, setRejectNote] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [paying, setPaying] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const q = supabase.from('milestone_payouts').select(`
      id, amount, momo_network, momo_number, status, proof_url, note, reject_note, created_at,
      milestones!inner(title, campaigns!inner(title, profiles!inner(full_name)))
    `).order('created_at', { ascending: false })
    if (filter !== 'all') q.eq('status', filter)
    const { data } = await q
    // Flatten nested joins
    const rows: ProofItem[] = (data || []).map((r: any) => ({
      id: r.id,
      campaign_title: r.milestones?.campaigns?.title || '—',
      organiser_name: r.milestones?.campaigns?.profiles?.full_name || '—',
      milestone_title: r.milestones?.title || '—',
      amount: r.amount,
      momo_network: r.momo_network || '—',
      momo_number: r.momo_number || '—',
      created_at: r.created_at,
      status: r.status,
      proof_url: r.proof_url,
      note: r.note || '',
      reject_note: r.reject_note,
    }))
    setProofs(rows)
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  const filtered = proofs.filter(p => filter === 'all' || p.status === filter)
  const item = proofs.find(p => p.id === selected) || null

  async function approvePayout(id: string) {
    setPaying(true)
    const supabase = createClient()
    await supabase.from('milestone_payouts').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id)
    setPaying(false); setSelected(null); load()
  }

  async function rejectProof(id: string) {
    const supabase = createClient()
    await supabase.from('milestone_payouts').update({ status: 'rejected', reject_note: rejectNote }).eq('id', id)
    setSelected(null); setRejectNote(''); setShowReject(false); load()
  }

  const BTN: React.CSSProperties = { border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit} button,input,textarea{font-family:'DM Sans',sans-serif}
        textarea:focus{outline:none;border-color:#0A6B4B!important}
      ` }} />

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '24px 24px 64px', display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT — list */}
        <div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: '#1A1A18', marginBottom: 10 }}>Milestone payouts</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['pending','approved','rejected','all'].map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                  background: filter===f?'#1A1A18':'transparent', color: filter===f?'#fff':'#8A8A82',
                  border: `1px solid ${filter===f?'#1A1A18':'#E8E4DC'}`,
                }}>
                  {f} {f !== 'all' && <span style={{ fontSize: 10, marginLeft: 3 }}>{proofs.filter(p => p.status === f).length}</span>}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No {filter !== 'all' ? filter : ''} payouts</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {filtered.map(p => (
                <div key={p.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: selected===p.id?'#E8F5EF':'#fff', border: `1.5px solid ${selected===p.id?'#0A6B4B':'#E8E4DC'}`, borderRadius: 11, padding: '11px 12px', cursor: 'pointer', transition: 'all .15s' }}
                  onClick={() => { setSelected(p.id); setShowReject(false) }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#185FA5', flexShrink: 0 }}>₵</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>{p.milestone_title} — ₵{p.amount.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#8A8A82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.campaign_title.slice(0,40)}{p.campaign_title.length>40?'…':''}</div>
                    <div style={{ fontSize: 10, color: '#C8C4BC' }}>{p.organiser_name} · {timeAgo(p.created_at)}</div>
                  </div>
                  <div style={statusStyle(p.status)}>{p.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — review */}
        <div style={{ position: 'sticky', top: 72 }}>
          {item ? (
            <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 12, padding: '18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #E8E4DC' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 3 }}>₵{item.amount.toLocaleString()} · {item.milestone_title}</div>
                  <div style={{ fontSize: 11, color: '#8A8A82', lineHeight: 1.5 }}>{item.campaign_title} · {item.organiser_name}</div>
                </div>
                <div style={statusStyle(item.status)}>{item.status}</div>
              </div>

              <div style={{ background: '#F5F4F0', borderRadius: 9, padding: 12, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A82', marginBottom: 8 }}>Payout destination</div>
                {[['Network', item.momo_network], ['MoMo number', item.momo_number], ['Amount', `₵${item.amount.toLocaleString()}`]].map(([l, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: '#8A8A82' }}>{l}</span>
                    <span style={{ fontWeight: 600, color: '#1A1A18' }}>{v}</span>
                  </div>
                ))}
              </div>

              {item.proof_url && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A82', marginBottom: 8 }}>Submitted proof</div>
                  <img src={item.proof_url} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 8 }} alt="Proof" />
                  {item.note && <div style={{ fontSize: 12, color: '#4A4A44', lineHeight: 1.65, background: '#FDFAF5', padding: '10px 12px', borderRadius: 7, border: '1px solid #E8E4DC' }}>{item.note}</div>}
                </div>
              )}

              {item.status === 'pending' && !showReject && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{ ...BTN, flex: 2, background: '#0A6B4B', color: '#fff', opacity: paying ? 0.6 : 1 }} disabled={paying} onClick={() => approvePayout(item.id)}>
                    {paying ? 'Processing…' : 'Approve & pay →'}
                  </button>
                  <button style={{ ...BTN, flex: 1, background: 'transparent', color: '#C0392B', border: '1px solid #C0392B' }} onClick={() => setShowReject(true)}>Reject</button>
                </div>
              )}
              {showReject && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#4A4A44', display: 'block', marginBottom: 6 }}>Reason (sent to campaigner)</label>
                  <textarea style={{ width: '100%', padding: 10, border: '1.5px solid #C0392B', borderRadius: 8, fontSize: 12, minHeight: 70, resize: 'vertical', marginBottom: 8 }}
                    placeholder="e.g. Please provide a clearer receipt with the supplier's name"
                    value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ ...BTN, flex: 1, background: '#C0392B', color: '#fff' }} onClick={() => rejectProof(item.id)}>Send rejection</button>
                    <button style={{ ...BTN, background: 'transparent', border: '1px solid #E8E4DC' }} onClick={() => setShowReject(false)}>Cancel</button>
                  </div>
                </div>
              )}
              {item.status === 'approved' && <div style={{ fontSize: 13, color: '#0A6B4B', background: '#E8F5EF', padding: 10, borderRadius: 8, textAlign: 'center' }}>✓ Paid — ₵{item.amount.toLocaleString()} sent to {item.momo_network}</div>}
              {item.status === 'rejected' && item.reject_note && <div style={{ fontSize: 12, color: '#C0392B', background: '#FCEBEB', padding: 10, borderRadius: 8 }}>Rejected: {item.reject_note}</div>}
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 12, padding: 40, textAlign: 'center', color: '#8A8A82', fontSize: 13 }}>Select a proof submission to review</div>
          )}
        </div>
      </div>
    </>
  )
}
