'use client'
import { useEffect, useState } from 'react'

type Review = { id: string; status: string; campaign_id: string; risk_score: number | null; notes: string | null; created_at: string }

export default function AdminVerificationPage() {
  const [rows, setRows] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [campaignId, setCampaignId] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/verification?status=${status}`)
    const data = await res.json()
    setRows(data.reviews || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [status])

  async function approve(id: string) {
    await fetch(`/api/admin/verification/${id}/approve`, { method: 'POST' })
    load()
  }

  async function reject(id: string) {
    const reason = window.prompt('Reason for rejection?') || ''
    await fetch(`/api/admin/verification/${id}/reject`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }),
    })
    load()
  }

  async function create() {
    if (!campaignId.trim()) return
    await fetch('/api/admin/verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: campaignId.trim() }),
    })
    setCampaignId('')
    load()
  }

  async function remove(id: string) {
    await fetch(`/api/admin/verification/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1 className="font-nunito font-black text-white text-2xl mb-1">Verification Queue</h1>
      <p className="text-white/30 text-sm mb-4">Review KYC and campaign verification decisions.</p>

      <div className="mb-5 flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${status === s ? 'bg-[#02A95C] text-white' : 'bg-white/5 text-white/40'}`}>{s}</button>
        ))}
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-xl p-4 mb-6 grid md:grid-cols-3 gap-3">
        <input value={campaignId} onChange={e => setCampaignId(e.target.value)} placeholder="Campaign ID" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <div />
        <button onClick={create} className="px-4 py-2 bg-[#02A95C] rounded-lg text-white text-sm font-bold">Create Verification Record</button>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? <div className="p-6 text-white/30 text-sm">Loading verification queue...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-white/5"><th className="px-4 py-3 text-white/30">Campaign</th><th className="px-4 py-3 text-white/30">Status</th><th className="px-4 py-3 text-white/30">Risk</th><th className="px-4 py-3 text-white/30">Actions</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white/70 font-mono text-xs">{r.campaign_id}</td>
                  <td className="px-4 py-3 text-white">{r.status}</td>
                  <td className="px-4 py-3 text-white/50">{r.risk_score ?? '-'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => approve(r.id)} className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">Approve</button>
                    <button onClick={() => reject(r.id)} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Reject</button>
                    <button onClick={() => remove(r.id)} className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded">Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-5 text-white/30">No verification records yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
