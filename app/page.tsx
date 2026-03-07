'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

const CATEGORIES = [
  { name: 'Medical', emoji: '🏥', slug: 'medical' },
  { name: 'Emergency', emoji: '🆘', slug: 'emergency' },
  { name: 'Education', emoji: '🎓', slug: 'education' },
  { name: 'Charity', emoji: '🤲', slug: 'charity' },
  { name: 'Faith', emoji: '⛪', slug: 'faith' },
  { name: 'Community', emoji: '🏘', slug: 'community' },
  { name: 'Environment', emoji: '🌿', slug: 'environment' },
  { name: 'Business', emoji: '💼', slug: 'business' },
  { name: 'Family', emoji: '👨‍👩‍👧', slug: 'family' },
  { name: 'Sports', emoji: '⚽', slug: 'sports' },
  { name: 'Events', emoji: '🎉', slug: 'events' },
  { name: 'Wishes', emoji: '🌟', slug: 'wishes' },
]

function CampaignCard({ c }: { c: any }) {
  const pct = c.goal_amount ? Math.min(Math.round((c.raised_amount / c.goal_amount) * 100), 100) : 0
  return (
    <Link href={`/campaigns/${c.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group">
      <div className="h-36 bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center text-4xl relative">
        {CATEGORIES.find(cat => cat.slug === c.category?.toLowerCase())?.emoji || '💚'}
        {c.verified && (
          <div className="absolute top-2.5 right-2.5 bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">✓ Verified</div>
        )}
      </div>
      <div className="p-4">
        <div className="font-nunito font-black text-navy text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">{c.title}</div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-bold text-navy">₵{(c.raised_amount || 0).toLocaleString()}</span>
          <span className="text-primary font-bold">{pct}%</span>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('campaigns').select('*')
      .eq('status', 'approved').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setCampaigns(data || []))
  }, [])

  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <section className="bg-navy relative overflow-hidden pt-20 pb-24 px-5">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Ghana's verified crowdfunding platform 🇬🇭
            </div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-6xl tracking-tight leading-[1.05] mb-5" style={{ letterSpacing: -2 }}>
              Raise money.<br />
              <span className="text-primary">Be trusted.</span>
            </h1>
            <p className="text-white/50 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Ghana's only crowdfunding platform with Ghana Card identity verification, instant MoMo payouts, and zero platform fees.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mb-10">
              <Link href="/create"
                className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30 text-sm">
                Start a campaign — it's free →
              </Link>
              <Link href="/campaigns"
                className="px-7 py-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold rounded-full transition-all text-sm">
                Browse campaigns
              </Link>
            </div>
            {/* Trust bar */}
            <div className="flex flex-wrap justify-center gap-6 text-xs text-white/30 font-medium">
              <span>✓ 0% platform fee</span>
              <span>✓ Ghana Card verified</span>
              <span>✓ MTN MoMo · Vodafone · AirtelTigo</span>
              <span>✓ Same-day payout</span>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── 3 steps, dead simple */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-10">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>Simple process</div>
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight">Start raising in 3 steps</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { n: '01', icon: '📝', title: 'Tell your story', desc: 'Create your campaign in minutes. Add your title, goal, and story.' },
                { n: '02', icon: '🪪', title: 'Verify your identity', desc: 'Upload your Ghana Card. Donors give more to verified campaigns.' },
                { n: '03', icon: '📱', title: 'Share & receive MoMo', desc: 'Share on WhatsApp. Donations arrive directly to your mobile money.' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">{step.icon}</div>
                  <div className="font-nunito font-black text-navy text-sm mb-1">{step.title}</div>
                  <div className="text-gray-400 text-sm leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/how-it-works" className="text-primary text-sm font-bold hover:underline">Learn more about how it works →</Link>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="py-14 bg-gray-50">
          <div className="max-w-5xl mx-auto px-5">
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-nunito font-black text-navy text-2xl tracking-tight">Browse by cause</h2>
              <Link href="/campaigns" className="text-primary text-sm font-bold hover:underline">See all →</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {CATEGORIES.map((cat, i) => (
                <Link key={i} href={`/campaigns?category=${cat.slug}`}
                  className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-primary/30 hover:bg-primary-light transition-all group hover:-translate-y-0.5">
                  <div className="text-2xl mb-2">{cat.emoji}</div>
                  <div className="text-xs font-bold text-gray-600 group-hover:text-primary-dark transition-colors">{cat.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── LIVE CAMPAIGNS ── */}
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-5">
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-nunito font-black text-navy text-2xl tracking-tight">Live campaigns</h2>
              <Link href="/campaigns" className="text-primary text-sm font-bold hover:underline">View all →</Link>
            </div>
            {campaigns.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {campaigns.map(c => <CampaignCard key={c.id} c={c} />)}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">🚀</div>
                <div className="font-nunito font-black text-navy text-xl mb-2">Be the first</div>
                <p className="text-gray-400 text-sm mb-5">No campaigns live yet. Start yours today.</p>
                <Link href="/create" className="inline-block bg-primary text-white font-nunito font-black px-7 py-3 rounded-full text-sm">
                  Start a campaign →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── WHY EVERYGIVING ── lean 3-column */}
        <section className="py-14 bg-navy">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-10">
              <h2 className="font-nunito font-black text-white text-3xl tracking-tight mb-2">Built for Ghana</h2>
              <p className="text-white/40 text-sm">Everything GoFundMe doesn't have. Everything Ghana needs.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: '🪪', title: 'Ghana Card verified', body: 'Every fundraiser confirms their identity before going live. Donors give more when they know who they\'re giving to.' },
                { icon: '📱', title: 'MoMo native', body: 'Designed for MTN MoMo, Vodafone Cash and AirtelTigo from day one. No bank account needed.' },
                { icon: '💸', title: 'Small transaction fee only', body: 'Just 2% + ₵0.25 per donation — automatically deducted. No platform fee, no monthly bills.' },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-nunito font-black text-white text-base mb-2">{item.title}</div>
                  <div className="text-white/40 text-sm leading-relaxed">{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-16 bg-primary text-center px-5">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-nunito font-black text-white text-3xl md:text-4xl tracking-tight mb-3" style={{ letterSpacing: -1 }}>
              Ready to start raising?
            </h2>
            <p className="text-white/70 text-base mb-7">Free to create. Verified in under 10 minutes. MoMo-native.</p>
            <Link href="/create"
              className="inline-block bg-white text-primary font-nunito font-black px-10 py-4 rounded-full hover:-translate-y-0.5 transition-all shadow-xl text-sm">
              Start your campaign — free →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
