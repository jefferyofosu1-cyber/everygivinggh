const fs = require('fs');

const content = `'use client'

import { useState } from 'react'
import Link from 'next/link'

// Featured campaigns ‚Äî replace with API call to /api/campaigns?featured=true
const FEATURED_CAMPAIGNS = [
  {
    id: '1', slug: 'ama-kidney-surgery',
    title: 'Help Ama get life-saving kidney surgery at Korle Bu Teaching Hospital',
    category: 'medical', organiserName: 'Kwame Mensah', location: 'Accra',
    raisedGHS: 14400, goalGHS: 20000, donorCount: 143, daysLeft: 12,
    isUrgent: true, isFunded: false, isDiasporaFriendly: true,
    coverEmoji: '\\u{1F3E5}', coverGradient: 'linear-gradient(135deg,#1B4332,#52B788)',
  },
  {
    id: '2', slug: 'bethel-assembly-roof',
    title: 'New roof for Bethel Assembly ‚Äî Kumasi Central',
    category: 'faith', organiserName: 'Pastor Isaac Asare', location: 'Kumasi',
    raisedGHS: 42000, goalGHS: 42000, donorCount: 312, daysLeft: 0,
    isUrgent: false, isFunded: true, isDiasporaFriendly: false,
    coverEmoji: '\\u26EA', coverGradient: 'linear-gradient(135deg,#2C3E50,#4A6FA5)',
  },
  {
    id: '3', slug: 'adjoa-university-fees',
    title: 'Help Adjoa pay her university fees at KNUST',
    category: 'education', organiserName: 'Adjoa Mensah', location: 'Tema',
    raisedGHS: 9200, goalGHS: 10500, donorCount: 67, daysLeft: 5,
    isUrgent: true, isFunded: false, isDiasporaFriendly: true,
    coverEmoji: '\\u{1F4DA}', coverGradient: 'linear-gradient(135deg,#5C3317,#A0522D)',
  },
]

const CATEGORIES = [
  { emoji: '\\u{1F3E5}', label: 'Medical',   slug: 'medical'   },
  { emoji: '\\u26EA',   label: 'Faith',      slug: 'faith'     },
  { emoji: '\\u{1F4DA}', label: 'Education', slug: 'education' },
  { emoji: '\\u{1F198}', label: 'Emergency', slug: 'emergency' },
  { emoji: '\\u{1F4A7}', label: 'Community', slug: 'community' },
  { emoji: '\\u{1F54A}\\uFE0F', label: 'Funeral', slug: 'funeral' },
  { emoji: '\\u{1F46A}', label: 'Family',    slug: 'family'    },
  { emoji: '\\u2728',   label: 'All causes', slug: ''          },
]

function formatGHS(n: number) {
  return n >= 1000 ? \`\\u20B5\${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k\` : \`\\u20B5\${n.toLocaleString()}\`
}

export default function HomePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: \`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        .camp-card{transition:all 0.22s}
        .camp-card:hover{box-shadow:0 8px 24px rgba(0,0,0,0.08);transform:translateY(-2px)}
        .cat-btn{transition:all 0.15s}
        .cat-btn:hover{background:#E8F5EF!important;border-color:#0A6B4B!important;color:#0A6B4B!important}
      \` }} />

      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:58, background:'#FFFFFF', borderBottom:'1px solid #E8E4DC', position:'sticky', top:0, zIndex:100, fontFamily:"'DM Sans',sans-serif" }}>
        <Link href="/" style={{ fontFamily:"'DM Serif Display',serif", fontSize:19, color:'#1A1A18', textDecoration:'none' }}>
          Every<em style={{ color:'#0A6B4B', fontStyle:'normal' }}>Giving</em>
        </Link>
        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
          <Link href="/campaigns"    style={{ fontSize:13, fontWeight:500, color:'#4A4A44', padding:'7px 11px', borderRadius:6, textDecoration:'none' }}>Browse</Link>
          <Link href="/how-it-works" style={{ fontSize:13, fontWeight:500, color:'#4A4A44', padding:'7px 11px', borderRadius:6, textDecoration:'none' }}>How it works</Link>
          <Link href="/about"        style={{ fontSize:13, fontWeight:500, color:'#4A4A44', padding:'7px 11px', borderRadius:6, textDecoration:'none' }}>About</Link>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <Link href="/auth/login" style={{ fontSize:13, fontWeight:500, color:'#1A1A18', padding:'7px 13px', border:'1px solid #E8E4DC', borderRadius:8, textDecoration:'none' }}>Sign in</Link>
          <Link href="/create"     style={{ fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'8px 16px', borderRadius:8, textDecoration:'none' }}>Start a campaign</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background:'#1A1A18', padding:'0 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'80px 0 72px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#B7DEC9', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:20, height:1, background:'#B7DEC9', display:'inline-block' }} />
              Ghana&apos;s trusted crowdfunding
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:48, lineHeight:1.1, color:'#fff', marginBottom:20 }}>
              The trusted way to<br />
              <em style={{ color:'#B7DEC9', fontStyle:'italic' }}>raise money in Ghana</em>
            </h1>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.55)', lineHeight:1.8, marginBottom:18 }}>
              Identity-verified campaigns. Mobile money payouts. Milestone-protected funds. Zero platform fees ‚Äî always.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
              {[
                "Every campaigner verified by Ghana Card before going live",
                "MTN MoMo, Vodafone Cash & AirtelTigo built in",
                "Funds released by milestone ‚Äî donors give with confidence",
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, fontSize:13, color:'rgba(255,255,255,0.7)' }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', background:'#0A6B4B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#fff', flexShrink:0, marginTop:1 }}>‚úì</div>
                  {item}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:20 }}>
              <Link href="/create" style={{ fontSize:14, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'13px 24px', borderRadius:10, textDecoration:'none' }}>
                Start a campaign ‚Äî free
              </Link>
              <Link href="/campaigns" style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.7)', padding:'13px 20px', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, textDecoration:'none' }}>
                Browse campaigns
              </Link>
            </div>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>Ì¥í Ghana Card verified ¬∑ MoMo-first ¬∑ Free to start</p>
          </div>

          {/* Right ‚Äî stats grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, background:'rgba(255,255,255,0.04)', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)' }}>
            {[
              { n:'‚Çµ2.4M+', label:'Raised on platform',  sub:'Across all verified campaigns'         },
              { n:'1,200+', label:'Campaigns launched',   sub:'Medical, education, faith & more'      },
              { n:'24hr',   label:'Verification time',    sub:'Typical Ghana Card review turnaround'  },
              { n:'‚Çµ0',     label:'Platform fee',         sub:'We never charge campaigners to start'  },
            ].map((stat, i) => (
              <div key={i} style={{ padding:'28px 24px', borderRight: i%2===0 ? '1px solid rgba(255,255,255,0.07)' : 'none', borderBottom: i<2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, color:'#B7DEC9', lineHeight:1, marginBottom:8 }}>{stat.n}</div>
                <div style={{ fontSize:12, fontWeight:600, color:'#fff', marginBottom:4 }}>{stat.label}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.5 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VALUE PILLARS */}
      <div style={{ background:'#fff', borderBottom:'1px solid #E8E4DC', padding:'0 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)' }}>
          {[
            { icon:'Ì≥±', title:'Mobile Money First',   desc:'MTN MoMo, Vodafone Cash & AirtelTigo ‚Äî the way Ghanaians actually pay' },
            { icon:'Ì∫™', title:'Ghana Card Verified',  desc:'Every organiser verified by identity before their campaign goes live'   },
            { icon:'Ì¥í', title:'Milestone Payouts',    desc:'Funds released only when proof is submitted ‚Äî protecting everyone'      },
          ].map((item, i) => (
            <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'24px 28px', borderRight: i<2 ? '1px solid #E8E4DC' : 'none' }}>
              <div style={{ fontSize:24, flexShrink:0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#1A1A18', marginBottom:5 }}>{item.title}</div>
                <div style={{ fontSize:12, color:'#8A8A82', lineHeight:1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ padding:'56px 28px', background:'#FDFAF5' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:10 }}>Browse by cause</div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, color:'#1A1A18', marginBottom:28 }}>What do you need help with?</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(8,1fr)', gap:10 }}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug || 'all'}
                href={cat.slug ? \`/campaigns?category=\${cat.slug}\` : '/campaigns'}
                className="cat-btn"
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'18px 8px', background:'#fff', border:'1px solid #E8E4DC', borderRadius:12, textDecoration:'none', cursor:'pointer' }}
              >
                <span style={{ fontSize:24 }}>{cat.emoji}</span>
                <span style={{ fontSize:11, fontWeight:600, color:'#1A1A18', textAlign:'center' }}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURED CAMPAIGNS */}
      <div style={{ padding:'0 28px 64px', background:'#FDFAF5' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:24 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:6 }}>Active now</div>
              <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, color:'#1A1A18' }}>Featured campaigns</h2>
            </div>
            <Link href="/campaigns" style={{ fontSize:13, fontWeight:600, color:'#0A6B4B', padding:'8px 16px', border:'1px solid #0A6B4B', borderRadius:8, textDecoration:'none' }}>
              See all ‚Üí
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
            {FEATURED_CAMPAIGNS.map((campaign) => {
              const pct = Math.min(100, Math.round(campaign.raisedGHS / campaign.goalGHS * 100))
              return (
                <Link
                  key={campaign.id}
                  href={\`/campaigns/\${campaign.slug}\`}
                  className="camp-card"
                  style={{ display:'block', background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden', textDecoration:'none', cursor:'pointer' }}
                >
                  <div style={{ height:158, background:campaign.coverGradient, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:36, position:'relative', zIndex:1 }}>{campaign.coverEmoji}</span>
                    <div style={{ position:'absolute', top:10, right:10, background:'rgba(255,255,255,0.95)', borderRadius:20, padding:'3px 8px', fontSize:10, fontWeight:700, color:'#0A6B4B' }}>‚úì Verified</div>
                    {campaign.isUrgent && !campaign.isFunded && (
                      <div style={{ position:'absolute', top:10, left:10, background:'#B85C00', borderRadius:20, padding:'3px 8px', fontSize:10, fontWeight:700, color:'#fff' }}>Urgent</div>
                    )}
                    {campaign.isFunded && (
                      <div style={{ position:'absolute', top:10, left:10, background:'#0A6B4B', borderRadius:20, padding:'3px 8px', fontSize:10, fontWeight:700, color:'#fff' }}>Funded ‚úì</div>
                    )}
                  </div>
                  <div style={{ padding:'14px 15px' }}>
                    <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:5 }}>{campaign.category}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1A1A18', lineHeight:1.45, marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{campaign.title}</div>
                    <div style={{ fontSize:12, color:'#8A8A82', marginBottom:11 }}>{campaign.organiserName} ¬∑ {campaign.location}</div>
                    <div style={{ height:4, background:'#E8E4DC', borderRadius:2, overflow:'hidden', marginBottom:7 }}>
                      <div style={{ height:'100%', width:\`\${pct}%\`, background: campaign.isFunded ? '#B85C00' : '#0A6B4B', borderRadius:2 }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'#1A1A18' }}>{formatGHS(campaign.raisedGHS)} raised</span>
                      <span style={{ fontSize:11, color:'#8A8A82' }}>
                        {campaign.isFunded ? 'Fully funded' : campaign.daysLeft === 0 ? 'Ends today' : \`\${campaign.daysLeft}d left\`}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ background:'#1A1A18', padding:'0 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'72px 0' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#B7DEC9', marginBottom:10 }}>Simple process</div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:36, color:'#fff', marginBottom:10 }}>Raise money in 3 steps</h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.45)', maxWidth:400, margin:'0 auto' }}>From idea to funded ‚Äî takes less than 5 minutes to start</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
            {[
              { n:'1', title:'Create your campaign', desc:"Tell your story, set your goal, upload a photo. Our guided form makes it easy ‚Äî no tech skills needed." },
              { n:'2', title:'Get verified in 24hrs', desc:"Submit your Ghana Card and supporting documents. Verified campaigns raise 3x more money." },
              { n:'3', title:'Share & receive MoMo', desc:"Share on WhatsApp. Donors pay via MoMo or card. Funds land in your mobile wallet same day." },
            ].map((step, i) => (
              <div key={i} style={{ textAlign:'center', padding:'32px 24px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'#0A6B4B', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Serif Display',serif", fontSize:22, color:'#fff', margin:'0 auto 20px' }}>{step.n}</div>
                <h3 style={{ fontSize:15, fontWeight:600, color:'#fff', marginBottom:10 }}>{step.title}</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:32 }}>
            <Link href="/how-it-works" style={{ fontSize:13, fontWeight:500, color:'#B7DEC9', padding:'10px 22px', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, textDecoration:'none', display:'inline-block' }}>
              Full guide ‚Äî how it works ‚Üí
            </Link>
          </div>
        </div>
      </div>

      {/* DIASPORA */}
      <div style={{ background:'#fff', borderTop:'1px solid #E8E4DC', padding:'0 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'56px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
          <div>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:10 }}>Ìºç Diaspora Ghanaians</div>
            <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, color:'#1A1A18', marginBottom:14, lineHeight:1.2 }}>
              Support home from<br />anywhere in the world
            </h2>
            <p style={{ fontSize:14, color:'#8A8A82', lineHeight:1.8, marginBottom:20 }}>
              Donate from the UK, US, or Europe in GBP, USD, or EUR. Funds convert and land in Ghana via Zeepay MoMo ‚Äî same day.
            </p>
            <Link href="/campaigns?filter=diaspora" style={{ fontSize:13, fontWeight:600, color:'#0A6B4B', padding:'10px 20px', border:'1.5px solid #0A6B4B', borderRadius:8, textDecoration:'none', display:'inline-block' }}>
              View diaspora-friendly campaigns ‚Üí
            </Link>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { flag:'Ì∑¨Ì∑ß', currency:'GBP', label:'British Pounds'  },
              { flag:'Ì∑∫Ì∑∏', currency:'USD', label:'US Dollars'      },
              { flag:'Ì∑™Ì∑∫', currency:'EUR', label:'Euros'           },
              { flag:'Ì∑¨Ì∑≠', currency:'GHS', label:'Ghana Cedis'     },
            ].map((item, i) => (
              <div key={i} style={{ background:'#FDFAF5', border:'1px solid #E8E4DC', borderRadius:12, padding:'20px 16px', display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontSize:24 }}>{item.flag}</span>
                <span style={{ fontSize:15, fontWeight:700, color:'#1A1A18' }}>{item.currency}</span>
                <span style={{ fontSize:11, color:'#8A8A82' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA BAND */}
      <div style={{ background:'#0A6B4B', padding:'64px 28px', textAlign:'center' }}>
        <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:36, color:'#fff', marginBottom:12 }}>Ready to start raising money?</h2>
        <p style={{ fontSize:15, color:'rgba(255,255,255,0.65)', marginBottom:28 }}>
          Join over 1,200 Ghanaians already using EveryGiving. Free to start. Verified in 24hrs. Instant MoMo payout.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/create" style={{ fontSize:14, fontWeight:600, color:'#0A6B4B', background:'#fff', padding:'13px 26px', borderRadius:10, textDecoration:'none' }}>
            Start a campaign ‚Äî free
          </Link>
          <Link href="/campaigns" style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,0.75)', padding:'13px 26px', borderRadius:10, border:'1px solid rgba(255,255,255,0.3)', textDecoration:'none' }}>
            Browse campaigns
          </Link>
        </div>
        <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:20 }}>Ì¥í Ghana Card verified ¬∑ Free to start ¬∑ Instant MoMo payout</p>
      </div>

      {/* FOOTER */}
      <footer style={{ background:'#1A1A18', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'24px 28px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color:'#fff' }}>
            Every<span style={{ color:'#B7DEC9' }}>Giving</span>
          </span>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>¬© 2026 EveryGiving ¬∑ Built in Ghana Ì∑¨Ì∑≠ ¬∑ ‚Çµ0 platform fee</span>
          <div style={{ display:'flex', gap:14 }}>
            {['Terms', 'Privacy', 'Fees', 'Contact'].map(l => (
              <Link key={l} href={\`/\${l.toLowerCase()}\`} style={{ fontSize:12, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
`;

fs.writeFileSync('app/page.tsx', content, 'utf8');
console.log('Written app/page.tsx ‚Äî', fs.statSync('app/page.tsx').size, 'bytes');
