import { AdminHeader } from '@/components/admin/AdminHeader'
'use client'
import { useEffect, useState } from 'react'
import type { Donation } from '@/lib/sanityClient'

export default function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/sanity/donations')
      if (!res.ok) {
        setDonations([])
        setLoading(false)
        return
      }
      const json = (await res.json()) as { donations: Donation[] }
      setDonations(json.donations || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0)

  return (
    <div>
      <AdminHeader
        title="Donations"
        subtitle="Donations stored in Sanity for reporting and insights."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-white/5 rounded-xl px-5 py-4">
          <div className="font-nunito font-black text-xl text-primary">
            {donations.length}
          </div>
          <div className="text-white/30 text-xs">Total donations</div>
        </div>
        <div className="bg-gray-900 border border-white/5 rounded-xl px-5 py-4">
          <div className="font-nunito font-black text-xl text-primary">
            ₵{totalRaised.toLocaleString()}
          </div>
          <div className="text-white/30 text-xs">Total amount</div>
        </div>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">
            Loading donations…
          </div>
        ) : donations.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-white/30 text-sm">No donations found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-white/3 transition-all">
                    <td className="px-5 py-4 text-white/40 text-xs">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white font-semibold">
                        {d.donorName || 'Anonymous'}
                      </div>
                      {d.donorEmail && (
                        <div className="text-white/30 text-xs">{d.donorEmail}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white/70 max-w-[220px] truncate">
                        {d.campaignTitle || '—'}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-nunito font-black text-primary">
                      ₵{d.amount.toLocaleString()}
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

