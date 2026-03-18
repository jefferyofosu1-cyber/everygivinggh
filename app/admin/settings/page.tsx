'use client'
import { useEffect, useState, useCallback } from 'react'

type Setting = {
  key: string
  value: unknown
  updated_by?: string
  updated_at?: string
}

// Canonical list of platform settings with descriptions
const KNOWN_SETTINGS: { key: string; label: string; description: string; type: 'string' | 'boolean' | 'number' | 'json' }[] = [
  { key: 'platform.maintenance_mode',       label: 'Maintenance mode',         description: 'Take the platform offline for all users while you deploy updates.',             type: 'boolean' },
  { key: 'platform.allow_new_signups',      label: 'Allow new signups',        description: 'Whether new users can register. Turn off to freeze registrations.',            type: 'boolean' },
  { key: 'platform.allow_new_campaigns',    label: 'Allow new campaigns',      description: 'Whether campaigners can create new campaigns.',                                type: 'boolean' },
  { key: 'platform.min_campaign_goal',      label: 'Minimum campaign goal (₵)', description: 'Smallest allowed campaign goal amount in GHS.',                               type: 'number'  },
  { key: 'platform.max_campaign_goal',      label: 'Maximum campaign goal (₵)', description: 'Largest allowed campaign goal amount in GHS.',                                type: 'number'  },
  { key: 'platform.platform_fee_pct',       label: 'Platform fee (%)',          description: 'Percentage taken from each donation as platform revenue.',                     type: 'number'  },
  { key: 'platform.min_withdrawal_amount',  label: 'Minimum withdrawal (₵)',    description: 'Minimum amount a campaigner can withdraw via MoMo or bank.',                  type: 'number'  },
  { key: 'email.from_name',                label: 'Email sender name',          description: 'Display name used in all outgoing platform emails.',                           type: 'string'  },
  { key: 'email.from_address',             label: 'Email from address',         description: 'The sending email address for notifications.',                                  type: 'string'  },
  { key: 'verification.auto_approve_basic', label: 'Auto-approve basic tier',   description: 'Automatically approve organisations applying for Basic verification.',        type: 'boolean' },
  { key: 'notifications.donor_receipt',     label: 'Send donor receipts',       description: 'Whether to email a receipt to donors after each confirmed payment.',           type: 'boolean' },
]

function fmt(ts?: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('en-GH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function renderValue(v: unknown, type: string): string {
  if (v === null || v === undefined) return '—'
  if (type === 'boolean') return String(v)
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [custom, setCustom] = useState({ key: '', value: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    const list: Setting[] = data.settings || []
    setSettings(list)
    // Pre-fill edit values
    const vals: Record<string, string> = {}
    list.forEach(s => { vals[s.key] = renderValue(s.value, 'string') })
    setEditValues(vals)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const getValue = (key: string) => settings.find(s => s.key === key)

  async function save(key: string, raw: string, meta: typeof KNOWN_SETTINGS[0]) {
    setSaving(key)
    let parsed: unknown = raw
    if (meta.type === 'boolean') parsed = raw === 'true'
    else if (meta.type === 'number') parsed = Number(raw)
    else { try { parsed = JSON.parse(raw) } catch { parsed = raw } }

    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: parsed }),
    })
    setSaveMsg(key); setTimeout(() => setSaveMsg(null), 2000)
    setSaving(null); load()
  }

  async function saveCustom() {
    if (!custom.key.trim()) return
    setSaving('custom')
    let parsed: unknown = custom.value
    try { parsed = JSON.parse(custom.value) } catch { parsed = custom.value }
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: custom.key.trim(), value: parsed }),
    })
    setCustom({ key: '', value: '' }); setSaving(null); load()
  }

  const CARD: React.CSSProperties = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }
  const INP: React.CSSProperties = { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#fff', fontFamily: 'inherit', width: '100%' }
  const BTN: React.CSSProperties = { background: '#6366F1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px', cursor: 'pointer' }

  // Group settings by prefix
  const GROUPS = ['platform', 'email', 'verification', 'notifications']

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `input:focus,textarea:focus{outline:none;border-color:#6366F1!important} select:focus{outline:none}` }} />

      <div style={{ maxWidth: 780 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Platform settings</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)' }}>Configure global platform behaviour. All changes are logged to the audit trail.</p>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 13 }}>Loading settings…</div>
        ) : (
          <>
            {GROUPS.map(group => {
              const groupSettings = KNOWN_SETTINGS.filter(s => s.key.startsWith(group + '.'))
              return (
                <div key={group} style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>{group}</div>
                  {groupSettings.map(meta => {
                    const current = getValue(meta.key)
                    const raw = editValues[meta.key] ?? (current ? renderValue(current.value, meta.type) : '')
                    const isDirty = raw !== (current ? renderValue(current.value, meta.type) : '')
                    return (
                      <div key={meta.key} style={CARD}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#F9FAFB', marginBottom: 3 }}>{meta.label}</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginBottom: 10 }}>{meta.description}</div>
                            {meta.type === 'boolean' ? (
                              <select value={raw} onChange={e => setEditValues(v => ({ ...v, [meta.key]: e.target.value }))}
                                style={{ ...INP, width: 'auto', cursor: 'pointer' }}>
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            ) : (
                              <input type={meta.type === 'number' ? 'number' : 'text'}
                                value={raw}
                                onChange={e => setEditValues(v => ({ ...v, [meta.key]: e.target.value }))}
                                placeholder={meta.type === 'number' ? '0' : 'value'}
                                style={INP} />
                            )}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <button onClick={() => save(meta.key, raw, meta)} disabled={!isDirty || saving === meta.key}
                              style={{ ...BTN, opacity: isDirty ? 1 : 0.35 }}>
                              {saving === meta.key ? '…' : saveMsg === meta.key ? '✓ Saved' : 'Save'}
                            </button>
                            {current?.updated_at && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.2)', marginTop: 4 }}>Updated {fmt(current.updated_at)}</div>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}

            {/* Custom / uncategorised settings from DB */}
            {settings.filter(s => !KNOWN_SETTINGS.find(k => k.key === s.key)).length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Custom</div>
                {settings.filter(s => !KNOWN_SETTINGS.find(k => k.key === s.key)).map(s => (
                  <div key={s.key} style={CARD}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#A78BFA', marginBottom: 4 }}>{s.key}</div>
                        <input value={editValues[s.key] ?? renderValue(s.value, 'string')}
                          onChange={e => setEditValues(v => ({ ...v, [s.key]: e.target.value }))}
                          style={INP} />
                      </div>
                      <button onClick={() => save(s.key, editValues[s.key] ?? '', { key: s.key, label: s.key, description: '', type: 'json' })}
                        style={BTN}>{saving === s.key ? '…' : '✓ Save'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add custom setting */}
            <div style={{ ...CARD, borderStyle: 'dashed' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.4)', marginBottom: 10 }}>Add custom setting</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
                <input value={custom.key} onChange={e => setCustom(p => ({ ...p, key: e.target.value }))}
                  placeholder="platform.key_name" style={{ ...INP, fontFamily: 'monospace' }} />
                <input value={custom.value} onChange={e => setCustom(p => ({ ...p, value: e.target.value }))}
                  placeholder='value or JSON (e.g. "text" / true / 42)' style={INP} />
                <button onClick={saveCustom} disabled={!custom.key.trim() || saving === 'custom'}
                  style={{ ...BTN, opacity: custom.key.trim() ? 1 : 0.4 }}>
                  {saving === 'custom' ? '…' : '+ Add'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
