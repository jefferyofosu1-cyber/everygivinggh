import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata = { title: 'Pricing — Every Giving' }

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-5 py-16">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary-light text-primary-dark text-xs font-bold px-4 py-1.5 rounded-full mb-5">
            Simple & transparent
          </div>
          <h1 className="font-nunito font-black text-navy text-4xl mb-4">One small fee.<br />Nothing else.</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
            Every Giving charges a small transaction fee to keep the platform running. No hidden charges. No monthly fees. No surprises.
          </p>
        </div>

        {/* Fee card */}
        <div className="bg-white border-2 border-primary/20 rounded-2xl p-10 text-center mb-10 shadow-sm">
          <div className="text-6xl font-nunito font-black text-navy mb-2">2.5%</div>
          <div className="text-gray-400 text-lg mb-1">+ GHS 0.50 per donation</div>
          <div className="w-16 h-px bg-gray-100 mx-auto my-5" />
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg mx-auto">
            Every Giving charges a small transaction fee of 2.5% + GHS 0.50 per donation.
            This fee is automatically deducted from each donation and helps cover payment
            processing, securely delivering donations, and supporting multiple payment methods
            such as Mobile Money, debit cards, credit cards, Apple Pay, and Google Pay.
            This is the only fee deducted for someone starting a fundraiser.
          </p>
        </div>

        {/* Example calculation */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-10">
          <h2 className="font-nunito font-black text-navy text-lg mb-5">Example calculation</h2>
          <div className="space-y-3">
            {[
              { donation: 50,   fee: (50   * 0.025 + 0.50), receives: (50   - (50   * 0.025 + 0.50)) },
              { donation: 100,  fee: (100  * 0.025 + 0.50), receives: (100  - (100  * 0.025 + 0.50)) },
              { donation: 500,  fee: (500  * 0.025 + 0.50), receives: (500  - (500  * 0.025 + 0.50)) },
              { donation: 1000, fee: (1000 * 0.025 + 0.50), receives: (1000 - (1000 * 0.025 + 0.50)) },
            ].map(row => (
              <div key={row.donation} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 text-sm">
                <span className="text-gray-400">Donor gives</span>
                <span className="font-bold text-navy">₵{row.donation.toFixed(2)}</span>
                <span className="text-gray-400">Fee</span>
                <span className="text-gray-500">₵{row.fee.toFixed(2)}</span>
                <span className="text-gray-400">Campaign receives</span>
                <span className="font-nunito font-black text-primary">₵{row.receives.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What's free */}
        <div className="mb-10">
          <h2 className="font-nunito font-black text-navy text-lg mb-5">What is always free</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '🚀', title: 'Starting a fundraiser', desc: 'Create and publish your campaign at no cost.' },
              { icon: '🪪', title: 'Identity verification', desc: 'Get verified and earn donor trust — completely free.' },
              { icon: '📋', title: 'Campaign management', desc: 'Updates, photos, stories — free forever.' },
              { icon: '📱', title: 'Mobile Money payouts', desc: 'Receive funds directly to MTN MoMo or Vodafone Cash.' },
              { icon: '📊', title: 'Donation tracking', desc: 'Real-time dashboard showing every donation.' },
              { icon: '🔗', title: 'Sharing tools', desc: 'Share your campaign link anywhere.' },
            ].map(item => (
              <div key={item.title} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-bold text-navy text-sm">{item.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-14">
          <h2 className="font-nunito font-black text-navy text-lg mb-5">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Do donors see the fee?',
                a: 'No. The fee is deducted silently from the donation before it reaches your campaign. The donor experience is completely frictionless.'
              },
              {
                q: 'When is the fee deducted?',
                a: 'Automatically at the moment of each donation. You never need to calculate or pay it manually.'
              },
              {
                q: 'Are there any other fees?',
                a: 'No. No monthly fees, no withdrawal fees, no setup fees. Just 2.5% + GHS 0.50 per donation.'
              },
              {
                q: 'Is verification still free?',
                a: 'Yes — identity verification is completely free. It exists only as a trust feature to help donors feel confident giving to your campaign.'
              },
            ].map(item => (
              <div key={item.q} className="border border-gray-100 rounded-xl p-5">
                <div className="font-bold text-navy text-sm mb-1.5">{item.q}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-navy rounded-2xl p-8 text-center">
          <h2 className="font-nunito font-black text-white text-xl mb-2">Ready to start raising?</h2>
          <p className="text-white/50 text-sm mb-6">It is free to start. You only pay when donations come in.</p>
          <Link href="/create"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-3.5 rounded-xl transition-all text-sm shadow hover:shadow-lg">
            Start a fundraiser — free
          </Link>
        </div>

      </main>
      <Footer />
    </>
  )
}
