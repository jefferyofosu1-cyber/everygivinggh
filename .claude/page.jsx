'use client';

/**
 * EveryGiving — Browse Campaigns Page
 * Route: /campaigns
 *
 * Features:
 * - Full-text search across title, organiser, location
 * - Category tab filtering (Medical, Education, Emergency, etc.)
 * - Filter chips: Urgent, Fully funded, Diaspora friendly
 * - Sort: Most urgent, Most recent, Most donors, Closest to goal
 * - Paginated grid with Load More
 * - Featured first card when no filter active
 * - Search term highlighting
 * - Empty state with clear-all CTA
 *
 * Data:
 * Replace the SAMPLE_CAMPAIGNS array with a real API call.
 * Recommended: fetch('/api/campaigns') from your Node.js backend.
 * The component is fully client-side rendered — add Suspense + loading.jsx
 * in the app directory if you want server-side rendering.
 */

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',       label: 'All campaigns' },
  { id: 'medical',   label: 'Medical' },
  { id: 'education', label: 'Education' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'faith',     label: 'Faith' },
  { id: 'community', label: 'Community' },
  { id: 'funeral',   label: 'Funeral' },
  { id: 'family',    label: 'Family' },
];

const FILTER_CHIPS = [
  { id: 'urgent',   label: 'Urgent' },
  { id: 'funded',   label: 'Fully funded' },
  { id: 'diaspora', label: 'Diaspora friendly' },
];

const SORT_OPTIONS = [
  { value: 'urgent',  label: 'Most urgent' },
  { value: 'recent',  label: 'Most recent' },
  { value: 'popular', label: 'Most donors' },
  { value: 'pct',     label: 'Closest to goal' },
];

const PAGE_SIZE = 6;

// ─── SAMPLE DATA — replace with API call ──────────────────────────────────────
// Each campaign object shape:
// {
//   id: string,
//   slug: string,           // used in URL: /campaigns/[slug]
//   category: string,       // matches CATEGORIES id
//   title: string,
//   organiserName: string,
//   location: string,
//   raisedGHS: number,
//   goalGHS: number,
//   donorCount: number,
//   daysLeft: number,       // 0 = ends today
//   isUrgent: boolean,
//   isFunded: boolean,
//   isDiasporaFriendly: boolean,
//   coverEmoji: string,     // temporary until real photos
//   coverGradient: string,  // temporary until real photos
//   coverImageUrl?: string, // real photo when available
// }

const SAMPLE_CAMPAIGNS = [
  {
    id: '1', slug: 'ama-kidney-surgery', category: 'medical',
    title: 'Help Ama get life-saving kidney surgery at Korle Bu Teaching Hospital',
    organiserName: 'Kwame Mensah', location: 'Accra',
    raisedGHS: 14400, goalGHS: 20000, donorCount: 143, daysLeft: 12,
    isUrgent: true, isFunded: false, isDiasporaFriendly: true,
    coverEmoji: '🏥', coverGradient: 'linear-gradient(135deg,#1B4332,#52B788)',
  },
  {
    id: '2', slug: 'bethel-assembly-roof', category: 'faith',
    title: 'New roof for Bethel Assembly — Kumasi Central',
    organiserName: 'Pastor Isaac Asare', location: 'Kumasi',
    raisedGHS: 42000, goalGHS: 42000, donorCount: 312, daysLeft: 0,
    isUrgent: false, isFunded: true, isDiasporaFriendly: false,
    coverEmoji: '⛪', coverGradient: 'linear-gradient(135deg,#2C3E50,#4A6FA5)',
  },
  {
    id: '3', slug: 'adjoa-university-fees', category: 'education',
    title: 'Help Adjoa pay her university fees at KNUST',
    organiserName: 'Adjoa Mensah', location: 'Tema',
    raisedGHS: 9200, goalGHS: 10500, donorCount: 67, daysLeft: 5,
    isUrgent: true, isFunded: false, isDiasporaFriendly: true,
    coverEmoji: '📚', coverGradient: 'linear-gradient(135deg,#5C3317,#A0522D)',
  },
  {
    id: '4', slug: 'kofi-bone-tumour', category: 'medical',
    title: 'Surgery for Kofi — bone tumour removal at 37 Military Hospital',
    organiserName: 'Yaa Asante', location: 'Accra',
    raisedGHS: 6200, goalGHS: 15000, donorCount: 44, daysLeft: 21,
    isUrgent: false, isFunded: false, isDiasporaFriendly: true,
    coverEmoji: '🩺', coverGradient: 'linear-gradient(135deg,#3D0C02,#9B2335)',
  },
  {
    id: '5', slug: 'nkoranza-borehole', category: 'community',
    title: 'Borehole for Nkoranza North — clean water for 400 families',
    organiserName: 'Nkoranza Community Dev.', location: 'Brong-Ahafo',
    raisedGHS: 18700, goalGHS: 24000, donorCount: 189, daysLeft: 30,
    isUrgent: false, isFunded: false, isDiasporaFriendly: false,
    coverEmoji: '💧', coverGradient: 'linear-gradient(135deg,#014F86,#2196F3)',
  },
  {
    id: '6', slug: 'maame-efua-funeral', category: 'funeral',
    title: 'Funeral expenses for Maame Efua — community support needed',
    organiserName: 'Efua Boateng Family', location: 'Cape Coast',
    raisedGHS: 4100, goalGHS: 6000, donorCount: 38, daysLeft: 7,
    isUrgent: true, isFunded: false, isDiasporaFriendly: false,
    coverEmoji: '🕊️', coverGradient: 'linear-gradient(135deg,#2D2D2D,#6D6D6D)',
  },
  {
    id: '7', slug: 'accra-flood-home', category: 'family',
    title: 'Help rebuild our home after the Accra floods',
    organiserName: 'Emmanuel Darko', location: 'Accra',
    raisedGHS: 7800, goalGHS: 12000, donorCount: 91, daysLeft: 14,
    isUrgent: false, isFunded: false, isDiasporaFriendly: true,
    coverEmoji: '🏠', coverGradient: 'linear-gradient(135deg,#7B3F00,#C68642)',
  },
  {
    id: '8', slug: 'wa-shs-wassce', category: 'education',
    title: 'Support 12 students from Wa for their WASSCE prep materials',
    organiserName: 'Wa SHS PTA', location: 'Upper West',
    raisedGHS: 2100, goalGHS: 3500, donorCount: 29, daysLeft: 18,
    isUrgent: false, isFunded: false, isDiasporaFriendly: false,
    coverEmoji: '✏️', coverGradient: 'linear-gradient(135deg,#1A1A2E,#16213E)',
  },
  {
    id: '9', slug: 'pastor-emmanuel-dialysis', category: 'medical',
    title: 'Dialysis funding for Pastor Emmanuel — 3 months of treatment',
    organiserName: 'Grace Assembly Takoradi', location: 'Takoradi',
    raisedGHS: 11000, goalGHS: 18000, donorCount: 104, daysLeft: 9,
    isUrgent: true, isFunded: false, isDiasporaFriendly: true,
    coverEmoji: '💊', coverGradient: 'linear-gradient(135deg,#0D3B00,#2D6A0D)',
  },
];


// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatGHS(amount) {
  return `₵${amount.toLocaleString()}`;
}

function highlightText(text, query) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: '#fef08a', borderRadius: 2, padding: '0 1px' }}>{part}</mark>
      : part
  );
}


// ─── CAMPAIGN CARD ────────────────────────────────────────────────────────────

function CampaignCard({ campaign, query, featured = false }) {
  const pct = Math.min(100, Math.round(campaign.raisedGHS / campaign.goalGHS * 100));

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      style={{
        display: 'block',
        background: '#FFFFFF',
        border: '1px solid #E8E4DC',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.22s',
        textDecoration: 'none',
        gridColumn: featured ? 'span 2' : 'span 1',
      }}
      className="campaign-card"
    >
      {/* Cover image */}
      <div style={{
        height: featured ? 200 : 158,
        background: campaign.coverGradient,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {campaign.coverImageUrl ? (
          <img src={campaign.coverImageUrl} alt={campaign.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        ) : (
          <span style={{ fontSize: featured ? 48 : 36, position: 'relative', zIndex: 1 }}>{campaign.coverEmoji}</span>
        )}

        {/* Verified badge */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 20, padding: '3px 8px',
          fontSize: 10, fontWeight: 700, color: '#0A6B4B',
          display: 'flex', alignItems: 'center', gap: 3,
        }}>✓ Verified</div>

        {/* Urgent / Funded badge */}
        {campaign.isFunded && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#B85C00', borderRadius: 20, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#fff' }}>
            Funded ✓
          </div>
        )}
        {campaign.isUrgent && !campaign.isFunded && (
          <div style={{ position: 'absolute', top: 10, left: 10, background: '#B85C00', borderRadius: 20, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#fff' }}>
            Urgent
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '14px 15px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 5 }}>
          {campaign.category}
        </div>

        <div style={{ fontSize: featured ? 15 : 13, fontWeight: 600, color: '#1A1A18', lineHeight: 1.45, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {highlightText(campaign.title, query)}
        </div>

        <div style={{ fontSize: 12, color: '#8A8A82', marginBottom: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
          {highlightText(campaign.organiserName, query)} · {campaign.location}
          {campaign.isDiasporaFriendly && (
            <span style={{ fontSize: 10, fontWeight: 600, color: '#B85C00', background: '#FEF3E2', padding: '1px 5px', borderRadius: 8, marginLeft: 4 }}>
              🌍 Diaspora
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: '#E8E4DC', borderRadius: 2, overflow: 'hidden', marginBottom: 7 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: campaign.isFunded ? '#B85C00' : '#0A6B4B', borderRadius: 2, transition: 'width 0.6s ease' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18' }}>{formatGHS(campaign.raisedGHS)} raised</span>
          <span style={{ fontSize: 11, color: '#8A8A82' }}>
            {campaign.donorCount} donors ·{' '}
            {campaign.isFunded
              ? <span style={{ color: '#B85C00', fontWeight: 700 }}>Fully funded</span>
              : campaign.daysLeft === 0
                ? <span style={{ color: '#B85C00' }}>Ends today</span>
                : `${campaign.daysLeft}d left`
            }
          </span>
        </div>
      </div>
    </Link>
  );
}


// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function BrowseCampaignsPage() {
  const [query, setQuery]               = useState('');
  const [activeCategory, setCategory]   = useState('all');
  const [activeFilters, setFilters]     = useState(new Set());
  const [sortBy, setSortBy]             = useState('urgent');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    let list = SAMPLE_CAMPAIGNS.filter(c => {
      if (activeCategory !== 'all' && c.category !== activeCategory) return false;
      if (activeFilters.has('urgent') && !c.isUrgent) return false;
      if (activeFilters.has('funded') && !c.isFunded) return false;
      if (activeFilters.has('diaspora') && !c.isDiasporaFriendly) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.organiserName.toLowerCase().includes(q) &&
          !c.location.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'urgent')  return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0) || a.daysLeft - b.daysLeft;
      if (sortBy === 'recent')  return b.id - a.id;
      if (sortBy === 'popular') return b.donorCount - a.donorCount;
      if (sortBy === 'pct')     return (b.raisedGHS / b.goalGHS) - (a.raisedGHS / a.goalGHS);
      return 0;
    });
  }, [query, activeCategory, activeFilters, sortBy]);

  const visible = filtered.slice(0, visibleCount);

  // ── Handlers ──
  const toggleFilter = useCallback((id) => {
    setFilters(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setVisibleCount(PAGE_SIZE);
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setCategory('all');
    setFilters(new Set());
    setSortBy('urgent');
    setVisibleCount(PAGE_SIZE);
  }, []);

  const isFeaturedMode = !query && activeCategory === 'all' && activeFilters.size === 0;

  return (
    <>
      {/* ── NAV ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 58, background: '#FFFFFF', borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, color: '#1A1A18', textDecoration: 'none' }}>
          Every<em style={{ color: '#0A6B4B', fontStyle: 'normal' }}>Giving</em>
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/auth/login" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A18', padding: '7px 13px', border: '1px solid #E8E4DC', borderRadius: 8, textDecoration: 'none' }}>Sign in</Link>
          <Link href="/create" style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>Start a campaign</Link>
        </div>
      </nav>

      {/* ── HEADER + SEARCH ── */}
      <div style={{ background: '#1A1A18', padding: '40px 28px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B7DEC9', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 20, height: 1, background: '#B7DEC9', display: 'inline-block' }} />
            Verified campaigns
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#fff', marginBottom: 6, lineHeight: 1.15 }}>
            Every cause.<br /><em style={{ color: '#B7DEC9' }}>Every community.</em>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            All campaigns are identity-verified. Every fundraiser has had their Ghana Card confirmed by our team.
          </p>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 600, marginBottom: 24 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, opacity: 0.4, pointerEvents: 'none' }} viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="white" strokeWidth="1.5" />
              <path d="M13 13l3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
              placeholder="Search campaigns, names, causes…"
              style={{ width: '100%', padding: '13px 42px 13px 42px', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 12, background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            />
            {query && (
              <button onClick={clearAll} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 22, height: 22, borderRadius: '50%', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setCategory(cat.id); setVisibleCount(PAGE_SIZE); }}
              style={{ fontSize: 13, fontWeight: 500, color: activeCategory === cat.id ? '#fff' : 'rgba(255,255,255,0.45)', padding: '12px 14px', borderBottom: activeCategory === cat.id ? '2px solid #B7DEC9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap', background: 'none', border: 'none', borderBottom: activeCategory === cat.id ? '2px solid #B7DEC9' : '2px solid transparent', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#8A8A82' }}>
            <strong style={{ color: '#1A1A18' }}>{filtered.length}</strong> campaign{filtered.length !== 1 ? 's' : ''}
            {query && <em style={{ color: '#0A6B4B' }}> for "{query}"</em>}
          </span>
          {FILTER_CHIPS.map(f => (
            <button key={f.id} onClick={() => toggleFilter(f.id)}
              style={{ fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20, border: activeFilters.has(f.id) ? '1px solid #0A6B4B' : '1px solid #E8E4DC', background: activeFilters.has(f.id) ? '#E8F5EF' : '#fff', color: activeFilters.has(f.id) ? '#0A6B4B' : '#4A4A44', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
              {f.label}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setVisibleCount(PAGE_SIZE); }}
          style={{ fontSize: 13, color: '#4A4A44', padding: '6px 10px', border: '1px solid #E8E4DC', borderRadius: 8, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* ── CAMPAIGN GRID ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px 60px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 14, opacity: 0.4 }}>🔍</div>
            <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1A1A18', marginBottom: 6 }}>No campaigns found</h3>
            <p style={{ fontSize: 14, color: '#8A8A82', marginBottom: 20 }}>Try a different search or clear your filters</p>
            <button onClick={clearAll} style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '11px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear all filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
            {visible.map((campaign, i) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                query={query}
                featured={i === 0 && isFeaturedMode}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {filtered.length > visibleCount && (
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button
              onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
              style={{ fontSize: 14, fontWeight: 600, color: '#0A6B4B', background: 'transparent', border: '1.5px solid #0A6B4B', padding: '11px 28px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}
            >
              Load more — {filtered.length - visibleCount} remaining
            </button>
          </div>
        )}
      </div>
    </>
  );
}
