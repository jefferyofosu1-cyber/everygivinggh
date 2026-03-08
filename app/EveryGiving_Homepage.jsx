// Full EveryGiving Homepage — GoFundMe structure, Ghana soul
// This is the preview artifact version

import { useState, useEffect, useRef } from "react"

const PHOTOS = {
  hero:      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=85&auto=format&fit=crop&crop=face",
  community: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=700&q=85&auto=format&fit=crop",
  medical:   "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80&auto=format&fit=crop",
  education: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80&auto=format&fit=crop",
  faith:     "https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=600&q=80&auto=format&fit=crop",
  giving:    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80&auto=format&fit=crop",
  phone:     "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop",
  accra:     "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80&auto=format&fit=crop",
  family:    "https://images.unsplash.com/photo-1520350094754-f0fdcac35c1c?w=600&q=80&auto=format&fit=crop",
  sport:     "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&q=80&auto=format&fit=crop",
  volunteer: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80&auto=format&fit=crop",
  business:  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop",
}

const CATS = [
  { name:"Medical",   img: PHOTOS.medical,   color:"#FF6B6B" },
  { name:"Education", img: PHOTOS.education, color:"#4ECDC4" },
  { name:"Faith",     img: PHOTOS.faith,     color:"#A8E6CF" },
  { name:"Community", img: PHOTOS.community, color:"#FFD93D" },
  { name:"Family",    img: PHOTOS.family,    color:"#6C63FF" },
  { name:"Sports",    img: PHOTOS.sport,     color:"#FF8B64" },
  { name:"Volunteer", img: PHOTOS.volunteer, color:"#02A95C" },
  { name:"Business",  img: PHOTOS.business,  color:"#1A2B3C" },
]

const CAMPAIGNS = [
  { title:"Help Ama pay for kidney surgery at Korle Bu", name:"Ama Mensah · Accra", raised:14400, goal:20000, img:PHOTOS.medical,   cat:"Medical",   verified:true  },
  { title:"Kofi's final year fees — KNUST Engineering",  name:"Kofi Asante · Kumasi", raised:2100,  goal:4500,  img:PHOTOS.education,cat:"Education", verified:true  },
  { title:"New roof for Victory Baptist Church, Tema",    name:"Victory Baptist · Tema",raised:18000, goal:30000, img:PHOTOS.faith,    cat:"Faith",     verified:true  },
  { title:"Borehole for Breman Asikuma — 500 families",  name:"Breman Community",     raised:8750,  goal:15000, img:PHOTOS.community,cat:"Community",verified:false },
  { title:"School kits for 30 orphaned children, Accra", name:"Hope Foundation",       raised:3200,  goal:5000,  img:PHOTOS.giving,   cat:"Charity",   verified:true  },
  { title:"Support Kwame — Ghana Black Stars youth",     name:"Kwame Mensah · Accra", raised:1800,  goal:6000,  img:PHOTOS.sport,    cat:"Sports",    verified:false },
]

function useCountUp(target, duration, active) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start
    const step = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active])
  return val
}

export default function HomePage() {
  const [search, setSearch] = useState("")
  const [statsOn, setStatsOn] = useState(false)
  const [donationPop, setDonationPop] = useState(false)
  const [notifIdx, setNotifIdx] = useState(0)
  const statsRef = useRef(null)

  const raised = useCountUp(2412500, 2800, statsOn)
  const camps  = useCountUp(1247,    2200, statsOn)
  const donors = useCountUp(8934,    2500, statsOn)

  const NOTIFS = [
    { name:"Kwame donated ₵200", sub:"via MTN MoMo · just now" },
    { name:"Abena donated ₵50",  sub:"via Vodafone Cash · 2 min ago" },
    { name:"Yaw donated ₵500",   sub:"via AirtelTigo · 5 min ago" },
    { name:"Esi donated ₵100",   sub:"via MTN MoMo · 8 min ago" },
  ]

  useEffect(() => {
    const t1 = setTimeout(() => setDonationPop(true), 1200)
    const t2 = setInterval(() => setNotifIdx(i => (i + 1) % NOTIFS.length), 3500)
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsOn(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => { clearTimeout(t1); clearInterval(t2); obs.disconnect() }
  }, [])

  const fmtRaised = raised >= 1000000
    ? `₵${(raised/1000000).toFixed(1)}M`
    : `₵${raised.toLocaleString()}`

  return (
    <div style={{ fontFamily:"'Nunito', 'Nunito Sans', sans-serif", background:"#fff", overflowX:"hidden", color:"#1A2B3C" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Nunito+Sans:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hover-lift { transition: transform .25s, box-shadow .25s; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,.12); }
        .img-zoom img { transition: transform .5s; }
        .img-zoom:hover img { transform: scale(1.07); }
        @keyframes slideIn { from { transform:translateY(12px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes fadeUp  { from { transform:translateY(24px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes pulse   { 0%,100% { transform:scale(1) } 50% { transform:scale(1.05) } }
        .notif-enter { animation: slideIn .4s ease both; }
        .fade-up { animation: fadeUp .7s ease both; }
        .pulse { animation: pulse 2s ease infinite; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        .progress-bar { height:6px; background:#f0f0f0; border-radius:99px; overflow:hidden; }
        .progress-fill { height:100%; background:#02A95C; border-radius:99px; transition:width .8s ease; }
        input:focus { outline: none; }
        ::-webkit-scrollbar { display:none; }
      `}</style>

      {/* ── NAVBAR ───────────────────────────────── */}
      <nav style={{ background:"#fff", borderBottom:"1px solid #f0f0f0", padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 1px 0 #f0f0f0" }}>
        <div style={{ fontWeight:900, fontSize:22, letterSpacing:-0.5 }}>
          <span style={{ color:"#02A95C" }}>Every</span><span style={{ color:"#1A2B3C" }}>Giving</span>
        </div>
        <div style={{ display:"flex", gap:28, fontSize:13, fontWeight:700, color:"#475569" }}>
          {["How it works","Donate","About"].map(l => (
            <span key={l} style={{ cursor:"pointer", transition:"color .2s" }}
              onMouseEnter={e => e.target.style.color="#02A95C"}
              onMouseLeave={e => e.target.style.color="#475569"}>{l}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button style={{ padding:"8px 20px", border:"2px solid #e2e8f0", borderRadius:99, fontSize:13, fontWeight:700, background:"#fff", cursor:"pointer", color:"#1A2B3C" }}>Sign in</button>
          <button style={{ padding:"8px 20px", borderRadius:99, fontSize:13, fontWeight:900, background:"#02A95C", color:"#fff", border:"none", cursor:"pointer" }}>Start a campaign</button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────── */}
      <section style={{ background:"#fff", display:"grid", gridTemplateColumns:"1fr 1fr", minHeight:580, maxWidth:1200, margin:"0 auto", padding:"0 40px", gap:0, alignItems:"center" }}>

        {/* Left */}
        <div className="fade-up" style={{ paddingRight:48, paddingBottom:40, paddingTop:24 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#f0fdf6", border:"1px solid rgba(2,169,92,.2)", borderRadius:99, padding:"6px 14px", marginBottom:20 }}>
            <span style={{ width:7, height:7, background:"#02A95C", borderRadius:"50%", display:"inline-block" }} className="pulse" />
            <span style={{ fontSize:12, fontWeight:700, color:"#02A95C" }}>Ghana's verified crowdfunding platform</span>
          </div>
          <h1 style={{ fontSize:"clamp(36px,4vw,52px)", fontWeight:900, lineHeight:1.03, letterSpacing:-2, color:"#1A2B3C", marginBottom:18 }}>
            Ghana's home for<br/>trusted{" "}
            <span style={{ color:"#02A95C" }}>fundraising</span>
          </h1>
          <p style={{ fontSize:17, color:"#64748b", lineHeight:1.65, marginBottom:28, maxWidth:420 }}>
            Ghana Card verified. MoMo native. Donors know exactly who they're giving to — and money arrives same day.
          </p>

          {/* Search bar */}
          <div style={{ display:"flex", maxWidth:460, marginBottom:20, borderRadius:99, overflow:"hidden", border:"2px solid #e2e8f0", transition:"border .2s" }}
            onFocus={() => {}} >
            <div style={{ position:"relative", flex:1 }}>
              <svg style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"#94a3b8" }} width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search campaigns…"
                style={{ width:"100%", border:"none", padding:"14px 14px 14px 42px", fontSize:14, fontFamily:"inherit", background:"#fff", color:"#1A2B3C" }} />
            </div>
            <button style={{ background:"#02A95C", color:"#fff", border:"none", padding:"0 28px", fontSize:14, fontWeight:900, cursor:"pointer", fontFamily:"inherit" }}>Search</button>
          </div>

          {/* Category pills */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {["Medical","Education","Emergency","Faith","Community"].map(c => (
              <button key={c} style={{ fontSize:12, fontWeight:700, color:"#64748b", border:"1.5px solid #e2e8f0", padding:"7px 14px", borderRadius:99, background:"#f8fafc", cursor:"pointer", transition:"all .2s", fontFamily:"inherit" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#02A95C"; e.currentTarget.style.color="#02A95C"; e.currentTarget.style.background="#f0fdf6" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#e2e8f0"; e.currentTarget.style.color="#64748b"; e.currentTarget.style.background="#f8fafc" }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Right — Photo + floating cards */}
        <div style={{ position:"relative", height:520, alignSelf:"flex-end" }}>
          <img src={PHOTOS.hero} alt="Fundraiser"
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center", borderRadius:"40px 40px 0 0", display:"block" }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(26,43,60,.15), transparent)", borderRadius:"40px 40px 0 0" }} />

          {/* Campaign card */}
          <div style={{ position:"absolute", left:-40, bottom:60, background:"#fff", borderRadius:20, boxShadow:"0 20px 60px rgba(0,0,0,.15)", padding:18, width:260, border:"1px solid #f0f0f0" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <img src={PHOTOS.accra} alt="" style={{ width:40, height:40, borderRadius:"50%", objectFit:"cover", border:"2.5px solid #02A95C" }} />
              <div>
                <div style={{ fontWeight:900, fontSize:12, color:"#1A2B3C" }}>Ama Mensah</div>
                <div style={{ fontSize:10, color:"#02A95C", fontWeight:700 }}>✓ Ghana Card Verified · Accra</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:"#64748b", marginBottom:10, lineHeight:1.4 }}>Help with kidney surgery at Korle Bu Teaching Hospital</div>
            <div className="progress-bar" style={{ marginBottom:8 }}>
              <div className="progress-fill" style={{ width:"72%" }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
              <span style={{ fontWeight:900, color:"#1A2B3C" }}>₵14,400 raised</span>
              <span style={{ fontWeight:900, color:"#02A95C" }}>72%</span>
            </div>
          </div>

          {/* Live donation notification */}
          {donationPop && (
            <div key={notifIdx} className="notif-enter"
              style={{ position:"absolute", top:32, left:-28, background:"#fff", borderRadius:16, boxShadow:"0 12px 40px rgba(0,0,0,.14)", padding:"12px 16px", display:"flex", alignItems:"center", gap:12, minWidth:230, border:"1px solid #f0f0f0" }}>
              <div style={{ width:36, height:36, background:"#02A95C", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>💚</div>
              <div>
                <div style={{ fontSize:12, fontWeight:900, color:"#1A2B3C" }}>{NOTIFS[notifIdx].name}</div>
                <div style={{ fontSize:10, color:"#94a3b8" }}>{NOTIFS[notifIdx].sub}</div>
              </div>
            </div>
          )}

          {/* Verification badge */}
          <div style={{ position:"absolute", top:100, right:-18, background:"#1A2B3C", borderRadius:12, padding:"10px 14px", boxShadow:"0 8px 24px rgba(0,0,0,.3)" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.5)", marginBottom:2 }}>Identity verified</div>
            <div style={{ fontSize:13, fontWeight:900, color:"#02A95C" }}>✓ Ghana Card</div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────── */}
      <div style={{ borderTop:"1px solid #f0f0f0", borderBottom:"1px solid #f0f0f0", background:"#fafafa", padding:"14px 40px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"6px 40px", fontSize:12, fontWeight:600, color:"#94a3b8" }}>
          {[
            ["🪪","Ghana Card identity verified"],
            ["📱","MTN · Vodafone · AirtelTigo"],
            ["⚡","Same-day MoMo payout"],
            ["💸","2% + ₵0.25 only · no platform fee"],
            ["🔒","Encrypted & secure"],
          ].map(([icon, text]) => (
            <div key={text} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:15 }}>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ────────────────────────────────── */}
      <section ref={statsRef} style={{ background:"#fff", padding:"72px 40px", textAlign:"center" }}>
        <div style={{ fontSize:11, fontWeight:800, letterSpacing:3, color:"#02A95C", textTransform:"uppercase", marginBottom:10, fontFamily:"monospace" }}>Impact so far</div>
        <h2 style={{ fontSize:36, fontWeight:900, letterSpacing:-1.5, marginBottom:52, color:"#1A2B3C" }}>Ghanaians helping Ghanaians</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:32, maxWidth:700, margin:"0 auto" }}>
          {[
            { val: fmtRaised,             label:"Total raised",       sub:"and counting" },
            { val: `${camps.toLocaleString()}+`, label:"Campaigns funded", sub:"across 17 categories" },
            { val: `${donors.toLocaleString()}+`,label:"Generous donors",  sub:"all across Ghana" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize:"clamp(36px,5vw,52px)", fontWeight:900, color:"#02A95C", lineHeight:1, marginBottom:8 }}>{s.val}</div>
              <div style={{ fontWeight:800, fontSize:15, color:"#1A2B3C", marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:12, color:"#94a3b8" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BROWSE BY CAUSE ──────────────────────── */}
      <section style={{ background:"#f8fafb", padding:"72px 40px", borderTop:"1px solid #f0f0f0" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:3, color:"#02A95C", textTransform:"uppercase", marginBottom:8, fontFamily:"monospace" }}>Find your cause</div>
              <h2 style={{ fontSize:34, fontWeight:900, letterSpacing:-1.5, color:"#1A2B3C" }}>Browse by category</h2>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:"#02A95C", cursor:"pointer" }}>See all 17 →</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {CATS.map((cat, i) => (
              <div key={i} className="img-zoom hover-lift"
                style={{ borderRadius:20, overflow:"hidden", aspectRatio:"4/3", position:"relative", cursor:"pointer" }}>
                <img src={cat.img} alt={cat.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,.65) 0%, rgba(0,0,0,.1) 60%, transparent 100%)" }} />
                <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"14px 16px" }}>
                  <div style={{ fontWeight:900, color:"#fff", fontSize:15, textShadow:"0 1px 4px rgba(0,0,0,.3)" }}>{cat.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────── */}
      <section style={{ background:"#fff", padding:"72px 40px", borderTop:"1px solid #f0f0f0" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:3, color:"#02A95C", textTransform:"uppercase", marginBottom:10, fontFamily:"monospace" }}>Simple process</div>
            <h2 style={{ fontSize:38, fontWeight:900, letterSpacing:-1.5, color:"#1A2B3C" }}>Start fundraising in minutes</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28 }}>
            {[
              { n:"1", img:PHOTOS.phone,   title:"Create your campaign",      desc:"Write your story, set your goal, upload a photo. Our guided form takes under 15 minutes — no tech skills needed." },
              { n:"2", img:PHOTOS.accra,   title:"Verify your identity",      desc:"Upload your Ghana Card, Passport or Driver's Licence. Verified campaigns raise 3× more — donors give when they trust who they're giving to." },
              { n:"3", img:PHOTOS.giving,  title:"Share and receive MoMo",    desc:"Share on WhatsApp. Donations come in from MTN MoMo, Vodafone Cash and AirtelTigo — directly to your wallet, same day." },
            ].map((step, i) => (
              <div key={i} className="hover-lift" style={{ borderRadius:20, overflow:"hidden", background:"#f8fafb", border:"1px solid #f0f0f0", cursor:"pointer" }}>
                <div className="img-zoom" style={{ height:200, overflow:"hidden", position:"relative" }}>
                  <img src={step.img} alt={step.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                  <div style={{ position:"absolute", inset:0, background:"rgba(26,43,60,.25)" }} />
                  <div style={{ position:"absolute", top:16, left:16, width:40, height:40, background:"#02A95C", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:18, boxShadow:"0 4px 16px rgba(2,169,92,.4)" }}>
                    {step.n}
                  </div>
                </div>
                <div style={{ padding:"20px 22px" }}>
                  <h3 style={{ fontWeight:900, fontSize:17, color:"#1A2B3C", marginBottom:8 }}>{step.title}</h3>
                  <p style={{ fontSize:13, color:"#64748b", lineHeight:1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE CAMPAIGNS ───────────────────────── */}
      <section style={{ background:"#f8fafb", padding:"72px 40px", borderTop:"1px solid #f0f0f0" }}>
        <div style={{ maxWidth:1160, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:3, color:"#02A95C", textTransform:"uppercase", marginBottom:8, fontFamily:"monospace" }}>Verified campaigns</div>
              <h2 style={{ fontSize:34, fontWeight:900, letterSpacing:-1.5, color:"#1A2B3C" }}>Live right now</h2>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color:"#02A95C", cursor:"pointer" }}>See all campaigns →</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {CAMPAIGNS.map((c, i) => {
              const pct = Math.round((c.raised / c.goal) * 100)
              return (
                <div key={i} className="hover-lift" style={{ background:"#fff", borderRadius:20, overflow:"hidden", border:"1px solid #f0f0f0", cursor:"pointer" }}>
                  <div className="img-zoom" style={{ height:192, overflow:"hidden", position:"relative" }}>
                    <img src={c.img} alt={c.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    {c.verified && (
                      <div style={{ position:"absolute", top:12, right:12, background:"#02A95C", color:"#fff", fontSize:10, fontWeight:900, padding:"4px 10px", borderRadius:99, letterSpacing:.5 }}>✓ VERIFIED</div>
                    )}
                  </div>
                  <div style={{ padding:20 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                      <span style={{ width:6, height:6, background:"#02A95C", borderRadius:"50%", display:"inline-block" }} />
                      <span style={{ fontSize:10, fontWeight:800, color:"#02A95C", textTransform:"uppercase", letterSpacing:1 }}>{c.cat}</span>
                    </div>
                    <div style={{ fontWeight:800, fontSize:14, color:"#1A2B3C", marginBottom:5, lineHeight:1.35 }} className="line-clamp-2">{c.title}</div>
                    <div style={{ fontSize:11, color:"#94a3b8", marginBottom:12 }}>{c.name}</div>
                    <div className="progress-bar" style={{ marginBottom:8 }}>
                      <div className="progress-fill" style={{ width:`${pct}%` }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontWeight:900, fontSize:14, color:"#1A2B3C" }}>₵{c.raised.toLocaleString()} <span style={{ fontWeight:400, fontSize:11, color:"#94a3b8" }}>raised</span></span>
                      <span style={{ fontWeight:900, fontSize:12, color:"#02A95C" }}>{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ textAlign:"center", marginTop:32 }}>
            <button style={{ border:"2px solid #02A95C", color:"#02A95C", background:"#fff", padding:"13px 36px", borderRadius:99, fontSize:14, fontWeight:900, cursor:"pointer", fontFamily:"inherit", transition:"all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.background="#02A95C"; e.currentTarget.style.color="#fff" }}
              onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.color="#02A95C" }}>
              See all verified campaigns →
            </button>
          </div>
        </div>
      </section>

      {/* ── WHY EVERYGIVING ──────────────────────── */}
      <section style={{ background:"#fff", padding:"80px 40px", borderTop:"1px solid #f0f0f0" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>

          {/* Photo collage */}
          <div style={{ position:"relative", height:460 }}>
            <img src={PHOTOS.community} alt="" style={{ position:"absolute", top:0, left:0, width:260, height:260, objectFit:"cover", borderRadius:20, boxShadow:"0 16px 48px rgba(0,0,0,.15)", border:"4px solid #fff" }} />
            <img src={PHOTOS.medical}   alt="" style={{ position:"absolute", bottom:0, left:40, width:200, height:200, objectFit:"cover", borderRadius:20, boxShadow:"0 12px 36px rgba(0,0,0,.14)", border:"4px solid #fff" }} />
            <img src={PHOTOS.accra}     alt="" style={{ position:"absolute", top:30, right:0, width:180, height:240, objectFit:"cover", borderRadius:20, boxShadow:"0 12px 36px rgba(0,0,0,.12)", border:"4px solid #fff" }} />
            <div style={{ position:"absolute", bottom:48, right:8, background:"#02A95C", color:"#fff", borderRadius:16, padding:"12px 18px", boxShadow:"0 8px 32px rgba(2,169,92,.4)" }}>
              <div style={{ fontSize:26, fontWeight:900 }}>₵2.4M+</div>
              <div style={{ fontSize:11, opacity:.8 }}>raised in Ghana 🇬🇭</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:3, color:"#02A95C", textTransform:"uppercase", marginBottom:12, fontFamily:"monospace" }}>Built for Ghana</div>
            <h2 style={{ fontSize:36, fontWeight:900, letterSpacing:-1.5, color:"#1A2B3C", marginBottom:28, lineHeight:1.1 }}>
              Everything GoFundMe<br/>doesn't have
            </h2>
            {[
              { icon:"🪪", title:"Ghana Card verification", desc:"Every fundraiser verifies their identity before going live. Donors give 3× more to verified campaigns. Trust is everything." },
              { icon:"📱", title:"Built for mobile money",  desc:"MTN MoMo, Vodafone Cash and AirtelTigo built in from day one. No bank account required. Donations arrive same day." },
              { icon:"💸", title:"Honest, transparent fees",desc:"Only 2% + ₵0.25 per donation — auto-deducted. No platform fee. No monthly bill. No surprises. Ever." },
            ].map((item, i) => (
              <div key={i} style={{ display:"flex", gap:18, marginBottom:22 }}>
                <div style={{ width:48, height:48, background:"#f0fdf6", border:"1.5px solid rgba(2,169,92,.15)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight:900, fontSize:15, color:"#1A2B3C", marginBottom:4 }}>{item.title}</div>
                  <div style={{ fontSize:13, color:"#64748b", lineHeight:1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
            <div style={{ display:"flex", gap:12, marginTop:8 }}>
              <button style={{ padding:"13px 28px", background:"#02A95C", color:"#fff", border:"none", borderRadius:99, fontSize:14, fontWeight:900, cursor:"pointer", fontFamily:"inherit" }}>
                Start a campaign →
              </button>
              <button style={{ padding:"12px 24px", border:"2px solid #e2e8f0", borderRadius:99, fontSize:14, fontWeight:700, background:"#fff", cursor:"pointer", fontFamily:"inherit", color:"#64748b" }}>
                Learn more
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section style={{ background:"#1A2B3C", padding:"72px 40px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:44 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:3, color:"#02A95C", textTransform:"uppercase", marginBottom:10, fontFamily:"monospace" }}>Real stories</div>
            <h2 style={{ fontSize:36, fontWeight:900, letterSpacing:-1.5, color:"#fff", lineHeight:1.1 }}>
              People just like you<br/>raised money here
            </h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
            {[
              { name:"Ama Korantema", loc:"Accra", raised:"₵18,500", cat:"Medical", img:PHOTOS.hero,      quote:"I raised ₵18,500 in 3 weeks. Strangers donated because they could see my Ghana Card was verified. The badge made all the difference." },
              { name:"Pastor Isaac Asare", loc:"Kumasi", raised:"₵42,000", cat:"Faith", img:PHOTOS.faith,  quote:"Our church needed a new roof. I shared in 5 WhatsApp groups. In two months we had more than enough. The Verified badge was everything." },
              { name:"Adjoa Mensah",  loc:"Tema",  raised:"₵9,200",  cat:"Education", img:PHOTOS.education, quote:"My daughter got into university but we couldn't pay the fees. In two weeks, 67 people donated. She started school. I still cry thinking about it." },
            ].map((t, i) => (
              <div key={i} style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:20, padding:24, transition:"background .2s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.08)"}
                onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.05)"}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <img src={t.img} alt={t.name} style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", border:"2px solid #02A95C" }} />
                  <div>
                    <div style={{ fontWeight:900, fontSize:13, color:"#fff" }}>{t.name}</div>
                    <div style={{ fontSize:11, color:"#02A95C", fontWeight:600 }}>{t.loc} · Raised {t.raised}</div>
                  </div>
                </div>
                <div style={{ display:"inline-block", fontSize:10, color:"rgba(255,255,255,.4)", background:"rgba(255,255,255,.07)", borderRadius:99, padding:"3px 10px", marginBottom:12, fontWeight:700 }}>{t.cat}</div>
                <p style={{ fontSize:13, color:"rgba(255,255,255,.6)", lineHeight:1.7, fontStyle:"italic" }}>"{t.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEES STRIP ───────────────────────────── */}
      <section style={{ background:"#fff", padding:"56px 40px", borderBottom:"1px solid #f0f0f0" }}>
        <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:11, fontWeight:800, letterSpacing:3, color:"#02A95C", textTransform:"uppercase", marginBottom:10, fontFamily:"monospace" }}>Transparent pricing</div>
          <h2 style={{ fontSize:32, fontWeight:900, letterSpacing:-1.5, color:"#1A2B3C", marginBottom:10 }}>Simple, honest fees</h2>
          <p style={{ fontSize:15, color:"#64748b", marginBottom:36, maxWidth:480, margin:"0 auto 36px" }}>
            One small transaction fee per donation — automatically deducted. No platform fee. No monthly bill.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
            {[
              { icon:"🎯", title:"0% platform fee",        desc:"Starting a campaign is completely free. We never charge to create or maintain your campaign." },
              { icon:"💸", title:"2% + ₵0.25 per donation",desc:"The only cost. Automatically deducted from each donation — no invoice, no hassle." },
              { icon:"📱", title:"Free MoMo payout",       desc:"Withdrawing to your wallet is always free. Your money arrives same day." },
            ].map((item, i) => (
              <div key={i} style={{ background:"#f8fafb", border:"1px solid #f0f0f0", borderRadius:20, padding:"24px 22px", textAlign:"left" }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{item.icon}</div>
                <div style={{ fontWeight:900, fontSize:15, color:"#1A2B3C", marginBottom:6 }}>{item.title}</div>
                <div style={{ fontSize:13, color:"#64748b", lineHeight:1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:"#02A95C", cursor:"pointer" }}>
            Calculate exactly what you'll receive with our fee calculator →
          </span>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────── */}
      <section style={{ position:"relative", overflow:"hidden" }}>
        <img src={PHOTOS.community} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
        <div style={{ position:"absolute", inset:0, background:"rgba(26,43,60,.88)" }} />
        <div style={{ position:"relative", textAlign:"center", padding:"96px 40px", maxWidth:680, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(36px,5vw,52px)", fontWeight:900, color:"#fff", letterSpacing:-2, marginBottom:14, lineHeight:1.06 }}>
            Start your campaign<br/><span style={{ color:"#02A95C" }}>today</span>
          </h2>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.55)", marginBottom:36, lineHeight:1.6 }}>
            Free to create. Ghana Card verified in minutes.<br/>MoMo donations from day one.
          </p>
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <button style={{ padding:"16px 36px", background:"#02A95C", color:"#fff", border:"none", borderRadius:99, fontSize:16, fontWeight:900, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 8px 32px rgba(2,169,92,.35)", transition:"transform .2s" }}
              onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
              Start a campaign — it's free →
            </button>
            <button style={{ padding:"15px 30px", background:"rgba(255,255,255,.1)", color:"#fff", border:"1.5px solid rgba(255,255,255,.2)", borderRadius:99, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              Donate to a campaign
            </button>
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.25)", marginTop:20 }}>No credit card · No platform fee · Ghana Card verified</p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────── */}
      <footer style={{ background:"#0f1a26", padding:"48px 40px 28px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:40, marginBottom:40 }}>
            <div>
              <div style={{ fontWeight:900, fontSize:22, letterSpacing:-0.5, marginBottom:12 }}>
                <span style={{ color:"#02A95C" }}>Every</span><span style={{ color:"#fff" }}>Giving</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.35)", lineHeight:1.7, maxWidth:260 }}>
                Ghana's verified crowdfunding platform. Identity-verified. MoMo-native. Built for Ghanaians.
              </p>
            </div>
            {[
              { h:"Fundraise", links:["Start a campaign","How it works","Verification","Fundraising tips","Team fundraising"] },
              { h:"Donate",    links:["Browse campaigns","Medical","Education","Faith","Emergency"] },
              { h:"Company",   links:["About us","Blog","Help centre","Contact","Transparency"] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontWeight:900, fontSize:13, color:"#fff", marginBottom:14 }}>{col.h}</div>
                {col.links.map(l => (
                  <div key={l} style={{ fontSize:13, color:"rgba(255,255,255,.35)", marginBottom:9, cursor:"pointer", transition:"color .2s" }}
                    onMouseEnter={e => e.currentTarget.style.color="#02A95C"}
                    onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,.35)"}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>© 2025 EveryGiving · Accra, Ghana</div>
            <div style={{ display:"flex", gap:20, fontSize:12, color:"rgba(255,255,255,.2)" }}>
              {["Terms","Privacy","Cookies"].map(l => (
                <span key={l} style={{ cursor:"pointer" }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
