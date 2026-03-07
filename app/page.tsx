'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

// Real Ghana/Africa photos — all free to use under Unsplash License
// Photo credits embedded per Unsplash requirements
const PHOTOS = {
  // Ransford Quaye — woman smiling, Accra Ghana
  heroPortrait: 'https://images.unsplash.com/photo-1696943740649-cc05d4e5e0cc?w=900&q=85&auto=format&fit=crop',
  // Nana Kwandoh — Accra street life
  accraStreet: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800&q=80&auto=format&fit=crop',
  // Emmanuel Ikwuegbu — African woman portrait
  womanPortrait: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80&auto=format&fit=crop',
  // Hush Naidoo — phone / mobile money
  mobilePayment: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop',
  // Taylor Wilcox — students / learning
  education: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80&auto=format&fit=crop',
  // Vonecia Carswell — community people
  community: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80&auto=format&fit=crop',
  // National Cancer Institute — medical/care
  medical: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80&auto=format&fit=crop',
  // Eliott Reyna — hands giving
  giving: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80&auto=format&fit=crop',
  // KAL VISUALS — church/faith gathering
  faith: 'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=600&q=80&auto=format&fit=crop',
}

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

const EMOJI: Record<string, string> = {
  medical:'🏥', emergency:'🆘', education:'🎓', charity:'🤲', faith:'⛪',
  community:'🏘', environment:'🌿', business:'💼', family:'👨‍👩‍👧',
  sports:'⚽', events:'🎉', wishes:'🌟', memorial:'🕊', other:'💚',
}

// Placeholder campaigns shown before DB has data
const PLACEHOLDERS = [
  { title: "Help Ama pay for her kidney surgery at Korle Bu", name: 'Ama Mensah · Accra', raised: 14400, goal: 20000, img: PHOTOS.medical },
  { title: "Kofi's final year university fees — KNUST", name: 'Kofi Asante · Kumasi', raised: 2100, goal: 4500, img: PHOTOS.education },
  { title: 'New roof for Victory Baptist Church, Tema', name: 'Victory Baptist · Tema', raised: 18000, goal: 30000, img: PHOTOS.faith },
]

function LiveCampaignCard({ c }: { c: any }) {
  const pct = c.goal_amount ? Math.min(Math.round((c.raised_amount / c.goal_amount) * 100), 100) : 0
  return (
    <Link href={`/campaigns/${c.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
      <div className="h-48 relative overflow-hidden bg-gray-100">
        {c.image_url
          ? <img src={c.image_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center text-5xl">{EMOJI[c.category?.toLowerCase()] || '💚'}</div>
        }
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

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('campaigns').select('*, profiles(full_name)')
      .eq('status', 'approved').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setCampaigns(data || []))
  }, [])

  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ── Split: text left, real photo right */}
        <section className="bg-navy min-h-[620px] grid md:grid-cols-2 overflow-hidden">
          {/* Text column */}
          <div className="flex flex-col justify-center px-8 md:px-14 py-16 relative">
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '36px 36px' }} />
            <div className="relative max-w-lg">
              <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Ghana's verified crowdfunding platform 🇬🇭
              </div>
              <h1 className="font-nunito font-black text-white text-5xl md:text-6xl leading-[1.02] mb-5" style={{ letterSpacing: -2 }}>
                Raise money.<br /><span className="text-primary">Be trusted.</span>
              </h1>
              <p className="text-white/50 text-base leading-relaxed mb-7 max-w-md">
                Ghana's only crowdfunding platform with Ghana Card identity verification, instant MoMo payouts, and a small 2% transaction fee — no platform fee, no monthly bills.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href="/create"
                  className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30 text-sm">
                  Start a campaign — free →
                </Link>
                <Link href="/donate"
                  className="px-7 py-4 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold rounded-full transition-all text-sm">
                  Browse campaigns
                </Link>
              </div>
              <div className="flex flex-wrap gap-5 text-xs text-white/30 font-medium">
                <span>✓ Ghana Card verified</span>
                <span>✓ MoMo native</span>
                <span>✓ Same-day payout</span>
                <span>✓ 2% + ₵0.25 fee only</span>
              </div>
            </div>
          </div>

          {/* Photo column */}
          <div className="relative hidden md:block">
            <img
              src={PHOTOS.womanPortrait}
              alt="Fundraiser in Ghana"
              className="w-full h-full object-cover"
            />
            {/* Left fade to navy */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-navy to-transparent" />
            {/* Floating campaign card */}
            <div className="absolute bottom-10 left-6 bg-white rounded-2xl shadow-2xl p-4 w-[230px]">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
                  <img src={PHOTOS.accraStreet} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-nunito font-black text-navy text-xs">Ama Mensah</div>
                  <div className="text-primary text-xs font-bold flex items-center gap-1">✓ Verified · Accra</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-2.5 leading-snug">Help with kidney surgery at Korle Bu Teaching Hospital</div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-primary rounded-full" style={{ width: '72%' }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-bold text-navy">₵14,400 raised</span>
                <span className="text-primary font-bold">72%</span>
              </div>
            </div>
            {/* Top-right donation notification */}
            <div className="absolute top-8 right-6 bg-white rounded-xl shadow-xl px-4 py-2.5 flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-sm flex-shrink-0">💚</div>
              <div>
                <div className="text-xs font-black text-navy">New donation</div>
                <div className="text-xs text-gray-400">Kwame donated ₵200 via MTN MoMo</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST STRIP ── */}
        <div className="bg-white border-b border-gray-100 py-4 overflow-x-auto">
          <div className="max-w-5xl mx-auto px-5 flex flex-wrap justify-center gap-6 text-xs text-gray-400 font-medium">
            {['🪪 Ghana Card identity verified','📱 MTN · Vodafone · AirtelTigo','💸 No platform fee','⚡ Same-day payout','🔒 Encrypted & secure'].map((t,i) => <span key={i}>{t}</span>)}
          </div>
        </div>

        {/* ── HOW IT WORKS — with real photos ── */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-12">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2" style={{ fontFamily: 'DM Mono, monospace' }}>Simple process</div>
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight">Start raising in 3 steps</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { n: '01', img: PHOTOS.mobilePayment, title: 'Tell your story', desc: 'Create your campaign in minutes — title, goal, and your personal story.' },
                { n: '02', img: PHOTOS.education, title: 'Verify your identity', desc: 'Upload your Ghana Card. Donors give 3× more to verified campaigns.' },
                { n: '03', img: PHOTOS.giving, title: 'Share & receive MoMo', desc: 'Share on WhatsApp. Donations arrive directly to your mobile money.' },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="h-48 relative overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-navy/20" />
                    <div className="absolute top-4 left-4 w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg">
                      <span className="font-nunito font-black text-white text-xs">{s.n}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="font-nunito font-black text-navy text-base mb-1.5">{s.title}</div>
                    <div className="text-gray-400 text-sm leading-relaxed">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/how-it-works" className="text-primary text-sm font-bold hover:underline">Learn more →</Link>
            </div>
          </div>
        </section>

        {/* ── IMPACT NUMBERS ── */}
        <section className="bg-primary py-12 px-5">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
            {[['₵2.4M+','Raised on EveryGiving'],['1,200+','Successful campaigns'],['8,900+','Generous donors']].map(([v,l],i)=>(
              <div key={i}>
                <div className="font-nunito font-black text-white text-3xl md:text-4xl mb-1">{v}</div>
                <div className="text-white/60 text-xs">{l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WHY EVERYGIVING — photo + text ── */}
        <section className="py-16 bg-white overflow-hidden">
          <div className="max-w-5xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
            {/* Photo collage */}
            <div className="relative h-[420px]">
              <img src={PHOTOS.community} alt="Community"
                className="absolute top-0 left-0 w-64 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
              <img src={PHOTOS.medical} alt="Medical"
                className="absolute bottom-0 left-16 w-52 h-52 object-cover rounded-2xl shadow-xl border-4 border-white" />
              <img src={PHOTOS.accraStreet} alt="Accra"
                className="absolute top-12 right-0 w-44 h-64 object-cover rounded-2xl shadow-xl border-4 border-white" />
              <div className="absolute bottom-8 right-2 bg-primary text-white text-xs font-bold rounded-xl px-4 py-2 shadow-lg">
                Ghana-built 🇬🇭
              </div>
            </div>
            {/* Text */}
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Built for Ghana</div>
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-5" style={{ letterSpacing: -1 }}>
                Everything GoFundMe<br />doesn't have
              </h2>
              <div className="flex flex-col gap-5">
                {[
                  { icon: '🪪', title: 'Ghana Card verified', desc: 'Every fundraiser confirms their identity before going live. Donors give more to verified campaigns — and you deserve that trust.' },
                  { icon: '📱', title: 'MoMo native', desc: 'Designed for MTN MoMo, Vodafone Cash and AirtelTigo from day one. No bank account required.' },
                  { icon: '💸', title: 'Honest fees', desc: 'Just 2% + ₵0.25 per donation — automatically deducted. No platform fee, no monthly bills, no surprises.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-11 h-11 bg-primary-light border border-primary/15 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="font-nunito font-black text-navy text-sm mb-1">{item.title}</div>
                      <div className="text-gray-400 text-xs leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/about" className="inline-block mt-6 text-primary text-sm font-bold hover:underline">Learn more about us →</Link>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ── */}
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-5">
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-nunito font-black text-navy text-2xl tracking-tight">Browse by cause</h2>
              <Link href="/fundraising-categories" className="text-primary text-sm font-bold hover:underline">All 17 categories →</Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {CATEGORIES.map((cat, i) => (
                <Link key={i} href={`/campaigns?category=${cat.slug}`}
                  className="bg-white border border-gray-100 rounded-2xl p-4 text-center hover:border-primary/30 hover:bg-primary-light transition-all group hover:-translate-y-0.5">
                  <div className="text-2xl mb-1.5">{cat.emoji}</div>
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
              <Link href="/donate" className="text-primary text-sm font-bold hover:underline">View all →</Link>
            </div>

            {campaigns.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {campaigns.map(c => <LiveCampaignCard key={c.id} c={c} />)}
              </div>
            ) : (
              /* Placeholder cards with real photos */
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {PLACEHOLDERS.map((c, i) => {
                  const pct = Math.round((c.raised / c.goal) * 100)
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="h-48 relative overflow-hidden">
                        <img src={c.img} alt={c.title} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">✓ Verified</div>
                      </div>
                      <div className="p-5">
                        <div className="font-nunito font-black text-navy text-sm mb-1 line-clamp-2">{c.title}</div>
                        <div className="text-gray-400 text-xs mb-3">{c.name}</div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-navy">₵{c.raised.toLocaleString()} raised</span>
                          <span className="text-primary font-bold">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── FINAL CTA — full bleed photo background ── */}
        <section className="relative py-24 overflow-hidden">
          <img src={PHOTOS.community} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy/80" />
          <div className="relative max-w-2xl mx-auto px-5 text-center">
            <h2 className="font-nunito font-black text-white text-4xl tracking-tight mb-3" style={{ letterSpacing: -1 }}>
              Ready to start raising?
            </h2>
            <p className="text-white/60 text-base mb-8">Free to create. Verified in under 10 minutes. MoMo-native.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/create"
                className="px-10 py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30 text-sm">
                Start your campaign — free →
              </Link>
              <Link href="/donate"
                className="px-8 py-4 bg-white/15 hover:bg-white/20 border border-white/20 text-white font-bold rounded-full transition-all text-sm">
                Browse campaigns
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
