'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type IncludedItem = {
  bg: string
  iconColor: string
  icon: React.ReactNode
  title: string
  tag: string
  tagStyle: string
  desc: string
}

type BonusCard = {
  cardStyle: string
  badgeStyle: string
  badge: string
  title: string
  titleColor: string
  desc: string
  descColor: string
  value: string
  valueColor: string
}

type ProofItem = {
  init: string
  name: string
  action: string
  time: string
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const INCLUDED_ITEMS: IncludedItem[] = [
  {
    bg: '#F0FDF6', iconColor: '#02A95C',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    title: 'Your own verified campaign page',
    tag: 'Free', tagStyle: 'bg-primary-light text-primary-dark',
    desc: 'A dedicated, shareable link for your fundraiser. Built for mobile. Works on WhatsApp, Facebook, and Instagram. No coding, no design skills needed.',
  },
  {
    bg: '#EFF6FF', iconColor: '#3B82F6',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Automatic identity verification',
    tag: 'Automatic', tagStyle: 'bg-blue-50 text-blue-700',
    desc: 'Upload your Ghana Card, take a selfie. Our system cross-checks the NIA database and confirms your identity — no manual review, no waiting. Verified badge goes live the same day.',
  },
  {
    bg: '#FEF3C7', iconColor: '#D97706',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>,
    title: 'MTN MoMo, Vodafone Cash & AirtelTigo built in',
    tag: 'Instant', tagStyle: 'bg-amber-50 text-amber-700',
    desc: 'Donors pay using the mobile money they already have. No bank account needed. Funds arrive in your wallet the same day donations are made.',
  },
  {
    bg: '#F0FDF6', iconColor: '#02A95C',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    title: 'Live donation tracking dashboard',
    tag: 'Free', tagStyle: 'bg-primary-light text-primary-dark',
    desc: 'Watch donations come in as they happen. See who gave, when, and how much. Post updates to keep donors engaged and share the campaign further.',
  },
  {
    bg: '#FDF4FF', iconColor: '#9333EA',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
    title: 'One-tap WhatsApp sharing',
    tag: 'Free', tagStyle: 'bg-primary-light text-primary-dark',
    desc: 'A pre-written share message with your campaign link, ready to send on WhatsApp, Facebook, and X. Campaigns shared in the first 24 hours raise significantly more.',
  },
  {
    bg: '#F0FDF6', iconColor: '#02A95C',
    icon: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    title: 'Public transparency ledger',
    tag: 'Free', tagStyle: 'bg-primary-light text-primary-dark',
    desc: 'Every donation shown publicly. Donors can see their contribution listed. Full transparency builds the trust that raises more money.',
  },
]

const BONUSES: BonusCard[] = [
  {
    cardStyle: 'bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200/60',
    badge: 'Bonus 01', badgeStyle: 'bg-amber-100 text-amber-800',
    title: 'Campaign coaching tips inside your dashboard',
    titleColor: 'text-amber-900',
    desc: 'Step-by-step prompts guide you from draft to fully-funded. Written by people who have run successful campaigns in Ghana.',
    descColor: 'text-amber-800/70',
    value: '₵200 value', valueColor: 'text-amber-800',
  },
  {
    cardStyle: 'bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200/60',
    badge: 'Bonus 02', badgeStyle: 'bg-green-100 text-green-800',
    title: 'WhatsApp message templates that get clicks',
    titleColor: 'text-green-900',
    desc: 'Pre-written messages for day 1, day 7, and the final push. Copy, paste, send. Stop stressing over what to say to your contacts.',
    descColor: 'text-green-800/70',
    value: '₵150 value', valueColor: 'text-green-800',
  },
  {
    cardStyle: 'bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-200/60',
    badge: 'Bonus 03', badgeStyle: 'bg-indigo-100 text-indigo-800',
    title: 'Donor thank-you emails sent automatically',
    titleColor: 'text-indigo-900',
    desc: 'Every donor receives a branded thank-you the moment they give. Keeps relationships warm and increases the chance they share your campaign.',
    descColor: 'text-indigo-800/70',
    value: '₵300 value', valueColor: 'text-indigo-800',
  },
  {
    cardStyle: 'bg-navy border border-white/10',
    badge: 'Bonus 04', badgeStyle: 'bg-primary/20 text-primary',
    title: 'Priority listing in the Discover feed',
    titleColor: 'text-white',
    desc: 'New verified campaigns are featured at the top of the Every Giving browse page for 7 days — extra visibility at launch when momentum matters most.',
    descColor: 'text-white/45',
    value: '₵500 value', valueColor: 'text-white',
  },
]

const PROOF_ITEMS: ProofItem[] = [
  { init: 'K', name: 'Kofi from Kumasi',    action: 'just raised ₵2,400 in 48 hours',          time: '2 minutes ago' },
  { init: 'A', name: 'Ama from Accra',      action: 'started a verified Medical campaign',       time: '6 minutes ago' },
  { init: 'Y', name: 'Yaw from Takoradi',   action: 'received a ₵500 donation from a stranger', time: '11 minutes ago' },
  { init: 'E', name: 'Esi from Cape Coast', action: 'reached 80% of her goal in 5 days',        time: '18 minutes ago' },
  { init: 'P', name: 'Pastor Kwame',        action: 'raised ₵45,000 for his church building',   time: '24 minutes ago' },
  { init: 'B', name: 'Benedicta from Tema', action: 'got her first 10 donations in 2 hours',    time: '31 minutes ago' },
]

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}>
      {children}
    </div>
  )
}

// ─── SOCIAL PROOF TICKER ─────────────────────────────────────────────────────

function ProofTicker() {
  const [idx, setIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const COLORS = ['#02A95C','#018A4A','#05C96E','#10B981','#059669','#047857']

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % PROOF_ITEMS.length)
        setFading(false)
      }, 300)
    }, 4000)
    return () => clearInterval(id)
  }, [])

  const item = PROOF_ITEMS[idx]
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 max-w-sm mx-auto mb-8">
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-nunito font-black text-sm transition-all duration-300"
        style={{ backgroundColor: `${COLORS[idx % COLORS.length]}22`, color: COLORS[idx % COLORS.length], opacity: fading ? 0 : 1 }}>
        {item.init}
      </div>
      <div className={`transition-all duration-300 ${fading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}>
        <div className="text-xs text-white/60 leading-snug">
          <span className="font-bold text-white">{item.name}</span> {item.action}
        </div>
        <div className="text-xs text-white/25 mt-0.5">{item.time}</div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function OfferPage() {
  return (
    <>
      <main className="bg-gray-50">

        {/* ══ 1. THE PROMISE ═══════════════════════════════════════════════ */}
        <Reveal>
          <section className="bg-navy relative overflow-hidden mx-4 mt-4 rounded-[28px] mb-4">
            {/* dot grid */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            {/* glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.18) 0%, transparent 60%)' }} />

            <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
              <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 text-primary text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                The Every Giving Promise
              </div>

              <h1 className="font-nunito font-black text-white leading-tight mb-5" style={{ fontSize: 'clamp(32px,5vw,56px)', letterSpacing: -1.5 }}>
                Raise money in Ghana<br />
                <span className="text-primary">the right way.</span><br />
                Or pay nothing.
              </h1>

              <p className="text-white/55 text-base leading-relaxed max-w-lg mx-auto mb-10">
                Create a verified campaign in under 10 minutes.{' '}
                <strong className="text-white/85 font-semibold">Your identity confirmed. Your goal published. Donations straight to your MoMo wallet.</strong>{' '}
                If we don't deliver, you owe us nothing — because it's completely free.
              </p>

              <div className="flex justify-center">
                <div className="flex divide-x divide-white/10 border border-white/10 rounded-2xl overflow-hidden">
                  {[
                    { val: '0%', label: 'Platform fee' },
                    { val: '<10 min', label: 'To go live' },
                    { val: 'Same day', label: 'MoMo payout' },
                  ].map(s => (
                    <div key={s.label} className="px-8 py-5 text-center">
                      <div className="font-nunito font-black text-primary text-2xl leading-none mb-1">{s.val}</div>
                      <div className="text-white/35 text-xs">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ══ 2. WHAT'S INCLUDED ══════════════════════════════════════════ */}
        <Reveal delay={80}>
          <section className="bg-white rounded-[24px] border border-gray-100 shadow-sm mx-4 mb-4 overflow-hidden">
            <div className="px-8 py-7 border-b border-gray-100 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>What you get</div>
                <h2 className="font-nunito font-black text-navy text-2xl tracking-tight">
                  Everything included. <span className="text-primary">Free.</span>
                </h2>
              </div>
              <div className="font-nunito font-black text-sm bg-primary-light text-primary-dark border border-primary/20 px-4 py-2 rounded-full">
                Valued at ₵0 — always
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {INCLUDED_ITEMS.map((item, i) => (
                <div key={i} className="flex items-start gap-4 px-8 py-5 hover:bg-gray-50 transition-colors group">
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 group-hover:scale-105 transition-transform" style={{ backgroundColor: item.bg, color: item.iconColor }}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-nunito font-extrabold text-navy text-sm mb-1">
                      {item.title}
                      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full ml-2 ${item.tagStyle}`}>{item.tag}</span>
                    </div>
                    <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ══ 3. BONUSES ══════════════════════════════════════════════════ */}
        <Reveal delay={120}>
          <div className="mx-4 mb-4">
            <div className="mb-4 px-1">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>Bonuses</div>
              <h2 className="font-nunito font-black text-navy text-2xl tracking-tight">And you also get these.</h2>
              <p className="text-gray-500 text-sm mt-1">Added automatically when you create your first campaign. No extra steps.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {BONUSES.map((b, i) => (
                <div key={i} className={`rounded-2xl p-7 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg ${b.cardStyle}`}>
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 bg-current" />
                  <div className={`inline-block text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 ${b.badgeStyle}`}>{b.badge}</div>
                  <h3 className={`font-nunito font-black text-lg leading-snug mb-2 ${b.titleColor}`}>{b.title}</h3>
                  <p className={`text-sm leading-relaxed mb-4 ${b.descColor}`}>{b.desc}</p>
                  <div className={`flex items-center gap-2 font-nunito font-black text-sm ${b.valueColor}`}>
                    <span className="line-through opacity-40 font-semibold">{b.value}</span>
                    <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">Free</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ══ 4. RISK REVERSAL ════════════════════════════════════════════ */}
        <Reveal delay={160}>
          <section className="bg-white rounded-[24px] border-2 border-primary/15 shadow-sm mx-4 mb-4 p-8 md:p-10 relative overflow-hidden">
            {/* Subtle glow top-right */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.07), transparent 70%)', transform: 'translate(30%, -30%)' }} />

            <div className="grid md:grid-cols-[auto_1fr] gap-7 items-start relative">
              {/* Shield */}
              <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center border border-primary/15 flex-shrink-0">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9,12 11,14 15,10"/>
                </svg>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>Zero risk guarantee</div>
                <h2 className="font-nunito font-black text-navy text-2xl md:text-3xl tracking-tight mb-3">
                  There is nothing to lose. Literally.
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xl">
                  Every Giving is <strong className="text-navy font-semibold">completely free to use.</strong> We never charge a platform fee. We never take a percentage of your donations. There is no credit card required to sign up, no hidden cost when you withdraw, and no penalty if your campaign does not reach its goal.
                  <br /><br />
                  <strong className="text-navy font-semibold">You keep every cedi donated to you.</strong> Whether you raise ₵500 or ₵500,000 — it all goes directly to your mobile money wallet.
                </p>

                <div className="flex flex-col gap-3">
                  {[
                    'No signup fee, no monthly fee, no withdrawal fee',
                    'Keep everything you raise — even if you don\'t hit your goal',
                    'Delete your campaign at any time — no questions asked',
                    'Your personal data never shared with donors or third parties',
                  ].map((point, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-medium text-navy">
                      <div className="w-5 h-5 bg-primary rounded-full flex-shrink-0 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>
                      </div>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ══ 5. THE CTA ══════════════════════════════════════════════════ */}
        <Reveal delay={200}>
          <section className="bg-navy rounded-[28px] mx-4 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.15) 0%, transparent 65%)' }} />

            <div className="relative max-w-2xl mx-auto px-6 py-20 text-center">
              {/* Urgency badge */}
              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                Every day you wait is a day without donations
              </div>

              <h2 className="font-nunito font-black text-white leading-tight mb-5" style={{ fontSize: 'clamp(28px,4.5vw,48px)', letterSpacing: -1 }}>
                Your campaign could be<br />
                <span className="text-primary">live in 10 minutes.</span>
              </h2>

              <p className="text-white/50 text-base leading-relaxed mb-10 max-w-md mx-auto">
                Free to start. Verified the same day. Money in your MoMo wallet as donations arrive.{' '}
                <strong className="text-white/80 font-semibold">Over 1,200 Ghanaians are already raising money right now.</strong>
              </p>

              {/* Ticker */}
              <ProofTicker />

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 justify-center mb-10">
                <Link
                  href="/create"
                  className="font-nunito font-black text-white bg-primary hover:bg-primary-dark text-base px-10 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30">
                  Start my free campaign →
                </Link>
                <Link
                  href="/campaigns"
                  className="font-nunito font-bold text-white/70 hover:text-white border border-white/15 hover:border-white/40 text-base px-8 py-4 rounded-full transition-all hover:-translate-y-0.5">
                  See real campaigns
                </Link>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  'No platform fee — ever',
                  'Ghana Card verified',
                  'Instant MoMo payout',
                  'Built in Ghana',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/35 font-medium">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>

        <div className="h-4" />
      </main>
    </>
  )
}
