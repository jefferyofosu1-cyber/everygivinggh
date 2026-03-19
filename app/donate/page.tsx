'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const EMOJI: Record<string, string> = {
  medical: 'MD', emergency: 'EM', education: 'ED', charity: 'CH', faith: 'FA',
  community: 'CM', environment: 'EN', business: 'BS', family: 'FM',
  sports: 'SP', events: 'EV', competition: 'CP', travel: 'TR', volunteer: 'VL',
  wishes: 'WS', memorial: 'MM', other: 'OT',
}

const CAT_PILLS = [
  { name: 'All', slug: null },
  { name: ' Medical', slug: 'medical' },
  { name: 'Emergency', slug: 'emergency' },
  { name: ' Education', slug: 'education' },
  { name: ' Faith', slug: 'faith' },
  { name: ' Community', slug: 'community' },
  { name: ' Family', slug: 'family' },
]

function CampaignCard({ c }: { c: any }) {
  const pct = c.goal_amount ? Math.min(Math.round((c.raised_amount / c.goal_amount) * 100), 100) : 0
  return (
    <Link href={`/campaigns/${c.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
      <div className="h-44 bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center text-5xl relative">
        {EMOJI[c.category?.toLowerCase()] || ''}
        {c.verified && <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full"> Verified</div>}
      </div>
      <div className="p-5">
        <div className="font-nunito font-black text-navy text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{c.title}</div>
        <div className="text-gray-400 text-xs mb-3">Campaign</div>
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
  const [allCampaigns, setAllCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const res = await fetch('/api/campaigns', { cache: 'no-store' })
        const json = await res.json()
        setAllCampaigns(json.campaigns || [])
      } catch (err) {
        console.error('Failed to load campaigns:', err)
        setAllCampaigns([])
      } finally {
        setLoading(false)
      }
    }
    loadCampaigns()
  }, [])

  const campaigns = allCampaigns
    .filter(c => !activeCategory || c.category?.toLowerCase() === activeCategory.toLowerCase())
    .slice(0, 9)

  return (
    <>
      <Navbar />
      <main>
        {/* Hero  -  emotional, donation-focused */}
        <section className="bg-navy relative overflow-hidden py-24">
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-5 text-center text-white">
            <div className="text-5xl mb-5"></div>
            <h1 className="font-nunito font-black text-4xl md:text-5xl tracking-tight mb-4" style={{ letterSpacing: -1 }}>
              Give with <span className="text-primary">confidence</span>
            </h1>
            <p className="text-white/50 text-base mb-8 max-w-xl mx-auto leading-relaxed">
              Every campaign on EveryGiving is identity-verified. The person you are giving to has had their Ghana Card reviewed and confirmed by our team. Donations are held securely and released to fundraisers in milestones they set.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[' Identity verified', ' MoMo direct', ' Secure', '2% + ₵0.25 transaction fee only'].map((item, i) => (
                <span key={i} className="bg-white/10 border border-white/15 text-white/70 text-xs font-semibold px-4 py-2 rounded-full">{item}</span>
              ))}
            </div>
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
                <div className="text-4xl mb-3"></div>
                <div className="font-nunito font-black text-navy text-xl mb-2">No campaigns yet</div>
                <p className="text-gray-400 text-sm">Check back soon  -  or start your own campaign.</p>
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
                { icon: '*', title: 'Choose a campaign', desc: "Browse verified campaigns. Every fundraiser has confirmed their identity  -  you know exactly who you're giving to." },
                { icon: '*', title: 'Pay by MoMo', desc: 'Choose MTN MoMo, Vodafone Cash, or AirtelTigo. A payment prompt appears instantly on your phone.' },
                { icon: '*', title: 'Donation received', desc: 'The fundraiser receives the money directly. You receive a confirmation and receipt instantly.' },
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
