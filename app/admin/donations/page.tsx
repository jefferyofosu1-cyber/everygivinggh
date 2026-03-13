'use client'
import { useEffect, useState } from 'react'

const STATUS_BADGE: Record<string, string> = {
  success: 'bg-green-500/20 text-green-400',
  pending: 'bg-amber-500/20 text-amber-400',
  failed: 'bg-red-500/20 text-red-400',
}

function DonationModal({ donation, onClose, onUpdate }: { donation: any; onClose: () => void; onUpdate: () => void }) {
  const [newStatus, setNewStatus] = useState(donation.status)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const updateStatus = async () => {
    if (newStatus === donation.status) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: donation.id, status: newStatus }),
      })
      if (res.ok) { onUpdate(); onClose() }
    } catch (e) { console.error('updateStatus error:', e) }
    setSaving(false)
  }

  const deleteDonation = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/donations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: donation.id }),
      })
      if (res.ok) { onUpdate(); onClose() }
    } catch (e) { console.error('deleteDonation error:', e) }
    setDeleting(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-nunito font-black text-white text-lg mb-1">Donation Details</h2>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[donation.status] || ''}`}>{donation.status}</span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-2xl leading-none ml-4">×</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-white/30 text-xs mb-0.5">Donor</div><div className="text-white font-semibold">{donation.donor_name || 'Anonymous'}</div></div>
              <div><div className="text-white/30 text-xs mb-0.5">Email</div><div className="text-white font-semibold truncate">{donation.donor_email || ' - '}</div></div>
              <div><div className="text-white/30 text-xs mb-0.5">Amount</div><div className="text-primary font-black">₵{donation.amount?.toLocaleString()}</div></div>
              <div><div className="text-white/30 text-xs mb-0.5">Method</div><div className="text-white font-semibold">{donation.payment_method || ' - '}</div></div>
              <div><div className="text-white/30 text-xs mb-0.5">Reference</div><div className="text-white font-mono text-xs">{donation.payment_reference || ' - '}</div></div>
              <div><div className="text-white/30 text-xs mb-0.5">Date</div><div className="text-white font-semibold">{new Date(donation.created_at).toLocaleString()}</div></div>
              <div className="col-span-2"><div className="text-white/30 text-xs mb-0.5">Campaign</div><div className="text-white font-semibold">{donation.campaigns?.title || ' - '}</div></div>
              {donation.message && <div className="col-span-2"><div className="text-white/30 text-xs mb-0.5">Message</div><div className="text-white/70 text-sm">{donation.message}</div></div>}
            </div>
          </div>

          {/* Status update */}
          <div>
            <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Update Status</label>
            <div className="flex gap-2">
              {['pending', 'success', 'failed'].map(s => (
                <button key={s} onClick={() => setNewStatus(s)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all capitalize ${
                    newStatus === s
                      ? s === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400'
                        : s === 'failed' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                        : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {newStatus !== donation.status && (
            <button onClick={updateStatus} disabled={saving}
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all text-sm disabled:opacity-50 shadow-lg shadow-primary/20">
              {saving ? 'Saving…' : 'Save Status Change'}
            </button>
          )}

          {/* Delete */}
          {confirmDelete ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-red-400 text-xs mb-3">Permanently delete this donation record? This cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs font-bold rounded-lg transition-all">Cancel</button>
                <button onClick={deleteDonation} disabled={deleting} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="w-full text-center text-xs text-red-400/60 hover:text-red-400 transition-colors py-2">
              Delete donation
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/admin/donations')
      .then(r => r.json())
      .then(data => {
        setDonations(data.donations || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = donations.filter(d => {
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    const matchSearch = !search ||
      d.donor_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.campaigns?.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.payment_reference?.includes(search)
    return matchStatus && matchSearch
  })

  const totalRaised = filtered.filter(d => d.status === 'success').reduce((sum, d) => sum + (d.amount || 0), 0)

  const exportCSV = () => {
    const rows = [
      ['Date', 'Donor', 'Campaign', 'Amount', 'Method', 'Reference', 'Status'],
      ...filtered.map(d => [
        new Date(d.created_at).toLocaleDateString(),
        d.donor_name || 'Anonymous',
        d.campaigns?.title || ' - ',
        d.amount,
        d.payment_method || ' - ',
        d.payment_reference || ' - ',
        d.status,
      ])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `everygiving-donations-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-nunito font-black text-white text-2xl mb-1">Donations</h1>
          <p className="text-white/30 text-sm">All transactions across every campaign.</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all">
          <span></span> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total donations', val: donations.filter(d => d.status === 'success').length, color: 'text-primary' },
          { label: 'Total raised', val: `₵${donations.filter(d => d.status === 'success').reduce((s, d) => s + (d.amount || 0), 0).toLocaleString()}`, color: 'text-primary' },
          { label: 'Pending', val: donations.filter(d => d.status === 'pending').length, color: 'text-amber-400' },
          { label: 'Failed', val: donations.filter(d => d.status === 'failed').length, color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 border border-white/5 rounded-xl px-5 py-4">
            <div className={`font-nunito font-black text-xl ${s.color}`}>{s.val}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {['all', 'success', 'pending', 'failed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === s ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search donor, campaign…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all" />
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-white/30">
            <span>{filtered.length} results · </span>
            <span className="text-primary font-bold">₵{totalRaised.toLocaleString()} shown</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Loading donations…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3"></div>
            <div className="text-white/30 text-sm">No donations found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Donor</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Campaign</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Method</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Reference</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-white/3 transition-all">
                    <td className="px-5 py-4 text-white/40 text-xs">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="text-white font-semibold">{d.donor_name || 'Anonymous'}</div>
                      {d.donor_email && <div className="text-white/30 text-xs">{d.donor_email}</div>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white/70 max-w-[180px] truncate">{d.campaigns?.title || ' - '}</div>
                      <div className="text-white/30 text-xs">{d.campaigns?.profiles?.full_name || ' - '}</div>
                    </td>
                    <td className="px-5 py-4 font-nunito font-black text-primary">₵{d.amount?.toLocaleString()}</td>
                    <td className="px-5 py-4 text-white/50 text-xs">{d.payment_method || ' - '}</td>
                    <td className="px-5 py-4 text-white/30 text-xs font-mono">{d.payment_reference || ' - '}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[d.status] || ''}`}>{d.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(d)}
                        className="bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 hover:border-primary/30 text-white/60 text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <DonationModal donation={selected} onClose={() => setSelected(null)} onUpdate={load} />}
    </div>
  )
}
