'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { usePageContent, cms } from '@/lib/content'

export default function TransparencyPage() {
  const c = usePageContent('transparency')
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-navy relative overflow-hidden py-20">
          <div className="relative max-w-3xl mx-auto px-5 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              Transparency
            </div>
            <h1 className="font-nunito font-black text-white text-3xl md:text-5xl tracking-tight mb-4 leading-tight" style={{ letterSpacing: -1 }}>
              {cms(c, 'hero', 'headline', 'Nothing to hide. Everything explained.')}
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-lg mx-auto">
              {cms(c, 'hero', 'subtext', 'EveryGiving is built on trust and transparency. This page shows exactly how the platform works, where money goes, and how we protect both donors and fundraisers in Ghana.')}
            </p>
          </div>
        </section>

        {/* Core commitments */}
        <section className="py-16" style={{ background: 'var(--surface)' }}>
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Our commitments</div>
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-10">Our Commitments</h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { icon: '₵', title: '0% Platform Fee on Funds Raised', body: 'EveryGiving does not take a cut of the funds raised for a cause. We charge a service fee of 2.9% + GHS 0.50 per donation to cover secure payment processing and platform operations. Verification fees help us sustain and grow the platform.' },
                { icon: '✓', title: 'Identity Verified', body: 'All fundraisers are required to verify their identity before raising funds. This ensures campaigns are created by real people, building trust for donors. Verified campaigns display a badge that donors can easily recognize.' },
                { icon: '👁', title: 'Every Donation is Visible', body: 'Transparency builds confidence. All donations are publicly visible on the campaign page. Total amount raised and campaign goal are shown in real time. Donors can see individual contributions. No hidden numbers. No manipulation.' },
                { icon: '⚡', title: 'Fast & Direct Payouts', body: 'Donations are processed securely and sent directly to the fundraiser\'s registered account or wallet as quickly as possible.' },
                { icon: '🚨', title: 'Fraud is Reported', body: 'We take fraud seriously: Fraudulent campaigns are removed immediately. Cases are reported to the authorities. Fraudsters are not just banned — they are held accountable.' },
                { icon: '🔒', title: 'No Ads. No Data Selling. Ever.', body: 'EveryGiving is completely ad-free. We do not sell or share user data with third parties. Our platform is supported through service fees and verification fees.' },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-6 border" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)' }}>
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <div className="font-nunito font-black text-navy text-base mb-2">{item.title}</div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fee breakdown */}
        <section className="py-16 border-t scroll-mt-14" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)' }}>
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Fee breakdown</div>
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-6">Fee Breakdown</h2>
            <div className="rounded-2xl overflow-hidden shadow-sm mb-8 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>
                    <th className="text-left px-6 py-4 font-nunito font-black text-navy text-xs uppercase tracking-wider">Fee Type</th>
                    <th className="text-left px-6 py-4 font-nunito font-black text-navy text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-4 font-nunito font-black text-navy text-xs uppercase tracking-wider">Paid By</th>
                    <th className="text-left px-6 py-4 font-nunito font-black text-navy text-xs uppercase tracking-wider">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { fee: 'Service Fee', amount: '2.9% + GHS 0.50', by: 'Fundraiser', purpose: 'Covers payment processing and platform operations' },
                    { fee: 'Basic Verification', amount: 'Free', by: 'Fundraiser', purpose: 'Basic identity check' },
                    { fee: 'Standard Verification', amount: 'GHS 50 (one-time)', by: 'Fundraiser', purpose: 'Full ID verification + Verified badge' },
                    { fee: 'Premium Verification', amount: 'GHS 100 (one-time)', by: 'Fundraiser', purpose: 'Advanced verification for large campaigns' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-6 py-4 font-medium text-navy">{row.fee}</td>
                      <td className="px-6 py-4 font-nunito font-black text-primary">{row.amount}</td>
                      <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{row.by}</td>
                      <td className="px-6 py-4" style={{ color: 'var(--text-muted)' }}>{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How verification works */}
        <section className="py-16 border-t" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Verification</div>
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-6">Verification Process</h2>
            <div className="flex flex-col gap-4 max-w-2xl">
              {[
                { step: '1', title: 'ID Submission', desc: 'Fundraiser provides a valid ID.' },
                { step: '2', title: 'Document Review', desc: 'We verify that the ID is authentic and matches the user\'s details.' },
                { step: '3', title: 'Selfie Confirmation (Standard & Premium)', desc: 'Confirms the person in the ID matches the selfie.' },
                { step: '4', title: 'Supporting Documents (Premium)', desc: 'Optional review of additional documents, such as hospital letters.' },
                { step: '5', title: 'Verified Badge', desc: 'Fundraisers receive a badge on their campaign, signaling trust to donors.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="font-nunito font-black text-primary text-xs">{item.step}</span>
                  </div>
                  <div className="border rounded-xl p-4 flex-1" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="font-nunito font-extrabold text-navy text-sm mb-1">{item.title}</div>
                    <div className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact strip */}
        <section className="py-12 bg-primary relative overflow-hidden">
          <div className="relative max-w-3xl mx-auto px-5 text-center">
            <div className="font-nunito font-black text-white text-2xl mb-2">Questions?</div>
            <p className="text-white/60 text-sm mb-6">We believe in full transparency. If you have any questions about how EveryGiving works, we're happy to explain.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="mailto:business@everygiving.org"
                className="inline-block text-primary font-nunito font-black px-7 py-3 rounded-full text-sm hover:-translate-y-0.5 transition-all" style={{ background: 'var(--surface)' }}>
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
