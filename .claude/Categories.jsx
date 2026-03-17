/**
 * EveryGiving — Fundraising Categories Page
 * Route: /fundraising-categories
 *
 * Sections:
 * 1. Hero — headline + category count
 * 2. Category grid — all 17 categories as rich cards
 * 3. Featured category spotlight — rotates on click
 * 4. Tips by category — what works for each type
 * 5. CTA band
 *
 * Each category card links to /campaigns?category=slug
 *
 * Usage:
 *   // app/fundraising-categories/page.js
 *   import Categories from '@/components/Categories';
 *   export default function Page() { return <Categories />; }
 */

'use client';

import { useState } from 'react';

// ─── CATEGORY DATA ────────────────────────────────────────────────────────────

export const CATEGORIES = [
  {
    id: 'medical',
    label: 'Medical',
    emoji: '🫀',
    gradient: 'linear-gradient(135deg,#1B4332,#52B788)',
    color: '#E1F5EE',
    accent: '#0A6B4B',
    count: 3,
    avgGoal: '₵18,000',
    successRate: '78%',
    desc: 'Surgery, treatment, medication, hospital bills, and post-operative care.',
    tip: 'Lead with a real photo of the patient. Name, age, and one personal detail in the first sentence. State the exact cost and the deadline — surgery scheduled for [date] is the most powerful urgency signal.',
    examples: ['Kidney surgery at Korle Bu', 'Cancer treatment abroad', 'Post-accident physiotherapy', 'Child with heart condition'],
  },
  {
    id: 'education',
    label: 'Education',
    emoji: '📚',
    gradient: 'linear-gradient(135deg,#5C3317,#A0522D)',
    color: '#FEF3E2',
    accent: '#B85C00',
    count: 2,
    avgGoal: '₵8,500',
    successRate: '82%',
    desc: 'University fees, school supplies, exam registration, scholarships, and study abroad.',
    tip: 'Donors respond to academic achievement — include the school name, the course, and what the student had to do to earn their place. "She passed with distinction" is more powerful than "she needs help with fees."',
    examples: ['First-year university fees', 'WASSCE exam registration', 'Nursing school tuition', 'School supplies for a class'],
  },
  {
    id: 'emergency',
    label: 'Emergency',
    emoji: '🚨',
    gradient: 'linear-gradient(135deg,#922B21,#C0392B)',
    color: '#FCEBEB',
    accent: '#A32D2D',
    count: 1,
    avgGoal: '₵7,000',
    successRate: '71%',
    desc: 'Fire, flood, accident, sudden job loss, theft, and disaster recovery.',
    tip: 'Urgency is built into emergency campaigns — lean into it honestly. Show the before-and-after: what was there before, what was lost. A photo of the damage raises more than any amount of text.',
    examples: ['House fire recovery', 'Flood damage repairs', 'Road accident costs', 'Sudden job loss'],
  },
  {
    id: 'faith',
    label: 'Faith',
    emoji: '⛪',
    gradient: 'linear-gradient(135deg,#2C3E50,#4A6FA5)',
    color: '#E6F1FB',
    accent: '#185FA5',
    count: 2,
    avgGoal: '₵32,000',
    successRate: '88%',
    desc: 'Church roofs, mosque repairs, religious events, community worship spaces.',
    tip: 'Faith campaigns have the highest success rate on EveryGiving because the community is already gathered. Share the campaign in every WhatsApp group, every Sunday. Congregation campaigns reach 30% in 48 hours more often than any other category.',
    examples: ['Church roof replacement', 'Mosque renovation', 'Religious retreat centre', 'Sound system for worship'],
  },
  {
    id: 'community',
    label: 'Community',
    emoji: '🏘️',
    gradient: 'linear-gradient(135deg,#1A5276,#2E86C1)',
    color: '#EBF5FB',
    accent: '#1A5276',
    count: 2,
    avgGoal: '₵28,000',
    successRate: '74%',
    desc: 'Boreholes, community centres, market repairs, street lighting, shared infrastructure.',
    tip: 'Community campaigns succeed when they show collective ownership. Even a small contribution from community members themselves — ₵5 each — signals legitimacy and creates accountability. Diaspora donors give heavily to community infrastructure projects.',
    examples: ['Clean water borehole', 'Community centre roof', 'Market stall renovation', 'Solar street lights'],
  },
  {
    id: 'funeral',
    label: 'Funeral',
    emoji: '🕊️',
    gradient: 'linear-gradient(135deg,#4A235A,#7D3C98)',
    color: '#EEEDFE',
    accent: '#534AB7',
    count: 1,
    avgGoal: '₵6,500',
    successRate: '85%',
    desc: 'Funeral costs, burial expenses, repatriation, and bereavement support for families.',
    tip: 'Funeral campaigns move fast because the need is immediate and time-bound. Share within hours of launching, not days. Honour the person who passed — their life, their contribution to the community — not just the cost.',
    examples: ['Funeral and burial costs', 'Body repatriation from abroad', 'Bereavement family support', 'Memorial service'],
  },
  {
    id: 'family',
    label: 'Family',
    emoji: '👨‍👩‍👧',
    gradient: 'linear-gradient(135deg,#117A65,#1ABC9C)',
    color: '#E8F8F5',
    accent: '#117A65',
    count: 1,
    avgGoal: '₵5,000',
    successRate: '68%',
    desc: 'Supporting families through hardship — poverty, food insecurity, housing, childcare.',
    tip: 'Family campaigns need a specific person at the centre. "Help the Mensah family" is weak. "Help Ama Mensah feed her three children after losing her husband" is strong. Specificity creates empathy.',
    examples: ['Single parent support', 'Housing after eviction', 'Food assistance for family', 'Childcare while parent recovers'],
  },
  {
    id: 'sports',
    label: 'Sports',
    emoji: '⚽',
    gradient: 'linear-gradient(135deg,#7D6608,#F1C40F)',
    color: '#FEFDE7',
    accent: '#7D6608',
    count: 0,
    avgGoal: '₵12,000',
    successRate: '61%',
    desc: 'Athletes, youth sports teams, equipment, travel to competitions, training costs.',
    tip: 'Sports campaigns work best when donors feel they\'re investing in potential, not charity. Show achievements: league table position, tournament wins, what reaching this competition means. Video updates of training sessions convert extremely well.',
    examples: ['National youth team travel', 'Athletic equipment', 'Training camp fees', 'Sports scholarship support'],
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    emoji: '🙌',
    gradient: 'linear-gradient(135deg,#2E4057,#048A81)',
    color: '#E0F7F5',
    accent: '#048A81',
    count: 0,
    avgGoal: '₵9,000',
    successRate: '64%',
    desc: 'NGO projects, volunteer programmes, social impact initiatives, and community service.',
    tip: 'Volunteer campaigns struggle when they sound vague. Be specific about the output: "We will build 20 desks for 3 schools in the Northern Region." Donors want to fund a concrete outcome, not an organisation.',
    examples: ['NGO school building project', 'Community health screening', 'Youth mentorship programme', 'Environmental cleanup'],
  },
  {
    id: 'business',
    label: 'Business',
    emoji: '🏪',
    gradient: 'linear-gradient(135deg,#1B2631,#2C3E50)',
    color: '#EAECEE',
    accent: '#2C3E50',
    count: 0,
    avgGoal: '₵15,000',
    successRate: '48%',
    desc: 'Small business startup, equipment purchase, market stall, trade expansion.',
    tip: 'Business campaigns face the highest scepticism in Ghana — be aware of the "begging" perception. Frame it as investment, not charity. Show your trading history, existing customers, and exactly what the equipment will enable you to produce or sell.',
    examples: ['Market stall equipment', 'Sewing machine for tailoring', 'Small farm irrigation', 'Kiosk startup capital'],
  },
  {
    id: 'wedding',
    label: 'Wedding',
    emoji: '💍',
    gradient: 'linear-gradient(135deg,#922B21,#E74C3C)',
    color: '#FDEDEC',
    accent: '#922B21',
    count: 0,
    avgGoal: '₵8,000',
    successRate: '55%',
    desc: 'Traditional and church wedding costs, bride price, reception, and celebrations.',
    tip: 'Wedding campaigns succeed when the community is directly involved in sharing. Asking family members and friends to each contribute ₵50–₵200 feels natural in Ghanaian culture — it\'s a digital version of the traditional contribution envelope.',
    examples: ['Traditional wedding support', 'Church reception costs', 'Wedding attire', 'Bride price assistance'],
  },
  {
    id: 'memorial',
    label: 'Memorial',
    emoji: '🕯️',
    gradient: 'linear-gradient(135deg,#616A6B,#839192)',
    color: '#F2F3F4',
    accent: '#5D6D7E',
    count: 0,
    avgGoal: '₵4,500',
    successRate: '79%',
    desc: 'One-year memorials, tombstones, memorial plaques, and remembrance events.',
    tip: 'Memorial campaigns are deeply personal. Tell the story of the person being remembered — what they meant to their community, what they built, who they loved. The memorial is not the point; the person is.',
    examples: ['One-year anniversary event', 'Tombstone inscription', 'Memorial scholarship fund', 'Remembrance gathering'],
  },
  {
    id: 'animals',
    label: 'Animals',
    emoji: '🐾',
    gradient: 'linear-gradient(135deg,#7D3C98,#A569BD)',
    color: '#F5EEF8',
    accent: '#7D3C98',
    count: 0,
    avgGoal: '₵3,500',
    successRate: '52%',
    desc: 'Veterinary care, animal shelters, rescue operations, and livestock support for farmers.',
    tip: 'Animal campaigns resonate most when tied to a human story — a farmer whose livelihood depends on their livestock, or a child whose pet needs urgent care. Pure animal welfare campaigns are newer to Ghana\'s giving culture.',
    examples: ['Livestock veterinary care', 'Animal rescue shelter', 'Farm animal feed support', 'Pet emergency surgery'],
  },
  {
    id: 'arts',
    label: 'Arts & Culture',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg,#6C3483,#9B59B6)',
    color: '#F4ECF7',
    accent: '#6C3483',
    count: 0,
    avgGoal: '₵11,000',
    successRate: '58%',
    desc: 'Music albums, film production, art exhibitions, cultural events, and creative projects.',
    tip: 'Arts campaigns need to show the work, not just describe it. A 60-second video clip, a sample track, a sketch of the exhibition — donors want proof of the creator\'s ability before they invest. Crowdfunding an arts project is crowdfunding the artist.',
    examples: ['Music album recording', 'Short film production', 'Art exhibition costs', 'Cultural festival funding'],
  },
  {
    id: 'environment',
    label: 'Environment',
    emoji: '🌱',
    gradient: 'linear-gradient(135deg,#1E8449,#27AE60)',
    color: '#E9F7EF',
    accent: '#1E8449',
    count: 0,
    avgGoal: '₵20,000',
    successRate: '55%',
    desc: 'Tree planting, environmental clean-ups, renewable energy, and climate projects.',
    tip: 'Environmental campaigns win when they show local, visible impact. "Plant 500 trees in Kumasi by December" outperforms "fight climate change." Diaspora donors give heavily to environmental projects — make the international sharing easy.',
    examples: ['Tree planting initiative', 'Solar energy for rural school', 'Beach clean-up', 'Organic farming startup'],
  },
  {
    id: 'technology',
    label: 'Technology',
    emoji: '💻',
    gradient: 'linear-gradient(135deg,#1A237E,#3949AB)',
    color: '#E8EAF6',
    accent: '#1A237E',
    count: 0,
    avgGoal: '₵14,000',
    successRate: '50%',
    desc: 'Coding bootcamps, laptops for students, tech education, digital skills training.',
    tip: 'Technology campaigns need to overcome the perception that digital skills are a luxury. Frame access to technology as access to economic opportunity — "this laptop means Kwame can compete for the same jobs as students in Accra."',
    examples: ['Laptop for university student', 'Coding bootcamp fees', 'Tech lab for rural school', 'Digital skills training'],
  },
  {
    id: 'other',
    label: 'Other',
    emoji: '✨',
    gradient: 'linear-gradient(135deg,#424949,#717D7E)',
    color: '#F2F3F4',
    accent: '#424949',
    count: 0,
    avgGoal: '₵8,000',
    successRate: '55%',
    desc: 'Any cause that doesn\'t fit neatly into another category — every need matters.',
    tip: 'If your campaign doesn\'t fit any other category, choose this one. Write your story clearly and honestly — donors respond to genuine need, not category labels. The most important thing is that your story is specific, personal, and honest.',
    examples: ['Travel for family emergency', 'Legal fees support', 'Disability equipment', 'Unique personal circumstances'],
  },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Categories() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = CATEGORIES.filter(c =>
    !search || c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.desc.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCat = selected ? CATEGORIES.find(c => c.id === selected) : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        @keyframes fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .cat-card{cursor:pointer;transition:all .18s}
        .cat-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.1)}
        .cat-card.active{box-shadow:0 0 0 3px #0A6B4B, 0 12px 32px rgba(10,107,75,.15) !important;transform:translateY(-4px)}
        .search-input:focus{outline:none;border-color:#0A6B4B}
        .spotlight{animation:fadeup .3s ease both}
        input:focus{outline:none}
      `}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <a href="/" style={s.navLogo}>Every<span style={{ color: '#0A6B4B' }}>Giving</span></a>
        <div style={s.navR}>
          <a href="/campaigns" style={s.navLink}>Browse</a>
          <a href="/how-it-works" style={s.navLink}>How it works</a>
          <a href="/fundraising-categories" style={{ ...s.navLink, color: '#0A6B4B', fontWeight: 600 }}>Categories</a>
          <div style={s.navDiv} />
          <a href="/auth/login" style={s.navSignin}>Sign in</a>
          <a href="/create" style={s.navCta}>Start a campaign</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.eyebrow}>All categories</div>
          <h1 style={s.heroTitle}>
            Every cause<br />
            <em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>deserves to be funded</em>
          </h1>
          <p style={s.heroSub}>
            EveryGiving supports {CATEGORIES.length} categories of fundraising — from medical
            emergencies to community boreholes. Find your cause or start your own.
          </p>
          <div style={s.heroStats}>
            {[
              { n: CATEGORIES.length, l: 'Categories supported' },
              { n: CATEGORIES.filter(c => c.count > 0).length, l: 'With live campaigns' },
              { n: `${Math.round(CATEGORIES.reduce((a, c) => a + parseFloat(c.successRate), 0) / CATEGORIES.length)}%`, l: 'Avg success rate' },
            ].map((stat, i) => (
              <div key={i} style={s.heroStat}>
                <div style={s.heroStatN}>{stat.n}</div>
                <div style={s.heroStatL}>{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={s.main}>

        {/* SEARCH + COUNT */}
        <div style={s.searchRow}>
          <div style={s.searchWrap}>
            <svg style={s.searchIcon} viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={s.searchInput}
            />
            {search && (
              <button style={s.clearBtn} onClick={() => setSearch('')}>×</button>
            )}
          </div>
          <div style={s.countLabel}>
            {filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'}
            {search ? ` matching "${search}"` : ''}
          </div>
        </div>

        {/* CATEGORY GRID */}
        <div style={s.catGrid}>
          {filtered.map(cat => (
            <div
              key={cat.id}
              className={`cat-card${selected === cat.id ? ' active' : ''}`}
              style={s.catCard}
              onClick={() => setSelected(selected === cat.id ? null : cat.id)}
            >
              {/* Image area */}
              <div style={{ ...s.catImgArea, background: cat.gradient }}>
                <span style={{ fontSize: 36 }}>{cat.emoji}</span>
                {cat.count > 0 && (
                  <div style={s.liveBadge}>
                    <span style={s.liveDot} />
                    {cat.count} live
                  </div>
                )}
              </div>

              {/* Body */}
              <div style={s.catBody}>
                <div style={s.catLabel}>{cat.label}</div>
                <p style={s.catDesc}>{cat.desc}</p>
                <div style={s.catMeta}>
                  <div style={s.catMetaItem}>
                    <div style={s.catMetaN}>{cat.avgGoal}</div>
                    <div style={s.catMetaL}>avg goal</div>
                  </div>
                  <div style={s.catMetaItem}>
                    <div style={{ ...s.catMetaN, color: parseFloat(cat.successRate) >= 75 ? '#0A6B4B' : parseFloat(cat.successRate) >= 60 ? '#B85C00' : '#8A8A82' }}>
                      {cat.successRate}
                    </div>
                    <div style={s.catMetaL}>success rate</div>
                  </div>
                </div>
                <a
                  href={`/campaigns?category=${cat.id}`}
                  style={s.catBrowseBtn}
                  onClick={e => e.stopPropagation()}
                >
                  Browse {cat.label} →
                </a>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={s.emptyState}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div>
              <h3 style={s.emptyTitle}>No categories match "{search}"</h3>
              <p style={s.emptySub}>Try a broader search or browse all categories.</p>
              <button style={s.emptyBtn} onClick={() => setSearch('')}>Show all categories</button>
            </div>
          )}
        </div>

        {/* SPOTLIGHT — shown when a category is selected */}
        {selectedCat && (
          <div className="spotlight" key={selectedCat.id} style={{ ...s.spotlight, borderColor: selectedCat.accent + '40' }}>
            <div style={s.spotlightHeader}>
              <div style={{ ...s.spotlightEmoji, background: selectedCat.gradient }}>
                {selectedCat.emoji}
              </div>
              <div style={s.spotlightMeta}>
                <div style={{ ...s.spotlightCat, color: selectedCat.accent }}>{selectedCat.label}</div>
                <h3 style={s.spotlightTitle}>Tips for a successful {selectedCat.label.toLowerCase()} campaign</h3>
              </div>
              <button style={s.spotlightClose} onClick={() => setSelected(null)}>×</button>
            </div>

            <div style={s.spotlightGrid}>
              <div style={s.spotlightLeft}>
                <div style={s.spotlightTipLabel}>What works</div>
                <p style={s.spotlightTip}>{selectedCat.tip}</p>
                <div style={{ marginTop: 20 }}>
                  <div style={s.spotlightTipLabel}>Example campaigns</div>
                  <div style={s.examplesList}>
                    {selectedCat.examples.map((ex, i) => (
                      <div key={i} style={s.exampleItem}>
                        <div style={{ ...s.exampleDot, background: selectedCat.accent }} />
                        <span>{ex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={s.spotlightRight}>
                <div style={{ ...s.spotlightStatCard, background: selectedCat.color }}>
                  <div style={{ ...s.sStatN, color: selectedCat.accent }}>{selectedCat.avgGoal}</div>
                  <div style={{ ...s.sStatL, color: selectedCat.accent + 'BB' }}>average campaign goal</div>
                </div>
                <div style={{ ...s.spotlightStatCard, background: selectedCat.color }}>
                  <div style={{ ...s.sStatN, color: selectedCat.accent }}>{selectedCat.successRate}</div>
                  <div style={{ ...s.sStatL, color: selectedCat.accent + 'BB' }}>campaign success rate</div>
                </div>
                <a
                  href={`/create?category=${selectedCat.id}`}
                  style={{ ...s.spotlightCTA, background: selectedCat.accent }}
                >
                  Start a {selectedCat.label.toLowerCase()} campaign →
                </a>
                <a
                  href={`/campaigns?category=${selectedCat.id}`}
                  style={{ ...s.spotlightBrowse, color: selectedCat.accent, borderColor: selectedCat.accent + '40' }}
                >
                  Browse {selectedCat.label} campaigns →
                </a>
              </div>
            </div>
          </div>
        )}

        {/* START A CAMPAIGN CTA */}
        <div style={s.ctaBand}>
          <div>
            <h3 style={s.ctaBandTitle}>Don't see your cause?</h3>
            <p style={s.ctaBandSub}>Every need is valid. If your campaign doesn't fit a category perfectly, choose the closest one and tell your story honestly.</p>
          </div>
          <a href="/create" style={s.ctaBandBtn}>Start a campaign — free</a>
        </div>

      </div>

      {/* CTA SECTION */}
      <div style={s.ctaSection}>
        <div style={s.ctaSectionInner}>
          <div style={s.eyebrow}>Ready to raise?</div>
          <h2 style={s.ctaSectionTitle}>
            Whatever your cause —<br />
            <em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>EveryGiving is built for it</em>
          </h2>
          <p style={s.ctaSectionSub}>
            Identity verified. Milestone-protected. Zero platform fees.
            Mobile money from day one.
          </p>
          <div style={s.ctaActions}>
            <a href="/create" style={s.ctaBtnP}>Start a campaign — free</a>
            <a href="/campaigns" style={s.ctaBtnS}>Browse live campaigns</a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <span style={s.footerLogo}>Every<span style={{ color: '#B7DEC9' }}>Giving</span></span>
          <span style={s.footerCopy}>© 2026 EveryGiving · Built in Ghana 🇬🇭 · ₵0 platform fee</span>
          <div style={s.footerLinks}>
            {['Terms', 'Privacy', 'Fees', 'Contact'].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} style={s.footerLink}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s = {
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:60, background:'#fff', borderBottom:'1px solid #E8E4DC', position:'sticky', top:0, zIndex:200, fontFamily:"'DM Sans',sans-serif" },
  navLogo: { fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18' },
  navR: { display:'flex', gap:4, alignItems:'center' },
  navLink: { fontSize:13, color:'#8A8A82', padding:'6px 12px', borderRadius:6 },
  navDiv: { width:1, height:16, background:'#E8E4DC', margin:'0 6px' },
  navSignin: { fontSize:13, fontWeight:500, color:'#1A1A18', padding:'7px 14px', border:'1px solid #E8E4DC', borderRadius:8 },
  navCta: { fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'8px 18px', borderRadius:8, marginLeft:6 },

  hero: { background:'#1A1A18', padding:'0 32px' },
  heroInner: { maxWidth:1100, margin:'0 auto', padding:'64px 0', textAlign:'center' },
  eyebrow: { fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'#B7DEC9', marginBottom:12 },
  heroTitle: { fontFamily:"'DM Serif Display',serif", fontSize:44, lineHeight:1.1, color:'#fff', marginBottom:14 },
  heroSub: { fontSize:15, color:'rgba(255,255,255,.5)', lineHeight:1.75, maxWidth:520, margin:'0 auto 36px' },
  heroStats: { display:'flex', gap:40, justifyContent:'center', flexWrap:'wrap' },
  heroStat: { textAlign:'center' },
  heroStatN: { fontFamily:"'DM Serif Display',serif", fontSize:32, color:'#B7DEC9', lineHeight:1, marginBottom:4 },
  heroStatL: { fontSize:12, color:'rgba(255,255,255,.4)' },

  main: { maxWidth:1100, margin:'0 auto', padding:'36px 32px 64px' },

  searchRow: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, marginBottom:28, flexWrap:'wrap' },
  searchWrap: { display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid #E8E4DC', borderRadius:10, padding:'10px 14px', flex:1, maxWidth:360 },
  searchIcon: { width:16, height:16, color:'#8A8A82', flexShrink:0 },
  searchInput: { flex:1, border:'none', outline:'none', fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'#1A1A18', background:'transparent' },
  clearBtn: { background:'none', border:'none', fontSize:16, color:'#8A8A82', cursor:'pointer', padding:'0 2px', lineHeight:1 },
  countLabel: { fontSize:13, color:'#8A8A82' },

  catGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:16, marginBottom:28 },
  catCard: { background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden' },
  catImgArea: { height:120, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', fontSize:36 },
  liveBadge: { position:'absolute', bottom:8, left:8, background:'rgba(10,107,75,.9)', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:4 },
  liveDot: { width:5, height:5, borderRadius:'50%', background:'#52B788', animation:'pulse 1.5s infinite' },
  catBody: { padding:'14px 14px 16px' },
  catLabel: { fontFamily:"'DM Serif Display',serif", fontSize:16, color:'#1A1A18', marginBottom:5 },
  catDesc: { fontSize:12, color:'#8A8A82', lineHeight:1.6, marginBottom:12, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' },
  catMeta: { display:'flex', gap:16, marginBottom:12 },
  catMetaItem: {},
  catMetaN: { fontSize:13, fontWeight:700, color:'#1A1A18', lineHeight:1 },
  catMetaL: { fontSize:10, color:'#8A8A82', marginTop:2 },
  catBrowseBtn: { fontSize:12, fontWeight:600, color:'#0A6B4B', background:'#E8F5EF', padding:'7px 12px', borderRadius:7, display:'block', textAlign:'center', transition:'background .15s' },

  emptyState: { gridColumn:'1/-1', textAlign:'center', padding:'48px 24px', background:'#fff', border:'1.5px dashed #E8E4DC', borderRadius:14 },
  emptyTitle: { fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18', marginBottom:6 },
  emptySub: { fontSize:13, color:'#8A8A82', marginBottom:16 },
  emptyBtn: { fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'9px 18px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },

  spotlight: { background:'#fff', border:'1.5px solid', borderRadius:16, padding:'28px 24px', marginBottom:24 },
  spotlightHeader: { display:'flex', alignItems:'flex-start', gap:14, marginBottom:24 },
  spotlightEmoji: { width:52, height:52, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 },
  spotlightMeta: { flex:1 },
  spotlightCat: { fontSize:11, fontWeight:600, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:4 },
  spotlightTitle: { fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18', lineHeight:1.3 },
  spotlightClose: { background:'none', border:'none', fontSize:22, color:'#8A8A82', cursor:'pointer', padding:'0 4px', lineHeight:1, flexShrink:0 },
  spotlightGrid: { display:'grid', gridTemplateColumns:'1fr 240px', gap:32, alignItems:'start' },
  spotlightLeft: {},
  spotlightTipLabel: { fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'#8A8A82', marginBottom:8 },
  spotlightTip: { fontSize:13, color:'#4A4A44', lineHeight:1.8 },
  examplesList: { display:'flex', flexDirection:'column', gap:6 },
  exampleItem: { display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#4A4A44' },
  exampleDot: { width:5, height:5, borderRadius:'50%', flexShrink:0 },
  spotlightRight: { display:'flex', flexDirection:'column', gap:10 },
  spotlightStatCard: { borderRadius:12, padding:'16px' },
  sStatN: { fontFamily:"'DM Serif Display',serif", fontSize:28, lineHeight:1, marginBottom:4 },
  sStatL: { fontSize:12 },
  spotlightCTA: { display:'block', padding:'11px 16px', color:'#fff', borderRadius:9, fontSize:13, fontWeight:600, textAlign:'center', border:'none', cursor:'pointer' },
  spotlightBrowse: { display:'block', padding:'10px 16px', borderRadius:9, fontSize:13, fontWeight:500, textAlign:'center', border:'1px solid', background:'transparent' },

  ctaBand: { background:'#1A1A18', borderRadius:14, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap', marginBottom:0 },
  ctaBandTitle: { fontFamily:"'DM Serif Display',serif", fontSize:18, color:'#fff', marginBottom:4 },
  ctaBandSub: { fontSize:13, color:'rgba(255,255,255,.45)', lineHeight:1.6, maxWidth:480 },
  ctaBandBtn: { fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'10px 22px', borderRadius:8, whiteSpace:'nowrap' },

  ctaSection: { background:'#0A6B4B', padding:'64px 32px', textAlign:'center' },
  ctaSectionInner: { maxWidth:600, margin:'0 auto' },
  ctaSectionTitle: { fontFamily:"'DM Serif Display',serif", fontSize:38, color:'#fff', margin:'10px 0 14px', lineHeight:1.15 },
  ctaSectionSub: { fontSize:15, color:'rgba(255,255,255,.6)', lineHeight:1.75, marginBottom:28 },
  ctaActions: { display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' },
  ctaBtnP: { fontSize:14, fontWeight:600, color:'#0A6B4B', background:'#fff', padding:'12px 24px', borderRadius:10 },
  ctaBtnS: { fontSize:14, fontWeight:500, color:'rgba(255,255,255,.75)', background:'transparent', padding:'12px 24px', borderRadius:10, border:'1px solid rgba(255,255,255,.3)' },

  footer: { background:'#1A1A18', borderTop:'1px solid rgba(255,255,255,.06)', padding:'24px 32px' },
  footerInner: { maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 },
  footerLogo: { fontFamily:"'DM Serif Display',serif", fontSize:16, color:'#fff' },
  footerCopy: { fontSize:12, color:'rgba(255,255,255,.3)' },
  footerLinks: { display:'flex', gap:14 },
  footerLink: { fontSize:12, color:'rgba(255,255,255,.3)' },
};
