import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function TransparencyPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-navy relative overflow-hidden py-20">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-3xl mx-auto px-5 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              Transparency
            </div>
            <h1 className="font-nunito font-black text-white text-3xl md:text-5xl tracking-tight mb-4 leading-tight" style={{ letterSpacing: -1 }}>
              Nothing to hide.
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-lg mx-auto">
              EveryGiving operates with full transparency. This page explains exactly how the platform works, where money goes, and how we protect everyone who uses it.
            </p>
          </div>
        </section>

        {/* Core commitments */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Our commitments</div>
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-10">How Every Giving works</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { icon: '₵', title: '0% platform fee on donations', body: 'EveryGiving charges nothing on donations. If a donor gives ₵100, the fundraiser receives ₵100 minus only the standard MoMo network fee. We take no cut — ever.' },
                { icon: '🔒', title: 'Identity verified against NIA', body: 'Every fundraiser\'s identity is checked against the National Identification Authority database using their Ghana Card. Donors can see the Verified badge as proof.' },
                { icon: '👁', title: 'Every donation is visible', body: 'Donors can see all contributions on a campaign page. The total raised, the goal, and individual donations are all publicly visible. No hidden numbers.' },
                { icon: '⚡', title: 'Same-day MoMo payouts', body: 'We never hold fundraiser money. Donations flow directly to the registered MoMo wallet the same day they are received.' },
                { icon: '🛡', title: 'Fraud is reported to authorities', body: 'Any fraudulent campaign is removed immediately. We report fraud to the Ghana Police Service and EOCO. Fraudsters are not simply banned — they are reported to the authorities.' },
                { icon: '📊', title: 'No ads. No data selling. Ever.', body: 'EveryGiving is entirely ad-free. We do not sell user data to advertisers or any third party. Our business model is the verification fee — not your data.' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <div className="font-nunito font-black text-navy text-base mb-2">{item.title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fee breakdown */}
        <section className="py-16 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Fee breakdown</div>
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-6">Exactly what you pay, and why</h2>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-6 py-4 font-nunito font-black text-navy text-xs uppercase tracking-wider">Fee type</th>
                    <th className="text-left px-6 py-4 font-nunito font-black text-navy text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-4 font-nunito font-black text-navy text-xs uppercase tracking-wider">Paid by</th>
                    <th className="text-left px-6 py-4 font-nunito font-black text-navy text-xs uppercase tracking-wider">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { fee: 'Platform fee on donations', amount: '₵0 (0%)', by: 'No one', purpose: 'EveryGiving charges nothing on donations' },
                    { fee: 'Basic verification', amount: '₵20 one-time', by: 'Fundraiser', purpose: 'ID upload + number check + Basic badge' },
                    { fee: 'Standard verification', amount: '₵50 one-time', by: 'Fundraiser', purpose: 'Full ID + selfie + NIA check + Verified badge' },
                    { fee: 'Premium verification', amount: '₵100 one-time', by: 'Fundraiser', purpose: 'Full check + document review + Premium badge' },
                    { fee: 'MoMo transfer fees', amount: 'Set by network', by: 'Fundraiser (on withdrawal)', purpose: 'Set by MTN/Vodafone/AirtelTigo — not by us' },
                    { fee: 'Account creation', amount: '₵0', by: 'No one', purpose: 'Creating an account is always free' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-medium text-navy">{row.fee}</td>
                      <td className="px-6 py-4 font-nunito font-black text-primary">{row.amount}</td>
                      <td className="px-6 py-4 text-gray-500">{row.by}</td>
                      <td className="px-6 py-4 text-gray-500">{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How verification works */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Verification</div>
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-6">How we confirm identities</h2>
            <div className="flex flex-col gap-4 max-w-2xl">
              {[
                { step: '1', title: 'Fundraiser uploads Ghana Card', desc: 'Front and back photo of their National Identification Card, plus manually entering their ID number.' },
                { step: '2', title: 'NIA database check', desc: 'The ID number and document details are cross-referenced against the National Identification Authority (NIA) database.' },
                { step: '3', title: 'Facial matching (Standard & Premium)', desc: 'A live selfie is compared against the photo on the ID document using facial recognition. Liveness detection prevents photo spoofing.' },
                { step: '4', title: 'Document review (Premium only)', desc: 'Supporting documents — such as hospital admission letters — are reviewed manually by our team before the Premium badge is granted.' },
                { step: '5', title: 'Badge awarded', desc: 'Once verified, the appropriate badge appears on the campaign. Donors can see the badge and understand exactly what level of verification it represents.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-nunito font-black text-primary text-xs">{item.step}</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex-1">
                    <div className="font-nunito font-extrabold text-navy text-sm mb-1">{item.title}</div>
                    <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact strip */}
        <section className="py-12 bg-primary relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-3xl mx-auto px-5 text-center">
            <div className="font-nunito font-black text-white text-2xl mb-2">Questions about how we operate?</div>
            <p className="text-white/60 text-sm mb-6">We are happy to explain anything in more detail.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="mailto:business@everygiving.org"
                className="inline-block bg-white text-primary font-nunito font-black px-7 py-3 rounded-full text-sm hover:-translate-y-0.5 transition-all">
                Email us
              </a>
              <Link href="/terms"
                className="inline-block border-2 border-white/30 hover:border-white/60 text-white font-nunito font-bold px-7 py-3 rounded-full text-sm transition-all">
                Read our Terms
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
