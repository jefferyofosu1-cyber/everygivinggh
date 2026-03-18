'use client'
import { useEffect, useState } from 'react'

type Setting = { key: string; value: any }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')

  async function load() {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    setSettings(data.settings || [])
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (!key.trim()) return
    let parsed: any = value
    try { parsed = JSON.parse(value) } catch {}
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: key.trim(), value: parsed }),
    })
    setKey('')
    setValue('')
    load()
  }

  async function remove(settingKey: string) {
    await fetch('/api/admin/settings', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: settingKey }),
    })
    load()
  }

  return (
    <div>
      <h1 className="font-nunito font-black text-white text-2xl mb-1">Platform Settings</h1>
      <p className="text-white/30 text-sm mb-6">Manage configurable operational values and feature flags.</p>

      <div className="bg-gray-900 border border-white/5 rounded-xl p-4 mb-6 grid md:grid-cols-3 gap-3">
        <input value={key} onChange={e => setKey(e.target.value)} placeholder="setting.key" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <input value={value} onChange={e => setValue(e.target.value)} placeholder='{"enabled":true}' className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <button onClick={save} className="px-4 py-2 bg-[#02A95C] rounded-lg text-white text-sm font-bold">Save Setting</button>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b border-white/5"><th className="px-4 py-3 text-white/30">Key</th><th className="px-4 py-3 text-white/30">Value</th><th className="px-4 py-3 text-white/30">Actions</th></tr></thead>
          <tbody>
            {settings.map(s => (
              <tr key={s.key} className="border-b border-white/5">
                <td className="px-4 py-3 text-white/70 font-mono text-xs">{s.key}</td>
                <td className="px-4 py-3 text-white/50 text-xs"><pre>{JSON.stringify(s.value)}</pre></td>
                <td className="px-4 py-3"><button onClick={() => remove(s.key)} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Delete</button></td>
              </tr>
            ))}
            {settings.length === 0 && <tr><td colSpan={3} className="px-4 py-5 text-white/30">No settings yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
