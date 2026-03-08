'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

// ── PHOTOS ────────────────────────────────────────────────────────────────────
const P = {
  hero:      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&q=90&auto=format&fit=crop',
  hero2:     'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=85&auto=format&fit=crop',
  medical:   'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=480&q=80&auto=format&fit=crop',
  education: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=480&q=80&auto=format&fit=crop',
  faith:     'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=480&q=80&auto=format&fit=crop',
  community: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=480&q=80&auto=format&fit=crop',
  giving:    'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80&auto=format&fit=crop',
  phone:     'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop',
  accra:     'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80&auto=format&fit=crop',
  family:    'https://images.unsplash.com/photo-1520350094754-f0fdcac35c1c?w=480&q=80&auto=format&fit=crop',
  sport:     'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=480&q=80&auto=format&fit=crop',
  volunteer: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=480&q=80&auto=format&fit=crop',
}

const CATEGORIES = [
  { name: 'Medical',     img: P.medical,   slug: 'medical' },
  { name: 'Education',   img: P.education, slug: 'education' },
  { name: 'Faith',       img: P.faith,     slug: 'faith' },
  { name: 'Community',   img: P.community, slug: 'community' },
  { name: 'Family',      img: P.family,    slug: 'family' },
  { name: 'Sports',      img: P.sport,     slug: 'sports' },
  { name: 'Volunteer',   img: P.volunteer, slug: 'volunteer' },
  { name: 'Emergency',   img: P.giving,    slug: 'emergency' },
]

const EMOJI: Record<string, string> = {
  medical:'🏥',emergency:'🆘',education:'🎓',charity:'🤲',faith:'⛪',
  community:'🏘',environment:'🌿',business:'💼',family:'👨‍👩‍👧',
  sports:'⚽',events:'🎉',wishes:'🌟',memorial:'🕊',other:'💚',
}

// Count-up hook
function useCountUp(target: number, duration = 2000, active = false) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start: number
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, duration])
  return val
}

function CampaignCard({ c }: { c: any }) {
  const pct = c.goal_amount ? Math.min(Math.round((c.raised_amount / c.goal_amount) * 100), 100) : 0
  return (
    <Link href={`/campaigns/${c.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
      <div className="h-48 relative overflow-hidden bg-gray-100">
        {c.image_url
          ? <img src={c.image_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-gradient-to-br from-[#e6f9f1] to-blue-50 flex items-center justify-center text-5xl">{EMOJI[c.category?.toLowerCase()] || '💚'}</div>}
        {c.verified && <div className="absolute top-3 right-3 bg-[#02A95C] text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wide">✓ VERIFIED</div>}
      </div>
      <div className="p-5">
        <div className="font-bold text-[#1A2B3C] text-sm mb-1 line-clamp-2 group-hover:text-[#02A95C] transition-colors leading-snug">{c.title}</div>
        <div className="text-gray-400 text-xs mb-3">{c.profiles?.full_name || 'Anonymous'}</div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-[#02A95C] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between items-center">
          <span className="font-black text-[#1A2B3C] text-sm">₵{(c.raised_amount||0).toLocaleString()} <span className="text-gray-400 font-normal text-xs">raised</span></span>
          <span className="text-[#02A95C] font-black text-xs">{pct}%</span>
        </div>
      </div>
    </Link>
  )
}

// Placeholder cards
const PLACEHOLDERS = [
  { title: "Help Ama pay for her kidney surgery at Korle Bu", name: 'Ama Mensah · Accra', raised: 14400, goal: 20000, img: P.medical, cat: 'Medical' },
  { title: "Kofi's final year university fees — KNUST Engineering", name: 'Kofi Asante · Kumasi', raised: 2100, goal: 4500, img: P.education, cat: 'Education' },
  { title: 'New roof for Victory Baptist Church, Tema Community 8', name: 'Victory Baptist · Tema', raised: 18000, goal: 30000, img: P.faith, cat: 'Faith' },
  { title: 'Borehole project for Breman Asikuma — 500 families', name: 'Breman Community', raised: 8750, goal: 15000, img: P.community, cat: 'Community' },
  { title: 'School uniform and books for 30 orphaned children', name: 'Hope Foundation · Accra', raised: 3200, goal: 5000, img: P.giving, cat: 'Charity' },
  { title: 'Support Kwame Mensah — Ghana Black Stars youth league', name: 'Kwame Mensah · Accra', raised: 1800, goal: 6000, img: P.sport, cat: 'Sports' },
]

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [statsVisible, setStatsVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const statsRef = useRef<HTMLDivElement>(null)

  const raised = useCountUp(2412500, 2800, statsVisible)
  const campaignCount = useCountUp(1247, 2200, statsVisible)
  const donors = useCountUp(8934, 2500, statsVisible)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('campaigns').select('*, profiles(full_name)')
      .eq('status', 'approved').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setCampaigns(data || []))

    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  const displayCampaigns = campaigns.length > 0 ? campaigns : null

  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden">

        {/* ══════════════════════════════════════════
            HERO — GoFundMe style: big headline,
            search bar, split photo layout
        ══════════════════════════════════════════ */}
        <section className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 md:px-10 pt-14 pb-0 grid md:grid-cols-2 gap-0 items-end min-h-[560px]">

            {/* Left — text + search */}
            <div className="pb-14 md:pb-20 pr-0 md:pr-12 flex flex-col justify-center">
              <h1 className="font-nunito font-black text-[#1A2B3C] text-5xl md:text-[4rem] leading-[1.02] tracking-tight mb-4" style={{letterSpacing:-2}}>
                Raise money with
                confidence in<br />
                <span className="text-[#02A95C]">Ghana</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-md">
                Every fundraiser is identity-verified by our team. Donations are released to your MoMo wallet as you hit milestones. Zero platform fees — always.
              </p>

              {/* Search bar — GoFundMe style */}
              <div className="flex gap-0 max-w-md mb-6">
                <div className="relative flex-1">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && window.location.assign(`/campaigns?q=${searchQuery}`)}
                    placeholder="Search campaigns…"
                    className="w-full pl-10 pr-4 py-4 border-2 border-r-0 border-gray-200 rounded-l-full text-sm outline-none focus:border-[#02A95C] transition-colors bg-white"
                  />
                </div>
                <Link href={`/campaigns?q=${searchQuery}`}
                  className="bg-[#02A95C] hover:bg-[#028a4a] text-white font-nunito font-black text-sm px-7 rounded-r-full transition-all whitespace-nowrap flex items-center">
                  Search
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Medical','Education','Emergency','Faith','Community'].map(cat => (
                  <Link key={cat} href={`/campaigns?category=${cat.toLowerCase()}`}
                    className="text-xs font-semibold text-gray-500 hover:text-[#02A95C] border border-gray-200 hover:border-[#02A95C]/40 px-3.5 py-2 rounded-full transition-all bg-gray-50 hover:bg-[#f0fdf6]">
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right — stacked campaign cards over photo */}
            <div className="relative hidden md:block self-end">
              <img src={P.hero} alt="Fundraiser" className="w-full h-[500px] object-cover object-top rounded-tl-[40px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-tl-[40px]" />

              {/* Floating verified card */}
              <div className="absolute -left-10 bottom-16 bg-white rounded-2xl shadow-2xl p-4 w-64 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <img src={P.accra} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-[#02A95C]" />
                  <div>
                    <div className="font-black text-[#1A2B3C] text-xs">Ama Mensah</div>
                    <div className="text-[#02A95C] text-[10px] font-bold flex items-center gap-1">✓ Ghana Card Verified · Accra</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2.5 leading-snug">Help with kidney surgery at Korle Bu Teaching Hospital</div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-[#02A95C] rounded-full w-[72%]" />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-black text-[#1A2B3C]">₵14,400 raised</span>
                  <span className="text-[#02A95C] font-black">72%</span>
                </div>
              </div>

              {/* Donation notification */}
              <div className="absolute top-8 -left-8 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 border border-gray-100">
                <div className="w-8 h-8 bg-[#02A95C] rounded-full flex items-center justify-center text-sm flex-shrink-0">💚</div>
                <div>
                  <div className="text-xs font-black text-[#1A2B3C]">New donation</div>
                  <div className="text-[10px] text-gray-400">Kwame donated ₵200 via MTN MoMo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom wave into next section */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-100" />
        </section>

        {/* ══════════════════════════════════════════
            TRUST STRIP — like GoFundMe's "as seen in"
        ══════════════════════════════════════════ */}
        <section className="border-y border-gray-100 bg-gray-50 py-5">
          <div className="max-w-5xl mx-auto px-6 flex flex-wrap justify-center gap-8 text-xs font-semibold text-gray-400">
            {[
              { icon: '🪪', text: 'Identity verified' },
              { icon: '📱', text: 'MTN · Vodafone · AirtelTigo' },
              { icon: '⚡', text: 'Same-day MoMo payouts' },
              { icon: '💸', text: '2% + ₵0.25 per donation · 0% platform fee' },
              { icon: '🔒', text: 'Encrypted & secure' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-base">{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            STATS — animated numbers
        ══════════════════════════════════════════ */}
        <section ref={statsRef} className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <p className="text-[#02A95C] font-bold text-xs uppercase tracking-widest mb-4" style={{fontFamily:'DM Mono, monospace'}}>Impact so far</p>
            <h2 className="font-nunito font-black text-[#1A2B3C] text-3xl md:text-4xl mb-12 tracking-tight" style={{letterSpacing:-1}}>
              The numbers speak for themselves
            </h2>
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[
                { val: `₵${raised >= 1000000 ? (raised/1000000).toFixed(1)+'M' : raised.toLocaleString()}`, label: 'Total raised', sub: 'and growing' },
                { val: campaignCount.toLocaleString()+'+', label: 'Campaigns funded', sub: 'across 17 causes' },
                { val: donors.toLocaleString()+'+', label: 'Generous donors', sub: 'right across Ghana' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-nunito font-black text-[#02A95C] text-4xl md:text-5xl leading-none mb-2">{s.val}</div>
                  <div className="font-bold text-[#1A2B3C] text-sm mb-1">{s.label}</div>
                  <div className="text-gray-400 text-xs">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            BROWSE BY CAUSE — real photos, GoFundMe grid
        ══════════════════════════════════════════ */}
        <section className="py-16 bg-[#f8fafb]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[#02A95C] font-bold text-xs uppercase tracking-widest mb-2" style={{fontFamily:'DM Mono, monospace'}}>Find your cause</p>
                <h2 className="font-nunito font-black text-[#1A2B3C] text-3xl tracking-tight" style={{letterSpacing:-1}}>Browse by category</h2>
              </div>
              <Link href="/fundraising-categories" className="text-[#02A95C] font-bold text-sm hover:underline hidden md:block">See all 17 categories →</Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CATEGORIES.map((cat, i) => (
                <Link key={i} href={`/campaigns?category=${cat.slug}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="font-nunito font-black text-white text-sm drop-shadow-sm">{cat.name}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-6 md:hidden">
              <Link href="/fundraising-categories" className="text-[#02A95C] font-bold text-sm hover:underline">See all 17 categories →</Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            HOW IT WORKS — 3 steps with real images
            (GoFundMe-style horizontal steps)
        ══════════════════════════════════════════ */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-[#02A95C] font-bold text-xs uppercase tracking-widest mb-3" style={{fontFamily:'DM Mono, monospace'}}>Simple process</p>
              <h2 className="font-nunito font-black text-[#1A2B3C] text-4xl tracking-tight" style={{letterSpacing:-1}}>
                From idea to funded — in three steps
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n:'1', img: P.phone, title: 'Create your campaign', desc: 'Write your story, set your goal, add a photo. Under 15 minutes — no technical skills required.', cta:'Start free →', href:'/create' },
                { n:'2', img: P.accra, title: 'Verify your identity', desc: 'Upload your Ghana Card or accepted ID. Verified fundraisers raise 3× more — because donors trust people whose identity is confirmed.', cta:'See how →', href:'/verification' },
                { n:'3', img: P.giving, title: 'Share and receive donations', desc: 'Share on WhatsApp. Donations are held securely by Hubtel and released to your MTN MoMo, Vodafone Cash, or AirtelTigo wallet when you hit your milestones.', cta:'Learn more →', href:'/how-it-works' },
              ].map((step, i) => (
                <div key={i} className="group">
                  <div className="relative rounded-2xl overflow-hidden h-52 mb-5 shadow-sm">
                    <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-[#1A2B3C]/30 group-hover:bg-[#1A2B3C]/15 transition-all" />
                    <div className="absolute top-4 left-4 w-10 h-10 bg-[#02A95C] rounded-full flex items-center justify-center shadow-lg">
                      <span className="font-nunito font-black text-white text-sm">{step.n}</span>
                    </div>
                  </div>
                  <h3 className="font-nunito font-black text-[#1A2B3C] text-xl mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{step.desc}</p>
                  <Link href={step.href} className="text-[#02A95C] font-bold text-sm hover:underline">{step.cta}</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            LIVE CAMPAIGNS — GoFundMe discovery grid
        ══════════════════════════════════════════ */}
        <section className="py-16 bg-[#f8fafb] border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[#02A95C] font-bold text-xs uppercase tracking-widest mb-2" style={{fontFamily:'DM Mono, monospace'}}>Verified campaigns</p>
                <h2 className="font-nunito font-black text-[#1A2B3C] text-3xl tracking-tight" style={{letterSpacing:-1}}>Live right now</h2>
              </div>
              <Link href="/donate" className="hidden md:block text-[#02A95C] font-bold text-sm hover:underline">See all campaigns →</Link>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {displayCampaigns
                ? displayCampaigns.map(c => <CampaignCard key={c.id} c={c} />)
                : PLACEHOLDERS.map((c, i) => {
                    const pct = Math.round((c.raised / c.goal) * 100)
                    return (
                      <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
                        <div className="h-48 overflow-hidden">
                          <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-5">
                          <div className="text-[10px] font-black text-[#02A95C] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#02A95C] rounded-full" />
                            {c.cat} · Verified
                          </div>
                          <div className="font-bold text-[#1A2B3C] text-sm mb-1 line-clamp-2 leading-snug">{c.title}</div>
                          <div className="text-gray-400 text-xs mb-3">{c.name}</div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                            <div className="h-full bg-[#02A95C] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-black text-[#1A2B3C] text-sm">₵{c.raised.toLocaleString()} <span className="text-gray-400 font-normal text-xs">raised</span></span>
                            <span className="text-[#02A95C] font-black text-xs">{pct}% of ₵{c.goal.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
            </div>

            <div className="text-center mt-8">
              <Link href="/donate"
                className="inline-flex items-center gap-2 border-2 border-[#02A95C] text-[#02A95C] font-nunito font-black px-8 py-3.5 rounded-full hover:bg-[#02A95C] hover:text-white transition-all text-sm">
                See all verified campaigns →
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            WHY EVERYGIVING — feature split
            (GoFundMe "why us" section)
        ══════════════════════════════════════════ */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

            {/* Photo collage */}
            <div className="relative h-[480px]">
              <img src={P.hero2} alt="Community"
                className="absolute top-0 left-0 w-72 h-72 object-cover rounded-2xl shadow-xl border-4 border-white" />
              <img src={P.medical} alt="Medical"
                className="absolute bottom-0 left-20 w-56 h-56 object-cover rounded-2xl shadow-xl border-4 border-white" />
              <img src={P.accra} alt="Accra"
                className="absolute top-10 right-0 w-48 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
              <div className="absolute bottom-12 right-4 bg-[#02A95C] text-white rounded-2xl px-5 py-3 shadow-xl">
                <div className="font-nunito font-black text-2xl">₵2.4M+</div>
                <div className="text-white/70 text-xs">raised in Ghana 🇬🇭</div>
              </div>
            </div>

            {/* Text */}
            <div>
              <p className="text-[#02A95C] font-bold text-xs uppercase tracking-widest mb-3" style={{fontFamily:'DM Mono, monospace'}}>Built for Ghana</p>
              <h2 className="font-nunito font-black text-[#1A2B3C] text-4xl tracking-tight mb-6" style={{letterSpacing:-1}}>
                Built for Ghana.
                <span className="text-[#02A95C]">Unlike anything else.</span>
              </h2>
              <div className="flex flex-col gap-6">
                {[
                  { icon:'🪪', title:'Ghana Card identity verification', desc:'Every fundraiser confirms their identity before going live. Donors give 3× more to verified campaigns — and now they have a reason to trust you.' },
                  { icon:'📱', title:'Built for mobile money from day one', desc:'MTN MoMo, Vodafone Cash, and AirtelTigo are built into the platform from the ground up. No bank account needed. Donations land same day.' },
                  { icon:'💸', title:'Honest fees — no surprises', desc:'Just 2% + ₵0.25 per donation, automatically deducted. Zero platform fee. Zero monthly bills. Nothing hidden. Ever.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5">
                    <div className="w-12 h-12 bg-[#f0fdf6] border border-[#02A95C]/15 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="font-nunito font-black text-[#1A2B3C] text-base mb-1">{item.title}</div>
                      <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <Link href="/create"
                  className="px-8 py-4 bg-[#02A95C] hover:bg-[#028a4a] text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-[#02A95C]/25 text-sm">
                  Start a campaign →
                </Link>
                <Link href="/about"
                  className="px-7 py-4 border-2 border-gray-200 hover:border-[#02A95C] text-gray-600 hover:text-[#02A95C] font-bold rounded-full transition-all text-sm">
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            TESTIMONIAL / SOCIAL PROOF
            (GoFundMe "people like you" section)
        ══════════════════════════════════════════ */}
        <section className="py-20 bg-[#1A2B3C] overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <p className="text-[#02A95C] font-bold text-xs uppercase tracking-widest mb-3" style={{fontFamily:'DM Mono, monospace'}}>Real stories</p>
              <h2 className="font-nunito font-black text-white text-4xl tracking-tight" style={{letterSpacing:-1}}>
                Real people.
                <span className="text-[#02A95C]">Real results.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                { name:'Ama Korantema', location:'Accra', raised:'₵18,500', cat:'Medical', quote:'I raised ₵18,500 in three weeks. Strangers donated because they could see my identity was verified. EveryGiving gave them a reason to trust me.', img: P.hero },
                { name:'Pastor Isaac Asare', location:'Kumasi', raised:'₵42,000', cat:'Faith', quote:'Our church needed a new roof. I shared the campaign across five WhatsApp groups and in two months we had more than we needed. The Verified badge changed everything.', img: P.faith },
                { name:'Adjoa Mensah', location:'Tema', raised:'₵9,200', cat:'Education', quote:'My daughter got into university but we couldn\'t pay the fees. In two weeks, 67 people donated. She started school. I still cry when I think about it.', img: P.education },
              ].map((t, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-[#02A95C]" />
                    <div>
                      <div className="font-nunito font-black text-white text-sm">{t.name}</div>
                      <div className="text-[#02A95C] text-xs font-semibold">{t.location} · Raised {t.raised}</div>
                    </div>
                  </div>
                  <div className="text-white/60 text-xs bg-white/5 rounded-full px-3 py-1 inline-block mb-3">{t.cat}</div>
                  <p className="text-white/70 text-sm leading-relaxed italic">"{t.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FEES EXPLAINER — transparent pricing
        ══════════════════════════════════════════ */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-[#02A95C] font-bold text-xs uppercase tracking-widest mb-3" style={{fontFamily:'DM Mono, monospace'}}>Transparent pricing</p>
            <h2 className="font-nunito font-black text-[#1A2B3C] text-3xl tracking-tight mb-3" style={{letterSpacing:-1}}>Simple, honest fees</h2>
            <p className="text-gray-500 text-base mb-10 max-w-lg mx-auto leading-relaxed">
              One transaction fee per donation — automatically deducted so you never receive a bill. No platform fee. No monthly charges. Nothing hidden.
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { icon:'🎯', title:'0% platform fee', desc:'We never charge a platform fee. Creating a campaign is always completely free.' },
                { icon:'💸', title:'2% + ₵0.25 per donation', desc:'The only cost. Deducted automatically from each donation before it reaches the fundraiser.' },
                { icon:'📱', title:'No payout fee', desc:'Withdrawing to your MoMo wallet is always free. Funds are released to your wallet as milestones are completed.' },
              ].map((item, i) => (
                <div key={i} className="bg-[#f8fafb] border border-gray-100 rounded-2xl p-6 text-left">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-nunito font-black text-[#1A2B3C] text-base mb-2">{item.title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>

            <Link href="/fees" className="text-[#02A95C] font-bold text-sm hover:underline">
              Calculate exactly what you'll receive →
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            FINAL CTA — full bleed, photo bg
            (GoFundMe bottom CTA)
        ══════════════════════════════════════════ */}
        <section className="relative py-28 overflow-hidden">
          <img src={P.hero2} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1A2B3C]/85" />
          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <h2 className="font-nunito font-black text-white text-5xl tracking-tight mb-4" style={{letterSpacing:-2}}>
              Create your campaign<br /><span className="text-[#02A95C]">today</span>
            </h2>
            <p className="text-white/60 text-lg mb-8 leading-relaxed">
              Free to create. Verified in minutes.<br />Donations straight to your MoMo.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/create"
                className="px-10 py-4 bg-[#02A95C] hover:bg-[#028a4a] text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-2xl shadow-[#02A95C]/30 text-base">
                Start a campaign — free →
              </Link>
              <Link href="/donate"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-full transition-all text-base">
                Donate to a campaign
              </Link>
            </div>
            <p className="text-white/30 text-xs mt-6">No credit card · No platform fee · Identity verified</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
