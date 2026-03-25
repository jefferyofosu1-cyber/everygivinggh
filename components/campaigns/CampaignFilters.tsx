'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

const CATEGORIES = ['All', 'Medical', 'Education', 'Church & Faith', 'Emergency', 'Business', 'Memorial', 'Community', 'Events']

const EMOJI: Record<string, string> = {
  Medical: '', Education: '', 'Church & Faith': '', Emergency: '',
  Business: '', Memorial: '', Community: '', Events: '', Other: '',
}

export default function CampaignFilters({ 
  initialCategory = 'All', 
  initialSearch = '' 
}: { 
  initialCategory?: string, 
  initialSearch?: string 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)

  // Use a debounced effect to update the URL when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) {
        params.set('q', search)
      } else {
        params.delete('q')
      }
      params.delete('page') // Reset to page 1 on search
      router.push(`/campaigns?${params.toString()}`, { scroll: false })
    }, 500)
    return () => clearTimeout(timer)
  }, [search, router, searchParams])

  const handleCategoryChange = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === 'All') {
      params.delete('category')
    } else {
      params.set('category', cat)
    }
    params.delete('page')
    router.push(`/campaigns?${params.toString()}`, { scroll: false })
  }

  const activeCategory = searchParams.get('category') || 'All'

  return (
    <div className="space-y-6">
      <section className="bg-navy relative overflow-hidden py-16" style={{ background: 'var(--navy)' }}>
        <div className="relative max-w-4xl mx-auto px-5 text-center text-white">
          <h1 className="font-nunito font-black text-white text-3xl md:text-5xl tracking-tight mb-4" style={{ letterSpacing: -1 }}>
            Browse campaigns
          </h1>
          <p className="text-white/40 text-sm mb-8">All verified fundraisers on Every Giving.</p>
          <div className="relative max-w-lg mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input 
              type="text" 
              placeholder="Search campaigns…" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm pl-11 pr-5 py-4 rounded-full outline-none focus:border-primary/50 transition-all" 
            />
          </div>
        </div>
      </section>

      <div className="bg-surface border-b border-border sticky top-0 z-10 overflow-x-auto shadow-sm" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-5 py-3 flex gap-2 min-w-max">
          {CATEGORIES.map(cat => (
            <button 
              key={cat} 
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-dark' 
                  : 'bg-surface-alt text-muted hover:bg-border'
              }`}
              style={activeCategory === cat ? { background: 'var(--primary)' } : { background: 'var(--surface-alt)', color: 'var(--text-muted)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
