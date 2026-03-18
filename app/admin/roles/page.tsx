'use client'
import { useEffect, useState, useCallback } from 'react'

type RoleRow = {
  id: string
  user_id: string
  role: string
  permissions: string[]
  created_at: string
  updated_at: string
}

const ROLE_DEFS: { value: string; label: string; color: string; bg: string; perms: string[] }[] = [
  { value: 'super_admin',  label: 'Super admin',  color: '#F87171', bg: '#F8717118', perms: ['*'] },
  { value: 'admin',        label: 'Admin',         color: '#FB923C', bg: '#FB923C18', perms: ['users.read','campaigns.manage','content.manage','reports.view','settings.view','payouts.manage'] },
  { value: 'moderator',    label: 'Moderator',     color: '#FBBF24', bg: '#FBBF2418', perms: ['campaigns.manage','users.read','reports.view'] },
  { value: 'support',      label: 'Support',       color: '#34D399', bg: '#34D39918', perms: ['users.read','campaigns.view','disputes.manage'] },
  { value: 'finance',      label: 'Finance',       color: '#60A5FA', bg: '#60A5FA18', perms: ['payouts.manage','reports.view','donations.view'] },
  { value: 'content',      label: 'Content editor',color: '#A78BFA', bg: '#A78BFA18', perms: ['content.manage','blog_posts.manage'] },
]

const ALL_PERMS = [
  'users.read','users.manage','campaigns.view','campaigns.manage',
  'content.manage','reports.view','settings.view','settings.manage',
  'payouts.manage','donations.view','disputes.manage','blog_posts.manage',
]

function roleStyle(r: string) {
  const d = ROLE_DEFS.find(d => d.value === r)
  return d ? { color: d.color, background: d.bg } : { color: '#9CA3AF', background: 'rgba(156,163,175,.1)' }
}

function fmt(ts: string) {
  return new Date(ts).toLocaleDateString('en-GH', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminRolesPage() {
  const [rows, setRows] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('moderator')
  const [customPerms, setCustomPerms] = useState<string[]>([])
  const [useCustomPerms, setUseCustomPerms] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<RoleRow | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/roles')
    const data = await res.json()
    setRows(data.roles || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const rolePerms = ROLE_DEFS.find(d => d.value === role)?.perms ?? []

  async function saveRole() {
    if (!userId.trim()) return
    setSaving(true)
    await fetch('/api/admin/roles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId.trim(), role, permissions: useCustomPerms ? customPerms : rolePerms }),
    })
    setUserId(''); setSaving(false); load()
  }

  async function editSave() {
    if (!editRow) return
    setSaving(true)
    await fetch('/api/admin/roles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: editRow.user_id, role: editRow.role, permissions: editRow.permissions }),
    })
    setEditRow(null); setSaving(false); load()
  }

  async function removeRole(userId: string) {
    setDeleting(userId)
    await fetch('/api/admin/roles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setDeleting(null); load()
  }

  const INP: React.CSSProperties = { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#fff', fontFamily: 'inherit' }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `input:focus,select:focus{outline:none;border-color:#6366F1!important} .perm-chip{cursor:pointer;user-select:none}` }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* LEFT — role table */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Roles & permissions</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)' }}>Manage which staff members have admin access and what they can do.</p>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 13 }}>Loading…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,.2)', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No admin roles assigned yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Use the form to grant a user admin access.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rows.map(r => (
                <div key={r.id} style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: '12px 16px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#E5E7EB', marginBottom: 4 }}>{r.user_id}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ ...roleStyle(r.role) as React.CSSProperties, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{r.role}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.2)' }}>Since {fmt(r.created_at)}</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      style={{ background: 'rgba(255,255,255,.07)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 11, padding: '5px 10px', cursor: 'pointer' }}>
                      {expandedId === r.id ? 'Hide' : 'Permissions'}
                    </button>
                    <button onClick={() => removeRole(r.user_id)} disabled={deleting === r.user_id}
                      style={{ background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.25)', borderRadius: 6, color: '#F87171', fontSize: 11, padding: '5px 10px', cursor: 'pointer' }}>
                      {deleting === r.user_id ? '…' : 'Revoke'}
                    </button>
                  </div>

                  {expandedId === r.id && (
                    <div style={{ padding: '0 16px 14px', borderTop: '1px solid rgba(255,255,255,.05)' }}>
                      <div style={{ paddingTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(r.permissions || []).map(p => (
                          <span key={p} style={{ fontSize: 10, fontWeight: 600, color: '#A78BFA', background: 'rgba(167,139,250,.1)', padding: '3px 8px', borderRadius: 100 }}>{p}</span>
                        ))}
                        {(r.permissions || []).length === 0 && <span style={{ fontSize: 12, color: 'rgba(255,255,255,.25)' }}>No explicit permissions</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — assign role */}
        <div style={{ position: 'sticky', top: 72 }}>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Assign / update role</div>

            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: 5 }}>User ID (UUID)</label>
            <input value={userId} onChange={e => setUserId(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              style={{ ...INP, width: '100%', marginBottom: 12, fontFamily: 'monospace', fontSize: 11 }} />

            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', marginBottom: 5 }}>Role</label>
            <select value={role} onChange={e => { setRole(e.target.value); setUseCustomPerms(false); setCustomPerms([]) }}
              style={{ ...INP, width: '100%', marginBottom: 12, cursor: 'pointer' }}>
              {ROLE_DEFS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>

            {/* Preview permissions */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)' }}>Permissions</span>
                <button onClick={() => setUseCustomPerms(!useCustomPerms)}
                  style={{ fontSize: 10, color: '#A78BFA', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {useCustomPerms ? '↩ Use defaults' : '✎ Customise'}
                </button>
              </div>
              {!useCustomPerms ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {rolePerms.map(p => <span key={p} style={{ fontSize: 10, color: '#A78BFA', background: 'rgba(167,139,250,.1)', padding: '2px 7px', borderRadius: 100 }}>{p}</span>)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {ALL_PERMS.map(p => (
                    <span key={p} className="perm-chip"
                      onClick={() => setCustomPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                      style={{ fontSize: 10, padding: '3px 7px', borderRadius: 100, border: '1px solid', borderColor: customPerms.includes(p) ? '#A78BFA' : 'rgba(255,255,255,.1)', color: customPerms.includes(p) ? '#A78BFA' : 'rgba(255,255,255,.35)', background: customPerms.includes(p) ? 'rgba(167,139,250,.12)' : 'transparent' }}>
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button onClick={saveRole} disabled={!userId.trim() || saving}
              style={{ display: 'block', width: '100%', background: '#6366F1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, padding: '11px', cursor: 'pointer', opacity: userId.trim() ? 1 : 0.4 }}>
              {saving ? 'Saving…' : 'Save role →'}
            </button>
          </div>

          {/* Role legend */}
          <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Role guide</div>
            {ROLE_DEFS.map(d => (
              <div key={d.value} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ ...roleStyle(d.value) as React.CSSProperties, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, flexShrink: 0, marginTop: 1 }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
