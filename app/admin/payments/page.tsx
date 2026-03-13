'use client'
import { useEffect, useState } from 'react'

type EventRow = { id: string; external_event_id: string; status: string; processed: boolean; amount: number; created_at: string }

export default function AdminPaymentsPage() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [mismatches, setMismatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const [eventsRes, mismatchRes] = await Promise.all([
      fetch('/api/admin/payments/events?limit=200').then(r => r.json()),
      fetch('/api/admin/payments/mismatches').then(r => r.json()),
    ])
    setEvents(eventsRes.events || [])
    setMismatches(mismatchRes.mismatches || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function reconcile() {
    await fetch('/api/admin/payments/reconcile', { method: 'POST' })
    load()
  }

  async function retry(eventId: string) {
    await fetch('/api/admin/payments/retry', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId }),
    })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-nunito font-black text-white text-2xl mb-1">Payments</h1>
          <p className="text-white/30 text-sm">Monitor gateway events and reconcile mismatches.</p>
        </div>
        <button onClick={reconcile} className="px-4 py-2 bg-[#02A95C] rounded-lg text-white font-bold text-sm">Run reconcile</button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 text-white font-semibold">Mismatches ({mismatches.length})</div>
          {loading ? <div className="p-4 text-white/30 text-sm">Loading...</div> : (
            <div className="divide-y divide-white/5">
              {mismatches.map(m => (
                <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{m.externalEventId}</p>
                    <p className="text-white/40 text-xs">{m.status} · {new Date(m.created_at).toLocaleString()}</p>
                  </div>
                  <button onClick={() => retry(m.id)} className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded">Retry</button>
                </div>
              ))}
              {mismatches.length === 0 && <div className="px-4 py-4 text-white/30 text-sm">No mismatches found.</div>}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 text-white font-semibold">Recent Events</div>
          {loading ? <div className="p-4 text-white/30 text-sm">Loading...</div> : (
            <div className="max-h-[420px] overflow-auto divide-y divide-white/5">
              {events.map(e => (
                <div key={e.id} className="px-4 py-3">
                  <p className="text-white text-sm">{e.external_event_id}</p>
                  <p className="text-white/40 text-xs">{e.status} · processed={String(e.processed)} · GHS {Number(e.amount || 0).toLocaleString()}</p>
                </div>
              ))}
              {events.length === 0 && <div className="px-4 py-4 text-white/30 text-sm">No payment events yet.</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
