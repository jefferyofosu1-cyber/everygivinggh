import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-navy py-20 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="text-4xl mb-5">🇬🇭</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-5 leading-tight">
              Built in Ghana,<br />for Ghanaians
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto">
              Every Giving was born from a simple observation — Ghanaians are incredibly generous, but the tools to fundraise online were built for the West. We built something different.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-5 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-primary-light text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5">Our mission</div>
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-5">
                Make generosity easy, trusted, and transparent
              </h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Ghana has a culture of "chipping in" — funerals, medical emergencies, school fees. Communities have always looked after each other. But in the digital age, that generosity gets blocked by distrust.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Every Giving adds the layer of verification and transparency that turns "I'd like to help but I'm not sure" into "Here's ₵200 — I trust this is real."
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🪪', title: 'Identity first', desc: 'Every fundraiser verified with Ghana Card before going live' },
                { icon: '📱', title: 'Mobile money native', desc: 'Built around MTN MoMo, Vodafone Cash, AirtelTigo' },
                { icon: '💸', title: 'Zero fees forever', desc: '100% of donations reach the cause — always' },
                { icon: '📊', title: 'Full transparency', desc: 'Every cedi tracked and publicly visible' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-nunito font-bold text-navy text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The problem we solve */}
        <section className="py-16 bg-gray-50 border-y border-gray-100">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-5">The problem we're solving</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left mt-10">
              {[
                { icon: '😰', title: 'Distrust', desc: 'Ghanaians have been burned by online scams. Real fundraisers struggle to be believed — even when they\'re legitimate.' },
                { icon: '📵', title: 'Wrong tools', desc: 'GoFundMe doesn\'t support MoMo. Bank transfers are slow. WhatsApp begging doesn\'t scale beyond your contacts.' },
                { icon: '📉', title: 'Lost donations', desc: 'Without a campaign page, donors forget to give. There\'s no urgency, no progress bar, no social sharing.' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-nunito font-bold text-navy mb-2">{item.title}</div>
                  <div className="text-sm text-gray-400 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-10 text-center">What we believe</h2>
            <div className="flex flex-col gap-5">
              {[
                { n: '01', title: 'Trust is earned, not assumed', desc: 'We verify every campaign. This protects donors and helps genuine fundraisers raise more.' },
                { n: '02', title: 'Money belongs to the cause', desc: '0% platform fee. Every cedi donated goes to the campaign. Full stop.' },
                { n: '03', title: 'Ghanaians deserve Ghanaian tools', desc: 'MoMo-first. Ghana Card verified. Local support. Built for how Ghana actually works.' },
                { n: '04', title: 'Transparency builds trust', desc: 'All donations are publicly tracked. Fundraisers post updates and receipts. No black boxes.' },
              ].map((v, i) => (
                <div key={i} className="flex gap-5 p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="font-nunito font-black text-primary/30 text-2xl flex-shrink-0 w-10">{v.n}</div>
                  <div>
                    <div className="font-nunito font-extrabold text-navy mb-1">{v.title}</div>
                    <div className="text-sm text-gray-400 leading-relaxed">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-center px-5">
          <h2 className="font-nunito font-black text-white text-2xl mb-3">Ready to be part of it?</h2>
          <p className="text-white/75 text-sm mb-6">Start a campaign or donate to a cause you believe in.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/create" className="px-7 py-3 bg-white text-primary font-nunito font-black rounded-full hover:-translate-y-0.5 transition-all shadow text-sm">
              Start a fundraiser →
            </Link>
            <Link href="/campaigns" className="px-7 py-3 border-2 border-white/40 hover:border-white text-white font-bold rounded-full transition-all text-sm">
              Browse campaigns
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
