'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type Ticket = {
  id: string
  type: string
  subject: string
  message: string
  priority: string
  status: string
  contact_email?: string
  created_at: string
  resolved_at?: string
}

const PRIORITIES: Record<string, { label: string; color: string; bg: string }> = {
  urgent:   { label: 'Urgent',   color: '#F87171', bg: '#F8717118' },
  high:     { label: 'High',     color: '#FB923C', bg: '#FB923C18' },
  normal:   { label: 'Normal',   color: '#FBBF24', bg: '#FBBF2418' },
  low:      { label: 'Low',      color: '#9CA3AF', bg: 'rgba(156,163,175,.1)' },
}

const STATUSES: Record<string, { label: string; color: string }> = {
  open:        { label: 'Open',        color: '#34D399' },
  in_progress: { label: 'In progress', color: '#60A5FA' },
  resolved:    { label: 'Resolved',    color: '#9CA3AF' },
  closed:      { label: 'Closed',      color: '#4B5563' },
}

function fmt(ts: string) {
  const d = new Date(ts), now = Date.now(), diff = now - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return d.toLocaleDateString('en-GH', { day: '2-digit', month: 'short' })
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('open')
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  // New ticket form
  const [showNew, setShowNew] = useState(false)
  const [form, setForm] = useState({ type: 'general', subject: '', message: '', priority: 'normal', contact_email: '' })
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/support/tickets')
    const data = await res.json()
    setTickets(data.tickets || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = tickets.filter(t => filter === 'all' || t.status === filter)

  async function updateStatus(ticket: Ticket, status: string) {
    setSending(true)
    await fetch(`/api/admin/support/tickets/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null }),
    })
    setSending(false); load()
    setSelected(prev => prev?.id === ticket.id ? { ...prev, status } : prev)
  }

  async function createTicket() {
    if (!form.subject.trim() || !form.message.trim()) return
    setCreating(true)
    await fetch('/api/admin/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ type: 'general', subject: '', message: '', priority: 'normal', contact_email: '' })
    setShowNew(false); setCreating(false); load()
  }

  const counts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  }

  const INP: React.CSSProperties = { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#fff', fontFamily: 'inherit', width: '100%' }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `input:focus,textarea:focus,select:focus{outline:none;border-color:#6366F1!important} .ticket-row:hover{background:rgba(255,255,255,.04)!important} .ticket-row.active{background:rgba(99,102,241,.08)!important;border-left:2.5px solid #6366F1!important}` }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Support tickets</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)' }}>Manage user and organiser support requests.</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/admin/support/disputes"
                style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)', borderRadius: 8, color: '#F87171', fontSize: 12, fontWeight: 600, padding: '8px 14px', textDecoration: 'none' }}>
                ⚖️ Disputes
              </Link>
              <button onClick={() => setShowNew(!showNew)}
                style={{ background: '#6366F1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px', cursor: 'pointer' }}>
                + New ticket
              </button>
            </div>
          </div>

          {/* Status tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 4 }}>
            {(['open', 'in_progress', 'resolved', 'all'] as const).map(s => (
              <button key={s} onClick={() => setFilter(s)}
                style={{ flex: 1, padding: '7px 4px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: filter === s ? 700 : 400, background: filter === s ? 'rgba(255,255,255,.1)' : 'transparent', color: filter === s ? '#fff' : 'rgba(255,255,255,.4)', transition: 'all .15s' }}>
                {s === 'in_progress' ? 'In progress' : s.charAt(0).toUpperCase() + s.slice(1)} <span style={{ fontSize: 10, opacity: .7 }}>{counts[s]}</span>
              </button>
            ))}
          </div>

          {/* New ticket form */}
          {showNew && (
            <div style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.25)', borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 12 }}>New support ticket</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                <div>
                  <label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ ...INP, cursor: 'pointer' }}>
                    {['general','billing','verification','technical','abuse','other'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600, display: 'block', marginBottom: 4 }}>Priority</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} style={{ ...INP, cursor: 'pointer' }}>
                    {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Subject" style={{ ...INP, marginBottom: 8 }} />
              <input value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} placeholder="Contact email (optional)" type="email" style={{ ...INP, marginBottom: 8 }} />
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="Describe the issue…"
                style={{ ...INP, minHeight: 80, resize: 'vertical', marginBottom: 10 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={createTicket} disabled={!form.subject.trim() || !form.message.trim() || creating}
                  style={{ background: '#6366F1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, padding: '9px 18px', cursor: 'pointer', opacity: form.subject.trim() && form.message.trim() ? 1 : 0.4 }}>
                  {creating ? 'Creating…' : 'Create ticket'}
                </button>
                <button onClick={() => setShowNew(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, color: 'rgba(255,255,255,.5)', fontSize: 13, padding: '9px 14px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Ticket list */}
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 13 }}>Loading tickets…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,.2)', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎉</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No {filter !== 'all' ? filter : ''} tickets</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map(t => {
                const pri = PRIORITIES[t.priority] || PRIORITIES.normal
                const sta = STATUSES[t.status] || STATUSES.open
                return (
                  <div key={t.id} className={`ticket-row${selected?.id === t.id ? ' active' : ''}`}
                    style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '11px 14px', cursor: 'pointer', transition: 'all .12s', borderLeft: '2.5px solid transparent' }}
                    onClick={() => setSelected(selected?.id === t.id ? null : t)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#F9FAFB' }}>{t.subject}</div>
                      <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: pri.color, background: pri.bg, padding: '2px 7px', borderRadius: 100 }}>{pri.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: sta.color, background: `${sta.color}15`, padding: '2px 7px', borderRadius: 100 }}>{sta.label}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', background: 'rgba(255,255,255,.05)', padding: '1px 6px', borderRadius: 100 }}>{t.type}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,.2)' }}>{fmt(t.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* RIGHT — detail */}
        <div style={{ position: 'sticky', top: 72 }}>
          {selected ? (
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{selected.subject}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: PRIORITIES[selected.priority]?.color, background: PRIORITIES[selected.priority]?.bg, padding: '2px 7px', borderRadius: 100 }}>{PRIORITIES[selected.priority]?.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: STATUSES[selected.status]?.color, background: `${STATUSES[selected.status]?.color}15`, padding: '2px 7px', borderRadius: 100 }}>{STATUSES[selected.status]?.label}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', fontSize: 18, cursor: 'pointer' }}>✕</button>
              </div>

              {selected.contact_email && (
                <div style={{ fontSize: 12, color: '#60A5FA', marginBottom: 12 }}>📧 {selected.contact_email}</div>
              )}

              <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, marginBottom: 16 }}>
                {selected.message}
              </div>

              {/* Status actions */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>Update status</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {Object.entries(STATUSES).map(([k, v]) => (
                    <button key={k} onClick={() => updateStatus(selected, k)} disabled={selected.status === k || sending}
                      style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 100, border: `1px solid ${v.color}40`, background: selected.status === k ? `${v.color}20` : 'transparent', color: v.color, cursor: 'pointer', opacity: selected.status === k ? 0.6 : 1 }}>
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.2)', marginTop: 12, borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 10 }}>
                Opened: {fmt(selected.created_at)} · Type: {selected.type}
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 13 }}>
              Select a ticket to review
            </div>
          )}
        </div>
      </div>
    </>
  )
}
