'use client'
import { useEffect, useState } from 'react'

type Dispute = { id: string; reason: string; status: string; resolution?: string }

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [reason, setReason] = useState('')

  async function load() {
    const res = await fetch('/api/admin/support/disputes')
    const data = await res.json()
    setDisputes(data.disputes || [])
  }

  useEffect(() => { load() }, [])

  async function create() {
    if (!reason.trim()) return
    await fetch('/api/admin/support/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason.trim() }),
    })
    setReason('')
    load()
  }

  async function resolve(d: Dispute) {
    const resolution = window.prompt('Resolution notes', d.resolution || '')
    if (resolution === null) return
    await fetch(`/api/admin/support/disputes/${d.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'resolved', resolution }),
    })
    load()
  }

  async function remove(id: string) {
    await fetch(`/api/admin/support/disputes/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1 className="font-nunito font-black text-white text-2xl mb-1">Disputes</h1>
      <p className="text-white/30 text-sm mb-6">Resolve payment disputes and preserve donor trust.</p>

      <div className="bg-gray-900 border border-white/5 rounded-xl p-4 mb-6 grid md:grid-cols-3 gap-3">
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason for dispute" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <div />
        <button onClick={create} className="px-4 py-2 bg-[#02A95C] rounded-lg text-white text-sm font-bold">Create Dispute</button>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="text-left border-b border-white/5"><th className="px-4 py-3 text-white/30">Reason</th><th className="px-4 py-3 text-white/30">Status</th><th className="px-4 py-3 text-white/30">Actions</th></tr></thead>
          <tbody>
            {disputes.map(d => (
              <tr key={d.id} className="border-b border-white/5">
                <td className="px-4 py-3 text-white/70">{d.reason}</td>
                <td className="px-4 py-3 text-white">{d.status}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => resolve(d)} className="px-2 py-1 text-xs bg-[#02A95C]/20 text-[#02A95C] rounded">Resolve</button>
                  <button onClick={() => remove(d.id)} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Delete</button>
                </td>
              </tr>
            ))}
            {disputes.length === 0 && <tr><td colSpan={3} className="px-4 py-5 text-white/30">No disputes yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
