'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import NextImage from 'next/image'

interface MediaImage {
  _id: string
  _createdAt: string
  title: string
  alt: string
  tags: string[]
  url: string
  metadata?: { dimensions?: { width: number; height: number }; lqip?: string }
}

type ModalView = 'upload' | 'detail' | null

export default function AdminMediaPage() {
  const [images, setImages] = useState<MediaImage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [tagFilter, setTagFilter] = useState('')
  const [modal, setModal] = useState<ModalView>(null)
  const [selected, setSelected] = useState<MediaImage | null>(null)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadAlt, setUploadAlt] = useState('')
  const [uploadTags, setUploadTags] = useState('')
  const [uploadError, setUploadError] = useState('')

  // Edit state
  const [editTitle, setEditTitle] = useState('')
  const [editAlt, setEditAlt] = useState('')
  const [editTags, setEditTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const LIMIT = 20

  const fetchImages = useCallback(async () => {
    setLoading(true)
    const qs = new URLSearchParams({ offset: String(offset), limit: String(LIMIT) })
    if (tagFilter) qs.set('tag', tagFilter)
    const res = await fetch(`/api/admin/media?${qs}`)
    const data = await res.json()
    setImages(data.images || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [offset, tagFilter])

  useEffect(() => { fetchImages() }, [fetchImages])

  // ── Upload handlers ─────────────────────────────────────────────────────────
  function openUpload() {
    setUploadFile(null)
    setUploadPreview('')
    setUploadTitle('')
    setUploadAlt('')
    setUploadTags('')
    setUploadError('')
    setModal('upload')
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadFile(file)
    setUploadPreview(URL.createObjectURL(file))
    setUploadTitle(file.name.replace(/\.[^.]+$/, ''))
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadFile) return
    setUploading(true)
    setUploadError('')

    const form = new FormData()
    form.append('file', uploadFile)
    form.append('title', uploadTitle)
    form.append('alt', uploadAlt)
    form.append('tags', uploadTags)

    const res = await fetch('/api/admin/media', { method: 'POST', body: form })
    if (!res.ok) {
      const data = await res.json()
      setUploadError(data.error || 'Upload failed')
      setUploading(false)
      return
    }

    setUploading(false)
    setModal(null)
    setOffset(0)
    fetchImages()
  }

  // ── Detail / edit handlers ──────────────────────────────────────────────────
  function openDetail(img: MediaImage) {
    setSelected(img)
    setEditTitle(img.title)
    setEditAlt(img.alt)
    setEditTags(img.tags.join(', '))
    setModal('detail')
  }

  async function handleSave() {
    if (!selected) return
    setSaving(true)
    await fetch(`/api/admin/media/${selected._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        alt: editAlt,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      }),
    })
    setSaving(false)
    setModal(null)
    fetchImages()
  }

  async function handleDelete() {
    if (!selected || !confirm('Delete this image permanently?')) return
    setDeleting(true)
    await fetch(`/api/admin/media/${selected._id}`, { method: 'DELETE' })
    setDeleting(false)
    setModal(null)
    fetchImages()
  }

  function copyUrl() {
    if (!selected) return
    navigator.clipboard.writeText(selected.url)
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  const totalPages = Math.ceil(total / LIMIT)
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-nunito font-black text-white text-2xl mb-1">Media Library</h1>
          <p className="text-white/30 text-sm">
            {total} image{total !== 1 ? 's' : ''} stored in Sanity CDN
          </p>
        </div>
        <button onClick={openUpload}
          className="px-5 py-2.5 bg-[#02A95C] text-white font-bold rounded-xl hover:bg-[#028a4a] transition-colors text-sm">
          + Upload Image
        </button>
      </div>

      {/* Tag filter */}
      <div className="mb-6">
        <input
          type="text" placeholder="Filter by tag..." value={tagFilter}
          onChange={e => { setTagFilter(e.target.value); setOffset(0) }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] w-full max-w-xs transition-colors"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3 opacity-30">🖼</div>
          <p className="text-white/30 text-sm">No images yet. Upload your first image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map(img => (
            <button key={img._id} onClick={() => openDetail(img)}
              className="group relative aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/5 hover:border-[#02A95C]/50 transition-all">
              <NextImage src={img.url} alt={img.alt || img.title} fill className="object-cover" sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                <p className="text-white text-xs font-bold truncate">{img.title}</p>
                {img.tags.length > 0 && (
                  <p className="text-white/50 text-[10px] truncate mt-0.5">{img.tags.join(', ')}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - LIMIT))}
            className="px-3 py-1.5 text-xs text-white/50 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Previous
          </button>
          <span className="text-white/30 text-xs">Page {currentPage} of {totalPages}</span>
          <button disabled={offset + LIMIT >= total} onClick={() => setOffset(offset + LIMIT)}
            className="px-3 py-1.5 text-xs text-white/50 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Next
          </button>
        </div>
      )}

      {/* ── Upload Modal ───────────────────────────────────────────────────── */}
      {modal === 'upload' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="font-nunito font-black text-white text-lg">Upload Image</h2>
              <button onClick={() => setModal(null)} className="text-white/30 hover:text-white text-xl">&times;</button>
            </div>

            <form onSubmit={handleUpload} className="p-5 space-y-4">
              {/* Drop zone / preview */}
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-[#02A95C]/50 transition-colors">
                {uploadPreview ? (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mx-auto max-w-xs">
                    <NextImage src={uploadPreview} alt="Preview" fill className="object-contain" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl mb-2 opacity-30">+</div>
                    <p className="text-white/30 text-sm">Click to select an image</p>
                    <p className="text-white/20 text-xs mt-1">JPEG, PNG, WebP, GIF, SVG — max 10MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">Title</label>
                <input type="text" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors"
                  placeholder="Image title" />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">Alt Text</label>
                <input type="text" value={uploadAlt} onChange={e => setUploadAlt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors"
                  placeholder="Describe the image for accessibility" />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">Tags (comma-separated)</label>
                <input type="text" value={uploadTags} onChange={e => setUploadTags(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors"
                  placeholder="campaign, hero, medical" />
              </div>

              {uploadError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">{uploadError}</div>
              )}

              <button type="submit" disabled={!uploadFile || uploading}
                className="w-full py-3 bg-[#02A95C] text-white font-bold rounded-xl hover:bg-[#028a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail / Edit Modal ────────────────────────────────────────────── */}
      {modal === 'detail' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="font-nunito font-black text-white text-lg">Image Details</h2>
              <button onClick={() => setModal(null)} className="text-white/30 hover:text-white text-xl">&times;</button>
            </div>

            <div className="p-5 space-y-5">
              {/* Preview */}
              <div className="relative w-full aspect-video bg-black/30 rounded-xl overflow-hidden">
                <NextImage src={selected.url} alt={selected.alt || selected.title} fill className="object-contain" />
              </div>

              {/* URL copy */}
              <div className="flex items-center gap-2">
                <input readOnly value={selected.url}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs font-mono truncate" />
                <button onClick={copyUrl}
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                  {copyFeedback ? 'Copied!' : 'Copy URL'}
                </button>
              </div>

              {/* Edit fields */}
              <div>
                <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">Title</label>
                <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#02A95C] transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">Alt Text</label>
                <input type="text" value={editAlt} onChange={e => setEditAlt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#02A95C] transition-colors" />
              </div>

              <div>
                <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">Tags</label>
                <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#02A95C] transition-colors"
                  placeholder="campaign, hero, medical" />
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-white/20">
                {selected.metadata?.dimensions && (
                  <span>{selected.metadata.dimensions.width} x {selected.metadata.dimensions.height}</span>
                )}
                <span>{new Date(selected._createdAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-2.5 bg-[#02A95C] text-white font-bold rounded-xl hover:bg-[#028a4a] disabled:opacity-50 transition-colors text-sm">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleDelete} disabled={deleting}
                  className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 font-bold rounded-xl hover:bg-red-500/20 disabled:opacity-50 transition-colors text-sm">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
