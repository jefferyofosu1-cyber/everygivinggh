'use client'
import { useEffect, useState } from 'react'

export default function AdminReportsPage() {
  const [overview, setOverview] = useState<any>(null)
  const [funnel, setFunnel] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/reports/overview').then(r => r.json()),
      fetch('/api/admin/reports/funnel').then(r => r.json()),
      fetch('/api/admin/reports/categories').then(r => r.json()),
    ]).then(([o, f, c]) => {
      setOverview(o.kpis || null)
      setFunnel(f.funnel || null)
      setCategories(c.categories || [])
    })
  }, [])

  return (
    <div>
      <h1 className="font-nunito font-black text-white text-2xl mb-1">Reports</h1>
      <p className="text-white/30 text-sm mb-6">Platform KPIs, conversion funnel, and category performance.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-white/5 rounded-xl p-4"><p className="text-white/30 text-xs">Total Raised</p><p className="text-primary text-xl font-black">GHS {Number(overview?.totalRaised || 0).toLocaleString()}</p></div>
        <div className="bg-gray-900 border border-white/5 rounded-xl p-4"><p className="text-white/30 text-xs">Pending Payouts</p><p className="text-amber-300 text-xl font-black">{overview?.pendingPayouts || 0}</p></div>
        <div className="bg-gray-900 border border-white/5 rounded-xl p-4"><p className="text-white/30 text-xs">Open Disputes</p><p className="text-red-400 text-xl font-black">{overview?.openDisputes || 0}</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-gray-900 border border-white/5 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3">Funnel</h2>
          <div className="space-y-1 text-sm text-white/70">
            <p>Signups: {funnel?.signups ?? 0}</p>
            <p>Campaigns Created: {funnel?.campaignsCreated ?? 0}</p>
            <p>Campaigns Approved: {funnel?.campaignsApproved ?? 0}</p>
            <p>Successful Donations: {funnel?.successfulDonations ?? 0}</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-white/5 rounded-xl p-4">
          <h2 className="text-white font-semibold mb-3">Top Categories</h2>
          <div className="space-y-2 text-sm">
            {categories.slice(0, 8).map((c: any) => (
              <div key={c.category} className="flex items-center justify-between">
                <span className="text-white/70">{c.category}</span>
                <span className="text-white">{c.count}</span>
              </div>
            ))}
            {categories.length === 0 && <p className="text-white/30">No category data yet.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
