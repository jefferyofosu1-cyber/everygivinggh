'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const VALUES = [
  {
    icon: '🔒',
    title: 'Trust through verification',
    desc: 'Every fundraiser is verified with their Ghana Card. Donors give more when they know the person is real. We built verification first because trust is the foundation of everything.',
  },
  {
    icon: '🇬🇭',
    title: 'Built for Ghana, by Ghana',
    desc: 'We use MTN MoMo, Vodafone Cash, and AirtelTigo because that is how Ghana moves money. No bank account required. No foreign payment methods that most Ghanaians cannot access.',
  },
  {
    icon: '₵',
    title: '0% platform fee — forever',
    desc: 'Every cedi donated goes to the fundraiser. We will never take a percentage of your donations. This is a promise, not a promotion.',
  },
  {
    icon: '🌍',
    title: 'Radical transparency',
    desc: 'Every donation is visible. Every withdrawal is recorded. Donors can see exactly how much has been raised and withdrawn. Transparency is not optional — it is how we work.',
  },
  {
    icon: '⚡',
    title: 'Speed matters in emergencies',
    desc: 'Most people come to us in urgent situations — medical bills, sudden loss, emergency repairs. We designed every step to be as fast as possible. Verified and live in under 10 minutes.',
  },
  {
    icon: '🤝',
    title: 'Community-first',
    desc: 'Ghana has always had a culture of communal giving — from susu to community fundraisers. Every Giving is a modern tool for an ancient tradition.',
  },
]

const STATS = [
  { val: '0%', label: 'Platform fee' },
  { val: '<10 min', label: 'Average verification time' },
  { val: '3', label: 'Mobile money networks supported' },
  { val: '2026', label: 'Founded in Ghana' },
]

const TEAM = [
  {
    initial: 'J',
    name: 'Jeffery Ofosu',
    role: 'Founder & CEO',
    bio: 'Jeffery built Every Giving after seeing people he knew struggle to raise money for medical emergencies — sending MoMo requests to strangers who had no way to verify if the cause was real.',
  },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <section className="bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.15) 0%, transparent 60%)' }} />
          <div className="relative max-w-4xl mx-auto px-5 py-20 md:py-28">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-8 tracking-widest uppercase">
              Our story
            </div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-6xl tracking-tight leading-none mb-6" style={{ letterSpacing: -2 }}>
              Giving should be<br />
              <span className="text-primary">trusted.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-xl mb-10">
              We built Every Giving because raising money in Ghana shouldn't require knowing the right people. It should require having a real cause — and a way to prove it.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
              {STATS.map(s => (
                <div key={s.label} className="bg-navy px-6 py-5 text-center">
                  <div className="font-nunito font-black text-primary text-2xl md:text-3xl leading-none mb-1">{s.val}</div>
                  <div className="text-white/30 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── THE PROBLEM ── */}
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-5">
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Why we exist</div>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-8 leading-tight">
              The problem with asking for money in Ghana
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {[
                {
                  problem: 'Strangers won\'t donate to someone they can\'t verify',
                  detail: 'Sending a MoMo request to your contacts works if they know you. It fails completely with strangers — who make up the majority of potential donors for most campaigns.',
                },
                {
                  problem: 'Fraud has made people suspicious of online giving',
                  detail: 'Too many scam campaigns have made genuine fundraisers pay the price. Legitimate people raising money for real emergencies are treated with suspicion.',
                },
                {
                  problem: 'Global platforms don\'t work for Ghana',
                  detail: 'GoFundMe and similar platforms don\'t support Ghana properly. No MoMo. No Ghana Card verification. Payouts require foreign bank accounts most Ghanaians don\'t have.',
                },
                {
                  problem: 'The platforms that do work charge high fees',
                  detail: 'Platforms charging 5–8% of donations mean someone raising ₵10,000 loses ₵500–800 to fees. In emergencies, every cedi counts.',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                  <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </div>
                  <div className="font-nunito font-extrabold text-navy text-sm mb-2">{item.problem}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{item.detail}</div>
                </div>
              ))}
            </div>

            {/* The answer */}
            <div className="bg-navy rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.1), transparent 70%)', transform: 'translate(30%,-30%)' }} />
              <div className="relative">
                <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>The answer</div>
                <h3 className="font-nunito font-black text-white text-2xl tracking-tight mb-4 leading-tight">
                  Verified identity + MoMo-native + 0% fees
                </h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-lg">
                  When donors can see a Verified badge — confirmed against the NIA database — they give. When payouts go straight to MoMo, fundraisers get their money. When there are no fees, every cedi reaches the person who needs it. That is Every Giving.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-12">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>What we stand for</div>
              <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight">Our values</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {VALUES.map((v, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 hover:-translate-y-1 transition-transform shadow-sm">
                  <div className="text-3xl mb-4">{v.icon}</div>
                  <div className="font-nunito font-black text-navy text-base mb-2">{v.title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TEAM ── */}
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-5">
            <div className="text-center mb-12">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>The people behind it</div>
              <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight">Built by Ghanaians</h2>
              <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">Every Giving is a Ghanaian platform built by people who understand how money moves in Ghana.</p>
            </div>
            <div className="flex justify-center gap-6 flex-wrap">
              {TEAM.map((member, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-7 max-w-sm w-full text-center">
                  <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-nunito font-black text-primary text-2xl">{member.initial}</span>
                  </div>
                  <div className="font-nunito font-black text-navy text-lg mb-0.5">{member.name}</div>
                  <div className="text-primary text-xs font-bold uppercase tracking-widest mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>{member.role}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{member.bio}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MISSION STATEMENT ── */}
        <section className="py-20 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-3xl mx-auto px-5 text-center">
            <div className="font-nunito font-black text-white text-3xl md:text-5xl leading-tight tracking-tight mb-6" style={{ letterSpacing: -1 }}>
              "Ghana has always given.<br />We're making it easier."
            </div>
            <p className="text-white/70 text-base leading-relaxed max-w-lg mx-auto mb-10">
              From communal susu groups to church fundraisers to emergency appeals — Ghanaians have always rallied around each other. Every Giving is a modern infrastructure for that ancient generosity.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/create"
                className="bg-white text-primary font-nunito font-black px-8 py-4 rounded-full hover:-translate-y-0.5 transition-all shadow-xl text-sm">
                Start a campaign
              </Link>
              <Link href="/campaigns"
                className="border-2 border-white/30 hover:border-white/60 text-white font-nunito font-bold px-7 py-4 rounded-full transition-all text-sm">
                Browse campaigns
              </Link>
            </div>
          </div>
        </section>

        {/* ── CONTACT STRIP ── */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-nunito font-black text-navy text-lg mb-1">Want to get in touch?</div>
              <div className="text-gray-400 text-sm">Questions, press enquiries, or partnership ideas.</div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/contact"
                className="bg-primary hover:bg-primary-dark text-white font-nunito font-black px-6 py-3 rounded-full transition-all hover:-translate-y-0.5 text-sm shadow-lg shadow-primary/25">
                Contact us
              </Link>
              <a href="mailto:business@everygiving.org"
                className="border-2 border-gray-200 hover:border-primary text-gray-600 hover:text-primary font-bold px-6 py-3 rounded-full transition-all text-sm">
                business@everygiving.org
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
