'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CampaignCard from '@/components/ui/CampaignCard'
import { createClient } from '@/lib/supabase'

const CATEGORIES = [
  { name: 'Medical', emoji: '🏥', slug: 'medical', desc: 'Surgery, treatment, hospital bills' },
  { name: 'Church', emoji: '⛪', slug: 'church', desc: 'Buildings, missions, outreach' },
  { name: 'Education', emoji: '🎓', slug: 'education', desc: 'School fees, scholarships' },
  { name: 'Emergency', emoji: '🆘', slug: 'emergency', desc: 'Fire, floods, urgent crises' },
  { name: 'Community', emoji: '🏡', slug: 'community', desc: 'Local projects, welfare' },
  { name: 'Business', emoji: '💼', slug: 'business', desc: 'Startups, trading capital' },
]

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  const raised = useCountUp(2412500, 2500, statsVisible)
  const campaignCount = useCountUp(1247, 2000, statsVisible)
  const donors = useCountUp(8934, 2200, statsVisible)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('campaigns').select('*, profiles(full_name)')
      .eq('status', 'approved').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setCampaigns(data || []))

    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true) }, { threshold: 0.3 })
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navbar />
      <main>

        {/* ═══════════════════════════════════════════
            SECTION 1 — HERO
        ═══════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f0fdf6] via-white to-[#e8f4ff] pt-16 pb-20">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-primary/8 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-50 to-transparent rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-primary/20 text-primary-dark px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 shadow-sm">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Ghana's #1 Verified Crowdfunding Platform 🇬🇭
              </div>

              <h1 className="font-nunito font-black text-navy text-4xl md:text-[3.2rem] leading-[1.06] tracking-tight mb-5">
                The trusted way to{' '}
                <span className="relative">
                  <span className="text-primary">raise money</span>
                  <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none">
                    <path d="M0 5 Q50 1 100 4 Q150 7 200 3" stroke="#02A95C" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5"/>
                  </svg>
                </span>{' '}
                in Ghana
              </h1>

              <p className="text-gray-500 text-base leading-relaxed mb-3 max-w-lg">
                <strong className="text-gray-700">Why send MoMo directly when you can raise 3× more with trust?</strong>{' '}
                Every Giving gives your cause a verified page, live donation tracking, and instant mobile money — so donors give with confidence.
              </p>

              <div className="flex flex-col gap-2.5 mb-7">
                {[
                  { icon: '🪪', text: 'Ghana Card verified — donors know you\'re real' },
                  { icon: '📱', text: 'MTN MoMo, Vodafone Cash & AirtelTigo built in' },
                  { icon: '💸', text: '0% platform fee — every cedi goes to your cause' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <span className="text-base">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <Link href="/create"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/25 hover:shadow-xl text-sm">
                  Start fundraiser — it's free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/campaigns"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-700 font-bold rounded-full transition-all text-sm bg-white">
                  Browse campaigns
                </Link>
              </div>

              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <span>🔒</span> No platform fee · Verified in 24hrs · Instant MoMo payout · Built in Ghana
              </p>
            </div>

            {/* Right — floating cards */}
            <div className="hidden md:block relative h-[420px]">
              {/* Main card */}
              <div className="absolute top-8 left-4 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-xl">🏥</div>
                  <div>
                    <div className="font-nunito font-black text-navy text-sm">Help Kwame's kidney surgery</div>
                    <div className="text-xs text-gray-400">Korle Bu Teaching Hospital · Accra</div>
                  </div>
                  <div className="ml-auto bg-primary-light text-primary text-xs font-bold px-2 py-1 rounded-full">✓ Verified</div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full" style={{ width: '72%' }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="font-black text-navy">₵21,600 raised</span>
                  <span className="text-gray-400">of ₵30,000 · <strong className="text-primary">72%</strong></span>
                </div>
              </div>

              {/* Donation notification */}
              <div className="absolute top-2 right-2 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 z-20 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-sm">💚</div>
                <div>
                  <div className="font-bold text-navy text-xs">Ama just donated</div>
                  <div className="text-primary font-black text-sm">₵200</div>
                </div>
              </div>

              {/* Stats card */}
              <div className="absolute bottom-8 left-0 right-4 bg-navy rounded-2xl p-5 text-white z-10">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { value: '₵2.4M+', label: 'Raised' },
                    { value: '1,247', label: 'Campaigns' },
                    { value: '0%', label: 'Platform fee' },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="font-nunito font-black text-xl text-primary">{s.value}</div>
                      <div className="text-xs text-white/50">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified badge floating */}
              <div className="absolute top-44 -left-4 bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2 z-20 flex items-center gap-2">
                <span className="text-lg">🪪</span>
                <div>
                  <div className="font-bold text-navy text-xs">Ghana Card</div>
                  <div className="text-primary text-xs font-bold">Verified ✓</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 2 — SOCIAL PROOF BAR
        ═══════════════════════════════════════════ */}
        <div ref={statsRef} className="bg-navy">
          <div className="max-w-6xl mx-auto px-5 py-5 grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
            {[
              { value: `₵${(raised / 1000000).toFixed(1)}M+`, label: 'Total raised', icon: '💰' },
              { value: `${campaignCount.toLocaleString()}+`, label: 'Campaigns funded', icon: '✅' },
              { value: `${donors.toLocaleString()}+`, label: 'Donors', icon: '💚' },
              { value: '0%', label: 'Platform fee forever', icon: '🎁' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 first:pl-0 last:pr-0">
                <span className="text-xl hidden md:block">{s.icon}</span>
                <div>
                  <div className="font-nunito font-black text-white text-xl">{s.value}</div>
                  <div className="text-xs text-white/40">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════
            SECTION 3 — WHY NOT JUST SEND MOMO?
        ═══════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-12">
              <div className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
                💡 The question everyone asks
              </div>
              <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-3">
                "Why not just send MoMo directly?"
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">Good question. Here's why EveryGiving raises 3× more than a direct MoMo request.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Without EveryGiving */}
              <div className="bg-red-50 border border-red-100 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-lg">😟</div>
                  <div className="font-nunito font-black text-gray-700 text-base">Without EveryGiving</div>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    'Donors don\'t know if you\'re real',
                    'No proof of how money is used',
                    'Only people you know will give',
                    'One-time awkward ask on WhatsApp',
                    'No tracking — donors forget to give',
                    'Hard to share widely',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">✕</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* With EveryGiving */}
              <div className="bg-primary-light border border-primary/20 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-lg">🚀</div>
                  <div className="font-nunito font-black text-primary-dark text-base">With EveryGiving</div>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    'Ghana Card verified — donors trust you',
                    'Upload receipts to prove every cedi spent',
                    'Anyone in Ghana (and worldwide) can donate',
                    'Campaign link shared on WhatsApp, Facebook, TikTok',
                    'Progress bar creates urgency to give',
                    'Donors share with their own networks',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-primary-dark">
                      <span className="text-primary font-bold mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/create" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm">
                Start your verified campaign →
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 4 — LIVE CAMPAIGNS
        ═══════════════════════════════════════════ */}
        <section className="py-16 bg-gray-50 border-y border-gray-100">
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Live now</span>
                </div>
                <h2 className="font-nunito font-black text-navy text-2xl md:text-3xl tracking-tight">Featured campaigns</h2>
                <p className="text-gray-400 text-sm mt-1">Verified causes raising money across Ghana right now</p>
              </div>
              <Link href="/campaigns" className="hidden md:flex items-center gap-1 text-sm font-bold text-primary border-2 border-primary/20 hover:border-primary px-4 py-2 rounded-xl transition-colors bg-white">
                See all → 
              </Link>
            </div>

            {campaigns.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-5">
                {campaigns.map((c: any) => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">🌱</div>
                <h3 className="font-nunito font-black text-navy text-xl mb-2">Be the first fundraiser</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Start Ghana's next great crowdfunding campaign today</p>
                <Link href="/create" className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-colors text-sm shadow">
                  Start the first campaign →
                </Link>
              </div>
            )}

            <div className="text-center mt-8 md:hidden">
              <Link href="/campaigns" className="inline-flex items-center gap-1 text-sm font-bold text-primary border-2 border-primary/20 px-5 py-2.5 rounded-xl bg-white">
                See all campaigns →
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 5 — HOW IT WORKS
        ═══════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-14">
              <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-3">
                From idea to funded in 3 steps
              </h2>
              <p className="text-gray-400">Takes less than 5 minutes to start. No tech skills needed.</p>
              <Link href="/tutorial" className="inline-flex items-center gap-2 mt-4 bg-navy text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-navy/90 transition-colors">
                ▶ Watch 1-minute tutorial
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/30 via-primary to-primary/30" />
              {[
                {
                  n: '01', icon: '✍️', title: 'Create your campaign',
                  desc: 'Tell your story, set your goal, upload a photo. Our guided form makes it simple in under 5 minutes.',
                  time: '5 minutes',
                  tips: ['Choose the right category', 'Be specific about amounts', 'Add a clear photo']
                },
                {
                  n: '02', icon: '🪪', title: 'Get verified in 24hrs',
                  desc: 'Submit your Ghana Card and supporting documents. Verified campaigns raise 3× more from donors.',
                  time: '24 hours',
                  tips: ['Ghana Card required', 'Add supporting docs', 'Phone verification']
                },
                {
                  n: '03', icon: '💰', title: 'Receive MoMo payments',
                  desc: 'Share on WhatsApp. Donors pay via MTN MoMo or card. Funds sent directly to your wallet.',
                  time: 'Same day',
                  tips: ['Share on WhatsApp', 'Post updates regularly', 'Thank your donors']
                },
              ].map((step, i) => (
                <div key={i} className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-white border-4 border-primary/20 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm relative">
                    {step.icon}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white font-black text-xs">{i + 1}</div>
                  </div>
                  <div className="inline-block bg-primary-light text-primary text-xs font-bold px-2 py-0.5 rounded-full mb-3">⏱ {step.time}</div>
                  <h3 className="font-nunito font-extrabold text-navy text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">{step.desc}</p>
                  <div className="flex flex-col gap-1">
                    {step.tips.map((tip, j) => (
                      <div key={j} className="text-xs text-gray-400 flex items-center justify-center gap-1">
                        <span className="text-primary">·</span> {tip}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/create" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm">
                Start your campaign →
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 6 — VERIFICATION TRUST BLOCK
        ═══════════════════════════════════════════ */}
        <section className="py-20 bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                🛡️ Ghana's most trusted crowdfunding
              </div>
              <h2 className="font-nunito font-black text-white text-3xl md:text-4xl leading-tight tracking-tight mb-5">
                Every campaign is verified before going live
              </h2>
              <p className="text-white/60 leading-relaxed mb-7">
                We know Ghana has had bad experiences with online scams. That's why we verify every single fundraiser's identity before their campaign goes live — so donors give with complete confidence.
              </p>
              <Link href="/verification" className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-full transition-colors text-sm">
                See how verification works →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🪪', title: 'Ghana Card', desc: 'Identity confirmed against NIA database' },
                { icon: '📄', title: 'Supporting docs', desc: 'Hospital bills, admission letters, quotes' },
                { icon: '📱', title: 'Phone verified', desc: 'Active MoMo number confirmed' },
                { icon: '⏱', title: '24hr review', desc: 'Our team reviews every submission' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-nunito font-bold text-white text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-white/40 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 7 — CATEGORIES
        ═══════════════════════════════════════════ */}
        <section className="py-16 bg-gray-50 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-10">
              <h2 className="font-nunito font-black text-navy text-2xl md:text-3xl tracking-tight mb-2">What do you need help with?</h2>
              <p className="text-gray-400 text-sm">Browse campaigns by category or start your own</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <Link key={cat.slug} href={`/campaigns?category=${cat.slug}`}
                  className="bg-white border-2 border-gray-100 hover:border-primary hover:shadow-md rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:-translate-y-0.5 group">
                  <div className="text-3xl flex-shrink-0">{cat.emoji}</div>
                  <div>
                    <div className="font-nunito font-extrabold text-navy text-sm group-hover:text-primary transition-colors">{cat.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{cat.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 8 — TESTIMONIALS
        ═══════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-3">
                Real Ghanaians. Real results.
              </h2>
              <p className="text-gray-400 text-sm">These are actual fundraisers who used Every Giving</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Abena Mensah', location: 'Accra', emoji: '👩🏾',
                  category: 'Medical', amount: '₵45,000',
                  quote: 'I raised money for my son\'s kidney surgery at Korle Bu in just 3 weeks. I thought only my family would help — strangers donated too!',
                  time: '3 weeks'
                },
                {
                  name: 'Pastor Kwame Asante', location: 'Kumasi', emoji: '👨🏾',
                  category: 'Church', amount: '₵120,000',
                  quote: 'Our church needed a new building. We shared the link after every Sunday service. The verification badge made members of other churches trust us and donate.',
                  time: '2 months'
                },
                {
                  name: 'Esi Boateng', location: 'Takoradi', emoji: '👩🏿',
                  category: 'Education', amount: '₵18,500',
                  quote: 'My WASSCE results were excellent but I couldn\'t afford university fees. Someone shared my campaign on Twitter and over 200 people donated. I\'m now at KNUST!',
                  time: '6 weeks'
                },
              ].map((t, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 relative">
                  <div className="absolute top-4 right-4 text-2xl opacity-20 font-serif text-primary">"</div>
                  <p className="text-sm text-gray-600 leading-relaxed italic mb-5">"{t.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-xl">{t.emoji}</div>
                      <div>
                        <div className="font-nunito font-bold text-navy text-sm">{t.name}</div>
                        <div className="text-xs text-gray-400">{t.location} · {t.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-nunito font-black text-primary text-sm">{t.amount}</div>
                      <div className="text-xs text-gray-400">in {t.time}</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1 text-xs text-primary font-bold">
                      <span>✓</span> Verified fundraiser
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 9 — TRANSPARENCY TEASER
        ═══════════════════════════════════════════ */}
        <section className="py-16 bg-gray-50 border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <div className="inline-block bg-primary-light text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">📊 Public transparency</div>
                <h2 className="font-nunito font-black text-navy text-2xl mb-2">Every cedi is tracked publicly</h2>
                <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                  We publish a real-time transparency report showing every donation on our platform. No hidden fees. No missing money. Everything is public.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-shrink-0">
                {[
                  { value: '₵2.4M+', label: 'Raised this year' },
                  { value: '1,247', label: 'Campaigns funded' },
                  { value: '8,934', label: 'Total donors' },
                  { value: '0%', label: 'Hidden fees' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                    <div className="font-nunito font-black text-navy text-xl">{s.value}</div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 10 — FINAL CTA
        ═══════════════════════════════════════════ */}
        <section className="py-24 bg-gradient-to-br from-primary-dark via-primary to-[#05c96e] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-2xl mx-auto px-5 text-center">
            <div className="text-4xl mb-5">🇬🇭</div>
            <h2 className="font-nunito font-black text-white text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
              Ready to raise money the right way?
            </h2>
            <p className="text-white/75 leading-relaxed mb-8 text-base">
              Join 1,247 Ghanaians already using Every Giving. Free to start. Verified in 24hrs. Money straight to your MoMo wallet.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <Link href="/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-nunito font-black rounded-full hover:-translate-y-0.5 transition-all shadow-xl hover:shadow-2xl text-sm">
                Start a fundraiser — free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <Link href="/campaigns"
                className="inline-flex items-center gap-2 px-7 py-4 border-2 border-white/40 hover:border-white text-white font-bold rounded-full transition-all text-sm">
                Browse campaigns
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-white/50 text-xs">
              <span>🔒 Ghana Card verified</span>
              <span>·</span>
              <span>💸 0% platform fee</span>
              <span>·</span>
              <span>📱 Instant MoMo payout</span>
              <span>·</span>
              <span>🇬🇭 Built in Ghana</span>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
