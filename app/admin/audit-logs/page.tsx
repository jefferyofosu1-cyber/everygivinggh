'use client'
import { useEffect, useState, useCallback } from 'react'

type Log = {
  id: string
  action: string
  entity_type: string
  entity_id: string
  actor_user_id: string
  created_at: string
  before_state?: Record<string, unknown>
  after_state?: Record<string, unknown>
}

const ACTION_COLOR: Record<string, string> = {
  create: '#34D399', update: '#60A5FA', delete: '#F87171',
  approve: '#34D399', reject: '#F87171', settings: '#A78BFA', default: '#9CA3AF',
}

function actionColor(a: string) {
  const k = Object.keys(ACTION_COLOR).find(k => a.includes(k))
  return ACTION_COLOR[k || 'default']
}

function fmt(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString('en-GH', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState(100)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Log | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/audit-logs?limit=${limit}`)
    const data = await res.json()
    setLogs(data.logs || [])
    setLoading(false)
  }, [limit])

  useEffect(() => { load() }, [load])

  const filtered = filter
    ? logs.filter(l =>
        l.action.toLowerCase().includes(filter.toLowerCase()) ||
        l.entity_type?.toLowerCase().includes(filter.toLowerCase()) ||
        l.actor_user_id?.toLowerCase().includes(filter.toLowerCase())
      )
    : logs

  const ROW: React.CSSProperties = { display: 'grid', gridTemplateColumns: '140px 1fr 120px 90px', gap: 12, padding: '10px 14px', alignItems: 'center', fontSize: 13, cursor: 'pointer', transition: 'background .12s', borderBottom: '1px solid rgba(255,255,255,.04)' }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .log-row:hover { background: rgba(255,255,255,.04) !important }
        .log-row.active { background: rgba(99,102,241,.1) !important; border-left: 2.5px solid #6366F1 !important }
        input:focus { outline: none; border-color: #6366F1 !important }
      ` }} />

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 360px' : '1fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: 'inherit', fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Audit logs</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)' }}>Immutable trail of every admin action performed on the platform.</p>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select value={limit} onChange={e => setLimit(Number(e.target.value))}
                style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#fff', fontSize: 12, padding: '7px 10px', cursor: 'pointer' }}>
                {[50, 100, 200, 500].map(n => <option key={n} value={n}>{n} rows</option>)}
              </select>
              <button onClick={load} style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#fff', fontSize: 12, padding: '7px 12px', cursor: 'pointer' }}>↻ Refresh</button>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: .4 }}>🔍</span>
            <input value={filter} onChange={e => setFilter(e.target.value)}
              placeholder="Filter by action, entity type, or user ID…"
              style={{ width: '100%', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: '10px 14px 10px 36px', fontSize: 13, color: '#fff', fontFamily: 'inherit' }} />
          </div>

          {/* Table */}
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ ...ROW, cursor: 'default', background: 'rgba(255,255,255,.04)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              <div>Timestamp</div><div>Action</div><div>Entity</div><div>Actor</div>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 13 }}>Loading audit logs…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 13 }}>No logs {filter ? `matching "${filter}"` : 'found'}</div>
            ) : filtered.map(log => (
              <div key={log.id} className={`log-row${selected?.id === log.id ? ' active' : ''}`}
                style={ROW} onClick={() => setSelected(selected?.id === log.id ? null : log)}>
                <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 11 }}>
                  <div>{timeAgo(log.created_at)}</div>
                  <div style={{ fontSize: 10, marginTop: 2 }}>{fmt(log.created_at).split(',')[0]}</div>
                </div>
                <div>
                  <span style={{ display: 'inline-block', background: `${actionColor(log.action)}18`, color: actionColor(log.action), fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, marginBottom: 2 }}>{log.action}</span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
                  <div>{log.entity_type}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', fontFamily: 'monospace', marginTop: 1 }}>{log.entity_id?.slice(0, 8)}</div>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>{log.actor_user_id?.slice(0, 8)}</div>
              </div>
            ))}
          </div>

          {!loading && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', textAlign: 'right', marginTop: 10 }}>
              Showing {filtered.length} of {logs.length} events
            </div>
          )}
        </div>

        {/* RIGHT — detail panel */}
        {selected && (
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 20, position: 'sticky', top: 72 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <span style={{ display: 'inline-block', background: `${actionColor(selected.action)}18`, color: actionColor(selected.action), fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100, marginBottom: 6 }}>{selected.action}</span>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{fmt(selected.created_at)}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            {[['Entity type', selected.entity_type], ['Entity ID', selected.entity_id], ['Actor user', selected.actor_user_id]].map(([l, v]) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 12, color: '#E5E7EB', fontFamily: 'monospace', background: 'rgba(255,255,255,.05)', padding: '6px 10px', borderRadius: 6, wordBreak: 'break-all' }}>{v || '—'}</div>
              </div>
            ))}

            {selected.before_state && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>Before</div>
                <pre style={{ fontSize: 10, color: '#F87171', background: 'rgba(248,113,113,.06)', padding: '8px 10px', borderRadius: 6, overflow: 'auto', maxHeight: 140 }}>{JSON.stringify(selected.before_state, null, 2)}</pre>
              </div>
            )}

            {selected.after_state && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 3 }}>After</div>
                <pre style={{ fontSize: 10, color: '#34D399', background: 'rgba(52,211,153,.06)', padding: '8px 10px', borderRadius: 6, overflow: 'auto', maxHeight: 140 }}>{JSON.stringify(selected.after_state, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
