const fs = require('fs');
const path = require('path');

const content = `'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// ─── DATA ─────────────────────────────────────────────────────────────────────
// TODO: Replace with Supabase query: SELECT * FROM campaigns WHERE status='active'

const MOCK_CAMPAIGNS = [
  { id: '1', slug: 'ama-kidney-surgery', title: 'Help Ama get life-saving kidney surgery at Korle Bu', category: 'medical', organiser: 'Kwame Mensah', location: 'Accra', goalGHS: 20000, raisedGHS: 14400, donorCount: 143, daysLeft: 12, verified: true, emoji: '🫀', gradient: 'linear-gradient(135deg,#1B4332,#52B788)', excerpt: 'My mother Ama has woken up at 4am every day for thirty years to sell at Makola Market. She needs surgery within 90 days.' },
  { id: '2', slug: 'bethel-church-roof', title: 'New roof for Bethel Assembly — Kumasi Central', category: 'faith', organiser: 'Pastor Isaac Asare', location: 'Kumasi', goalGHS: 42000, raisedGHS: 42000, donorCount: 312, daysLeft: 0, verified: true, emoji: '⛪', gradient: 'linear-gradient(135deg,#2C3E50,#4A6FA5)', excerpt: 'Our congregation of 400 families has worshipped under a leaking roof for three years.' },
  { id: '3', slug: 'adjoa-university-fees', title: 'Help Adjoa pay her first-year fees at KNUST', category: 'education', organiser: 'Adjoa Mensah', location: 'Tema', goalGHS: 10500, raisedGHS: 9200, donorCount: 67, daysLeft: 5, verified: true, emoji: '📚', gradient: 'linear-gradient(135deg,#5C3317,#A0522D)', excerpt: "My daughter worked for two years to earn her place at KNUST. We cannot let fees be the reason she doesn't go." },
  { id: '4', slug: 'accra-community-borehole', title: 'Clean water borehole for Abokobi community', category: 'community', organiser: 'Emmanuel Tetteh', location: 'Abokobi', goalGHS: 35000, raisedGHS: 18200, donorCount: 204, daysLeft: 28, verified: true, emoji: '💧', gradient: 'linear-gradient(135deg,#1A5276,#2E86C1)', excerpt: 'Over 600 families in Abokobi walk 4km daily for water. A single borehole changes everything.' },
  { id: '5', slug: 'kofi-accident-recovery', title: 'Help Kofi recover from road accident — physiotherapy needed', category: 'emergency', organiser: 'Abena Boateng', location: 'Accra', goalGHS: 8000, raisedGHS: 3100, donorCount: 28, daysLeft: 21, verified: true, emoji: '🏥', gradient: 'linear-gradient(135deg,#922B21,#C0392B)', excerpt: 'Kofi was hit by a vehicle in January. He survived but cannot walk. Six months of physiotherapy will get him back on his feet.' },
  { id: '6', slug: 'yaa-funeral-support', title: "Support for Yaa's family — funeral and bereavement costs", category: 'funeral', organiser: 'Yaw Darko', location: 'Cape Coast', goalGHS: 6000, raisedGHS: 5400, donorCount: 89, daysLeft: 3, verified: true, emoji: '🕊️', gradient: 'linear-gradient(135deg,#4A235A,#7D3C98)', excerpt: 'Our mother Yaa passed suddenly last week. She served this community for 40 years.' },
  { id: '7', slug: 'kwame-medical-trip', title: 'Send Kwame to India for specialist heart surgery', category: 'medical', organiser: 'Gifty Asante', location: 'Kumasi', goalGHS: 55000, raisedGHS: 22000, donorCount: 189, daysLeft: 45, verified: true, emoji: '❤️', gradient: 'linear-gradient(135deg,#0B3D2E,#1A6B4A)', excerpt: 'Kwame is 34 and a father of three. The surgery he needs is not available in Ghana.' },
  { id: '8', slug: 'esi-school-supplies', title: 'School supplies for 120 children in Volta Region', category: 'education', organiser: 'Esi Nyarko', location: 'Ho', goalGHS: 4500, raisedGHS: 4500, donorCount: 54, daysLeft: 0, verified: true, emoji: '✏️', gradient: 'linear-gradient(135deg,#784212,#CA6F1E)', excerpt: 'These children travel 2 hours each way to school. The least we can do is make sure they have what they need.' },
  { id: '9', slug: 'north-ghana-solar', title: 'Solar panels for three-classroom school in Tamale', category: 'community', organiser: 'Ibrahim Mahama', location: 'Tamale', goalGHS: 18000, raisedGHS: 7600, donorCount: 71, daysLeft: 60, verified: true, emoji: '☀️', gradient: 'linear-gradient(135deg,#7D6608,#B7950B)', excerpt: 'When the power goes out — which is often — 240 students sit in the dark. Solar panels mean learning never stops.' },
]

const CATEGORIES = [
  { id: 'all', label: 'All campaigns', emoji: '✦' },
  { id: 'medical', label: 'Medical', emoji: '🫀' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'emergency', label: 'Emergency', emoji: '🏥' },
  { id: 'faith', label: 'Faith', emoji: '⛪' },
  { id: 'community', label: 'Community', emoji: '💧' },
  { id: 'funeral', label: 'Funeral', emoji: '🕊️' },
]

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'ending_soon', label: 'Ending soon' },
  { id: 'most_funded', label: 'Most funded' },
  { id: 'most_donors', label: 'Most donors' },
]

const PER_PAGE = 6

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function pct(raised: number, goal: number) { return Math.min(100, Math.round((raised / goal) * 100)) }
function fmt(n: number) { return n >= 1000 ? \`₵\${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k\` : \`₵\${n.toLocaleString()}\` }
function useDebounce(value: string, delay = 300) {
  const [d, setD] = useState(value)
  useEffect(() => { const t = setTimeout(() => setD(value), delay); return () => clearTimeout(t) }, [value, delay])
  return d
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ height: 160, background: '#E8E4DC', animation: 'shimmer 1.4s ease infinite' }} />
      <div style={{ padding: 16 }}>
        {[60, '90%', '70%', '50%', '100%'].map((w, i) => (
          <div key={i} style={{ width: w, height: i === 3 ? 4 : 12, background: '#E8E4DC', borderRadius: 4, marginBottom: 10, animation: \`shimmer 1.4s ease \${i * 0.1}s infinite\` }} />
        ))}
      </div>
    </div>
  )
}

// ─── CAMPAIGN CARD ────────────────────────────────────────────────────────────

interface Campaign {
  id: string; slug: string; title: string; category: string; organiser: string;
  location: string; goalGHS: number; raisedGHS: number; donorCount: number;
  daysLeft: number; verified: boolean; emoji: string; gradient: string; excerpt: string;
}

function CampaignCard({ campaign, index }: { campaign: Campaign; index: number }) {
  const [hovered, setHovered] = useState(false)
  const p = pct(campaign.raisedGHS, campaign.goalGHS)
  const funded = p >= 100
  const urgent = campaign.daysLeft > 0 && campaign.daysLeft <= 5

  return (
    <div
      style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16, overflow: 'hidden', transition: 'all .2s', transform: hovered ? 'translateY(-4px)' : 'none', boxShadow: hovered ? '0 16px 40px rgba(0,0,0,.1)' : '0 1px 3px rgba(0,0,0,.04)', animation: \`fadeup .4s ease \${index * 60}ms both\` }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ height: 160, background: campaign.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 36 }}>
        {campaign.emoji}
        {campaign.verified && <div style={{ position: 'absolute', top: 10, right: 10, background: '#fff', borderRadius: 20, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#0A6B4B' }}>✓ Verified</div>}
        {urgent && <div style={{ position: 'absolute', top: 10, left: 10, background: '#FEF3E2', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#B85C00', display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#B85C00', display: 'inline-block' }} />{campaign.daysLeft}d left</div>}
        {funded && !urgent && <div style={{ position: 'absolute', top: 10, left: 10, background: '#FEF3E2', borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#B85C00' }}>✓ Funded</div>}
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.07em', color: '#0A6B4B', marginBottom: 6 }}>{campaign.category.toUpperCase()}</div>
        <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 15, lineHeight: 1.4, color: '#1A1A18', marginBottom: 7 }}>{campaign.title}</h3>
        <p style={{ fontSize: 12, color: '#8A8A82', lineHeight: 1.6, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{campaign.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#8A8A82', marginBottom: 12 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#E8F5EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#0A6B4B' }}>{campaign.organiser[0]}</div>
          {campaign.organiser} · {campaign.location}
        </div>
        <div style={{ height: 4, background: '#E8E4DC', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{ height: '100%', width: \`\${p}%\`, background: funded ? '#B85C00' : '#0A6B4B', borderRadius: 2, transition: 'width .6s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>{fmt(campaign.raisedGHS)} raised</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#8A8A82' }}>{campaign.donorCount} donors</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: funded ? '#B85C00' : '#0A6B4B' }}>{funded ? 'Funded' : \`\${p}%\`}</span>
          </div>
        </div>
        <Link href={\`/campaigns/\${campaign.slug}\`} style={{ display: 'block', width: '100%', padding: '10px 0', background: hovered ? '#085C3F' : '#0A6B4B', color: '#fff', textAlign: 'center', borderRadius: 8, fontSize: 13, fontWeight: 600, transition: 'background .15s' }}>
          {funded ? 'View campaign' : 'Donate now'}
        </Link>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ query, category, onClear }: { query: string; category: string; onClear: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', border: '1.5px dashed #E8E4DC', borderRadius: 16 }}>
      <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
      <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: '#1A1A18', marginBottom: 8 }}>
        {query ? \`No campaigns found for "\${query}"\` : \`No \${category} campaigns yet\`}
      </h3>
      <p style={{ fontSize: 14, color: '#8A8A82', marginBottom: 20, lineHeight: 1.6 }}>
        {query ? 'Try a different search term or browse all categories.' : 'Be the first to start a campaign in this category.'}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={onClear}>Browse all campaigns</button>
        <Link href="/create" style={{ fontSize: 13, fontWeight: 500, color: '#0A6B4B', padding: '10px 20px', borderRadius: 8, border: '1px solid #0A6B4B' }}>Start a campaign</Link>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query)

  useEffect(() => {
    setLoading(true)
    setPage(1)
    const t = setTimeout(() => setLoading(false), 450)
    return () => clearTimeout(t)
  }, [debouncedQuery, category, sort])

  const filtered = MOCK_CAMPAIGNS.filter(c => {
    const matchCat = category === 'all' || c.category === category
    const q = debouncedQuery.toLowerCase()
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.organiser.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.excerpt.toLowerCase().includes(q)
    return matchCat && matchQ
  }).sort((a, b) => {
    if (sort === 'ending_soon') return (a.daysLeft || 999) - (b.daysLeft || 999)
    if (sort === 'most_funded') return pct(b.raisedGHS, b.goalGHS) - pct(a.raisedGHS, a.goalGHS)
    if (sort === 'most_donors') return b.donorCount - a.donorCount
    return parseInt(b.id) - parseInt(a.id)
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const handleClear = useCallback(() => { setQuery(''); setCategory('all'); setSort('newest'); searchRef.current?.focus() }, [])

  return (
    <>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        @keyframes shimmer{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .cat-tab:hover{background:#E8F5EF !important;color:#0A6B4B !important}
        .cat-tab.active{background:#0A6B4B !important;color:#fff !important;border-color:#0A6B4B !important}
        .sort-opt:hover{background:#F1EFE8}
        .sort-opt.active{background:#0A6B4B;color:#fff;border-color:#0A6B4B}
        .page-btn:hover:not(:disabled){background:#E8F5EF;border-color:#0A6B4B;color:#0A6B4B}
        .page-btn.active{background:#0A6B4B !important;color:#fff !important;border-color:#0A6B4B !important}
        .page-btn:disabled{opacity:.35;cursor:not-allowed}
        input:focus{outline:none}
      \`}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: '#fff', borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 0, zIndex: 200 }}>
        <Link href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: '#1A1A18' }}>Every<span style={{ color: '#0A6B4B' }}>Giving</span></Link>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {([['/', 'Home'], ['/campaigns', 'Browse'], ['/how-it-works', 'How it works'], ['/fees', 'Fees']] as [string,string][]).map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize: 13, fontWeight: href === '/campaigns' ? 600 : 500, color: href === '/campaigns' ? '#0A6B4B' : '#4A4A44', padding: '7px 12px', borderRadius: 6 }}>{label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/auth/login" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A18', padding: '7px 14px', border: '1px solid #E8E4DC', borderRadius: 8 }}>Sign in</Link>
          <Link href="/create" style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '8px 18px', borderRadius: 8 }}>Start a campaign</Link>
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ background: '#1A1A18', padding: '56px 32px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#B7DEC9', marginBottom: 14 }}>Verified campaigns</div>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 42, lineHeight: 1.15, color: '#fff', marginBottom: 14 }}>
              Find a cause<br /><em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>worth giving to</em>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, maxWidth: 380 }}>Every campaign is identity-verified. Funds released in milestones. Zero platform fees — always.</p>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
              <svg style={{ width: 18, height: 18, color: '#8A8A82', flexShrink: 0 }} viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input ref={searchRef} type="text" placeholder="Search by name, cause, or location…" value={query} onChange={e => setQuery(e.target.value)}
                style={{ flex: 1, border: 'none', fontSize: 15, fontFamily: 'inherit', color: '#1A1A18', background: 'transparent' }} />
              {query && <button style={{ background: 'none', border: 'none', fontSize: 18, color: '#8A8A82', cursor: 'pointer' }} onClick={() => setQuery('')}>×</button>}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', paddingLeft: 4 }}>
              {filtered.length} verified campaign{filtered.length !== 1 ? 's' : ''}{debouncedQuery ? \` matching "\${debouncedQuery}"\` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 64px' }}>

        {/* FILTER ROW */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} className={\`cat-tab\${category === cat.id ? ' active' : ''}\`}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '7px 14px', border: '0.5px solid #E8E4DC', borderRadius: 20, background: '#fff', color: '#4A4A44', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}
                onClick={() => setCategory(cat.id)}>
                <span style={{ fontSize: 14 }}>{cat.emoji}</span>{cat.label}
                {cat.id !== 'all' && <span style={{ fontSize: 10, fontWeight: 600, opacity: .6, background: 'rgba(0,0,0,.06)', padding: '1px 6px', borderRadius: 10 }}>{MOCK_CAMPAIGNS.filter(c => c.category === cat.id).length}</span>}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#8A8A82', marginRight: 2 }}>Sort:</span>
            {SORT_OPTIONS.map(opt => (
              <button key={opt.id} className={\`sort-opt\${sort === opt.id ? ' active' : ''}\`}
                style={{ fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 20, border: '0.5px solid #E8E4DC', background: '#fff', color: '#4A4A44', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit', whiteSpace: 'nowrap' as const }}
                onClick={() => setSort(opt.id)}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20, marginBottom: 40 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState query={debouncedQuery} category={category} onClear={handleClear} />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20, marginBottom: 40 }}>
              {paginated.map((c, i) => <CampaignCard key={c.id} campaign={c} index={i} />)}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 48 }}>
                <button className="page-btn" style={{ fontSize: 13, fontWeight: 500, padding: '8px 14px', border: '0.5px solid #E8E4DC', borderRadius: 8, background: '#fff', color: '#4A4A44', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
                  disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={\`page-btn\${page === p ? ' active' : ''}\`}
                    style={{ fontSize: 13, fontWeight: 500, padding: '8px 14px', border: '0.5px solid #E8E4DC', borderRadius: 8, background: '#fff', color: '#4A4A44', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
                    onClick={() => setPage(p)}>{p}</button>
                ))}
                <button className="page-btn" style={{ fontSize: 13, fontWeight: 500, padding: '8px 14px', border: '0.5px solid #E8E4DC', borderRadius: 8, background: '#fff', color: '#4A4A44', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
                  disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
              </div>
            )}
          </>
        )}

        {/* BOTTOM CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1A1A18', borderRadius: 16, padding: '28px 32px', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: '#fff', marginBottom: 4 }}>Don&#39;t see what you are looking for?</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>Start your own campaign in under 15 minutes. Identity verified. Zero platform fees.</p>
          </div>
          <Link href="/create" style={{ fontSize: 14, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '12px 24px', borderRadius: 10, whiteSpace: 'nowrap' as const }}>Start a campaign — free</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#1A1A18', borderTop: '1px solid rgba(255,255,255,.06)', padding: '24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: '#fff' }}>Every<span style={{ color: '#B7DEC9' }}>Giving</span></span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{String.fromCharCode(169)} {new Date().getFullYear()} EveryGiving · Built in Ghana</span>
          <div style={{ display: 'flex', gap: 14 }}>
            {[['Terms','/terms'],['Privacy','/privacy'],['Fees','/fees']].map(([l,h]) => <Link key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{l}</Link>)}
          </div>
        </div>
      </footer>
    </>
  )
}
`;

const out = path.join(__dirname, '..', 'app', 'campaigns', 'page.tsx');
fs.writeFileSync(out, content, 'utf8');
console.log('Written', fs.statSync(out).size, 'bytes');
