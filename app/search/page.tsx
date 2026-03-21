'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Campaign {
  id: string
  title: string
  story: string
  category: string
  location: string
  goal_amount: number
  raised_amount: number
  verified: boolean
  image_url: string | null
  slug: string | null
  donor_count: number
  profiles?: { full_name: string }
}

const CATEGORIES = ['all','Medical','Education','Emergency','Community','Faith','Business','Environment','Disaster']

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [results, setResults] = useState<Campaign[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string, cat: string) => {
    setLoading(true)
    const supabase = createClient()
    let sb = supabase
      .from('campaigns')
      .select('id,title,story,category,location,goal_amount,raised_amount,verified,image_url,slug,donor_count,profiles(full_name)', { count: 'exact' })
      .in('status', ['live', 'active', 'approved'])
      .order('raised_amount', { ascending: false })
      .limit(24)

    if (cat !== 'all') sb = sb.eq('category', cat)
    if (q.trim()) sb = sb.or(`title.ilike.%${q}%,story.ilike.%${q}%,location.ilike.%${q}%`) // Removed organiser_name search for now as it's harder in .or() with relations

    const { data, count } = await sb
    setResults(data || [])
    setTotal(count || 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query, category), query ? 300 : 0)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, category, search])

  const fmt = (n: number) => `₵${n.toLocaleString('en-GH')}`
  const pct = (r: number, g: number) => g > 0 ? Math.min(100, Math.round((r / g) * 100)) : 0

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box} body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        .card:hover{box-shadow:0 8px 24px rgba(0,0,0,.09);transform:translateY(-2px)}
        .card{transition:all .18s;display:block;background:#fff;border:1px solid #E8E4DC;border-radius:14px;overflow:hidden;text-decoration:none}
        input:focus{outline:none;border-color:#0A6B4B!important}
        .cat-btn.active{background:#0A6B4B!important;color:#fff!important;border-color:#0A6B4B!important}
        .cat-btn:hover{background:#E8F5EF;color:#0A6B4B}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .skeleton{background:#E8E4DC;border-radius:8px;animation:pulse 1.4s ease infinite}
      ` }} />

      {/* STICKY SEARCH BAR */}
      <div style={{ background: '#111827', padding: '32px 24px', borderBottom: '1px solid rgba(255,255,255,.08)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search campaigns, causes, locations…"
              style={{ width: '100%', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 12, padding: '13px 44px 13px 44px', fontSize: 15, background: 'rgba(255,255,255,.08)', color: '#fff', fontFamily: 'inherit' }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 18, cursor: 'pointer' }}>✕</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`cat-btn${category === cat ? ' active' : ''}`}
                style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 100, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', cursor: 'pointer', transition: 'all .15s' }}>
                {cat === 'all' ? 'All categories' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 64px' }}>
        <div style={{ fontSize: 13, color: '#8A8A82', marginBottom: 20 }}>
          {loading ? 'Searching…' : `${total.toLocaleString()} campaign${total !== 1 ? 's' : ''} found${query ? ` for "${query}"` : ''}`}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, overflow: 'hidden' }}>
                <div className="skeleton" style={{ height: 160 }} />
                <div style={{ padding: '14px 16px' }}>
                  <div className="skeleton" style={{ height: 14, marginBottom: 8, width: '80%' }} />
                  <div className="skeleton" style={{ height: 12, marginBottom: 14, width: '50%' }} />
                  <div className="skeleton" style={{ height: 4, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: '30%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>No campaigns found</div>
            <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Try adjusting your search or selecting a different category.</p>
            <button onClick={() => { setQuery(''); setCategory('all') }}
              style={{ background: '#0A6B4B', color: '#fff', border: 'none', borderRadius: 100, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {results.map(c => {
              const progress = pct(c.raised_amount || 0, c.goal_amount || 1)
              return (
                <Link key={c.id} href={`/campaigns/${c.slug || c.id}`} className="card">
                  <div style={{ height: 160, background: c.image_url ? `url(${c.image_url}) center/cover` : 'linear-gradient(135deg,#D1FAE5,#A7F3D0)', position: 'relative' }}>
                    {c.verified && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: '#0A6B4B', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100 }}>✓ Verified</div>
                    )}
                    <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100 }}>{c.category}</div>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4, lineHeight: 1.35 }}>{c.title}</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 10 }}>{c.profiles?.full_name || 'Anonymous'}{c.location ? ` · ${c.location}` : ''}</div>
                    <div style={{ height: 4, background: '#E5E7EB', borderRadius: 99, marginBottom: 6, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: '#0A6B4B', borderRadius: 99 }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#0A6B4B' }}>{fmt(c.raised_amount || 0)}</span>
                        <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>of {fmt(c.goal_amount)}</span>
                      </div>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>{c.donor_count || 0} donors</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
