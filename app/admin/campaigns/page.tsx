'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase'

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected']

const TIER_BADGE: Record<string, string> = {
  basic:    'bg-gray-700 text-gray-300',
  standard: 'bg-primary/20 text-primary',
  premium:  'bg-amber-500/20 text-amber-400',
  gold:     'bg-yellow-500/20 text-yellow-400',
  diamond:  'bg-purple-500/20 text-purple-400',
}

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-amber-500/20 text-amber-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}

async function sendStatusEmail(to: string, name: string, title: string, status: 'approved' | 'rejected', note: string) {
  try {
    const res = await fetch('/api/send-status-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, name, title, status, note }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Status email failed:', err)
    }
  } catch (e) {
    console.error('sendStatusEmail error:', e)
  }
}


function CampaignModal({ campaign, onClose, onUpdate }: { campaign: any; onClose: () => void; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [emailSent, setEmailSent] = useState(false)

  const updateStatus = async (status: 'approved' | 'rejected') => {
    setLoading(true)
    const supabase = createClient()

    await supabase.from('campaigns').update({
      status,
      verified: status === 'approved',
    }).eq('id', campaign.id)

    // Send email notification to fundraiser
    try {
      // Try profiles.email first, then fall back to auth user lookup
      let fundraiserEmail = campaign.profiles?.email
      if (!fundraiserEmail && campaign.user_id) {
        const { data: userData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', campaign.user_id)
          .single()
        fundraiserEmail = userData?.email
      }

      if (fundraiserEmail) {
        await sendStatusEmail(
          fundraiserEmail,
          campaign.profiles?.full_name?.split(' ')[0] || 'there',
          campaign.title,
          status,
          note.trim()
        )
      } else {
        console.warn('No email found for fundraiser — status email not sent')
      }
    } catch (e) {
      console.error('Status email failed:', e)
    }

    setLoading(false)
    onUpdate()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-nunito font-black text-white text-lg mb-1">{campaign.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TIER_BADGE[campaign.verification_tier] || 'bg-gray-700 text-gray-300'}`}>{campaign.verification_tier || 'basic'}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[campaign.status]}`}>{campaign.status}</span>
              <span className="text-white/30 text-xs">{new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white text-2xl leading-none ml-4">×</button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">

          {/* Fundraiser info */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Fundraiser</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-white/30 text-xs mb-0.5">Name</div><div className="text-white font-semibold">{campaign.profiles?.full_name || '—'}</div></div>
              <div><div className="text-white/30 text-xs mb-0.5">Phone</div><div className="text-white font-semibold">{campaign.profiles?.phone || '—'}</div></div>
              <div><div className="text-white/30 text-xs mb-0.5">Category</div><div className="text-white font-semibold">{campaign.category}</div></div>
              <div><div className="text-white/30 text-xs mb-0.5">Goal</div><div className="text-primary font-black">₵{campaign.goal_amount?.toLocaleString()}</div></div>
              <div className="col-span-2"><div className="text-white/30 text-xs mb-0.5">ID type</div><div className="text-white font-semibold">{campaign.id_type || '—'}</div></div>
              <div className="col-span-2"><div className="text-white/30 text-xs mb-0.5">ID number</div><div className="text-white font-mono font-bold">{campaign.id_number || '—'}</div></div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Identity Documents</div>
            {!campaign.id_front_url && !campaign.selfie_url ? (
              <div className="text-white/20 text-xs text-center py-4 border border-white/5 rounded-xl">
                ⚠️ No documents uploaded — SQL migrations may not have run yet
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {campaign.id_front_url && (
                  <div>
                    <div className="text-white/40 text-xs font-bold mb-2">ID PHOTO</div>
                    <a href={campaign.id_front_url} target="_blank" rel="noopener noreferrer" className="block group">
                      <img
                        src={campaign.id_front_url}
                        alt="ID document"
                        className="w-full rounded-xl border border-white/10 object-cover max-h-52 group-hover:border-primary/40 transition-all"
                        onError={(e) => { (e.target as HTMLImageElement).style.display='none' }}
                      />
                      <div className="text-primary text-xs mt-1.5 text-right">Open full size →</div>
                    </a>
                  </div>
                )}
                {campaign.selfie_url && (
                  <div>
                    <div className="text-white/40 text-xs font-bold mb-2">SELFIE</div>
                    <a href={campaign.selfie_url} target="_blank" rel="noopener noreferrer" className="block group">
                      <img
                        src={campaign.selfie_url}
                        alt="Selfie"
                        className="w-full rounded-xl border border-white/10 object-cover max-h-52 group-hover:border-primary/40 transition-all"
                        onError={(e) => { (e.target as HTMLImageElement).style.display='none' }}
                      />
                      <div className="text-primary text-xs mt-1.5 text-right">Open full size →</div>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Story */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Campaign story</div>
            <p className="text-white/70 text-sm leading-relaxed">{campaign.story || 'No story provided.'}</p>
          </div>

          {/* Rejection note */}
          <div>
            <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-2">
              Note to fundraiser <span className="text-white/20 font-normal normal-case">(required if rejecting — included in their email)</span>
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder="e.g. Your ID photo is too blurry to read. Please resubmit with a clear, well-lit photo of your Ghana Card."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all resize-none" />
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-xs text-primary/80">
            📧 An email will be automatically sent to the fundraiser when you approve or reject their campaign.
          </div>
        </div>

        {/* Actions */}
        {campaign.status === 'pending' && (
          <div className="flex gap-3 p-6 border-t border-white/10">
            <button onClick={() => updateStatus('rejected')} disabled={loading}
              className="flex-1 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-nunito font-black rounded-xl transition-all text-sm disabled:opacity-50">
              {loading ? '…' : '✗ Reject'}
            </button>
            <button onClick={() => updateStatus('approved')} disabled={loading}
              className="flex-[2] py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all text-sm disabled:opacity-50 shadow-lg shadow-primary/20">
              {loading ? 'Saving…' : '✓ Approve & go live'}
            </button>
          </div>
        )}
        {campaign.status !== 'pending' && (
          <div className="flex gap-3 p-6 border-t border-white/10">
            <button onClick={() => updateStatus('approved')} disabled={loading || campaign.status === 'approved'}
              className="flex-1 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-bold rounded-xl transition-all text-sm disabled:opacity-30">
              ✓ Approve
            </button>
            <button onClick={() => updateStatus('rejected')} disabled={loading || campaign.status === 'rejected'}
              className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl transition-all text-sm disabled:opacity-30">
              ✗ Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CampaignsContent() {
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all')
  const [selected, setSelected] = useState<any>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const supabase = createClient()
    let q = supabase.from('campaigns')
      .select('*, profiles(full_name, phone, email), user_id')
      .order('created_at', { ascending: false })
    if (activeTab !== 'all') q = q.eq('status', activeTab)
    const { data } = await q
    setCampaigns(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [activeTab])

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
          <p className="text-white/30 text-sm">Review, approve and manage all campaigns.</p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-2 rounded-full">
            {pendingCount} pending review
          </div>
        )}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {STATUS_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeTab === tab ? 'bg-primary text-white' : 'text-white/40 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search campaigns…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-white/30 text-sm">No campaigns found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Campaign</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Fundraiser</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Tier</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Goal</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/3 transition-all group">
                    <td className="px-5 py-4">
                      <div className="text-white font-semibold max-w-[200px] truncate group-hover:text-primary transition-colors">{c.title}</div>
                      <div className="text-white/30 text-xs truncate max-w-[200px]">{c.category}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white/70 text-sm">{c.profiles?.full_name || '—'}</div>
                      <div className="text-white/30 text-xs">{c.profiles?.phone || '—'}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TIER_BADGE[c.verification_tier] || 'bg-gray-700 text-gray-300'}`}>
                        {c.verification_tier || 'basic'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-nunito font-black text-primary">₵{c.goal_amount?.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[c.status] || ''}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/30 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(c)}
                        className="bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 hover:border-primary/30 text-white/60 text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                        Review →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <CampaignModal campaign={selected} onClose={() => setSelected(null)} onUpdate={load} />}
    </div>
  )
}

export default function AdminCampaignsPage() {
  return <Suspense fallback={<div className="text-white/30 text-sm p-8">Loading…</div>}><CampaignsContent /></Suspense>
}
