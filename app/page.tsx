'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { TutorialEmbed } from '@/components/home/TutorialComponents'
import CampaignCard from '@/components/ui/CampaignCard'
import type { Campaign } from '@/types'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',       label: 'All campaigns' },
  { id: 'medical',   label: 'Medical' },
  { id: 'education', label: 'Education' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'faith',     label: 'Faith' },
  { id: 'community', label: 'Community' },
  { id: 'family',    label: 'Family' },
]

const FILTER_CHIPS = [
  { id: 'urgent',   label: 'Urgent' },
  { id: 'funded',   label: 'Fully funded' },
]

const SORT_OPTIONS = [
  { value: 'urgent',  label: 'Most urgent' },
  { value: 'recent',  label: 'Most recent' },
  { value: 'popular', label: 'Most donors' },
  { value: 'pct',     label: 'Closest to goal' },
]

const PAGE_SIZE = 6

// ─── SVG ICONS (optimized with next/image or kept as clean components) ───────

const IconVerify = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
const IconShield = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEye = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconHeart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatGHS(amount: number) {
  return `₵${amount.toLocaleString()}`
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-100 rounded px-0.5">{part}</mark>
      : part
  )
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function HomePage() {
  const [campaigns, setCampaigns]       = useState<Campaign[]>([])
  const [loading, setLoading]           = useState(true)
  const [query, setQuery]               = useState('')
  const [activeCategory, setCategory]   = useState('all')
  const [activeFilters, setFilters]     = useState(new Set<string>())
  const [sortBy, setSortBy]             = useState('urgent')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('campaigns')
      .select('*, profiles(full_name, phone)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setCampaigns(data as Campaign[])
        setLoading(false)
      })
  }, [])

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    const list = campaigns.filter(c => {
      if (activeCategory !== 'all' && c.category !== activeCategory) return false
      if (activeFilters.has('urgent') && !c.verified) return false
      if (activeFilters.has('funded') && (c.raised_amount < c.goal_amount)) return false
      if (query) {
        const q = query.toLowerCase()
        if (
          !c.title.toLowerCase().includes(q) &&
          !(c.profiles?.full_name || '').toLowerCase().includes(q) &&
          !(c.location || '').toLowerCase().includes(q)
        ) return false
      }
      return true
    })

    return [...list].sort((a, b) => {
      if (sortBy === 'urgent')  return (b.verified ? 1 : 0) - (a.verified ? 1 : 0)
      if (sortBy === 'recent')  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'popular') return (b.raised_amount || 0) - (a.raised_amount || 0)
      if (sortBy === 'pct')     return (b.raised_amount / b.goal_amount) - (a.raised_amount / a.goal_amount)
      return 0
    })
  }, [campaigns, query, activeCategory, activeFilters, sortBy])

  const visible = filtered.slice(0, visibleCount)

  // ── Handlers ──
  const toggleFilter = useCallback((id: string) => {
    setFilters(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
    setVisibleCount(PAGE_SIZE)
  }, [])

  const clearAll = useCallback(() => {
    setQuery('')
    setCategory('all')
    setFilters(new Set())
    setSortBy('urgent')
    setVisibleCount(PAGE_SIZE)
  }, [])

  const isFeaturedMode = !query && activeCategory === 'all' && activeFilters.size === 0

  return (
    <>
      <Navbar />
      <style dangerouslySetInnerHTML={{ __html: `
        body { background: #FDFAF5; color: #1A1A18; }
        .transition-hover { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .campaign-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.06); }
        .hero-bg { background: linear-gradient(180deg, #F9F8F6 0%, #FDFAF5 100%); }
        .play-button { transition: all 0.3s ease; }
        a:has(.play-button):hover .play-button { transform: scale(1.1); background: rgba(255, 0, 0, 1) !important; }
      `}} />

      {/* ── 1. NEW TEXT HERO SECTION ── */}
      <div className="hero-bg" style={{ padding: '80px 28px 60px', textAlign: 'center', borderBottom: '1px solid #E8E4DC' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(40px, 7vw, 72px)', color: '#1A1A18', marginBottom: 24, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Raise money for what <span style={{ color: '#0A6B4B' }}>matters most</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#4A4A44', lineHeight: 1.6, marginBottom: 40, maxWidth: 680, marginInline: 'auto' }}>
            Create a fundraiser in minutes and get support from people who care across Ghana and beyond. 100% verified. No platform fees.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/create" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', background: '#0A6B4B', padding: '16px 32px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 24px rgba(10,107,75,0.25)', transition: 'transform 0.2s', className: 'transition-hover' } as any}>
              Start a fundraiser
            </Link>
            <Link href="/donate" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', background: '#02A95C', padding: '16px 32px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 24px rgba(2,169,92,0.25)', transition: 'transform 0.2s' }}>
              Donate now →
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. INTERACTIVE TUTORIAL SECTION ── */}
      <div style={{ padding: '60px 28px', background: '#FDFAF5' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, color: '#1A1A18', marginBottom: 12 }}>See it in action</h2>
            <p style={{ fontSize: 16, color: '#8A8A82' }}>Follow Ama's journey from problem to solution in 3 weeks</p>
          </div>
          <TutorialEmbed />
        </div>
      </div>

      {/* ── 3. TRUST LAYER ── */}
      <div style={{ padding: '80px 28px', background: '#F9F8F6', borderBottom: '1px solid #E8E4DC' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#1A1A18', marginBottom: 12 }}>Why people trust EveryGiving</h2>
            <p style={{ fontSize: 16, color: '#8A8A82' }}>Built to protect both the people giving and the people receiving.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            <div style={{ background: '#fff', padding: '32px 24px', borderRadius: 16, border: '1px solid #E8E4DC' }}>
              <div style={{ width: 48, height: 48, background: '#E8F5EF', color: '#0A6B4B', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><IconVerify /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>Verified fundraisers</h3>
              <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.6 }}>Every single campaign organizer is identity-checked using the national Ghana Card database.</p>
            </div>
            
            <div style={{ background: '#fff', padding: '32px 24px', borderRadius: 16, border: '1px solid #E8E4DC' }}>
              <div style={{ width: 48, height: 48, background: '#F0F4F8', color: '#185FA5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><IconShield /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>Secure payments</h3>
              <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.6 }}>We use bank-level security via Paystack for instant MoMo, Telecel Cash, and Card processing.</p>
            </div>

            <div style={{ background: '#fff', padding: '32px 24px', borderRadius: 16, border: '1px solid #E8E4DC' }}>
              <div style={{ width: 48, height: 48, background: '#FEF3E2', color: '#B85C00', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><IconEye /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>Transparent fees</h3>
              <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.6 }}>0% platform fee to start. A small, clear transaction fee ensures maximum funds reach the cause.</p>
            </div>

            <div style={{ background: '#fff', padding: '32px 24px', borderRadius: 16, border: '1px solid #E8E4DC' }}>
              <div style={{ width: 48, height: 48, background: '#FCE8E8', color: '#C0392B', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><IconHeart /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>Real impact stories</h3>
              <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.6 }}>Track milestones and see exactly how your donation changes lives within the community.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. CAMPAIGNS DIRECTORY ── */}
      <div id="campaigns" style={{ padding: '80px 28px', background: '#FDFAF5' }}>
        {/* Category tabs */}
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 24 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setCategory(cat.id); setVisibleCount(PAGE_SIZE) }}
              style={{ fontSize: 13, fontWeight: 600, color: activeCategory === cat.id ? '#0A6B4B' : '#4A4A44', padding: '10px 16px', borderRadius: 24, background: activeCategory === cat.id ? '#E8F5EF' : '#fff', border: activeCategory === cat.id ? '1px solid #B7DEC9' : '1px solid #E8E4DC', cursor: 'pointer', whiteSpace: 'nowrap' as const, fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {FILTER_CHIPS.map(f => (
              <button key={f.id} onClick={() => toggleFilter(f.id)}
                style={{ fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 20, border: activeFilters.has(f.id) ? '1px solid #1A1A18' : '1px dashed #A0A09A', background: activeFilters.has(f.id) ? '#1A1A18' : 'transparent', color: activeFilters.has(f.id) ? '#fff' : '#4A4A44', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                {activeFilters.has(f.id) ? '✓ ' : '+ '}{f.label}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setVisibleCount(PAGE_SIZE) }}
            style={{ fontSize: 13, fontWeight: 500, color: '#4A4A44', padding: '10px 14px', border: '1px solid #E8E4DC', borderRadius: 8, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Sort by: {o.label}</option>)}
          </select>
        </div>

        {/* Campaign Grid */}
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', border: '1px dashed #D4D4D0', borderRadius: 16 }}>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#1A1A18', marginBottom: 8 }}>No campaigns found</h3>
              <p style={{ fontSize: 15, color: '#8A8A82', marginBottom: 24 }}>Expand your search to find causes that need your help right now.</p>
              <button onClick={clearAll} style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', background: '#F9F8F6', padding: '12px 24px', borderRadius: 8, border: '1px solid #E8E4DC', cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {visible.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {filtered.length > visibleCount && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                style={{ fontSize: 15, fontWeight: 600, color: '#1A1A18', background: '#fff', border: '1px solid #E8E4DC', padding: '14px 32px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
              >
                Show more campaigns
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
