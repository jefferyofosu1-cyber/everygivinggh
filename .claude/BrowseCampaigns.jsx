/**
 * EveryGiving — Browse Campaigns Page
 * Route: /campaigns
 *
 * Features:
 * - Live search with debounce
 * - Category filter tabs
 * - Sort controls (newest, most funded, ending soon, most donors)
 * - Responsive campaign card grid
 * - Skeleton loading states
 * - Empty states (no results, no campaigns yet)
 * - Pagination
 * - Diaspora banner
 *
 * Usage in Next.js:
 *   // pages/campaigns/index.js  (Pages Router)
 *   export default function CampaignsPage() {
 *     return <BrowseCampaigns />;
 *   }
 *
 *   // app/campaigns/page.js  (App Router)
 *   import BrowseCampaigns from '@/components/BrowseCampaigns';
 *   export default function Page() {
 *     return <BrowseCampaigns />;
 *   }
 *
 * Data: Replace MOCK_CAMPAIGNS with a real fetch from your API:
 *   const res = await fetch(`/api/campaigns?q=${query}&category=${category}&sort=${sort}&page=${page}`);
 *   const { campaigns, total } = await res.json();
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Replace with real API data. Shape matches what your Node.js API should return.

const MOCK_CAMPAIGNS = [
  {
    id: '1', slug: 'ama-kidney-surgery',
    title: 'Help Ama get life-saving kidney surgery at Korle Bu',
    category: 'medical', organiser: 'Kwame Mensah', location: 'Accra',
    goalGHS: 20000, raisedGHS: 14400, donorCount: 143, daysLeft: 12,
    verified: true, emoji: '🫀', gradient: 'linear-gradient(135deg,#1B4332,#52B788)',
    excerpt: 'My mother Ama has woken up at 4am every day for thirty years to sell at Makola Market. She needs surgery within 90 days.',
  },
  {
    id: '2', slug: 'bethel-church-roof',
    title: 'New roof for Bethel Assembly — Kumasi Central',
    category: 'faith', organiser: 'Pastor Isaac Asare', location: 'Kumasi',
    goalGHS: 42000, raisedGHS: 42000, donorCount: 312, daysLeft: 0,
    verified: true, emoji: '⛪', gradient: 'linear-gradient(135deg,#2C3E50,#4A6FA5)',
    excerpt: 'Our congregation of 400 families has worshipped under a leaking roof for three years. Help us build something worthy.',
  },
  {
    id: '3', slug: 'adjoa-university-fees',
    title: 'Help Adjoa pay her first-year fees at KNUST',
    category: 'education', organiser: 'Adjoa Mensah', location: 'Tema',
    goalGHS: 10500, raisedGHS: 9200, donorCount: 67, daysLeft: 5,
    verified: true, emoji: '📚', gradient: 'linear-gradient(135deg,#5C3317,#A0522D)',
    excerpt: 'My daughter worked for two years to earn her place at KNUST. We cannot let fees be the reason she doesn\'t go.',
  },
  {
    id: '4', slug: 'accra-community-borehole',
    title: 'Clean water borehole for Abokobi community',
    category: 'community', organiser: 'Emmanuel Tetteh', location: 'Abokobi',
    goalGHS: 35000, raisedGHS: 18200, donorCount: 204, daysLeft: 28,
    verified: true, emoji: '💧', gradient: 'linear-gradient(135deg,#1A5276,#2E86C1)',
    excerpt: 'Over 600 families in Abokobi walk 4km daily for water. A single borehole changes everything for this community.',
  },
  {
    id: '5', slug: 'kofi-accident-recovery',
    title: 'Help Kofi recover from road accident — physiotherapy needed',
    category: 'emergency', organiser: 'Abena Boateng', location: 'Accra',
    goalGHS: 8000, raisedGHS: 3100, donorCount: 28, daysLeft: 21,
    verified: true, emoji: '🏥', gradient: 'linear-gradient(135deg,#922B21,#C0392B)',
    excerpt: 'Kofi was hit by a vehicle in January. He survived but cannot walk. Six months of physiotherapy will get him back on his feet.',
  },
  {
    id: '6', slug: 'yaa-funeral-support',
    title: 'Support for Yaa\'s family — funeral and bereavement costs',
    category: 'funeral', organiser: 'Yaw Darko', location: 'Cape Coast',
    goalGHS: 6000, raisedGHS: 5400, donorCount: 89, daysLeft: 3,
    verified: true, emoji: '🕊️', gradient: 'linear-gradient(135deg,#4A235A,#7D3C98)',
    excerpt: 'Our mother Yaa passed suddenly last week. She served this community for 40 years. Help us honour her properly.',
  },
  {
    id: '7', slug: 'kwame-medical-trip',
    title: 'Send Kwame to India for specialist heart surgery',
    category: 'medical', organiser: 'Gifty Asante', location: 'Kumasi',
    goalGHS: 55000, raisedGHS: 22000, donorCount: 189, daysLeft: 45,
    verified: true, emoji: '❤️', gradient: 'linear-gradient(135deg,#0B3D2E,#1A6B4A)',
    excerpt: 'Kwame is 34 and a father of three. The surgery he needs is not available in Ghana. Every donor is helping him come home.',
  },
  {
    id: '8', slug: 'esi-school-supplies',
    title: 'School supplies for 120 children in Volta Region',
    category: 'education', organiser: 'Esi Nyarko', location: 'Ho',
    goalGHS: 4500, raisedGHS: 4500, donorCount: 54, daysLeft: 0,
    verified: true, emoji: '✏️', gradient: 'linear-gradient(135deg,#784212,#CA6F1E)',
    excerpt: 'These children travel 2 hours each way to school. The least we can do is make sure they have what they need when they get there.',
  },
  {
    id: '9', slug: 'north-ghana-solar',
    title: 'Solar panels for three-classroom school in Tamale',
    category: 'community', organiser: 'Ibrahim Mahama', location: 'Tamale',
    goalGHS: 18000, raisedGHS: 7600, donorCount: 71, daysLeft: 60,
    verified: true, emoji: '☀️', gradient: 'linear-gradient(135deg,#7D6608,#B7950B)',
    excerpt: 'When the power goes out — which is often — 240 students sit in the dark. Solar panels mean learning never stops.',
  },
];

const CATEGORIES = [
  { id: 'all',       label: 'All campaigns', emoji: '✦' },
  { id: 'medical',   label: 'Medical',       emoji: '🫀' },
  { id: 'education', label: 'Education',     emoji: '📚' },
  { id: 'emergency', label: 'Emergency',     emoji: '🏥' },
  { id: 'faith',     label: 'Faith',         emoji: '⛪' },
  { id: 'community', label: 'Community',     emoji: '💧' },
  { id: 'funeral',   label: 'Funeral',       emoji: '🕊️' },
];

const SORT_OPTIONS = [
  { id: 'newest',      label: 'Newest first' },
  { id: 'ending_soon', label: 'Ending soon' },
  { id: 'most_funded', label: 'Most funded' },
  { id: 'most_donors', label: 'Most donors' },
];

const PER_PAGE = 6;

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function pct(raised, goal) {
  return Math.min(100, Math.round((raised / goal) * 100));
}

function fmt(n) {
  return n >= 1000 ? `₵${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `₵${n.toLocaleString()}`;
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardImage, background: '#E8E4DC', animation: 'shimmer 1.4s ease infinite' }} />
      <div style={styles.cardBody}>
        <div style={{ width: 60, height: 10, background: '#E8E4DC', borderRadius: 4, marginBottom: 8, animation: 'shimmer 1.4s ease infinite' }} />
        <div style={{ width: '90%', height: 14, background: '#E8E4DC', borderRadius: 4, marginBottom: 6, animation: 'shimmer 1.4s ease .1s infinite' }} />
        <div style={{ width: '70%', height: 14, background: '#E8E4DC', borderRadius: 4, marginBottom: 12, animation: 'shimmer 1.4s ease .1s infinite' }} />
        <div style={{ width: '50%', height: 10, background: '#E8E4DC', borderRadius: 4, marginBottom: 10, animation: 'shimmer 1.4s ease .2s infinite' }} />
        <div style={{ height: 4, background: '#E8E4DC', borderRadius: 2, marginBottom: 8, animation: 'shimmer 1.4s ease .2s infinite' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: 80, height: 10, background: '#E8E4DC', borderRadius: 4, animation: 'shimmer 1.4s ease .3s infinite' }} />
          <div style={{ width: 40, height: 10, background: '#E8E4DC', borderRadius: 4, animation: 'shimmer 1.4s ease .3s infinite' }} />
        </div>
      </div>
    </div>
  );
}

// ─── CAMPAIGN CARD ────────────────────────────────────────────────────────────

function CampaignCard({ campaign, index }) {
  const [hovered, setHovered] = useState(false);
  const p = pct(campaign.raisedGHS, campaign.goalGHS);
  const funded = p >= 100;
  const urgency = campaign.daysLeft > 0 && campaign.daysLeft <= 5;

  return (
    <div
      style={{
        ...styles.card,
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 40px rgba(0,0,0,.1)' : '0 1px 3px rgba(0,0,0,.04)',
        animationDelay: `${index * 60}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="campaign-card-anim"
    >
      {/* Image */}
      <div style={{ ...styles.cardImage, background: campaign.gradient }}>
        <span style={{ fontSize: 36 }}>{campaign.emoji}</span>
        {campaign.verified && (
          <div style={styles.verifiedBadge}>✓ Verified</div>
        )}
        {urgency && (
          <div style={styles.urgencyBadge}>
            <span style={styles.urgencyDot} />
            {campaign.daysLeft}d left
          </div>
        )}
        {funded && (
          <div style={styles.fundedBadge}>✓ Funded</div>
        )}
      </div>

      {/* Body */}
      <div style={styles.cardBody}>
        <div style={styles.cardCategory}>{campaign.category.toUpperCase()}</div>
        <h3 style={styles.cardTitle}>{campaign.title}</h3>
        <p style={styles.cardExcerpt}>{campaign.excerpt}</p>
        <div style={styles.cardOrganiser}>
          <div style={styles.organiserDot}>{campaign.organiser[0]}</div>
          <span>{campaign.organiser} · {campaign.location}</span>
        </div>

        {/* Progress */}
        <div style={styles.progressTrack}>
          <div style={{
            ...styles.progressFill,
            width: `${p}%`,
            background: funded ? '#B85C00' : '#0A6B4B',
          }} />
        </div>

        <div style={styles.cardStats}>
          <span style={styles.cardRaised}>{fmt(campaign.raisedGHS)} raised</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#8A8A82' }}>{campaign.donorCount} donors</span>
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: funded ? '#B85C00' : '#0A6B4B',
            }}>
              {funded ? 'Funded' : `${p}%`}
            </span>
          </div>
        </div>

        {/* CTA */}
        <a
          href={`/campaigns/${campaign.slug}`}
          style={{
            ...styles.cardCta,
            background: hovered ? '#085C3F' : '#0A6B4B',
          }}
        >
          {funded ? 'View campaign' : 'Donate now'}
        </a>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ query, category, onClear }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>🔍</div>
      <h3 style={styles.emptyTitle}>
        {query ? `No campaigns found for "${query}"` : `No ${category} campaigns yet`}
      </h3>
      <p style={styles.emptySub}>
        {query
          ? 'Try a different search term or browse all categories.'
          : 'Be the first to start a campaign in this category.'}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={styles.emptyBtnPrimary} onClick={onClear}>
          Browse all campaigns
        </button>
        <a href="/create" style={styles.emptyBtnSecondary}>
          Start a campaign
        </a>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function BrowseCampaigns() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 280);

  // Simulate loading on filter change
  useEffect(() => {
    setLoading(true);
    setPage(1);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [debouncedQuery, category, sort]);

  // Filter + sort
  const filtered = MOCK_CAMPAIGNS.filter(c => {
    const matchCat = category === 'all' || c.category === category;
    const q = debouncedQuery.toLowerCase();
    const matchQ = !q ||
      c.title.toLowerCase().includes(q) ||
      c.organiser.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.excerpt.toLowerCase().includes(q);
    return matchCat && matchQ;
  }).sort((a, b) => {
    if (sort === 'ending_soon') return (a.daysLeft || 999) - (b.daysLeft || 999);
    if (sort === 'most_funded') return pct(b.raisedGHS, b.goalGHS) - pct(a.raisedGHS, a.goalGHS);
    if (sort === 'most_donors') return b.donorCount - a.donorCount;
    return b.id - a.id; // newest
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleClear = useCallback(() => {
    setQuery('');
    setCategory('all');
    setSort('newest');
    searchRef.current?.focus();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{color:inherit;text-decoration:none}

        @keyframes shimmer {
          0%,100%{opacity:1} 50%{opacity:.4}
        }
        @keyframes fadeup {
          from{opacity:0;transform:translateY(14px)}
          to{opacity:1;transform:translateY(0)}
        }
        .campaign-card-anim {
          animation: fadeup .4s ease both;
        }
        .cat-tab:hover { background: #E8F5EF !important; color: #0A6B4B !important; }
        .cat-tab.active { background: #0A6B4B !important; color: #fff !important; border-color: #0A6B4B !important; }
        .sort-opt:hover { background: #F1EFE8; }
        .sort-opt.active { background: #0A6B4B; color: #fff; }
        .page-btn:hover:not(:disabled) { background: #E8F5EF; border-color: #0A6B4B; color: #0A6B4B; }
        .page-btn.active { background: #0A6B4B !important; color: #fff !important; border-color: #0A6B4B !important; }
        .page-btn:disabled { opacity: .35; cursor: not-allowed; }
      `}</style>

      {/* NAV */}
      <nav style={styles.nav}>
        <a href="/" style={styles.navLogo}>
          Every<span style={{ color: '#0A6B4B' }}>Giving</span>
        </a>
        <div style={styles.navLinks}>
          <a href="/campaigns" style={{ ...styles.navLink, color: '#0A6B4B', fontWeight: 600 }}>Browse</a>
          <a href="/how-it-works" style={styles.navLink}>How it works</a>
          <a href="/fees" style={styles.navLink}>Fees</a>
          <div style={styles.navDivider} />
          <a href="/auth/login" style={styles.navSignin}>Sign in</a>
          <a href="/create" style={styles.navCta}>Start a campaign</a>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div style={styles.pageHeader}>
        <div style={styles.pageHeaderInner}>
          <div style={styles.headerMeta}>
            <span style={styles.eyebrow}>Verified campaigns</span>
            <h1 style={styles.pageTitle}>
              Find a cause<br />
              <em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>worth giving to</em>
            </h1>
            <p style={styles.pageSubtitle}>
              Every campaign is identity-verified. Funds released in milestones.
              Zero platform fees — always.
            </p>
          </div>

          {/* SEARCH BAR */}
          <div style={styles.searchWrap}>
            <div style={styles.searchBox}>
              <svg style={styles.searchIcon} viewBox="0 0 20 20" fill="none">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by name, cause, or location…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={styles.searchInput}
              />
              {query && (
                <button style={styles.clearBtn} onClick={() => setQuery('')}>×</button>
              )}
            </div>
            <div style={styles.searchHint}>
              {filtered.length} verified campaign{filtered.length !== 1 ? 's' : ''}
              {debouncedQuery ? ` matching "${debouncedQuery}"` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.main}>

        {/* CATEGORY TABS */}
        <div style={styles.filterRow}>
          <div style={styles.catTabs}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`cat-tab${category === cat.id ? ' active' : ''}`}
                style={styles.catTab}
                onClick={() => setCategory(cat.id)}
              >
                <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                {cat.label}
                {cat.id !== 'all' && (
                  <span style={styles.catCount}>
                    {MOCK_CAMPAIGNS.filter(c => c.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* SORT */}
          <div style={styles.sortRow}>
            <span style={styles.sortLabel}>Sort:</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.id}
                className={`sort-opt${sort === opt.id ? ' active' : ''}`}
                style={styles.sortOpt}
                onClick={() => setSort(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS */}
        {loading ? (
          <div style={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState query={debouncedQuery} category={category} onClear={handleClear} />
        ) : (
          <>
            <div style={styles.grid}>
              {paginated.map((campaign, i) => (
                <CampaignCard key={campaign.id} campaign={campaign} index={i} />
              ))}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  className="page-btn"
                  style={styles.pageBtn}
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  ← Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn${page === p ? ' active' : ''}`}
                    style={styles.pageBtn}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="page-btn"
                  style={styles.pageBtn}
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* START CAMPAIGN CTA */}
        <div style={styles.ctaBand}>
          <div style={styles.ctaLeft}>
            <h3 style={styles.ctaTitle}>Don't see what you're looking for?</h3>
            <p style={styles.ctaSub}>Start your own campaign in under 15 minutes. Identity verified. Zero platform fees.</p>
          </div>
          <a href="/create" style={styles.ctaBtn}>Start a campaign — free</a>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span style={styles.footerLogo}>
            Every<span style={{ color: '#B7DEC9' }}>Giving</span>
          </span>
          <span style={styles.footerCopy}>© 2026 EveryGiving · Built in Ghana 🇬🇭 · ₵0 platform fee</span>
          <div style={styles.footerLinks}>
            <a href="/terms" style={styles.footerLink}>Terms</a>
            <a href="/privacy" style={styles.footerLink}>Privacy</a>
            <a href="/fees" style={styles.footerLink}>Fees</a>
          </div>
        </div>
      </footer>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  // NAV
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: 60, background: '#fff',
    borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 0, zIndex: 200,
    fontFamily: "'DM Sans', sans-serif",
  },
  navLogo: {
    fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1A1A18',
  },
  navLinks: { display: 'flex', gap: 4, alignItems: 'center' },
  navLink: {
    fontSize: 13, color: '#8A8A82', padding: '6px 12px', borderRadius: 6,
    transition: 'color .15s',
  },
  navDivider: { width: 1, height: 16, background: '#E8E4DC', margin: '0 6px' },
  navSignin: {
    fontSize: 13, fontWeight: 500, color: '#1A1A18', padding: '7px 14px',
    border: '1px solid #E8E4DC', borderRadius: 8,
  },
  navCta: {
    fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B',
    padding: '8px 18px', borderRadius: 8, marginLeft: 6,
  },

  // PAGE HEADER
  pageHeader: { background: '#1A1A18', padding: '56px 32px 48px' },
  pageHeaderInner: {
    maxWidth: 1100, margin: '0 auto',
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center',
  },
  headerMeta: {},
  eyebrow: {
    fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase',
    color: '#B7DEC9', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  pageTitle: {
    fontFamily: "'DM Serif Display', serif", fontSize: 42, lineHeight: 1.15,
    color: '#fff', marginBottom: 14,
  },
  pageSubtitle: { fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, maxWidth: 380 },

  // SEARCH
  searchWrap: {},
  searchBox: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#fff', borderRadius: 12, padding: '14px 16px',
    border: '1.5px solid transparent', marginBottom: 10,
  },
  searchIcon: { width: 18, height: 18, color: '#8A8A82', flexShrink: 0 },
  searchInput: {
    flex: 1, border: 'none', outline: 'none', fontSize: 15,
    fontFamily: "'DM Sans', sans-serif", color: '#1A1A18', background: 'transparent',
  },
  clearBtn: {
    background: 'none', border: 'none', fontSize: 18, color: '#8A8A82',
    cursor: 'pointer', lineHeight: 1, padding: '0 4px',
  },
  searchHint: { fontSize: 12, color: 'rgba(255,255,255,.4)', paddingLeft: 4 },

  // MAIN
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 32px 64px' },

  // FILTERS
  filterRow: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    gap: 16, marginBottom: 28, flexWrap: 'wrap',
  },
  catTabs: { display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 },
  catTab: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, fontWeight: 500, padding: '7px 14px',
    border: '0.5px solid #E8E4DC', borderRadius: 20,
    background: '#fff', color: '#4A4A44', cursor: 'pointer',
    transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
  },
  catCount: {
    fontSize: 10, fontWeight: 600, color: 'inherit', opacity: .6,
    background: 'rgba(0,0,0,.06)', padding: '1px 6px', borderRadius: 10,
  },
  sortRow: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  sortLabel: { fontSize: 12, color: '#8A8A82', marginRight: 2 },
  sortOpt: {
    fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 20,
    border: '0.5px solid #E8E4DC', background: '#fff', color: '#4A4A44',
    cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
    whiteSpace: 'nowrap',
  },

  // GRID
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20, marginBottom: 40,
  },

  // CARD
  card: {
    background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16,
    overflow: 'hidden', transition: 'all .2s', cursor: 'pointer',
  },
  cardImage: {
    height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', fontSize: 36,
  },
  verifiedBadge: {
    position: 'absolute', top: 10, right: 10, background: '#fff',
    borderRadius: 20, padding: '3px 8px', fontSize: 10, fontWeight: 700, color: '#0A6B4B',
  },
  urgencyBadge: {
    position: 'absolute', top: 10, left: 10, background: '#FEF3E2',
    borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700,
    color: '#B85C00', display: 'flex', alignItems: 'center', gap: 5,
  },
  urgencyDot: {
    width: 6, height: 6, borderRadius: '50%', background: '#B85C00',
    animation: 'pulse 1.5s infinite',
  },
  fundedBadge: {
    position: 'absolute', top: 10, left: 10, background: '#FEF3E2',
    borderRadius: 20, padding: '3px 9px', fontSize: 10, fontWeight: 700, color: '#B85C00',
  },
  cardBody: { padding: 16 },
  cardCategory: {
    fontSize: 10, fontWeight: 700, letterSpacing: '.07em',
    color: '#0A6B4B', marginBottom: 6,
  },
  cardTitle: {
    fontFamily: "'DM Serif Display', serif", fontSize: 15, lineHeight: 1.4,
    color: '#1A1A18', marginBottom: 7,
  },
  cardExcerpt: {
    fontSize: 12, color: '#8A8A82', lineHeight: 1.6, marginBottom: 10,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  cardOrganiser: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: '#8A8A82', marginBottom: 12,
  },
  organiserDot: {
    width: 20, height: 20, borderRadius: '50%', background: '#E8F5EF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700, color: '#0A6B4B', flexShrink: 0,
  },
  progressTrack: {
    height: 4, background: '#E8E4DC', borderRadius: 2,
    overflow: 'hidden', marginBottom: 8,
  },
  progressFill: {
    height: '100%', borderRadius: 2, transition: 'width .6s ease',
  },
  cardStats: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  cardRaised: { fontSize: 13, fontWeight: 600, color: '#1A1A18' },
  cardCta: {
    display: 'block', width: '100%', padding: '10px 0',
    background: '#0A6B4B', color: '#fff', textAlign: 'center',
    borderRadius: 8, fontSize: 13, fontWeight: 600,
    transition: 'background .15s', cursor: 'pointer',
  },

  // EMPTY STATE
  emptyState: {
    gridColumn: '1 / -1', textAlign: 'center',
    padding: '64px 32px', background: '#fff',
    border: '1.5px dashed #E8E4DC', borderRadius: 16,
  },
  emptyIcon: { fontSize: 40, marginBottom: 14 },
  emptyTitle: {
    fontFamily: "'DM Serif Display', serif", fontSize: 22,
    color: '#1A1A18', marginBottom: 8,
  },
  emptySub: { fontSize: 14, color: '#8A8A82', marginBottom: 20, lineHeight: 1.6 },
  emptyBtnPrimary: {
    fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B',
    padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  emptyBtnSecondary: {
    fontSize: 13, fontWeight: 500, color: '#0A6B4B',
    padding: '10px 20px', borderRadius: 8,
    border: '1px solid #0A6B4B', display: 'inline-block',
  },

  // PAGINATION
  pagination: {
    display: 'flex', gap: 6, justifyContent: 'center',
    alignItems: 'center', marginBottom: 48,
  },
  pageBtn: {
    fontSize: 13, fontWeight: 500, padding: '8px 14px',
    border: '0.5px solid #E8E4DC', borderRadius: 8,
    background: '#fff', color: '#4A4A44', cursor: 'pointer',
    transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
  },

  // BOTTOM CTA
  ctaBand: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#1A1A18', borderRadius: 16, padding: '28px 32px',
    gap: 24, flexWrap: 'wrap',
  },
  ctaLeft: {},
  ctaTitle: {
    fontFamily: "'DM Serif Display', serif", fontSize: 20,
    color: '#fff', marginBottom: 4,
  },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 },
  ctaBtn: {
    fontSize: 14, fontWeight: 600, color: '#fff', background: '#0A6B4B',
    padding: '12px 24px', borderRadius: 10, whiteSpace: 'nowrap',
    transition: 'background .15s',
  },

  // FOOTER
  footer: { background: '#1A1A18', borderTop: '1px solid rgba(255,255,255,.06)', padding: '24px 32px' },
  footerInner: {
    maxWidth: 1100, margin: '0 auto',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 10,
  },
  footerLogo: { fontFamily: "'DM Serif Display', serif", fontSize: 16, color: '#fff' },
  footerCopy: { fontSize: 12, color: 'rgba(255,255,255,.3)' },
  footerLinks: { display: 'flex', gap: 14 },
  footerLink: { fontSize: 12, color: 'rgba(255,255,255,.3)' },
};
