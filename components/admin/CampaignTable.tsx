'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Campaign } from '@/lib/sanityClient'

type Props = {
  onChanged?: () => void
}

export function CampaignTable({ onChanged }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/sanity/campaigns', { method: 'GET' })
    if (!res.ok) {
      setCampaigns([])
      setLoading(false)
      return
    }
    const json = (await res.json()) as { campaigns: Campaign[] }
    setCampaigns(json.campaigns || [])
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this campaign? This cannot be undone.')) return
    await fetch(`/api/admin/sanity/campaigns?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    await load()
    onChanged?.()
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-8 text-center text-white/30 text-sm">
        Loading campaigns…
      </div>
    )
  }

  if (!campaigns.length) {
    return (
      <div className="bg-gray-900 border border-white/5 rounded-2xl p-10 text-center">
        <p className="text-white/30 text-sm mb-4">No campaigns found.</p>
        <Link
          href="/admin/campaigns/new"
          className="inline-block bg-primary text-white font-nunito font-black text-sm px-5 py-3 rounded-full hover:bg-primary-dark transition-all"
        >
          Create first campaign
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                Title
              </th>
              <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                Category
              </th>
              <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                Goal
              </th>
              <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                Raised
              </th>
              <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                Created
              </th>
              <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns.map((c) => (
              <tr key={c._id} className="hover:bg-white/5 transition-all">
                <td className="px-5 py-4">
                  <div className="text-white font-semibold max-w-xs truncate">
                    {c.title}
                  </div>
                </td>
                <td className="px-5 py-4 text-white/60 capitalize">
                  {c.category || '—'}
                </td>
                <td className="px-5 py-4 font-nunito font-black text-primary">
                  ₵{(c.goalAmount ?? 0).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-white/60">
                  ₵{(c.amountRaised ?? 0).toLocaleString()}
                </td>
                <td className="px-5 py-4 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-white/70 font-bold capitalize">
                    {c.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/30 text-xs">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString()
                    : '—'}
                </td>
                <td className="px-5 py-4 space-x-2">
                  <Link
                    href={`/admin/campaigns/${c._id}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 text-white/70 hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition-all"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

