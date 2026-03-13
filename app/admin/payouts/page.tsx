'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Payout = { id: string; amount: number; status: string; requested_at: string; failure_reason?: string }

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [fundraiserUserId, setFundraiserUserId] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/payouts')
    const data = await res.json()
    setPayouts(data.payouts || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function action(route: string, id: string) {
    await fetch(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    load()
  }

  async function createPayout() {
    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return
    await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: numericAmount,
        campaign_id: campaignId.trim() || null,
        fundraiser_user_id: fundraiserUserId.trim() || null,
      }),
    })
    setAmount('')
    setCampaignId('')
    setFundraiserUserId('')
    load()
  }

  async function removePayout(id: string) {
    await fetch('/api/admin/payouts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div>
      <h1 className="font-nunito font-black text-white text-2xl mb-1">Payouts</h1>
      <p className="text-white/30 text-sm mb-6">Review and process fundraiser withdrawal payouts.</p>

      <div className="bg-gray-900 border border-white/5 rounded-xl p-4 mb-6 grid md:grid-cols-4 gap-3">
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <input value={campaignId} onChange={e => setCampaignId(e.target.value)} placeholder="Campaign ID (optional)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <input value={fundraiserUserId} onChange={e => setFundraiserUserId(e.target.value)} placeholder="Fundraiser User ID (optional)" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <button onClick={createPayout} className="px-4 py-2 bg-[#02A95C] rounded-lg text-white text-sm font-bold">Create Payout</button>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? <div className="p-6 text-white/30 text-sm">Loading payouts...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-white/5"><th className="px-4 py-3 text-white/30">Requested</th><th className="px-4 py-3 text-white/30">Amount</th><th className="px-4 py-3 text-white/30">Status</th><th className="px-4 py-3 text-white/30">Actions</th></tr></thead>
            <tbody>
              {payouts.map(p => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white/40 text-xs"><Link href={`/admin/payouts/${p.id}`}>{new Date(p.requested_at).toLocaleString()}</Link></td>
                  <td className="px-4 py-3 text-primary font-bold">GHS {Number(p.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-white">{p.status}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => action('/api/admin/payouts/approve', p.id)} className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">Approve</button>
                    <button onClick={() => action('/api/admin/payouts/mark-sent', p.id)} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">Mark sent</button>
                    <button onClick={() => action('/api/admin/payouts/mark-failed', p.id)} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Mark failed</button>
                    <button onClick={() => removePayout(p.id)} className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded">Delete</button>
                  </td>
                </tr>
              ))}
              {payouts.length === 0 && <tr><td colSpan={4} className="px-4 py-5 text-white/30">No payout requests yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
