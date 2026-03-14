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

  const { count: totalCampaigns } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { data: donationStats } = await supabase
    .from('donations')
    .select('amount')
    .eq('status', 'success')

  const totalRaised = donationStats?.reduce((sum, d) => sum + (d.amount || 0), 0) ?? 0
  const totalDonors = donationStats?.length ?? 0

  const categories = [
    { name: 'Medical', emoji: '🏥', slug: 'medical', desc: 'Surgery, treatment, hospital bills' },
    { name: 'Education', emoji: '🎓', slug: 'education', desc: 'School fees, uniforms, books' },
    { name: 'Emergency', emoji: '🆘', slug: 'emergency', desc: 'Fire, floods, urgent needs' },
    { name: 'Funeral', emoji: '🕊️', slug: 'funeral', desc: 'Burial and funeral support' },
    { name: 'Community', emoji: '🏡', slug: 'community', desc: 'Boreholes, roads, projects' },
    { name: 'Church', emoji: '⛪', slug: 'church', desc: 'Building funds, missions' },
  ]

  const stats = [
    { label: 'Raised across Ghana', value: totalRaised >= 1000 ? `₵${(totalRaised/1000).toFixed(0)}K+` : `₵${totalRaised.toLocaleString()}`, icon: '💰', color: 'bg-primary-light' },
    { label: 'Active campaigns', value: `${totalCampaigns ?? 0}+`, icon: '📋', color: 'bg-blue-50' },
    { label: 'Donors helped', value: `${totalDonors}+`, icon: '🤝', color: 'bg-amber-50' },
    { label: 'Avg. verification', value: '24hrs', icon: '⚡', color: 'bg-purple-50' },
  ]

  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary-dark px-3 py-1.5 rounded-full text-xs font-bold mb-5 border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Ghana's crowdfunding platform
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-navy leading-[1.08] tracking-tight mb-5">
              Support people and<br />
              <span className="text-primary">causes across Ghana.</span>
            </h1>
            <p className="text-gray-500 leading-relaxed mb-6 text-base max-w-md">
              EveryGiving helps Ghanaians raise funds for medical bills, school fees, emergencies,
              funerals, and community projects — with identity verification, transparent tracking,
              and instant Mobile Money payouts.
            </p>
            <div className="flex flex-col gap-2 mb-7">
              {[
                'Built for Ghana — Mobile Money first',
                'Ghana Card identity verification',
                'Easy for family and diaspora to donate',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</div>
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Link href="/create"
                className="px-7 py-3.5 bg-primary hover:bg-primary-dark text-white font-black rounded-full transition-all hover:-translate-y-0.5 shadow hover:shadow-lg text-sm">
                Start a fundraiser — free
              </Link>
              <Link href="/campaigns"
                className="px-6 py-3.5 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-700 font-bold rounded-full transition-all text-sm">
                Donate to a campaign
              </Link>
            </div>
            <p className="text-xs text-gray-400">🔒 Ghana Card verified · Instant MoMo payout · Free to start</p>
          </div>

          {/* Stats grid */}
          <div className="hidden md:grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <div key={i} className={`${s.color} rounded-2xl p-6 flex flex-col gap-2`}>
                <div className="text-2xl">{s.icon}</div>
                <div className="font-nunito font-black text-2xl text-navy tracking-tight">{s.value}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── VALUE BANNER ─────────────────────────────────────────────── */}
        <div className="bg-navy">
          <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {[
              { icon: '📱', title: 'Mobile Money first', desc: 'MTN MoMo, Vodafone Cash & AirtelTigo' },
              { icon: '🪪', title: 'Identity verified', desc: 'Ghana Card verification on every campaign' },
              { icon: '🌍', title: 'Diaspora friendly', desc: 'Card & international payments accepted' },
              { icon: '🔒', title: 'Secure & transparent', desc: 'Every cedi tracked and publicly visible' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-6">
                <div className="text-xl flex-shrink-0">{item.icon}</div>
                <div>
                  <div className="font-nunito font-bold text-white text-xs mb-0.5">{item.title}</div>
                  <div className="text-xs text-white/40 leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CATEGORIES ───────────────────────────────────────────────── */}
        <div className="bg-gray-50 border-y border-gray-100 py-12">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-8">
              <h2 className="font-nunito font-black text-navy text-2xl mb-2">What do you need help with?</h2>
              <p className="text-gray-400 text-sm">Every cause matters. Start your campaign in minutes.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link key={cat.slug} href={`/campaigns?category=${cat.slug}`}
                  className="bg-white border-2 border-gray-100 hover:border-primary hover:bg-primary-light rounded-xl p-4 text-center transition-all hover:-translate-y-1 group">
                  <div className="text-2xl mb-2">{cat.emoji}</div>
                  <div className="font-nunito font-extrabold text-navy text-xs group-hover:text-primary-dark mb-1">{cat.name}</div>
                  <div className="text-[10px] text-gray-400 leading-tight hidden md:block">{cat.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-2">How EveryGiving works</h2>
              <p className="text-gray-400 text-sm">From idea to funded — takes less than 5 minutes to start</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-7 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
              {[
                { n: '1', icon: '📝', title: 'Create your campaign', desc: 'Tell your story, set your goal, upload a photo. Takes less than 5 minutes.' },
                { n: '2', icon: '🪪', title: 'Get verified free', desc: 'Submit your Ghana Card. Verified campaigns raise 3× more money.' },
                { n: '3', icon: '📲', title: 'Share on WhatsApp', desc: 'Share your campaign link with family, friends, and WhatsApp groups.' },
                { n: '4', icon: '💸', title: 'Receive via MoMo', desc: 'Donations land in your Mobile Money wallet. Fast and transparent.' },
              ].map((step) => (
                <div key={step.n} className="text-center relative z-10">
                  <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center font-nunito font-black text-white text-xl mx-auto mb-4 shadow-lg shadow-primary/30 border-4 border-white">
                    {step.n}
                  </div>
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <h3 className="font-nunito font-extrabold text-navy text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURED CAMPAIGNS ───────────────────────────────────────── */}
        <section className="bg-gray-50 border-y border-gray-100 py-14">
          <div className="max-w-6xl mx-auto px-5">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="font-nunito font-black text-navy text-2xl tracking-tight">Active campaigns</h2>
                <p className="text-gray-400 text-sm mt-1">Real people. Real causes. Across Ghana.</p>
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
                <p className="text-sm mb-6">Be the first to start a fundraiser on EveryGiving</p>
                <Link href="/create" className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-colors text-sm">
                  Start the first campaign →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ── TRUST & SAFETY ───────────────────────────────────────────── */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-10">
              <h2 className="font-nunito font-black text-navy text-2xl mb-2">Built on trust</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                EveryGiving takes fraud seriously. Every campaign is reviewed before going live.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: '🪪',
                  badge: 'Identity Verified',
                  badgeColor: 'bg-primary text-white',
                  title: 'Ghana Card verification',
                  desc: 'Every fundraiser submits their Ghana Card. Our team confirms identity before issuing a verified badge. Donors know exactly who they are giving to.',
                },
                {
                  icon: '🛡️',
                  badge: 'Fraud Protected',
                  badgeColor: 'bg-blue-600 text-white',
                  title: 'Fraud prevention',
                  desc: 'We monitor all campaigns for suspicious activity. Reported campaigns are paused immediately. Funds are only released after milestone verification.',
                },
                {
                  icon: '🔐',
                  badge: 'Secure Payments',
                  badgeColor: 'bg-amber-500 text-white',
                  title: 'Secure payment processing',
                  desc: 'All transactions are encrypted. We partner with licensed Ghanaian payment providers. We never store your MoMo PIN or card details.',
                },
              ].map(item => (
                <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{item.icon}</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-nunito font-black text-navy text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/transparency" className="text-primary text-sm font-semibold hover:underline">
                Learn how we protect donors and fundraisers →
              </Link>
            </div>
          </div>
        </section>

        {/* ── SOCIAL PROOF ─────────────────────────────────────────────── */}
        <div className="bg-navy py-14">
          <div className="max-w-6xl mx-auto px-5 text-center">
            <h2 className="font-nunito font-black text-white text-2xl mb-2">
              Ghanaians helping Ghanaians
            </h2>
            <p className="text-white/50 text-sm mb-10">Every cedi raised goes directly to a person or cause in Ghana.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: totalRaised >= 1000 ? `₵${(totalRaised/1000).toFixed(0)}K+` : `₵${totalRaised.toLocaleString()}`, label: 'Raised across Ghana' },
                { value: `${totalCampaigns ?? 0}+`, label: 'Active campaigns' },
                { value: `${totalDonors}+`, label: 'People supported' },
                { value: '24hrs', label: 'Avg. verification time' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-nunito font-black text-primary text-3xl mb-1">{s.value}</div>
                  <div className="text-white/40 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── DIASPORA SECTION ─────────────────────────────────────────── */}
        <section className="py-16 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto px-5 text-center">
            <div className="text-3xl mb-4">🌍</div>
            <h2 className="font-nunito font-black text-navy text-2xl mb-3">
              In the UK, US, or Canada? You can still help.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto mb-7">
              EveryGiving accepts international card payments so the Ghanaian diaspora can donate to campaigns back home. No MoMo account needed.
            </p>
            <Link href="/campaigns"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-3.5 rounded-full transition-all text-sm shadow hover:shadow-lg">
              Browse campaigns to support
            </Link>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-primary-dark to-primary py-20 text-center">
          <div className="max-w-xl mx-auto px-5">
            <h2 className="font-nunito font-black text-white text-3xl mb-3 tracking-tight">
              Ready to start raising money?
            </h2>
            <p className="text-white/75 mb-8 leading-relaxed text-sm">
              Free to start. Verified in 24hrs. Instant MoMo payout.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/create"
                className="px-8 py-3.5 bg-white text-primary font-black rounded-full hover:-translate-y-0.5 transition-all shadow hover:shadow-lg text-sm">
                Start a fundraiser — free
              </Link>
              <Link href="/campaigns"
                className="px-7 py-3.5 border-2 border-white/40 hover:border-white text-white font-bold rounded-full transition-all text-sm">
                Donate to a campaign
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
