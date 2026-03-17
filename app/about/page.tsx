'use client'

import { useState } from 'react'
import Link from 'next/link'

const BASE = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
a{color:inherit;text-decoration:none}
.val-card{cursor:pointer;transition:all .15s}
.val-card:hover{transform:translateY(-2px)}
.team-card{transition:all .18s}
.team-card:hover{box-shadow:0 10px 28px rgba(0,0,0,.07);transform:translateY(-2px)}
`

const STATS = [
  { n: '₵0',   label: 'Platform fee — forever',    sub: 'We never charge campaigners to create or publish' },
  { n: '24hr', label: 'Verification turnaround',    sub: 'Typical time from ID submission to campaign live' },
  { n: '3×',   label: 'More raised — verified',     sub: 'Verified campaigns raise 3× more than unverified' },
  { n: '100%', label: 'Campaigns verified',          sub: 'Every live campaign has been identity-checked' },
]

const VALUES = [
  { title: 'Dignity over charity',   body: "We believe asking for help should never feel shameful. EveryGiving is designed so campaigners can tell their story with pride — and donors can give in a way that honours the person receiving.", color: '#E1F5EE', accent: '#0A6B4B', icon: '🤝' },
  { title: 'Radical transparency',   body: "We publish our fee structure publicly, show donors exactly how milestones work, and never release funds without proof. If donors can't see where their money goes, they won't give it.", color: '#E6F1FB', accent: '#185FA5', icon: '🔍' },
  { title: 'Community before scale', body: 'We will not grow fast at the expense of trust. Every campaign we verify, every payout we release, every update we prompt — these are promises to the communities that depend on us.', color: '#FAEEDA', accent: '#B85C00', icon: '🌍' },
  { title: 'Built for everyone',     body: 'Not just for smartphone users in Accra. Feature phone support via USSD, same-day MoMo payouts, diaspora corridors — EveryGiving works for every Ghanaian, wherever they are.', color: '#EEEDFE', accent: '#534AB7', icon: '📱' },
]

const TEAM = [
  { initials: 'KA', name: 'Kwame Asante',    role: 'Founder & CEO',              bio: 'Former fintech engineer who built payment systems across West Africa. Returned to Ghana after 8 years abroad to build the platform he wished had existed when his family needed it.', location: 'Accra' },
  { initials: 'AO', name: 'Ama Osei',        role: 'Co-Founder & Head of Trust', bio: 'Spent 6 years in community development across the Northern and Volta Regions. Designed the verification and milestone systems that make EveryGiving trusted by donors.', location: 'Accra' },
  { initials: 'ET', name: 'Emmanuel Tetteh', role: 'Head of Engineering',         bio: 'Full-stack engineer with deep experience in MoMo API integrations. Built the payment layer connecting Paystack, Hubtel, and Zeepay into one seamless experience.', location: 'Accra' },
  { initials: 'GB', name: 'Grace Boateng',   role: 'Head of Community',           bio: 'Leads campaign support and verification. Former NGO programme manager who brought operational discipline to the campaign review process.', location: 'Kumasi' },
]

const PARTNERS = [
  { name: 'Paystack', role: 'Local MoMo & card payments', color: '#00C3F7' },
  { name: 'Hubtel',   role: 'USSD & checkout',            color: '#FF6600' },
  { name: 'Zeepay',   role: 'Diaspora remittance',        color: '#1A3C8F' },
]

const SE_ITEMS = [
  { icon: '💰', title: 'Self-sustaining revenue',  body: '2.5% + ₵0.50 per donation keeps us operating without grants or donor dependency.' },
  { icon: '♻️', title: 'Mission reinvestment',      body: 'A defined share of revenue goes back into the mission — subsidising fees for hardship cases and funding financial literacy for campaigners.' },
  { icon: '🤝', title: 'Impact investors',          body: 'We partner with investors who want financial return and social good. Profit and mission are not in conflict here.' },
  { icon: '📊', title: 'Annual impact report',      body: 'We publish our social metrics publicly every year — funds facilitated, lives affected, communities reached.' },
]

export default function AboutPage() {
  const [activeValue, setActiveValue] = useState(0)

  return (
    <>
      <style>{BASE}</style>

      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:58, background:'#FFFFFF', borderBottom:'1px solid #E8E4DC', position:'sticky', top:0, zIndex:100 }}>
        <Link href="/" style={{ fontFamily:"'DM Serif Display',serif", fontSize:19, color:'#1A1A18', textDecoration:'none' }}>
          Every<em style={{ color:'#0A6B4B', fontStyle:'normal' }}>Giving</em>
        </Link>
        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
          {([['/', 'Home'], ['/campaigns','Browse'], ['/how-it-works','How it works'], ['/about','About']] as [string,string][]).map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize:13, fontWeight: href==='/about' ? 600 : 500, color: href==='/about' ? '#0A6B4B' : '#4A4A44', padding:'7px 11px', borderRadius:6, textDecoration:'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Link href="/auth/login" style={{ fontSize:13, fontWeight:500, color:'#1A1A18', padding:'7px 13px', border:'1px solid #E8E4DC', borderRadius:8, textDecoration:'none' }}>Sign in</Link>
          <Link href="/create" style={{ fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'8px 16px', borderRadius:8, textDecoration:'none' }}>Start a campaign</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background:'#1A1A18', padding:'0 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'80px 0 72px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#B7DEC9', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:20, height:1, background:'#B7DEC9', display:'inline-block' }}/>Our story
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:44, color:'#fff', lineHeight:1.15, marginBottom:24 }}>
              Ghana deserved a<br/>
              <em style={{ color:'#B7DEC9', fontStyle:'italic' }}>better way to give</em>
            </h1>
            <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', lineHeight:1.8, marginBottom:16 }}>
              EveryGiving was built because the platforms that existed weren&apos;t built for Ghana. No MoMo. No Ghana Card verification. No milestone payouts. No understanding of how Ghanaians actually give and receive.
            </p>
            <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', lineHeight:1.8 }}>
              We built the platform we wished had existed when our own families needed it. Identity-verified. Mobile money first. Milestone-protected. Zero platform fees — always.
            </p>
          </div>
          <div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:32 }}>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:52, color:'#B7DEC9', lineHeight:1, marginBottom:16 }}>&ldquo;</div>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#fff', lineHeight:1.55, marginBottom:24 }}>
                Asking for help should never feel shameful. EveryGiving exists so every Ghanaian can raise money with dignity — and every donor can give with confidence.
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'#0A6B4B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff' }}>KA</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Kwame Asante</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>Founder, EveryGiving</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PROBLEM */}
      <div style={{ background:'#fff', borderTop:'1px solid #E8E4DC', borderBottom:'1px solid #E8E4DC', padding:'0 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'72px 0' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:12 }}>Why we exist</div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:34, color:'#1A1A18', marginBottom:40 }}>Ghana had a crowdfunding problem</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {[
              { before: "Global platforms like GoFundMe don't support MoMo", after: 'EveryGiving is built MoMo-first from day one — MTN, Vodafone, AirtelTigo' },
              { before: "No identity verification — donors couldn't trust who they were giving to", after: 'Every campaigner submits a Ghana Card, reviewed by our team before going live' },
              { before: 'Funds released all at once — nothing stopped misuse', after: 'Milestone-based payouts: funds released only when proof is submitted and verified' },
              { before: "Diaspora Ghanaians had no easy way to donate back home", after: 'Zeepay integration: GBP, USD, EUR → GHS MoMo same day' },
            ].map((item, i) => (
              <div key={i} style={{ background:'#FDFAF5', border:'1px solid #E8E4DC', borderRadius:14, padding:24 }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:14, opacity:.7 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#C0392B', marginTop:1 }}>✕</span>
                  <span style={{ fontSize:13, color:'#4A4A44', lineHeight:1.6 }}>{item.before}</span>
                </div>
                <div style={{ height:1, background:'#E8E4DC', marginBottom:14 }}/>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0A6B4B', marginTop:1 }}>✓</span>
                  <span style={{ fontSize:13, color:'#1A1A18', lineHeight:1.6, fontWeight:500 }}>{item.after}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ background:'#1A1A18', padding:'0 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'64px 0', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:32 }}>
          {STATS.map((stat, i) => (
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:44, color:'#fff', lineHeight:1, marginBottom:8 }}>{stat.n}</div>
              <div style={{ fontSize:13, fontWeight:600, color:'#B7DEC9', marginBottom:6 }}>{stat.label}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.4)', lineHeight:1.6 }}>{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* VALUES */}
      <div style={{ padding:'0 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'72px 0' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:12 }}>What we believe</div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:34, color:'#1A1A18', marginBottom:12 }}>Our values — not a poster, a practice</h2>
          <p style={{ fontSize:15, color:'#4A4A44', lineHeight:1.75, marginBottom:40, maxWidth:560 }}>
            Every product decision at EveryGiving is tested against these four commitments. If a feature violates one of them, we don&apos;t build it.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
            {VALUES.map((v, i) => (
              <div key={i} className="val-card"
                style={{ background:v.color, border: activeValue===i ? `2px solid ${v.accent}` : '1px solid transparent', borderRadius:14, padding:28, cursor:'pointer' }}
                onClick={() => setActiveValue(i)}>
                <div style={{ fontSize:28, marginBottom:14 }}>{v.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:700, color:v.accent, marginBottom:10 }}>{v.title}</h3>
                <p style={{ fontSize:13, color:v.accent+'BB', lineHeight:1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SOCIAL ENTERPRISE */}
      <div style={{ background:'#0A6B4B', padding:'0 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'72px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#B7DEC9', marginBottom:12 }}>Our structure</div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:34, color:'#fff', lineHeight:1.2, marginBottom:20 }}>
              A social enterprise,<br/>not a charity
            </h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', lineHeight:1.8 }}>
              EveryGiving is a for-profit social enterprise. We generate revenue through transaction fees to sustain ourselves commercially — but our social mission is embedded in our founding documents, not just our marketing.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {SE_ITEMS.map((item, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:12, padding:20 }}>
                <div style={{ fontSize:24, marginBottom:10 }}>{item.icon}</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:8 }}>{item.title}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', lineHeight:1.65 }}>{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TEAM */}
      <div style={{ padding:'0 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'72px 0' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:12 }}>The team</div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:34, color:'#1A1A18', marginBottom:12 }}>Built by Ghanaians, for Ghana</h2>
          <p style={{ fontSize:15, color:'#4A4A44', lineHeight:1.75, marginBottom:40, maxWidth:520 }}>
            Every person on our team has a personal stake in this working. We&apos;ve all been the campaigner, or the donor, or the community that needed help.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
            {TEAM.map((member, i) => (
              <div key={i} className="team-card" style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, padding:24 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'#1A1A18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', marginBottom:14 }}>{member.initials}</div>
                <div style={{ fontSize:15, fontWeight:700, color:'#1A1A18', marginBottom:3 }}>{member.name}</div>
                <div style={{ fontSize:12, fontWeight:500, color:'#0A6B4B', marginBottom:12 }}>{member.role}</div>
                <p style={{ fontSize:12, color:'#4A4A44', lineHeight:1.7, marginBottom:14 }}>{member.bio}</p>
                <div style={{ fontSize:11, color:'#8A8A82' }}>📍 {member.location}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:32, background:'#FDFAF5', border:'1px solid #E8E4DC', borderRadius:14, padding:'28px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:'#1A1A18', marginBottom:6 }}>We&apos;re building the team</div>
              <div style={{ fontSize:13, color:'#4A4A44' }}>We&apos;re hiring engineers, community managers, and partnership leads who believe in the mission.</div>
            </div>
            <Link href="/contact" style={{ fontSize:13, fontWeight:600, color:'#fff', background:'#1A1A18', padding:'12px 22px', borderRadius:8, textDecoration:'none', whiteSpace:'nowrap' }}>
              See open roles →
            </Link>
          </div>
        </div>
      </div>

      {/* BUILT IN GHANA */}
      <div style={{ background:'#1A1A18', padding:'0 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'72px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#B7DEC9', marginBottom:12 }}>🇬🇭 Local pride</div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:34, color:'#fff', lineHeight:1.2, marginBottom:20 }}>
              Built in Ghana.<br/>For Ghana.<br/>By Ghana.
            </h2>
            <p style={{ fontSize:15, color:'rgba(255,255,255,.55)', lineHeight:1.8, marginBottom:16 }}>
              Every line of code was written in Accra. Every product decision was made with a Ghanaian user in mind. Our team speaks Twi, Ewe, Ga, and Dagbani.
            </p>
            <p style={{ fontSize:15, color:'rgba(255,255,255,.55)', lineHeight:1.8 }}>
              We&apos;re not a Silicon Valley startup that &ldquo;expanded to Africa.&rdquo; We&apos;re a Ghanaian company that built something for our own community first.
            </p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { emoji:'🏛', label:'GRA registered',   sub:'Registered with the Ghana Revenue Authority' },
              { emoji:'🏦', label:'Local banking',     sub:'Primary accounts with GCB and Absa Ghana' },
              { emoji:'📱', label:'MoMo first',        sub:'Designed around how Ghanaians actually move money' },
              { emoji:'🌍', label:'Diaspora bridge',   sub:'Built understanding of the remittance corridor into the product from day 1' },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:16, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'16px 20px' }}>
                <div style={{ fontSize:24 }}>{item.emoji}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff', marginBottom:3 }}>{item.label}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PARTNERS */}
      <div style={{ padding:'0 32px', borderTop:'1px solid #E8E4DC' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'64px 0' }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#8A8A82', marginBottom:28, textAlign:'center' }}>Trusted partners</div>
          <div style={{ display:'flex', gap:28, justifyContent:'center', flexWrap:'wrap' }}>
            {PARTNERS.map((p, i) => (
              <div key={i} style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:12, padding:'18px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:160 }}>
                <div style={{ width:12, height:12, borderRadius:'50%', background:p.color }} />
                <div style={{ fontSize:15, fontWeight:700, color:'#1A1A18' }}>{p.name}</div>
                <div style={{ fontSize:11, color:'#8A8A82', textAlign:'center' }}>{p.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:'#0A6B4B', padding:'0 32px' }}>
        <div style={{ maxWidth:800, margin:'0 auto', padding:'72px 0', textAlign:'center' }}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:38, color:'#fff', lineHeight:1.2, marginBottom:16 }}>
            Ready to make a difference?
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.65)', marginBottom:32, lineHeight:1.75 }}>
            Whether you need to raise money or want to support a verified cause — EveryGiving is where you start.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center' }}>
            <Link href="/create" style={{ fontSize:14, fontWeight:700, color:'#0A6B4B', background:'#fff', padding:'14px 28px', borderRadius:10, textDecoration:'none' }}>
              Start a campaign →
            </Link>
            <Link href="/campaigns" style={{ fontSize:14, fontWeight:600, color:'#fff', padding:'14px 28px', border:'1.5px solid rgba(255,255,255,.3)', borderRadius:10, textDecoration:'none' }}>
              Browse campaigns
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background:'#111110', padding:'48px 32px 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:24, marginBottom:24, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:19, color:'#fff' }}>
              Every<em style={{ color:'#B7DEC9', fontStyle:'normal' }}>Giving</em>
            </span>
            <div style={{ display:'flex', gap:20 }}>
              {(['/privacy', '/terms', '/contact'] as const).map((href) => (
                <Link key={href} href={href} style={{ fontSize:12, color:'rgba(255,255,255,.3)', textDecoration:'none' }}>
                  {href.slice(1).charAt(0).toUpperCase() + href.slice(2)}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,.2)' }}>© {new Date().getFullYear()} EveryGiving Ltd · Accra, Ghana</div>
        </div>
      </footer>
    </>
  )
}
