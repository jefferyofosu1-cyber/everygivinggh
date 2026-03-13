'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function AdminPayoutDetailPage() {
  const params = useParams<{ id: string }>()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/payouts')
      .then(r => r.json())
      .then(d => {
        const found = (d.payouts || []).find((p: any) => p.id === params.id)
        setItem(found || null)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) return <p className="text-white/40">Loading payout details...</p>
  if (!item) return <p className="text-white/40">Payout not found.</p>

  return (
    <div>
      <h1 className="font-nunito font-black text-white text-2xl mb-2">Payout Detail</h1>
      <p className="text-white/30 text-sm mb-6">Track timeline and destination for this payout request.</p>

      <div className="bg-gray-900 border border-white/5 rounded-xl p-5 space-y-3 text-sm">
        <div className="text-white/70">ID: <span className="font-mono text-xs">{item.id}</span></div>
        <div className="text-white/70">Status: <span className="text-white">{item.status}</span></div>
        <div className="text-white/70">Amount: <span className="text-primary font-bold">GHS {Number(item.amount || 0).toLocaleString()}</span></div>
        <div className="text-white/70">Requested: <span className="text-white/50">{new Date(item.requested_at).toLocaleString()}</span></div>
        <div className="text-white/70">Failure reason: <span className="text-white/50">{item.failure_reason || '-'}</span></div>
        <pre className="bg-black/30 rounded-lg p-3 text-xs text-white/50 overflow-auto">{JSON.stringify(item.destination || {}, null, 2)}</pre>
      </div>
    </div>
  )
}
