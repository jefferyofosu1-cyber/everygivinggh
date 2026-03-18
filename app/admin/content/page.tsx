'use client'
import { useEffect, useState, useCallback } from 'react'

/* ── Page definitions: what can be edited for each page ────────────────────── */
interface SectionField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'array'
  arrayFields?: { key: string; label: string; type: 'text' | 'textarea' }[]
}

interface PageDef {
  slug: string
  title: string
  description: string
  sections: { key: string; label: string; fields: SectionField[] }[]
}

const PAGE_DEFS: PageDef[] = [
  {
    slug: 'home',
    title: 'Homepage',
    description: 'Hero section, trust badges, testimonials, and CTAs',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'headline', label: 'Headline', type: 'text' },
          { key: 'highlight', label: 'Highlighted word', type: 'text' },
          { key: 'subtext', label: 'Subtext', type: 'textarea' },
        ],
      },
      {
        key: 'trustBadges',
        label: 'Trust Badges',
        fields: [
          {
            key: 'items',
            label: 'Trust Items',
            type: 'array',
            arrayFields: [
              { key: 'icon', label: 'Icon', type: 'text' },
              { key: 'text', label: 'Text', type: 'text' },
            ],
          },
        ],
      },
      {
        key: 'testimonials',
        label: 'Testimonials',
        fields: [
          {
            key: 'items',
            label: 'Testimonials',
            type: 'array',
            arrayFields: [
              { key: 'name', label: 'Name', type: 'text' },
              { key: 'location', label: 'Location', type: 'text' },
              { key: 'amount', label: 'Amount Raised', type: 'text' },
              { key: 'category', label: 'Category', type: 'text' },
              { key: 'quote', label: 'Quote', type: 'textarea' },
            ],
          },
        ],
      },
      {
        key: 'cta',
        label: 'Final CTA',
        fields: [
          { key: 'headline', label: 'Headline', type: 'text' },
          { key: 'subtext', label: 'Subtext', type: 'textarea' },
        ],
      },
    ],
  },
  {
    slug: 'about',
    title: 'About Page',
    description: 'Company story, team, mission, and press info',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'headline', label: 'Headline', type: 'text' },
          { key: 'highlight', label: 'Highlighted word', type: 'text' },
          { key: 'subtext', label: 'Subtext', type: 'textarea' },
        ],
      },
      {
        key: 'stats',
        label: 'Stats Strip',
        fields: [
          {
            key: 'items',
            label: 'Stats',
            type: 'array',
            arrayFields: [
              { key: 'value', label: 'Value', type: 'text' },
              { key: 'label', label: 'Label', type: 'text' },
            ],
          },
        ],
      },
      {
        key: 'founder',
        label: 'Founder / Origin Story',
        fields: [
          { key: 'name', label: 'Name', type: 'text' },
          { key: 'title', label: 'Title', type: 'text' },
          { key: 'bio', label: 'Bio', type: 'textarea' },
          { key: 'originStory', label: 'Origin Story', type: 'textarea' },
          { key: 'missionQuote', label: 'Mission Quote', type: 'text' },
        ],
      },
      {
        key: 'pressFacts',
        label: 'Press Key Facts',
        fields: [
          {
            key: 'items',
            label: 'Facts',
            type: 'array',
            arrayFields: [
              { key: 'key', label: 'Label', type: 'text' },
              { key: 'value', label: 'Value', type: 'text' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'blog',
    title: 'Blog Posts',
    description: 'Create and manage blog articles',
    sections: [
      {
        key: 'settings',
        label: 'Page Settings',
        fields: [
          { key: 'headline', label: 'Page Headline', type: 'text' },
          { key: 'subtext', label: 'Page Subtext', type: 'textarea' },
        ],
      },
      {
        key: 'posts',
        label: 'Blog Posts',
        fields: [
          {
            key: 'items',
            label: 'Posts',
            type: 'array',
            arrayFields: [
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'slug', label: 'URL Slug', type: 'text' },
              { key: 'category', label: 'Category', type: 'text' },
              { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
              { key: 'body', label: 'Full Body', type: 'textarea' },
              { key: 'readTime', label: 'Read Time', type: 'text' },
              { key: 'date', label: 'Date (YYYY-MM-DD)', type: 'text' },
              { key: 'featured', label: 'Featured? (yes/no)', type: 'text' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'help',
    title: 'Help / FAQs',
    description: 'Frequently asked questions and support info',
    sections: [
      {
        key: 'settings',
        label: 'Page Settings',
        fields: [
          { key: 'headline', label: 'Headline', type: 'text' },
          { key: 'subtext', label: 'Subtext', type: 'textarea' },
        ],
      },
      {
        key: 'faqs',
        label: 'FAQ Items',
        fields: [
          {
            key: 'items',
            label: 'FAQs',
            type: 'array',
            arrayFields: [
              { key: 'question', label: 'Question', type: 'text' },
              { key: 'answer', label: 'Answer', type: 'textarea' },
              { key: 'category', label: 'Category', type: 'text' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'how-it-works',
    title: 'How It Works',
    description: 'Process steps, tutorial, and FAQs',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'badge', label: 'Badge Text', type: 'text' },
          { key: 'headline', label: 'Headline', type: 'text' },
          { key: 'subtext', label: 'Subtext', type: 'textarea' },
        ],
      },
      {
        key: 'steps',
        label: 'Process Steps',
        fields: [
          {
            key: 'items',
            label: 'Steps',
            type: 'array',
            arrayFields: [
              { key: 'number', label: 'Step #', type: 'text' },
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'tip', label: 'Tip (optional)', type: 'text' },
              { key: 'timeBadge', label: 'Time Badge', type: 'text' },
            ],
          },
        ],
      },
      {
        key: 'faqs',
        label: 'FAQ Section',
        fields: [
          {
            key: 'items',
            label: 'FAQs',
            type: 'array',
            arrayFields: [
              { key: 'question', label: 'Question', type: 'text' },
              { key: 'answer', label: 'Answer', type: 'textarea' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'fees',
    title: 'Fees & Pricing',
    description: 'Fee structure, verification tiers, and comparisons',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'headline', label: 'Headline', type: 'text' },
          { key: 'subtext', label: 'Subtext', type: 'textarea' },
        ],
      },
      {
        key: 'tiers',
        label: 'Verification Tiers',
        fields: [
          {
            key: 'items',
            label: 'Tiers',
            type: 'array',
            arrayFields: [
              { key: 'name', label: 'Tier Name', type: 'text' },
              { key: 'fee', label: 'Fee Amount', type: 'text' },
              { key: 'goalRange', label: 'Goal Range', type: 'text' },
              { key: 'deferrable', label: 'Deferrable?', type: 'text' },
            ],
          },
        ],
      },
      {
        key: 'faqs',
        label: 'Fee FAQs',
        fields: [
          {
            key: 'items',
            label: 'FAQs',
            type: 'array',
            arrayFields: [
              { key: 'question', label: 'Question', type: 'text' },
              { key: 'answer', label: 'Answer', type: 'textarea' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'transparency',
    title: 'Transparency',
    description: 'Core commitments, fee breakdown, verification process',
    sections: [
      {
        key: 'hero',
        label: 'Hero Section',
        fields: [
          { key: 'headline', label: 'Headline', type: 'text' },
          { key: 'subtext', label: 'Subtext', type: 'textarea' },
        ],
      },
      {
        key: 'commitments',
        label: 'Core Commitments',
        fields: [
          {
            key: 'items',
            label: 'Commitments',
            type: 'array',
            arrayFields: [
              { key: 'icon', label: 'Icon', type: 'text' },
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'body', label: 'Description', type: 'textarea' },
            ],
          },
        ],
      },
      {
        key: 'feeTable',
        label: 'Fee Breakdown Table',
        fields: [
          {
            key: 'items',
            label: 'Rows',
            type: 'array',
            arrayFields: [
              { key: 'feeType', label: 'Fee Type', type: 'text' },
              { key: 'amount', label: 'Amount', type: 'text' },
              { key: 'paidBy', label: 'Paid By', type: 'text' },
              { key: 'purpose', label: 'Purpose', type: 'text' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'fundraising-tips',
    title: 'Fundraising Tips',
    description: 'Tips and guides for successful campaigns',
    sections: [
      {
        key: 'settings',
        label: 'Page Settings',
        fields: [
          { key: 'headline', label: 'Headline', type: 'text' },
          { key: 'subtext', label: 'Subtext', type: 'textarea' },
        ],
      },
      {
        key: 'tips',
        label: 'Tips',
        fields: [
          {
            key: 'items',
            label: 'Tips',
            type: 'array',
            arrayFields: [
              { key: 'number', label: 'Tip #', type: 'text' },
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'tag', label: 'Tag', type: 'text' },
              { key: 'body', label: 'Body', type: 'textarea' },
              { key: 'stat', label: 'Stat Value', type: 'text' },
              { key: 'statLabel', label: 'Stat Label', type: 'text' },
            ],
          },
        ],
      },
    ],
  },
]

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface SavedPage {
  _id: string
  slug: string
  title: string
  _updatedAt: string
}

type SectionData = Record<string, any>
type PageData = Record<string, SectionData>

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function AdminContentPage() {
  const [savedPages, setSavedPages] = useState<SavedPage[]>([])
  const [loading, setLoading] = useState(true)
  const [activePage, setActivePage] = useState<PageDef | null>(null)
  const [pageData, setPageData] = useState<PageData>({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [loadingContent, setLoadingContent] = useState(false)

  // Fetch list of saved pages
  const fetchPages = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/content')
    const data = await res.json()
    setSavedPages(data.pages || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPages() }, [fetchPages])

  // Open a page for editing
  async function openPage(def: PageDef) {
    setActivePage(def)
    setLoadingContent(true)
    setSaveMsg('')

    const res = await fetch(`/api/admin/content?page=${def.slug}`)
    const data = await res.json()

    if (data.content?.sections) {
      setPageData(data.content.sections)
    } else {
      setPageData({})
    }
    setLoadingContent(false)
  }

  // Update a field value
  function updateField(sectionKey: string, fieldKey: string, value: any) {
    setPageData(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [fieldKey]: value },
    }))
  }

  // Array item operations
  function addArrayItem(sectionKey: string, fieldKey: string, fields: { key: string }[]) {
    const empty: Record<string, string> = {}
    fields.forEach(f => { empty[f.key] = '' })
    setPageData(prev => {
      const current = prev[sectionKey]?.[fieldKey] || []
      return {
        ...prev,
        [sectionKey]: { ...prev[sectionKey], [fieldKey]: [...current, empty] },
      }
    })
  }

  function updateArrayItem(sectionKey: string, fieldKey: string, index: number, itemKey: string, value: string) {
    setPageData(prev => {
      const current = [...(prev[sectionKey]?.[fieldKey] || [])]
      current[index] = { ...current[index], [itemKey]: value }
      return {
        ...prev,
        [sectionKey]: { ...prev[sectionKey], [fieldKey]: current },
      }
    })
  }

  function removeArrayItem(sectionKey: string, fieldKey: string, index: number) {
    setPageData(prev => {
      const current = [...(prev[sectionKey]?.[fieldKey] || [])]
      current.splice(index, 1)
      return {
        ...prev,
        [sectionKey]: { ...prev[sectionKey], [fieldKey]: current },
      }
    })
  }

  function moveArrayItem(sectionKey: string, fieldKey: string, index: number, dir: -1 | 1) {
    setPageData(prev => {
      const current = [...(prev[sectionKey]?.[fieldKey] || [])]
      const newI = index + dir
      if (newI < 0 || newI >= current.length) return prev
      ;[current[index], current[newI]] = [current[newI], current[index]]
      return {
        ...prev,
        [sectionKey]: { ...prev[sectionKey], [fieldKey]: current },
      }
    })
  }

  // Save content
  async function handleSave() {
    if (!activePage) return
    setSaving(true)
    setSaveMsg('')

    const res = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: activePage.slug,
        title: activePage.title,
        sections: pageData,
      }),
    })

    if (res.ok) {
      setSaveMsg('Saved successfully')
      fetchPages()
    } else {
      setSaveMsg('Failed to save')
    }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  // Delete page content
  const [confirmDeletePage, setConfirmDeletePage] = useState(false)
  const [deletingPage, setDeletingPage] = useState(false)

  async function handleDeletePage() {
    if (!activePage) return
    setDeletingPage(true)
    const res = await fetch('/api/admin/content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: activePage.slug }),
    })
    if (res.ok) {
      setActivePage(null)
      fetchPages()
    } else {
      setSaveMsg('Failed to delete')
      setTimeout(() => setSaveMsg(''), 3000)
    }
    setDeletingPage(false)
    setConfirmDeletePage(false)
  }

  const lastUpdated = (slug: string) => {
    const p = savedPages.find(s => s.slug === slug)
    return p ? new Date(p._updatedAt).toLocaleDateString() : null
  }

  // ── Page list view ──────────────────────────────────────────────────────────
  if (!activePage) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-nunito font-black text-white text-2xl mb-1">Page Content</h1>
          <p className="text-white/30 text-sm">Edit text, FAQs, testimonials, and more for each page on the site.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PAGE_DEFS.map(def => {
              const updated = lastUpdated(def.slug)
              return (
                <button key={def.slug} onClick={() => openPage(def)}
                  className="text-left bg-white/5 border border-white/5 hover:border-[#02A95C]/30 rounded-xl p-5 transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-nunito font-black text-white group-hover:text-[#02A95C] transition-colors">{def.title}</h3>
                    {updated && (
                      <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded-full">
                        Updated {updated}
                      </span>
                    )}
                  </div>
                  <p className="text-white/30 text-xs mb-3">{def.description}</p>
                  <div className="text-xs text-white/20">
                    {def.sections.length} section{def.sections.length !== 1 ? 's' : ''} to edit
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Page editor view ────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setActivePage(null)}
            className="text-white/30 hover:text-white transition-colors text-sm">
            &larr; Back
          </button>
          <div>
            <h1 className="font-nunito font-black text-white text-2xl">{activePage.title}</h1>
            <p className="text-white/30 text-xs">{activePage.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-xs ${saveMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
              {saveMsg}
            </span>
          )}
          {confirmDeletePage ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setConfirmDeletePage(false)} className="text-xs text-white/40 hover:text-white transition-colors">Cancel</button>
              <button onClick={handleDeletePage} disabled={deletingPage}
                className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors">
                {deletingPage ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDeletePage(true)}
              className="text-xs text-red-400/60 hover:text-red-400 transition-colors">
              Delete
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2.5 bg-[#02A95C] text-white font-bold rounded-xl hover:bg-[#028a4a] disabled:opacity-50 transition-colors text-sm">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {loadingContent ? (
        <div className="text-white/30 text-sm py-12 text-center">Loading content...</div>
      ) : (
        <div className="space-y-6">
          {activePage.sections.map(section => (
            <div key={section.key} className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h2 className="font-nunito font-bold text-white text-sm">{section.label}</h2>
              </div>
              <div className="p-5 space-y-4">
                {section.fields.map(field => {
                  if (field.type === 'array' && field.arrayFields) {
                    const items: any[] = pageData[section.key]?.[field.key] || []
                    return (
                      <div key={field.key}>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-white/40 uppercase tracking-wider">{field.label}</label>
                          <button onClick={() => addArrayItem(section.key, field.key, field.arrayFields!)}
                            className="text-xs text-[#02A95C] hover:text-[#02A95C]/80 font-bold transition-colors">
                            + Add Item
                          </button>
                        </div>
                        <div className="space-y-3">
                          {items.map((item: any, i: number) => (
                            <div key={i} className="bg-gray-800/50 border border-white/5 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-white/20 font-mono">#{i + 1}</span>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => moveArrayItem(section.key, field.key, i, -1)}
                                    disabled={i === 0}
                                    className="text-white/20 hover:text-white text-xs px-1.5 py-0.5 disabled:opacity-20 transition-colors">
                                    ↑
                                  </button>
                                  <button onClick={() => moveArrayItem(section.key, field.key, i, 1)}
                                    disabled={i === items.length - 1}
                                    className="text-white/20 hover:text-white text-xs px-1.5 py-0.5 disabled:opacity-20 transition-colors">
                                    ↓
                                  </button>
                                  <button onClick={() => removeArrayItem(section.key, field.key, i)}
                                    className="text-red-400/50 hover:text-red-400 text-xs px-1.5 py-0.5 ml-2 transition-colors">
                                    Remove
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {field.arrayFields!.map(af => (
                                  <div key={af.key} className={af.type === 'textarea' ? 'sm:col-span-2' : ''}>
                                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">{af.label}</label>
                                    {af.type === 'textarea' ? (
                                      <textarea
                                        value={item[af.key] || ''}
                                        onChange={e => updateArrayItem(section.key, field.key, i, af.key, e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors resize-none"
                                      />
                                    ) : (
                                      <input
                                        type="text"
                                        value={item[af.key] || ''}
                                        onChange={e => updateArrayItem(section.key, field.key, i, af.key, e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {items.length === 0 && (
                            <div className="text-center py-6 text-white/15 text-xs border border-dashed border-white/10 rounded-xl">
                              No items yet. Click &quot;+ Add Item&quot; to start.
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  // Simple text / textarea field
                  return (
                    <div key={field.key}>
                      <label className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-1.5">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          value={pageData[section.key]?.[field.key] || ''}
                          onChange={e => updateField(section.key, field.key, e.target.value)}
                          rows={4}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors resize-none"
                        />
                      ) : (
                        <input
                          type="text"
                          value={pageData[section.key]?.[field.key] || ''}
                          onChange={e => updateField(section.key, field.key, e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
