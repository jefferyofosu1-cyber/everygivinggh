'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface DonationCampaign {
  title:    string
  profiles: { full_name: string | null } | null
}

interface Donation {
  id:                string
  donor_name:        string | null
  donor_email:       string | null
  amount:            number
  payment_method:    string | null
  payment_reference: string | null
  status:            string
  created_at:        string
  campaigns:         DonationCampaign | null
}

const STATUS_BADGE: Record<string, string> = {
  success: 'bg-green-500/20 text-green-400',
  pending: 'bg-amber-500/20 text-amber-400',
  failed:  'bg-red-500/20 text-red-400',
}

const STATUS_FILTERS = ['all', 'success', 'pending', 'failed'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

export default function AdminDonationsPage() {
  const [donations,    setDonations]    = useState<Donation[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('donations')
      .select('*, campaigns(title, profiles(full_name))')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDonations((data ?? []) as Donation[])
        setLoading(false)
      })
  }, [])

  const filtered = donations.filter(d => {
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !search ||
      (d.donor_name ?? '').toLowerCase().includes(q) ||
      (d.campaigns?.title ?? '').toLowerCase().includes(q) ||
      (d.payment_reference ?? '').includes(search)
    return matchStatus && matchSearch
  })

  const successTotal  = donations.filter(d => d.status === 'success').reduce((s, d) => s + (d.amount ?? 0), 0)
  const filteredTotal = filtered.filter(d => d.status === 'success').reduce((s, d) => s + (d.amount ?? 0), 0)
  const cedis = (n: number) => `GH${String.fromCharCode(8373)}${n.toLocaleString()}`

  function exportCSV() {
    const rows = [
      ['Date', 'Donor', 'Campaign', 'Amount', 'Method', 'Reference', 'Status'],
      ...filtered.map(d => [
        new Date(d.created_at).toLocaleDateString(),
        d.donor_name ?? 'Anonymous',
        d.campaigns?.title ?? '-',
        d.amount,
        d.payment_method ?? '-',
        d.payment_reference ?? '-',
        d.status,
      ]),
    ]
    const csv  = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
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
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all">
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Successful',   val: donations.filter(d => d.status === 'success').length, color: 'text-green-400' },
          { label: 'Total raised', val: cedis(successTotal),                                   color: 'text-green-400' },
          { label: 'Pending',      val: donations.filter(d => d.status === 'pending').length,  color: 'text-amber-400' },
          { label: 'Failed',       val: donations.filter(d => d.status === 'failed').length,   color: 'text-red-400'   },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 border border-white/5 rounded-xl px-5 py-4">
            <p className={`font-nunito font-black text-xl ${s.color}`}>{s.val}</p>
            <p className="text-white/30 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === s ? 'bg-primary text-white' : 'text-white/40 hover:text-white'
              }`}>
              {s}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search donor, campaign..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all" />
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center gap-1 text-sm self-center">
            <span className="text-white/30">{filtered.length} results</span>
            <span className="text-white/20 mx-1">·</span>
            <span className="text-primary font-bold">{cedis(filteredTotal)} shown</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-white/30 text-sm">No donations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {['Date', 'Donor', 'Campaign', 'Amount', 'Method', 'Reference', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-white/[0.03] transition-all">
                    <td className="px-5 py-4 text-white/40 text-xs">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <p className="text-white font-semibold">{d.donor_name ?? 'Anonymous'}</p>
                      {d.donor_email && <p className="text-white/30 text-xs">{d.donor_email}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white/70 max-w-[180px] truncate">{d.campaigns?.title ?? '-'}</p>
                      <p className="text-white/30 text-xs">{d.campaigns?.profiles?.full_name ?? ''}</p>
                    </td>
                    <td className="px-5 py-4 font-nunito font-black text-primary">{cedis(d.amount ?? 0)}</td>
                    <td className="px-5 py-4 text-white/50 text-xs">{d.payment_method ?? '-'}</td>
                    <td className="px-5 py-4 text-white/30 text-xs font-mono">{d.payment_reference ?? '-'}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[d.status] ?? ''}`}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
