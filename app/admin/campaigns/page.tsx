'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import NextImage from 'next/image'

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

const CATEGORIES = ['Medical', 'Education', 'Emergency', 'Community', 'Business', 'Personal', 'Charity', 'Other']
const TIERS = ['basic', 'standard', 'premium', 'gold', 'diamond']


function CampaignModal({ campaign, onClose, onUpdate }: { campaign: any; onClose: () => void; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Edit mode state
  const [editing, setEditing] = useState(false)
  const [editFields, setEditFields] = useState({
    title: campaign.title || '',
    story: campaign.story || '',
    category: campaign.category || '',
    goal_amount: campaign.goal_amount || 0,
    verification_tier: campaign.verification_tier || 'basic',
    deadline: campaign.deadline || '',
    location: campaign.location || '',
  })
  const [saving, setSaving] = useState(false)

  // Image picker state
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [mediaImages, setMediaImages] = useState<any[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(campaign.image_url || '')
  const [imageUpdating, setImageUpdating] = useState(false)

  const loadMedia = useCallback(async () => {
    setMediaLoading(true)
    const res = await fetch('/api/admin/media?limit=50')
    const data = await res.json()
    setMediaImages(data.images || [])
    setMediaLoading(false)
  }, [])

  async function assignImage(url: string) {
    setImageUpdating(true)
    await fetch('/api/admin/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: campaign.id, image_url: url }),
    })
    setCurrentImageUrl(url)
    setImageUpdating(false)
    setShowImagePicker(false)
  }

  async function removeImage() {
    setImageUpdating(true)
    await fetch('/api/admin/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: campaign.id, image_url: null }),
    })
    setCurrentImageUrl('')
    setImageUpdating(false)
  }

  const updateStatus = async (status: 'approved' | 'rejected') => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, status, note: note.trim() }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        console.error('Campaign update failed:', err)
      }
    } catch (e) {
      console.error('updateStatus error:', e)
    }
    setLoading(false)
    onUpdate()
    onClose()
  }

  const saveEdits = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, ...editFields }),
      })
      if (res.ok) {
        setEditing(false)
        onUpdate()
      } else {
        const err = await res.json().catch(() => ({}))
        console.error('Save failed:', err)
      }
    } catch (e) {
      console.error('saveEdits error:', e)
    }
    setSaving(false)
  }

  const deleteCampaign = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id }),
      })
      if (res.ok) { onUpdate(); onClose() }
    } catch (e) {
      console.error('deleteCampaign error:', e)
    }
    setDeleting(false)
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all'

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-nunito font-black text-white text-lg mb-1">{editing ? 'Edit Campaign' : campaign.title}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TIER_BADGE[campaign.verification_tier] || 'bg-gray-700 text-gray-300'}`}>{campaign.verification_tier || 'basic'}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[campaign.status]}`}>{campaign.status}</span>
              <span className="text-white/30 text-xs">{new Date(campaign.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-xs text-primary hover:text-primary/80 font-bold transition-colors">Edit</button>
            )}
            <button onClick={onClose} className="text-white/30 hover:text-white text-2xl leading-none">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">

          {editing ? (
            /* ─── Edit Form ─── */
            <>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Title</label>
                <input value={editFields.title} onChange={e => setEditFields(f => ({ ...f, title: e.target.value }))} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Category</label>
                  <select value={editFields.category} onChange={e => setEditFields(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Goal (₵)</label>
                  <input type="number" min={1} value={editFields.goal_amount} onChange={e => setEditFields(f => ({ ...f, goal_amount: Number(e.target.value) }))} className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Tier</label>
                  <select value={editFields.verification_tier} onChange={e => setEditFields(f => ({ ...f, verification_tier: e.target.value }))} className={inputCls}>
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Deadline</label>
                  <input type="date" value={editFields.deadline?.split('T')[0] || ''} onChange={e => setEditFields(f => ({ ...f, deadline: e.target.value }))} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Location</label>
                <input value={editFields.location} onChange={e => setEditFields(f => ({ ...f, location: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Story</label>
                <textarea rows={5} value={editFields.story} onChange={e => setEditFields(f => ({ ...f, story: e.target.value }))} className={inputCls + ' resize-none'} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-bold rounded-xl transition-all text-sm">Cancel</button>
                <button onClick={saveEdits} disabled={saving} className="flex-[2] py-3 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all text-sm disabled:opacity-50 shadow-lg shadow-primary/20">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            /* ─── Read-only View ─── */
            <>
              {/* Fundraiser info */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Fundraiser</div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-white/30 text-xs mb-0.5">Name</div><div className="text-white font-semibold">{campaign.profiles?.full_name || ' - '}</div></div>
                  <div><div className="text-white/30 text-xs mb-0.5">Phone</div><div className="text-white font-semibold">{campaign.profiles?.phone || ' - '}</div></div>
                  <div><div className="text-white/30 text-xs mb-0.5">Category</div><div className="text-white font-semibold">{campaign.category}</div></div>
                  <div><div className="text-white/30 text-xs mb-0.5">Goal</div><div className="text-primary font-black">₵{campaign.goal_amount?.toLocaleString()}</div></div>
                  {campaign.location && <div><div className="text-white/30 text-xs mb-0.5">Location</div><div className="text-white font-semibold">{campaign.location}</div></div>}
                  {campaign.deadline && <div><div className="text-white/30 text-xs mb-0.5">Deadline</div><div className="text-white font-semibold">{new Date(campaign.deadline).toLocaleDateString()}</div></div>}
                  <div className="col-span-2"><div className="text-white/30 text-xs mb-0.5">ID type</div><div className="text-white font-semibold">{campaign.id_type || ' - '}</div></div>
                  <div className="col-span-2"><div className="text-white/30 text-xs mb-0.5">ID number</div><div className="text-white font-mono font-bold">{campaign.id_number || ' - '}</div></div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Identity Documents</div>
                {!campaign.id_front_url && !campaign.selfie_url ? (
                  <div className="text-white/20 text-xs text-center py-4 border border-white/5 rounded-xl">
                     No documents uploaded  -  SQL migrations may not have run yet
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

              {/* Campaign Cover Image */}
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-white/40 text-xs font-bold uppercase tracking-wider">Campaign Image</div>
                  <div className="flex gap-2">
                    {currentImageUrl && (
                      <button onClick={removeImage} disabled={imageUpdating}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50">
                        Remove
                      </button>
                    )}
                    <button onClick={() => { setShowImagePicker(true); loadMedia() }}
                      className="text-xs text-[#02A95C] hover:text-[#02A95C]/80 font-bold transition-colors">
                      {currentImageUrl ? 'Change' : '+ Assign Image'}
                    </button>
                  </div>
                </div>
                {currentImageUrl ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
                    <NextImage src={currentImageUrl} alt={campaign.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-full aspect-video rounded-xl border border-dashed border-white/10 flex items-center justify-center">
                    <p className="text-white/20 text-xs">No cover image assigned</p>
                  </div>
                )}

                {/* Image Picker Dropdown */}
                {showImagePicker && (
                  <div className="mt-3 bg-gray-800 border border-white/10 rounded-xl p-3 max-h-60 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/40 text-xs font-bold uppercase">Select from Media Library</span>
                      <button onClick={() => setShowImagePicker(false)} className="text-white/30 hover:text-white text-sm">&times;</button>
                    </div>
                    {mediaLoading ? (
                      <div className="text-white/30 text-xs text-center py-4">Loading images...</div>
                    ) : mediaImages.length === 0 ? (
                      <div className="text-white/20 text-xs text-center py-4">
                        No images in library. Upload images in Media first.
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {mediaImages.map((img: any) => (
                          <button key={img._id} onClick={() => assignImage(img.url)}
                            disabled={imageUpdating}
                            className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-[#02A95C]/50 transition-all disabled:opacity-50">
                            <NextImage src={img.url} alt={img.title || ''} fill className="object-cover" sizes="80px" />
                          </button>
                        ))}
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
                  Note to fundraiser <span className="text-white/20 font-normal normal-case">(required if rejecting  -  included in their email)</span>
                </label>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                  placeholder="e.g. Your ID photo is too blurry to read. Please resubmit with a clear, well-lit photo of your Ghana Card."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all resize-none" />
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-xs text-primary/80">
                 An email will be automatically sent to the fundraiser when you approve or reject their campaign.
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        {!editing && (
          <>
            {campaign.status === 'pending' && (
              <div className="flex gap-3 p-6 border-t border-white/10">
                <button onClick={() => updateStatus('rejected')} disabled={loading}
                  className="flex-1 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-nunito font-black rounded-xl transition-all text-sm disabled:opacity-50">
                  {loading ? '…' : 'Reject'}
                </button>
                <button onClick={() => updateStatus('approved')} disabled={loading}
                  className="flex-[2] py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all text-sm disabled:opacity-50 shadow-lg shadow-primary/20">
                  {loading ? 'Saving…' : 'Approve & go live'}
                </button>
              </div>
            )}
            {campaign.status !== 'pending' && (
              <div className="flex gap-3 p-6 border-t border-white/10">
                <button onClick={() => updateStatus('approved')} disabled={loading || campaign.status === 'approved'}
                  className="flex-1 py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 font-bold rounded-xl transition-all text-sm disabled:opacity-30">
                   Approve
                </button>
                <button onClick={() => updateStatus('rejected')} disabled={loading || campaign.status === 'rejected'}
                  className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold rounded-xl transition-all text-sm disabled:opacity-30">
                   Reject
                </button>
              </div>
            )}

            {/* Delete */}
            <div className="px-6 pb-6">
              {confirmDelete ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-xs mb-3">This will permanently delete the campaign and all its donations. This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs font-bold rounded-lg transition-all">Cancel</button>
                    <button onClick={deleteCampaign} disabled={deleting} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                      {deleting ? 'Deleting…' : 'Yes, delete permanently'}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="w-full text-center text-xs text-red-400/60 hover:text-red-400 transition-colors py-2">
                  Delete campaign
                </button>
              )}
            </div>
          </>
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
    const res = await fetch(`/api/admin/campaigns?status=${activeTab}`)
    const data = await res.json()
    setCampaigns(data.campaigns || [])
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
            <div className="text-4xl mb-3"></div>
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
                      <div className="text-white/70 text-sm">{c.profiles?.full_name || ' - '}</div>
                      <div className="text-white/30 text-xs">{c.profiles?.phone || ' - '}</div>
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
