'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

const EMOJI: Record<string, string> = {
  medical: '🏥', emergency: '🆘', education: '🎓', charity: '🤲', faith: '⛪',
  community: '🏘', environment: '🌿', business: '💼', family: '👨‍👩‍👧',
  sports: '⚽', events: '🎉', competition: '🏆', travel: '✈️', volunteer: '🙌',
  wishes: '🌟', memorial: '🕊', other: '💚',
}

const CAT_PILLS = [
  { name: 'All', slug: null },
  { name: '🏥 Medical', slug: 'medical' },
  { name: '🆘 Emergency', slug: 'emergency' },
  { name: '🎓 Education', slug: 'education' },
  { name: '⛪ Faith', slug: 'faith' },
  { name: '🏘 Community', slug: 'community' },
  { name: '👨‍👩‍👧 Family', slug: 'family' },
]

function CampaignCard({ c }: { c: any }) {
  const pct = c.goal_amount ? Math.min(Math.round((c.raised_amount / c.goal_amount) * 100), 100) : 0
  return (
    <Link href={`/campaigns/${c.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
      <div className="h-44 bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center text-5xl relative">
        {EMOJI[c.category?.toLowerCase()] || '💚'}
        {c.verified && <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">✓ Verified</div>}
      </div>
      <div className="p-5">
        <div className="font-nunito font-black text-navy text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{c.title}</div>
        <div className="text-gray-400 text-xs mb-3">{c.profiles?.full_name || 'Anonymous'}</div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-bold text-navy">₵{(c.raised_amount || 0).toLocaleString()} raised</span>
          <span className="text-primary font-bold">{pct}%</span>
        </div>
      </div>
    </Link>
  )
}

export default function DonatePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let q = supabase.from('campaigns').select('*, profiles(full_name)').eq('status', 'approved').order('created_at', { ascending: false }).limit(9)
    if (activeCategory) {
      q = supabase.from('campaigns').select('*, profiles(full_name)').eq('status', 'approved').ilike('category', activeCategory).limit(9)
    }
    q.then(({ data }) => { setCampaigns(data || []); setLoading(false) })
  }, [activeCategory])

  return (
    <>
      <Navbar />
      <main>
        {/* Hero — emotional, donation-focused */}
        <section className="bg-gradient-to-br from-navy via-navy to-[#0d2035] py-20 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-5">💚</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-4" style={{ letterSpacing: -1 }}>
              Give with <span className="text-primary">confidence</span>
            </h1>
            <p className="text-white/50 text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Every campaign on Every Giving is Ghana Card verified. The person you are giving to is real. Your money goes directly to their MoMo wallet.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['🪪 Identity verified', '📱 MoMo direct', '🔒 Secure', '2% + ₵0.25 fee only'].map((item, i) => (
                <span key={i} className="bg-white/10 border border-white/15 text-white/70 text-xs font-semibold px-4 py-2 rounded-full">{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-primary-light border-b border-primary/10 py-7 px-5">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
            {[['₵2.4M+', 'Total raised'], ['1,200+', 'Campaigns'], ['8,900+', 'Donors']].map(([v, l], i) => (
              <div key={i}>
                <div className="font-nunito font-black text-primary text-2xl md:text-3xl">{v}</div>
                <div className="text-primary-dark/60 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Category filter */}
        <div className="bg-white border-b border-gray-100 px-5 py-4 overflow-x-auto">
          <div className="max-w-5xl mx-auto flex gap-2 min-w-max">
            {CAT_PILLS.map((cat, i) => (
              <button key={i} onClick={() => setActiveCategory(cat.slug)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap ${activeCategory === cat.slug ? 'bg-primary text-white border-primary shadow-md shadow-primary/20' : 'border-gray-200 text-gray-600 hover:border-primary/40'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Campaign grid */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-5xl mx-auto px-5">
            {loading ? (
              <div className="grid md:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />)}
              </div>
            ) : campaigns.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-5">
                {campaigns.map(c => <CampaignCard key={c.id} c={c} />)}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">💚</div>
                <div className="font-nunito font-black text-navy text-xl mb-2">No campaigns yet</div>
                <p className="text-gray-400 text-sm">Check back soon or start your own.</p>
              </div>
            )}
          </div>
        </section>

        {/* How donating works */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h2 className="font-nunito font-black text-navy text-2xl mb-8">How donating works</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: '🔍', title: 'Choose a campaign', desc: 'Browse verified campaigns. Every person has confirmed their Ghana Card identity.' },
                { icon: '📱', title: 'Pay by MoMo', desc: 'Select MTN, Vodafone or AirtelTigo. A MoMo prompt appears on your phone.' },
                { icon: '✅', title: 'Donation received', desc: 'The fundraiser gets the money directly. You get a confirmation instantly.' },
              ].map((step, i) => (
                <div key={i}>
                  <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-xl mx-auto mb-3">{step.icon}</div>
                  <div className="font-nunito font-black text-navy text-sm mb-1.5">{step.title}</div>
                  <div className="text-gray-400 text-xs leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
