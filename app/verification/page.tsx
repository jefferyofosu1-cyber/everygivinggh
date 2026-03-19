
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Verification Tiers',
  description: 'Understand EveryGiving verification tiers - Basic, Standard, Premium, Gold, and Diamond. Learn what each tier includes, the fees, and the goal limits.',
}

const TIERS = [
  {
    id: 'basic', name: 'Basic', emoji: '*', price: 'Free', priceNum: 0,
    badge: 'Basic', badgeStyle: 'bg-gray-100 text-gray-600 border-gray-200',
    border: 'border-gray-200', headerBg: 'bg-gray-50',
    limit: 'Up to GH₵5,000', limitNum: 5000,
    canDefer: false, recommended: false,
    desc: 'For small, personal campaigns. ID upload only. No fee ever.',
    checks: [
      'ID document photo uploaded',
      'ID number recorded on file',
      'Basic badge displayed on campaign',
      'Manual admin review before approval',
    ],
    notIncluded: ['Selfie verification', 'Priority listing', 'Premium badge'],
  },
  {
    id: 'standard', name: 'Standard', emoji: '*', price: 'GH₵50', priceNum: 50,
    badge: 'Verified', badgeStyle: 'bg-primary-light text-primary border-primary/20',
    border: 'border-primary', headerBg: 'bg-primary-light',
    limit: 'Up to GH₵50,000', limitNum: 50000,
    canDefer: true, recommended: true,
    desc: 'The most popular tier. ID and selfie reviewed. Full Verified badge.',
    checks: [
      'Everything in Basic',
      'Selfie photo reviewed by our team',
      'Full Verified badge on campaign',
      'Priority placement in listings',
      'Can defer fee until first donation',
    ],
    notIncluded: ['Supporting document review', 'Premium placement'],
  },
  {
    id: 'premium', name: 'Premium', emoji: '⭐', price: '₵100', priceNum: 100,
    badge: 'Premium', badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    border: 'border-amber-400 opacity-60', headerBg: 'bg-amber-50',
    limit: 'More than GHC 50,000', limitNum: Infinity,
    canDefer: false, recommended: false,
    desc: 'Full document and situational review for large campaigns.',
    checks: [
      'Everything in Standard',
      'Supporting documents reviewed',
      'Premium badge + top placement',
      'Priority support from our team',
      'Dedicated account manager',
    ],
    notIncluded: [],
  },
]

const FAQS = [
  { q: 'Why does verification cost money?', a: 'The fee covers the cost of manual identity review by our team. We read every document carefully to protect donors. The fee ensures only serious, genuine fundraisers launch campaigns on EveryGiving.' },
  { q: 'Can I defer the fee?', a: 'Yes, Standard tier and above can defer the verification fee. It is automatically deducted from your first donations once your campaign starts receiving money. You pay nothing upfront.' },
  { q: 'What ID do I need?', a: 'Ghana Card (preferred), Passport, DVLA Driver\'s Licence, Voter\'s ID, or NHIS Card. The ID must be yours and must be clearly readable in the photo.' },
  { q: 'How long does verification take?', a: 'Basic and Standard tiers are usually reviewed within 24 hours. Premium within 24 hours. Gold within 12 hours. Diamond within 6 hours. You receive an email the moment your campaign is approved.' },
  { q: 'What happens if my campaign is rejected?', a: 'You will receive an email explaining why. The most common reasons are: unclear ID photo, ID details that do not match, or a campaign that violates our guidelines. You can resubmit after correcting the issue.' },
  { q: 'Can I upgrade my tier?', a: 'Yes. You can upgrade your tier at any time by contacting our team. You will pay the difference in fees, and your campaign will be re-reviewed at the higher tier level.' },
]

export default function VerificationPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-navy py-16 px-5 relative overflow-hidden">
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6">
               3 verification tiers
            </div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl mb-4" style={{ letterSpacing: -1 }}>
              Build donor trust.<br />
              <span className="text-primary">Raise more money.</span>
            </h1>
            <p className="text-white/55 text-base max-w-xl mx-auto leading-relaxed mb-8">
              Every EveryGiving campaign is manually reviewed by our team before going live. Verified campaigns raise 3x more than unverified ones - because donors trust what they can see.
            </p>
            <Link href="/create" className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/25 text-sm">
              Start a verified campaign
            </Link>
          </div>
        </section>

        {/* Why verification matters */}
        <section className="py-14 bg-white px-5 border-b border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-nunito font-black text-navy text-3xl mb-3">Why verification matters</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">In Ghana, trust is everything. Donors need to know the person asking for money is who they say they are.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: '*', title: 'Protects donors', desc: 'We review every ID document manually. Donors know every campaign they give to has been verified by a real person.' },
                { icon: '*', title: 'Boosts fundraising', desc: 'Campaigns with the Verified badge raise 3 times more on average. Trust converts to donations.' },
                { icon: '*', title: 'Builds Ghana\'s giving culture', desc: 'Every verified campaign makes online giving safer. We are building the infrastructure of trust for Ghana\'s digital economy.' },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-nunito font-black text-navy text-base mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tier cards */}
        <section className="py-16 bg-gray-50 px-5">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl mb-3">Choose your verification tier</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">Higher tiers include deeper review, stronger badges, and higher fundraising limits. Most fundraisers start at Standard.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {TIERS.map((tier) => (
                <div key={tier.id} className={`relative bg-white rounded-2xl border-2 ${tier.border} overflow-hidden flex flex-col`}>
                  {tier.recommended && (
                    <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">Most popular</div>
                  )}
                  <div className={`${tier.headerBg} px-5 pt-5 pb-4 border-b border-gray-100`}>
                    <div className="text-2xl mb-1.5">{tier.emoji}</div>
                    <div className="font-nunito font-black text-navy text-lg">{tier.name}</div>
                    <div className="font-nunito font-black text-2xl mt-1">{tier.price}</div>
                    {tier.canDefer && <div className="text-xs text-gray-400 mt-0.5">or defer from donations</div>}
                    <div className={`inline-flex items-center gap-1 border text-xs font-bold px-2.5 py-1 rounded-full mt-3 ${tier.badgeStyle}`}>
                      {tier.emoji} {tier.badge}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 font-semibold">
                      {tier.limit}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{tier.desc}</p>
                    <div className="flex flex-col gap-2 mt-1">
                      {tier.checks.map((c) => (
                        <div key={c} className="flex items-start gap-2">
                          <span className="text-primary text-xs mt-0.5 flex-shrink-0"></span>
                          <span className="text-xs text-gray-600 leading-snug">{c}</span>
                        </div>
                      ))}
                      {tier.notIncluded.map((c) => (
                        <div key={c} className="flex items-start gap-2 opacity-40">
                          <span className="text-gray-400 text-xs mt-0.5 flex-shrink-0">-</span>
                          <span className="text-xs text-gray-400 leading-snug line-through">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    {tier.priceNum === -1 ? (
                      <span className="block text-center py-2.5 rounded-full text-xs font-nunito font-black border-2 border-gray-200 text-gray-400 cursor-not-allowed">
                        Coming soon
                      </span>
                    ) : (
                      <Link href="/create"
                        className={`block text-center py-2.5 rounded-full text-xs font-nunito font-black transition-all ${tier.recommended ? 'bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20' : 'border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-600'}`}>
                        {tier.priceNum === 0 ? 'Start free' : `Start - ${tier.price}`}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-white px-5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl mb-3">How the verification process works</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-5">
              {[
                { n: '01', icon: '*', title: 'Create your campaign', desc: 'Fill in your campaign details - title, story, category, and fundraising goal.' },
                { n: '02', icon: '*', title: 'Upload your ID', desc: 'Take a clear photo of your ID document and a selfie (Standard and above). Takes 2 minutes.' },
                { n: '03', icon: '*', title: 'Our team reviews', desc: 'We manually review your ID and campaign. This usually takes less than 24 hours.' },
                { n: '04', icon: '*', title: 'Go live and fundraise', desc: 'Once approved, your campaign goes live with a Verified badge and you can start sharing.' },
              ].map((s, i) => (
                <div key={s.n} className="relative bg-gray-50 rounded-2xl border border-gray-100 p-6">
                  <div className="font-mono-dm text-xs text-primary font-bold mb-3 bg-primary/10 inline-block px-2 py-1 rounded-md">{s.n}</div>
                  <div className="text-2xl mb-3">{s.icon}</div>
                  <h3 className="font-nunito font-black text-navy text-sm mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-gray-50 px-5">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl mb-3">Frequently asked questions</h2>
            </div>
            <div className="flex flex-col gap-3">
              {FAQS.map((faq) => (
                <div key={faq.q} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-nunito font-black text-navy text-base mb-2">{faq.q}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-navy px-5 relative overflow-hidden">
          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="font-nunito font-black text-white text-3xl mb-4">Ready to get verified?</h2>
            <p className="text-white/55 text-sm mb-8">Create your campaign in 5 minutes. Upload your ID. Go live within 24 hours.</p>
            <Link href="/create" className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-10 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30 text-sm">
              Start your verified campaign
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
