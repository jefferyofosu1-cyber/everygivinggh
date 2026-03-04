import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function VerificationPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-light to-white py-16 px-5 border-b border-gray-100">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-5xl mb-5">🛡️</div>
            <h1 className="font-nunito font-black text-navy text-4xl tracking-tight mb-4">
              Verification — Ghana's trust layer
            </h1>
            <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto">
              Every campaign on Every Giving is reviewed by our team before going live. Here's exactly what we check — and why it matters for donors.
            </p>
          </div>
        </section>

        {/* Why verification matters */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-4">Why this matters in Ghana</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Ghana has seen many online scams. When a stranger asks for money online — even for a genuine cause — most people hesitate. That hesitation costs real fundraisers thousands of cedis.
                </p>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Our verification system removes that hesitation. When donors see the verified badge, they know a real human being with a real Ghana Card is behind the campaign.
                </p>
                <div className="bg-primary-light border border-primary/20 rounded-xl p-4">
                  <div className="font-nunito font-bold text-primary-dark mb-1">📈 Verified campaigns raise 3× more</div>
                  <div className="text-sm text-primary-dark/70">Our data shows verified campaigns consistently raise significantly more than unverified ones — simply because donors trust them.</div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { icon: '✅', stat: '100%', label: 'Campaigns reviewed by our team' },
                  { icon: '⏱', stat: '24hrs', label: 'Average verification time' },
                  { icon: '📈', stat: '3×', label: 'More raised with verified badge' },
                  { icon: '🔒', stat: '0', label: 'Fraudulent campaigns that passed verification' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className="text-2xl">{s.icon}</span>
                    <div>
                      <div className="font-nunito font-black text-navy text-xl">{s.stat}</div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Verification tiers */}
        <section className="py-16 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-2 text-center">Verification tiers</h2>
            <p className="text-gray-400 text-center text-sm mb-10">Choose the level that fits your campaign</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  tier: 'Basic', price: 'Free', badge: '⚪', color: 'border-gray-200',
                  desc: 'Campaign goes live immediately with no verification. No badge shown to donors.',
                  checks: ['Email verified', 'Phone number active', 'No identity check'],
                  recommended: false,
                  note: 'Raises the least — donors are cautious'
                },
                {
                  tier: 'Standard', price: '₵20', badge: '🟢', color: 'border-primary',
                  desc: 'Ghana Card identity verified. Displays the green ✓ Verified badge on your campaign.',
                  checks: ['Ghana Card verified', 'Phone number confirmed', 'Identity matches NIA records', '✓ Verified badge displayed'],
                  recommended: true,
                  note: 'Most popular — raises 3× more'
                },
                {
                  tier: 'Premium', price: '₵50', badge: '🏆', color: 'border-amber-400',
                  desc: 'Full verification including supporting documents. Displays Premium badge for maximum trust.',
                  checks: ['Ghana Card verified', 'Supporting documents checked', 'Hospital bill / admission letter / quote', '🏆 Premium Verified badge', 'Priority listing in search'],
                  recommended: false,
                  note: 'Best for large campaigns ₵10k+'
                },
              ].map((tier, i) => (
                <div key={i} className={`bg-white border-2 ${tier.color} rounded-2xl p-6 relative ${tier.recommended ? 'shadow-lg shadow-primary/10' : ''}`}>
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      ⭐ Recommended
                    </div>
                  )}
                  <div className="text-3xl mb-3">{tier.badge}</div>
                  <div className="font-nunito font-black text-navy text-lg mb-1">{tier.tier}</div>
                  <div className="font-nunito font-black text-primary text-2xl mb-3">{tier.price}</div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{tier.desc}</p>
                  <div className="flex flex-col gap-2 mb-4">
                    {tier.checks.map((c, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-primary flex-shrink-0 mt-0.5">✓</span>
                        {c}
                      </div>
                    ))}
                  </div>
                  <div className={`text-xs font-bold px-3 py-2 rounded-lg ${tier.recommended ? 'bg-primary-light text-primary-dark' : 'bg-gray-50 text-gray-500'}`}>
                    {tier.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to get verified */}
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-5">
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-10 text-center">How to get verified</h2>
            <div className="flex flex-col gap-5">
              {[
                { n: '1', title: 'Create your campaign', desc: 'Fill in your campaign details including title, story, goal and category.' },
                { n: '2', title: 'Choose your verification tier', desc: 'Select Standard (₵20) or Premium (₵50) on the payout setup step.' },
                { n: '3', title: 'Submit your documents', desc: 'Upload a clear photo of your Ghana Card. For Premium, also add supporting documents (hospital bill, admission letter, etc).' },
                { n: '4', title: 'Wait 24 hours', desc: 'Our team reviews your submission. We may call your phone number to confirm.' },
                { n: '5', title: 'Go live with your badge', desc: 'Once approved, your campaign goes live with the verified badge displayed prominently.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0 mt-0.5">{step.n}</div>
                  <div className="bg-gray-50 rounded-xl p-4 flex-1 border border-gray-100">
                    <div className="font-nunito font-bold text-navy mb-1">{step.title}</div>
                    <div className="text-sm text-gray-400">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-center px-5">
          <h2 className="font-nunito font-black text-white text-2xl mb-3">Ready to get verified?</h2>
          <p className="text-white/75 text-sm mb-6">Start your campaign and get the verified badge in 24 hours.</p>
          <Link href="/create" className="inline-block px-8 py-3.5 bg-white text-primary font-nunito font-black rounded-full hover:-translate-y-0.5 transition-all shadow text-sm">
            Start a verified campaign →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
