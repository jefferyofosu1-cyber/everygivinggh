'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

// ── Types ────────────────────────────────────────────────────────────────────

interface CampaignProfile {
  full_name: string | null
  phone:     string | null
  email:     string | null
}

interface Campaign {
  id:                string
  title:             string
  story:             string | null
  category:          string
  goal_amount:       number
  status:            string
  verification_tier: string
  created_at:        string
  user_id:           string
  id_type:           string | null
  id_number:         string | null
  id_front_url:      string | null
  selfie_url:        string | null
  profiles:          CampaignProfile | null
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'] as const
type StatusTab = typeof STATUS_TABS[number]

const TIER_BADGE: Record<string, string> = {
  basic:    'bg-gray-700 text-gray-300',
  standard: 'bg-green-500/20 text-green-400',
  premium:  'bg-amber-500/20 text-amber-400',
  gold:     'bg-yellow-500/20 text-yellow-400',
  diamond:  'bg-purple-500/20 text-purple-400',
}

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-amber-500/20 text-amber-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}

// ── Email ─────────────────────────────────────────────────────────────────────

async function sendStatusEmail(
  to: string, name: string, title: string,
  status: 'approved' | 'rejected', note: string,
): Promise<void> {
  try {
    await fetch('/api/send-status-email', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ to, name, title, status, note }),
    })
  } catch (e) {
    console.error('sendStatusEmail:', e instanceof Error ? e.message : e)
  }
}

// ── Campaign modal ────────────────────────────────────────────────────────────

function CampaignModal({ campaign, onClose, onUpdate }: {
  campaign: Campaign
  onClose:  () => void
  onUpdate: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [note,   setNote]   = useState('')

  async function updateStatus(status: 'approved' | 'rejected') {
    if (status === 'rejected' && !note.trim()) {
      toast.error('Please add a note explaining the rejection.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('campaigns')
      .update({ status, verified: status === 'approved' })
      .eq('id', campaign.id)
    if (error) {
      toast.error('Failed to update campaign')
      setSaving(false)
      return
    }

    const email = campaign.profiles?.email
    if (email) {
      await sendStatusEmail(
        email,
        campaign.profiles?.full_name?.split(' ')[0] ?? 'there',
        campaign.title,
        status,
        note.trim(),
      )
    }

    toast.success(status === 'approved' ? 'Campaign approved and live!' : 'Campaign rejected.')
    setSaving(false)
    onUpdate()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-nunito font-black text-white text-lg mb-1">{campaign.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TIER_BADGE[campaign.verification_tier] ?? 'bg-gray-700 text-gray-300'}`}>
                {campaign.verification_tier ?? 'basic'}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[campaign.status] ?? ''}`}>
                {campaign.status}
              </span>
              <span className="text-white/30 text-xs">{new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-xl leading-none ml-4 mt-1">x</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Fundraiser info */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Fundraiser</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-white/30 text-xs mb-0.5">Name</p>
                <p className="text-white font-semibold">{campaign.profiles?.full_name ?? '-'}</p>
              </div>
              <div>
                <p className="text-white/30 text-xs mb-0.5">Phone</p>
                <p className="text-white font-semibold">{campaign.profiles?.phone ?? '-'}</p>
              </div>
              <div>
                <p className="text-white/30 text-xs mb-0.5">Category</p>
                <p className="text-white font-semibold">{campaign.category}</p>
              </div>
              <div>
                <p className="text-white/30 text-xs mb-0.5">Goal</p>
                <p className="text-primary font-black">GH{String.fromCharCode(8373)}{campaign.goal_amount?.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-white/30 text-xs mb-0.5">ID type</p>
                <p className="text-white font-semibold">{campaign.id_type ?? '-'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-white/30 text-xs mb-0.5">ID number</p>
                <p className="text-white font-mono font-bold">{campaign.id_number ?? '-'}</p>
              </div>
            </div>
          </div>

          {/* Identity docs */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Identity Documents</p>
            {!campaign.id_front_url && !campaign.selfie_url ? (
              <p className="text-white/20 text-xs text-center py-4">No documents uploaded yet</p>
            ) : (
              <div className="space-y-4">
                {campaign.id_front_url && (
                  <div>
                    <p className="text-white/40 text-xs font-bold mb-2">ID PHOTO</p>
                    <a href={campaign.id_front_url} target="_blank" rel="noopener noreferrer" className="block group">
                      <img src={campaign.id_front_url} alt="ID"
                        className="w-full rounded-xl border border-white/10 object-cover max-h-52 group-hover:border-primary/40 transition-all"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <p className="text-primary text-xs mt-1.5 text-right">Open full size</p>
                    </a>
                  </div>
                )}
                {campaign.selfie_url && (
                  <div>
                    <p className="text-white/40 text-xs font-bold mb-2">SELFIE WITH ID</p>
                    <a href={campaign.selfie_url} target="_blank" rel="noopener noreferrer" className="block group">
                      <img src={campaign.selfie_url} alt="Selfie"
                        className="w-full rounded-xl border border-white/10 object-cover max-h-52 group-hover:border-primary/40 transition-all"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      <p className="text-primary text-xs mt-1.5 text-right">Open full size</p>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Story */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Campaign story</p>
            <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{campaign.story ?? 'No story provided.'}</p>
          </div>

          {/* Note */}
          <div>
            <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">
              Note to fundraiser
              {campaign.status === 'pending' && <span className="text-red-400 font-normal normal-case ml-1">(required if rejecting)</span>}
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="e.g. Your ID photo is too blurry. Please resubmit a clear, well-lit photo of your Ghana Card."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all resize-none" />
            <p className="text-white/20 text-xs mt-1">This message will be included in the email sent to the fundraiser.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button onClick={() => updateStatus('rejected')}
            disabled={saving || campaign.status === 'rejected'}
            className="flex-1 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-nunito font-black rounded-xl transition-all text-sm disabled:opacity-30">
            {saving ? '...' : 'Reject'}
          </button>
          <button onClick={() => updateStatus('approved')}
            disabled={saving || campaign.status === 'approved'}
            className="flex-[2] py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all text-sm disabled:opacity-30 shadow-lg shadow-primary/20">
            {saving ? 'Saving...' : campaign.status === 'pending' ? 'Approve and go live' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── List page ─────────────────────────────────────────────────────────────────

function CampaignsContent() {
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading,   setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState<StatusTab>(
    (searchParams.get('status') as StatusTab) ?? 'all'
  )
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [search,   setSearch]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let q = supabase
      .from('campaigns')
      .select('*, profiles(full_name, phone, email)')
      .order('created_at', { ascending: false })
    if (activeTab !== 'all') q = q.eq('status', activeTab)
    const { data } = await q
    setCampaigns((data ?? []) as Campaign[])
    setLoading(false)
  }, [activeTab])

  useEffect(() => { load() }, [load])

  const filtered = campaigns.filter(c =>
    !search ||
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount = campaigns.filter(c => c.status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-nunito font-black text-white text-2xl mb-1">Campaigns</h1>
          <p className="text-white/30 text-sm">Review, approve, and manage all campaigns.</p>
        </div>
        {pendingCount > 0 && (
          <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-2 rounded-full">
            {pendingCount} pending review
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                activeTab === tab ? 'bg-primary text-white' : 'text-white/40 hover:text-white'
              }`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all" />
        </div>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-white/30 text-sm">No campaigns found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {['Campaign', 'Fundraiser', 'Tier', 'Goal', 'Status', 'Date', ''].map((h, i) => (
                    <th key={i} className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-5 py-4">
                      <p className="text-white font-semibold max-w-[200px] truncate group-hover:text-primary transition-colors">{c.title}</p>
                      <p className="text-white/30 text-xs">{c.category}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white/70">{c.profiles?.full_name ?? '-'}</p>
                      <p className="text-white/30 text-xs">{c.profiles?.phone ?? '-'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TIER_BADGE[c.verification_tier] ?? 'bg-gray-700 text-gray-300'}`}>
                        {c.verification_tier ?? 'basic'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-nunito font-black text-primary text-sm">
                      GH{String.fromCharCode(8373)}{c.goal_amount?.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[c.status] ?? ''}`}>{c.status}</span>
                    </td>
                    <td className="px-5 py-4 text-white/30 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(c)}
                        className="bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 hover:border-primary/30 text-white/60 text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <CampaignModal campaign={selected} onClose={() => setSelected(null)} onUpdate={load} />
      )}
    </div>
  )
}

export default function AdminCampaignsPage() {
  return (
    <Suspense fallback={<div className="text-white/30 text-sm p-8">Loading...</div>}>
      <CampaignsContent />
    </Suspense>
  )
}
