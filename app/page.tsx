import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CampaignCard from '@/components/ui/CampaignCard'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const revalidate = 60

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, profiles(full_name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(6)

  const categories = [
    { name: 'Medical', emoji: '🏥', slug: 'medical' },
    { name: 'Church', emoji: '⛪', slug: 'church' },
    { name: 'Education', emoji: '🎓', slug: 'education' },
    { name: 'Emergency', emoji: '🆘', slug: 'emergency' },
    { name: 'Community', emoji: '🏡', slug: 'community' },
  ]

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-14 items-center">
          <div className="animate-fadeUp">
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary-dark px-3 py-1.5 rounded-full text-xs font-bold mb-5 border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse-dot" />
              Ghana's Trusted Crowdfunding Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-navy leading-[1.08] tracking-tight mb-4">
              The trusted way to <span className="text-primary">raise money</span> in Ghana
            </h1>
            <p className="text-gray-500 leading-relaxed mb-4 text-base max-w-md">
              <strong className="text-gray-700">Why send MoMo directly when you can raise more with trust?</strong> Every Giving gives your cause a verified page, transparent tracking, and mobile money — so donors give with confidence.
            </p>
            <div className="flex flex-col gap-2 mb-6">
              {['Verified identity — donors know you\'re real', 'MTN MoMo, Vodafone Cash & AirtelTigo built-in', 'Full transparency — every cedi tracked publicly'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</div>
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Link href="/create" className="px-7 py-3.5 bg-primary hover:bg-primary-dark text-white font-black rounded-full transition-all hover:-translate-y-0.5 shadow hover:shadow-lg text-sm">
                Start a fundraiser — it's free
              </Link>
              <Link href="/campaigns" className="px-6 py-3.5 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-700 font-bold rounded-full transition-all text-sm">
                Browse campaigns
              </Link>
            </div>
            <p className="text-xs text-gray-400 flex items-center gap-1">🔒 Ghana Card verified · Instant MoMo payout · Free to start</p>
          </div>

          {/* Right — stats */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { label: 'Raised on platform', value: '₵2.4M+', color: 'bg-primary-light', icon: '💰' },
              { label: 'Verified campaigns', value: '1,200+', color: 'bg-blue-50', icon: '✅' },
              { label: 'Verified campaigns', value: '1,200+', color: 'bg-amber-50', icon: '✅' },
              { label: 'Avg. verification', value: '24hrs', color: 'bg-purple-50', icon: '⚡' },
            ].map((s, i) => (
              <div key={i} className={`${s.color} rounded-2xl p-6 flex flex-col gap-2`}>
                <div className="text-2xl">{s.icon}</div>
                <div className="font-nunito font-black text-2xl text-navy tracking-tight">{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* VALUE BANNER */}
        <div className="bg-navy">
          <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {[
              { icon: '📱', title: 'Mobile Money First', desc: 'MTN MoMo, Vodafone Cash & AirtelTigo — the way Ghanaians actually pay' },
              { icon: '🪪', title: 'Ghana Card Verified', desc: 'Every organiser verified by identity — not just email' },
              { icon: '💸', title: 'Small transaction fee', desc: 'Just 2.5% + GHS 0.50 per donation. No monthly fees, no setup costs.' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-8 py-7">
                <div className="text-2xl flex-shrink-0">{item.icon}</div>
                <div>
                  <div className="font-nunito font-bold text-white text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-white/50 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="bg-gray-50 border-y border-gray-100 py-10">
          <div className="max-w-6xl mx-auto px-5">
            <h2 className="text-center font-nunito font-black text-navy text-lg mb-6">What do you need help with?</h2>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/campaigns?category=${cat.slug}`}
                  className="bg-white border-2 border-gray-100 hover:border-primary hover:bg-primary-light rounded-xl p-4 text-center cursor-pointer transition-all hover:-translate-y-1 group">
                  <div className="text-2xl mb-2">{cat.emoji}</div>
                  <div className="font-nunito font-extrabold text-navy text-xs group-hover:text-primary-dark">{cat.name}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CAMPAIGNS */}
        <section className="max-w-6xl mx-auto px-5 py-14">
          <div className="flex justify-between items-end mb-7">
            <div>
              <h2 className="font-nunito font-black text-navy text-2xl tracking-tight">Featured campaigns</h2>
              <p className="text-gray-400 text-sm mt-1">Verified causes making a real difference across Ghana</p>
            </div>
            <Link href="/campaigns" className="text-sm font-bold text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-light transition-colors">
              See all →
            </Link>
          </div>

          {campaigns && campaigns.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-5">
              {campaigns.map((c: any) => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-4">🌱</div>
              <p className="font-bold text-gray-500 mb-2">No campaigns yet</p>
              <p className="text-sm mb-6">Be the first to start a fundraiser on Every Giving</p>
              <Link href="/create" className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-colors text-sm">
                Start the first campaign →
              </Link>
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="bg-gray-50 border-y border-gray-100 py-16">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-2">Raise money in 3 simple steps</h2>
              <p className="text-gray-400 text-sm">From idea to funded — takes less than 5 minutes to start</p>
              <Link href="/tutorial" className="inline-flex items-center gap-2 mt-4 bg-navy text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-navy/90 transition-colors">
                ▶ Watch animated tutorial
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-7 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary to-primary-light" />
              {[
                { n: '1', title: 'Create your campaign', desc: 'Tell your story, set your goal, upload a photo. Our guided form makes it easy — no tech skills needed.' },
                { n: '2', title: 'Get verified in 24hrs', desc: 'Submit your Ghana Card + supporting documents. Verified campaigns raise 3× more money.' },
                { n: '3', title: 'Share & receive MoMo', desc: 'Share on WhatsApp. Donors pay instantly via MoMo or card. Funds land in your mobile wallet same day.' },
              ].map((step) => (
                <div key={step.n} className="text-center relative z-10">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center font-nunito font-black text-white text-xl mx-auto mb-4 shadow-lg shadow-primary/30 border-4 border-white">
                    {step.n}
                  </div>
                  <h3 className="font-nunito font-extrabold text-navy mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-primary-dark to-primary py-20 text-center">
          <div className="max-w-xl mx-auto px-5">
            <h2 className="font-nunito font-black text-white text-3xl mb-3 tracking-tight">Ready to start raising money?</h2>
            <p className="text-white/75 mb-8 leading-relaxed">Join over 1,200 Ghanaians already using Every Giving. Free to start. Verified in 24hrs. Instant MoMo payout.</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/create" className="px-8 py-3.5 bg-white text-primary font-black rounded-full hover:-translate-y-0.5 transition-all shadow hover:shadow-lg text-sm">
                Start a fundraiser — free
              </Link>
              <Link href="/campaigns" className="px-7 py-3.5 border-2 border-white/40 hover:border-white text-white font-bold rounded-full transition-all text-sm">
                Browse campaigns
              </Link>
            </div>
            <p className="text-white/50 text-xs mt-5">🔒 Ghana Card verified · Free to start · Instant MoMo payout</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
