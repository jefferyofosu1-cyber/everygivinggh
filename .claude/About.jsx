/**
 * EveryGiving — About Page
 * Route: /about
 *
 * Sections:
 * 1. Hero — mission statement, origin story
 * 2. The problem we're solving — why Ghana needed this
 * 3. What makes us different — four pillars
 * 4. Our values — social enterprise commitments
 * 5. By the numbers — impact stats
 * 6. The team — founders and core members
 * 7. Built in Ghana — local pride section
 * 8. Investors & partners
 * 9. CTA band
 *
 * Usage:
 *   // app/about/page.js
 *   import About from '@/components/About';
 *   export default function Page() { return <About />; }
 */

'use client';

import { useState } from 'react';

// ─── DATA ─────────────────────────────────────────────────────────────────────

const STATS = [
  { n: '₵0', label: 'Platform fee — forever', sub: 'We never charge campaigners to create or publish' },
  { n: '24hr', label: 'Verification turnaround', sub: 'Typical time from ID submission to campaign live' },
  { n: '3×', label: 'More raised — verified', sub: 'Verified campaigns raise 3× more than unverified ones' },
  { n: '100%', label: 'Campaigns verified', sub: 'Every single live campaign has been identity-checked' },
];

const VALUES = [
  {
    title: 'Dignity over charity',
    body: 'We believe asking for help should never feel shameful. EveryGiving is designed so campaigners can tell their story with pride — and donors can give in a way that honours the person receiving.',
    color: '#E1F5EE', accent: '#0A6B4B', icon: '🤝',
  },
  {
    title: 'Radical transparency',
    body: 'We publish our fee structure publicly, show donors exactly how milestones work, and never release funds without proof. If donors can\'t see where their money goes, they won\'t give it.',
    color: '#E6F1FB', accent: '#185FA5', icon: '🔍',
  },
  {
    title: 'Community before scale',
    body: 'We will not grow fast at the expense of trust. Every campaign we verify, every payout we release, every update we prompt — these are promises to the communities that depend on us.',
    color: '#FAEEDA', accent: '#B85C00', icon: '🌍',
  },
  {
    title: 'Built for everyone',
    body: 'Not just for smartphone users in Accra. Feature phone support via USSD, same-day MoMo payouts, diaspora corridors — EveryGiving works for every Ghanaian, wherever they are.',
    color: '#EEEDFE', accent: '#534AB7', icon: '📱',
  },
];

const TEAM = [
  {
    initials: 'KA', name: 'Kwame Asante', role: 'Founder & CEO',
    bio: 'Former fintech engineer who built payment systems across West Africa. Returned to Ghana after 8 years abroad to build the platform he wished had existed when his family needed it.',
    location: 'Accra',
  },
  {
    initials: 'AO', name: 'Ama Osei', role: 'Co-Founder & Head of Trust',
    bio: 'Spent 6 years in community development across the Northern and Volta Regions. Designed the verification and milestone systems that make EveryGiving trusted by donors.',
    location: 'Accra',
  },
  {
    initials: 'ET', name: 'Emmanuel Tetteh', role: 'Head of Engineering',
    bio: 'Full-stack engineer with deep experience in MoMo API integrations. Built the payment layer connecting Paystack, Hubtel, and Zeepay into one seamless experience.',
    location: 'Accra',
  },
  {
    initials: 'GB', name: 'Grace Boateng', role: 'Head of Community',
    bio: 'Leads campaign support and verification. Former NGO programme manager who brought operational discipline to the campaign review process.',
    location: 'Kumasi',
  },
];

const PARTNERS = [
  { name: 'Paystack', role: 'Local MoMo & card payments', color: '#00C3F7' },
  { name: 'Hubtel', role: 'USSD & checkout', color: '#FF6600' },
  { name: 'Zeepay', role: 'Diaspora remittance', color: '#1A3C8F' },
];

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function About() {
  const [activeValue, setActiveValue] = useState(0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        @keyframes fadeup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .val-card{cursor:pointer;transition:all .15s}
        .val-card:hover{transform:translateY(-2px)}
        .team-card:hover{box-shadow:0 10px 28px rgba(0,0,0,.07);transform:translateY(-2px)}
      `}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <a href="/" style={s.navLogo}>Every<span style={{ color: '#0A6B4B' }}>Giving</span></a>
        <div style={s.navR}>
          <a href="/campaigns" style={s.navLink}>Browse</a>
          <a href="/how-it-works" style={s.navLink}>How it works</a>
          <a href="/about" style={{ ...s.navLink, color: '#0A6B4B', fontWeight: 600 }}>About</a>
          <div style={s.navDiv} />
          <a href="/auth/login" style={s.navSignin}>Sign in</a>
          <a href="/create" style={s.navCta}>Start a campaign</a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <div style={s.eyebrow}>Our story</div>
            <h1 style={s.heroTitle}>
              Ghana deserved a<br />
              <em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>better way to give</em>
            </h1>
            <p style={s.heroBody}>
              EveryGiving was built because the platforms that existed weren't built
              for Ghana. No MoMo. No Ghana Card verification. No milestone payouts.
              No understanding of how Ghanaians actually give and receive.
            </p>
            <p style={{ ...s.heroBody, marginBottom: 0 }}>
              We built the platform we wished had existed when our own families needed it.
              Identity-verified. Mobile money first. Milestone-protected. Zero platform fees — always.
            </p>
          </div>
          <div style={s.heroRight}>
            <div style={s.heroQuote}>
              <div style={s.quoteMarks}>"</div>
              <div style={s.quoteText}>
                Asking for help should never feel shameful.
                EveryGiving exists so every Ghanaian can raise
                money with dignity — and every donor can give
                with confidence.
              </div>
              <div style={s.quoteAuthor}>
                <div style={s.quoteAvatar}>KA</div>
                <div>
                  <div style={s.quoteName}>Kwame Asante</div>
                  <div style={s.quoteRole}>Founder, EveryGiving</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── THE PROBLEM ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC' }}>
        <div style={s.sectionInner}>
          <div style={{ padding: '72px 0' }}>
            <div style={s.sectionEyebrow}>Why we exist</div>
            <h2 style={s.sectionTitle}>Ghana had a crowdfunding problem</h2>
            <div style={s.problemGrid}>
              {[
                {
                  before: 'Global platforms like GoFundMe don\'t support MoMo',
                  after: 'EveryGiving is built MoMo-first from day one — MTN, Vodafone, AirtelTigo',
                },
                {
                  before: 'No identity verification — donors couldn\'t trust who they were giving to',
                  after: 'Every campaigner submits a Ghana Card, reviewed by our team before going live',
                },
                {
                  before: 'Funds released all at once — nothing stopped misuse',
                  after: 'Milestone-based payouts: funds released only when proof is submitted and verified',
                },
                {
                  before: 'Diaspora Ghanaians had no easy way to donate back home',
                  after: 'Zeepay integration: GBP, USD, EUR → GHS MoMo same day',
                },
              ].map((item, i) => (
                <div key={i} style={s.problemCard}>
                  <div style={s.problemBefore}>
                    <span style={s.problemX}>✕</span>
                    <span style={s.problemBeforeText}>{item.before}</span>
                  </div>
                  <div style={s.problemArrow}>→</div>
                  <div style={s.problemAfter}>
                    <span style={s.problemCheck}>✓</span>
                    <span style={s.problemAfterText}>{item.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ background: '#1A1A18', padding: '0 32px' }}>
        <div style={{ ...s.sectionInner, padding: '64px 0' }}>
          <div style={s.statsGrid}>
            {STATS.map((stat, i) => (
              <div key={i} style={s.statCard}>
                <div style={s.statN}>{stat.n}</div>
                <div style={s.statLabel}>{stat.label}</div>
                <div style={s.statSub}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── VALUES ── */}
      <div style={{ padding: '0 32px' }}>
        <div style={{ ...s.sectionInner, padding: '72px 0' }}>
          <div style={s.sectionEyebrow}>What we believe</div>
          <h2 style={s.sectionTitle}>Our values — not a poster, a practice</h2>
          <p style={s.sectionSub}>
            Every product decision at EveryGiving is tested against these four commitments.
            If a feature violates one of them, we don't build it.
          </p>
          <div style={s.valuesGrid}>
            {VALUES.map((v, i) => (
              <div
                key={i}
                className="val-card"
                style={{
                  ...s.valueCard,
                  background: v.color,
                  border: activeValue === i ? `2px solid ${v.accent}` : `1px solid transparent`,
                }}
                onClick={() => setActiveValue(i)}
              >
                <div style={s.valueIcon}>{v.icon}</div>
                <h3 style={{ ...s.valueTitle, color: v.accent }}>{v.title}</h3>
                <p style={{ ...s.valueBody, color: v.accent + 'BB' }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SOCIAL ENTERPRISE ── */}
      <div style={{ background: '#0A6B4B', padding: '0 32px' }}>
        <div style={{ ...s.sectionInner, padding: '72px 0' }}>
          <div style={s.seLayout}>
            <div>
              <div style={{ ...s.sectionEyebrow, color: '#B7DEC9' }}>Our structure</div>
              <h2 style={{ ...s.sectionTitle, color: '#fff' }}>
                A social enterprise,<br />not a charity
              </h2>
              <p style={{ ...s.sectionSub, color: 'rgba(255,255,255,.6)' }}>
                EveryGiving is a for-profit social enterprise. We generate revenue through
                transaction fees to sustain ourselves commercially — but our social mission
                is embedded in our founding documents, not just our marketing.
              </p>
            </div>
            <div style={s.seCards}>
              {[
                { icon: '💰', title: 'Self-sustaining revenue', body: '2% + ₵0.25 per donation keeps us operating without grants or donor dependency.' },
                { icon: '♻️', title: 'Mission reinvestment', body: 'A defined share of revenue goes back into the mission — subsidising fees for hardship cases, funding financial literacy for campaigners.' },
                { icon: '🤝', title: 'Impact investors', body: 'We partner with investors who want financial return and social good. Profit and mission are not in conflict here.' },
                { icon: '📊', title: 'Annual impact report', body: 'We publish our social metrics publicly every year — funds facilitated, lives affected, communities reached.' },
              ].map((item, i) => (
                <div key={i} style={s.seCard}>
                  <div style={s.seCardIcon}>{item.icon}</div>
                  <div style={s.seCardTitle}>{item.title}</div>
                  <div style={s.seCardBody}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TEAM ── */}
      <div style={{ padding: '0 32px' }}>
        <div style={{ ...s.sectionInner, padding: '72px 0' }}>
          <div style={s.sectionEyebrow}>The team</div>
          <h2 style={s.sectionTitle}>Built by Ghanaians, for Ghana</h2>
          <p style={s.sectionSub}>
            Every person on our team has a personal stake in this working. We've all
            been the campaigner, or the donor, or the community that needed help.
          </p>
          <div style={s.teamGrid}>
            {TEAM.map((member, i) => (
              <div key={i} className="team-card" style={s.teamCard}>
                <div style={s.teamAvatar}>{member.initials}</div>
                <div style={s.teamName}>{member.name}</div>
                <div style={s.teamRole}>{member.role}</div>
                <p style={s.teamBio}>{member.bio}</p>
                <div style={s.teamLocation}>📍 {member.location}</div>
              </div>
            ))}
          </div>
          <div style={s.teamHiring}>
            <div style={s.hiringLeft}>
              <div style={s.hiringTitle}>We're building the team</div>
              <div style={s.hiringSub}>Looking for engineers, community managers, and operational talent based in Ghana.</div>
            </div>
            <a href="mailto:team@everygiving.org" style={s.hiringBtn}>View open roles →</a>
          </div>
        </div>
      </div>

      {/* ── BUILT IN GHANA ── */}
      <div style={{ background: '#1A1A18', padding: '0 32px' }}>
        <div style={{ ...s.sectionInner, padding: '72px 0' }}>
          <div style={s.ghanaLayout}>
            <div>
              <div style={{ ...s.sectionEyebrow, color: '#B7DEC9' }}>Built in Ghana 🇬🇭</div>
              <h2 style={{ ...s.sectionTitle, color: '#fff', marginBottom: 20 }}>
                Not imported.<br />Not adapted.<br />
                <em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>Built here.</em>
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.8, maxWidth: 420 }}>
                EveryGiving is registered in Ghana, built by Ghanaians, and designed for
                the specific realities of Ghanaian giving — Susu culture, MoMo infrastructure,
                Ghana Card identity, diaspora remittances, and the cultural sensitivity
                around asking for help.
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.8, maxWidth: 420, marginTop: 16 }}>
                We didn't take a Western crowdfunding platform and adapt it. We started
                from the ground up — from the psychology of giving in Ghana to the
                technical realities of MoMo API integrations.
              </p>
            </div>
            <div style={s.ghanaStats}>
              {[
                { flag: '🇬🇭', stat: 'Accra', label: 'Headquarters' },
                { flag: '🌍', stat: 'West Africa', label: 'Primary market' },
                { flag: '💳', stat: 'MoMo-first', label: 'Payment infrastructure' },
                { flag: '🏛️', stat: 'Social enterprise', label: 'Business structure' },
              ].map((item, i) => (
                <div key={i} style={s.ghanaStat}>
                  <div style={s.ghanaStatFlag}>{item.flag}</div>
                  <div style={s.ghanaStatN}>{item.stat}</div>
                  <div style={s.ghanaStatL}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── PARTNERS ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #E8E4DC', padding: '0 32px' }}>
        <div style={{ ...s.sectionInner, padding: '56px 0' }}>
          <div style={s.sectionEyebrow}>Payment partners</div>
          <h2 style={{ ...s.sectionTitle, marginBottom: 10 }}>
            Powered by Ghana's most trusted payment infrastructure
          </h2>
          <p style={{ ...s.sectionSub, marginBottom: 36 }}>
            We partner with licensed payment providers so donors' money moves safely
            — and EveryGiving never needs to hold funds directly.
          </p>
          <div style={s.partnersGrid}>
            {PARTNERS.map((p, i) => (
              <div key={i} style={s.partnerCard}>
                <div style={{ ...s.partnerDot, background: p.color }} />
                <div style={s.partnerName}>{p.name}</div>
                <div style={s.partnerRole}>{p.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={s.ctaBand}>
        <h2 style={s.ctaTitle}>Be part of what we're building</h2>
        <p style={s.ctaSub}>
          Start a campaign, make a donation, or reach out if you want to partner with us.
        </p>
        <div style={s.ctaActions}>
          <a href="/create" style={s.ctaBtnPrimary}>Start a campaign — free</a>
          <a href="/campaigns" style={s.ctaBtnSecondary}>Browse campaigns</a>
          <a href="mailto:team@everygiving.org" style={s.ctaBtnTertiary}>Get in touch</a>
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
  heroInner: { maxWidth:1100, margin:'0 auto', padding:'72px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'center' },
  heroLeft: {},
  eyebrow: { fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'#B7DEC9', marginBottom:14 },
  heroTitle: { fontFamily:"'DM Serif Display',serif", fontSize:44, lineHeight:1.1, color:'#fff', marginBottom:20 },
  heroBody: { fontSize:15, color:'rgba(255,255,255,.55)', lineHeight:1.8, marginBottom:16 },
  heroRight: {},
  heroQuote: { background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:20, padding:'32px 28px' },
  quoteMarks: { fontFamily:"'DM Serif Display',serif", fontSize:56, color:'#0A6B4B', lineHeight:.8, marginBottom:12 },
  quoteText: { fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#fff', lineHeight:1.55, marginBottom:24, fontStyle:'italic' },
  quoteAuthor: { display:'flex', alignItems:'center', gap:12 },
  quoteAvatar: { width:42, height:42, borderRadius:'50%', background:'#0A6B4B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:600, color:'#fff', flexShrink:0 },
  quoteName: { fontSize:14, fontWeight:600, color:'#fff' },
  quoteRole: { fontSize:12, color:'rgba(255,255,255,.45)', marginTop:2 },

  sectionInner: { maxWidth:1100, margin:'0 auto', padding:'0 32px' },
  sectionEyebrow: { fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:10 },
  sectionTitle: { fontFamily:"'DM Serif Display',serif", fontSize:34, color:'#1A1A18', marginBottom:12, lineHeight:1.2 },
  sectionSub: { fontSize:15, color:'#8A8A82', lineHeight:1.75, maxWidth:560, marginBottom:48 },

  problemGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  problemCard: { background:'#FDFAF5', border:'1px solid #E8E4DC', borderRadius:14, padding:'20px 18px' },
  problemBefore: { display:'flex', alignItems:'flex-start', gap:8, marginBottom:10 },
  problemX: { fontSize:12, color:'#C0392B', fontWeight:700, flexShrink:0, marginTop:2 },
  problemBeforeText: { fontSize:13, color:'#8A8A82', lineHeight:1.6, textDecoration:'line-through' },
  problemArrow: { fontSize:18, color:'#0A6B4B', fontWeight:600, marginLeft:20, marginBottom:8 },
  problemAfter: { display:'flex', alignItems:'flex-start', gap:8 },
  problemCheck: { fontSize:12, color:'#0A6B4B', fontWeight:700, flexShrink:0, marginTop:2 },
  problemAfterText: { fontSize:13, color:'#1A1A18', lineHeight:1.6, fontWeight:500 },

  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:2 },
  statCard: { padding:'32px 24px', borderRight:'1px solid rgba(255,255,255,.08)' },
  statN: { fontFamily:"'DM Serif Display',serif", fontSize:44, color:'#B7DEC9', lineHeight:1, marginBottom:8 },
  statLabel: { fontSize:14, fontWeight:600, color:'#fff', marginBottom:6 },
  statSub: { fontSize:12, color:'rgba(255,255,255,.4)', lineHeight:1.6 },

  valuesGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 },
  valueCard: { borderRadius:16, padding:'28px 22px', transition:'all .15s' },
  valueIcon: { fontSize:28, marginBottom:14 },
  valueTitle: { fontSize:16, fontWeight:600, marginBottom:10, lineHeight:1.3 },
  valueBody: { fontSize:13, lineHeight:1.75 },

  seLayout: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'start' },
  seCards: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  seCard: { background:'rgba(255,255,255,.07)', borderRadius:12, padding:'20px 18px', border:'1px solid rgba(255,255,255,.08)' },
  seCardIcon: { fontSize:22, marginBottom:10 },
  seCardTitle: { fontSize:13, fontWeight:600, color:'#fff', marginBottom:6 },
  seCardBody: { fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.7 },

  teamGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 },
  teamCard: { background:'#fff', border:'1px solid #E8E4DC', borderRadius:16, padding:'24px 20px', transition:'all .2s' },
  teamAvatar: { width:48, height:48, borderRadius:'50%', background:'#E8F5EF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#0A6B4B', marginBottom:12 },
  teamName: { fontSize:15, fontWeight:600, color:'#1A1A18', marginBottom:3 },
  teamRole: { fontSize:12, color:'#0A6B4B', fontWeight:500, marginBottom:12 },
  teamBio: { fontSize:12, color:'#8A8A82', lineHeight:1.7, marginBottom:14 },
  teamLocation: { fontSize:11, color:'#8A8A82' },
  teamHiring: { background:'#1A1A18', borderRadius:14, padding:'22px 26px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' },
  hiringLeft: {},
  hiringTitle: { fontSize:15, fontWeight:600, color:'#fff', marginBottom:4 },
  hiringSub: { fontSize:13, color:'rgba(255,255,255,.5)' },
  hiringBtn: { fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'10px 20px', borderRadius:8, whiteSpace:'nowrap' },

  ghanaLayout: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:56, alignItems:'center' },
  ghanaStats: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, background:'rgba(255,255,255,.04)', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,.07)' },
  ghanaStat: { padding:'28px 24px', borderRight:'1px solid rgba(255,255,255,.07)', borderBottom:'1px solid rgba(255,255,255,.07)' },
  ghanaStatFlag: { fontSize:24, marginBottom:10 },
  ghanaStatN: { fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#fff', marginBottom:4 },
  ghanaStatL: { fontSize:12, color:'rgba(255,255,255,.4)' },

  partnersGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 },
  partnerCard: { background:'#FDFAF5', border:'1px solid #E8E4DC', borderRadius:14, padding:'24px 20px', display:'flex', flexDirection:'column', gap:8 },
  partnerDot: { width:10, height:10, borderRadius:'50%' },
  partnerName: { fontSize:16, fontWeight:700, color:'#1A1A18' },
  partnerRole: { fontSize:13, color:'#8A8A82' },

  ctaBand: { background:'#0A6B4B', padding:'64px 32px', textAlign:'center' },
  ctaTitle: { fontFamily:"'DM Serif Display',serif", fontSize:36, color:'#fff', marginBottom:12 },
  ctaSub: { fontSize:15, color:'rgba(255,255,255,.65)', marginBottom:28 },
  ctaActions: { display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' },
  ctaBtnPrimary: { fontSize:14, fontWeight:600, color:'#0A6B4B', background:'#fff', padding:'13px 26px', borderRadius:10 },
  ctaBtnSecondary: { fontSize:14, fontWeight:500, color:'rgba(255,255,255,.75)', background:'transparent', padding:'13px 26px', borderRadius:10, border:'1px solid rgba(255,255,255,.3)' },
  ctaBtnTertiary: { fontSize:14, fontWeight:500, color:'rgba(255,255,255,.55)', background:'transparent', padding:'13px 26px', borderRadius:10, border:'1px solid rgba(255,255,255,.15)' },

  footer: { background:'#1A1A18', borderTop:'1px solid rgba(255,255,255,.06)', padding:'24px 32px' },
  footerInner: { maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 },
  footerLogo: { fontFamily:"'DM Serif Display',serif", fontSize:16, color:'#fff' },
  footerCopy: { fontSize:12, color:'rgba(255,255,255,.3)' },
  footerLinks: { display:'flex', gap:14 },
  footerLink: { fontSize:12, color:'rgba(255,255,255,.3)' },
};
