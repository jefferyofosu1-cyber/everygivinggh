'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { usePageContent, cms } from '@/lib/content'

export default function FeesPage() {
  const c = usePageContent('fees')
  const [amount, setAmount] = useState(100)
  const fee = parseFloat((amount * 0.029 + 0.50).toFixed(2))
  const receives = parseFloat((amount - fee).toFixed(2))
  const feePct = ((fee / amount) * 100).toFixed(1)
  const receivesPct = (((amount - fee) / amount) * 100).toFixed(1)

  const EXAMPLES = [20, 50, 100, 200, 500, 1000, 5000]

  const COMPARE = [
    { name: 'Every Giving', fee: '2.9% + ₵0.50', total: fee, color: 'bg-primary', logo: '' },
    { name: 'GoFundMe (US)', fee: '~5% + processing', total: parseFloat((amount * 0.05 + (amount * 0.029 + 0.30)).toFixed(2)), color: 'bg-green-500', logo: '' },
    { name: 'Jumia Pay', fee: '~3.5%', total: parseFloat((amount * 0.035).toFixed(2)), color: 'bg-orange-500', logo: '' },
    { name: 'Direct MoMo', fee: 'Unverified · No platform', total: 0, color: 'bg-gray-400', logo: '', note: 'No trust or verification' },
  ]

  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-navy relative overflow-hidden py-24">
          <div className="relative max-w-4xl mx-auto px-5 text-center text-white">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">Honest fees</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-4" style={{letterSpacing:-1}}>
              {cms(c, 'hero', 'headline', "Let's do the math together")}
            </h1>
            <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed">
              {cms(c, 'hero', 'subtext', 'No hidden charges. No surprises. We deduct a small transaction fee from each donation automatically  -  so you never receive a bill.')}
            </p>
          </div>
        </section>

        {/* Live calculator */}
        <section className="py-14 bg-white">
          <div className="max-w-2xl mx-auto px-5">
            <div className="text-center mb-8">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2" style={{fontFamily:'DM Mono, monospace'}}>Live calculator</div>
              <h2 className="font-nunito font-black text-navy text-3xl">See exactly what happens to every cedi donated</h2>
            </div>

            {/* Amount slider */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 mb-6">
              <div className="text-center mb-6">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Donation amount</div>
                <div className="font-nunito font-black text-primary text-5xl mb-1">₵{amount.toLocaleString()}</div>
              </div>

              {/* Slider */}
              <input type="range" min="1" max="10000" step="1" value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer mb-4"
                style={{accentColor:'#02A95C'}} />

              {/* Quick amounts */}
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {EXAMPLES.map(a => (
                  <button key={a} onClick={() => setAmount(a)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${amount === a ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-500 hover:border-primary/40'}`}>
                    ₵{a.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Animated breakdown */}
              <div className="space-y-4">
                {/* Visual bar */}
                <div className="relative h-12 bg-gray-100 rounded-2xl overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-500 rounded-2xl flex items-center justify-center"
                    style={{width:`${receivesPct}%`}}>
                    <span className="text-white text-xs font-black px-2 truncate">₵{receives.toLocaleString()} goes to fundraiser</span>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 bg-gray-300 flex items-center justify-end pr-2"
                    style={{width:`${feePct}%`}}>
                    <span className="text-gray-600 text-xs font-black">fee</span>
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-light border border-primary/15 rounded-2xl p-5 text-center">
                    <div className="font-nunito font-black text-primary text-3xl mb-1">₵{receives.toLocaleString()}</div>
                    <div className="text-primary-dark/70 text-xs font-bold uppercase tracking-wide">Fundraiser receives</div>
                    <div className="text-primary/60 text-xs mt-1">{receivesPct}% of donation</div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
                    <div className="font-nunito font-black text-gray-500 text-3xl mb-1">₵{fee.toFixed(2)}</div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-wide">Transaction fee</div>
                    <div className="text-gray-300 text-xs mt-1">{feePct}% of donation</div>
                  </div>
                </div>

                {/* Formula */}
                <div className="bg-gray-900 rounded-2xl p-5 font-mono text-sm">
                  <div className="text-gray-500 text-xs mb-3 uppercase tracking-wider">The formula</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white">₵{amount}</span>
                    <span className="text-gray-500">×</span>
                    <span className="text-primary">2.9%</span>
                    <span className="text-gray-500">+</span>
                    <span className="text-primary">₵0.50</span>
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-400">₵{fee.toFixed(2)} fee</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-white">₵{amount}</span>
                    <span className="text-gray-500">−</span>
                    <span className="text-gray-400">₵{fee.toFixed(2)}</span>
                    <span className="text-gray-500">=</span>
                    <span className="text-primary font-black text-lg">₵{receives.toFixed(2)} to fundraiser</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Verification fees */}
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="max-w-2xl mx-auto px-5">
            <div className="text-center mb-8">
              <h2 className="font-nunito font-black text-navy text-2xl mb-2">Verification fees</h2>
              <p className="text-gray-400 text-sm">One-time, per campaign. Pay upfront or defer  -  deducted from your first donations.</p>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-100 px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <div>Tier</div>
                <div>Fee</div>
                <div>Goal range</div>
                <div>Defer?</div>
              </div>
              {[
                { emoji: '*', tier: 'Basic',   fee: 'Free',     range: 'Up to GH₵5,000',          defer: ' - ' },
                { emoji: '*', tier: 'Standard', fee: 'GH₵50',   range: 'GH₵5,000 – GH₵10,000',    defer: 'Yes' },
                { emoji: '⭐', tier: 'Premium',  fee: 'GH₵100',  range: 'GH₵10,000 – GH₵50,000',   defer: 'Yes' },
                { emoji: '*', tier: 'Gold',     fee: 'GH₵200',  range: 'GH₵50,000 – GH₵100,000',  defer: 'Yes' },
                { emoji: '*', tier: 'Diamond',  fee: 'GH₵500',  range: 'GH₵100,000 and above',     defer: 'Yes' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-4 px-5 py-4 border-b border-gray-50 last:border-0 items-center">
                  <div className="flex items-center gap-2 font-bold text-navy text-sm">
                    <span>{row.emoji}</span><span>{row.tier}</span>
                  </div>
                  <div className={`font-nunito font-black text-sm ${row.fee === 'Free' ? 'text-gray-500' : 'text-primary'}`}>{row.fee}</div>
                  <div className="text-gray-500 text-xs">{row.range}</div>
                  <div className={`text-xs font-bold ${row.defer === 'Yes' ? 'text-primary' : 'text-gray-300'}`}>{row.defer}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              Defer means the fee is automatically deducted from your first donations  -  you pay nothing until money comes in.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-14 bg-gray-50 border-t border-gray-100">
          <div className="max-w-2xl mx-auto px-5">
            <div className="text-center mb-8">
              <h2 className="font-nunito font-black text-navy text-2xl mb-2">How we compare on a ₵{amount.toLocaleString()} donation</h2>
              <p className="text-gray-400 text-sm">Every Giving is always the most you can get to your cause</p>
            </div>
            <div className="flex flex-col gap-3">
              {COMPARE.map((c, i) => (
                <div key={i} className={`bg-white rounded-2xl border-2 p-5 transition-all ${i === 0 ? 'border-primary shadow-lg shadow-primary/10' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{c.logo}</span>
                      <div>
                        <div className="font-nunito font-black text-navy text-sm">{c.name}</div>
                        <div className="text-gray-400 text-xs">{c.fee}</div>
                      </div>
                    </div>
                    {i === 0 && <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">Best</span>}
                  </div>
                  {c.note ? (
                    <div className="text-xs text-gray-400 italic">{c.note}</div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                        <span>Fundraiser receives</span>
                        <span className={i === 0 ? 'text-primary font-black' : 'text-gray-600 font-semibold'}>
                          ₵{(amount - c.total).toFixed(2)} ({(((amount - c.total) / amount) * 100).toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${c.color}`}
                          style={{width:`${((amount - c.total) / amount) * 100}%`}} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="max-w-2xl mx-auto px-5">
            <h2 className="font-nunito font-black text-navy text-2xl text-center mb-8">Fee questions answered</h2>
            <div className="flex flex-col gap-4">
              {[
                { q: 'When is the fee deducted?', a: 'At the moment a donation is made. The 2.9% + ₵0.50 is automatically deducted from each donation. Fundraisers receive the net amount when their milestones are reached. No invoices, no bills, no follow-ups.' },
                { q: 'Is there a platform fee on top?', a: 'No. The only charge is the 2.9% + ₵0.50 transaction fee per donation. No monthly fee. No withdrawal fee. No setup fee. No platform fee. Ever.' },
                { q: 'What does the fee cover?', a: 'The fee covers payment processing (MoMo provider fees), platform maintenance, identity verification infrastructure, and customer support. We operate with full transparency.' },
                { q: 'Do donors see the fee?', a: 'No. To keep the donation process as simple as possible, donors only see the amount they are giving. EveryGiving handles all the background complexity so that 100% focus is on supporting your cause.' },
                { q:'Is the verification tier fee refundable?', a:'No. Verification fees cover the cost of reviewing your documents and are non-refundable. If your campaign is rejected, we will work with you to understand and resolve the issue.' },
              ].map((faq, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                  <div className="font-nunito font-black text-navy text-sm mb-2">{faq.q}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-primary text-center px-5">
          <h2 className="font-nunito font-black text-white text-3xl mb-3">No surprises. Ever.</h2>
          <p className="text-white/70 text-sm mb-7">Free to start. You only contribute when donations come in.</p>
          <Link href="/create" className="inline-block bg-white text-primary font-nunito font-black px-10 py-4 rounded-full hover:-translate-y-0.5 transition-all shadow-xl text-sm">
            Start your campaign →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
