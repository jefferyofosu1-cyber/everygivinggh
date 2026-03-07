import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const TIPS = [
  {
    n: '01', icon: '📸', title: 'Add a real photo',
    body: 'Campaigns with a clear, personal photo raise significantly more than those without. Use a real photo of yourself, the person you are raising for, or the situation you are describing. Avoid stock photos — donors can tell.',
    tag: 'Most impactful',
  },
  {
    n: '02', icon: '✍️', title: 'Tell the full story',
    body: 'Explain who you are, what happened, why you need help, and exactly how the money will be used. Be honest and specific. "I need ₵8,000 for my daughter\'s surgery at Korle Bu Teaching Hospital" is better than "help me please."',
    tag: 'Writing',
  },
  {
    n: '03', icon: '🪪', title: 'Get verified first',
    body: 'Donors give significantly more to verified campaigns. Upload your Ghana Card and complete identity verification before sharing your campaign. The Verified badge signals that you are a real, confirmed person.',
    tag: 'Trust',
  },
  {
    n: '04', icon: '📱', title: 'Share on WhatsApp immediately',
    body: 'The first 48 hours are the most important. Share your campaign link in every WhatsApp group you are in. Write a personal message explaining your situation — don\'t just drop a link.',
    tag: 'Sharing',
  },
  {
    n: '05', icon: '🔄', title: 'Post updates regularly',
    body: 'Campaigns that post updates raise more because they show donors the money is being used. Post at least once a week — even a short "We\'re 40% there, thank you so much" message keeps momentum going.',
    tag: 'Momentum',
  },
  {
    n: '06', icon: '🎯', title: 'Set a realistic goal',
    body: 'Campaigns that reach 30% of their goal in the first week almost always hit their target. Set a goal you can realistically achieve. You can always raise more — but setting too high a goal can make your campaign look unsuccessful.',
    tag: 'Strategy',
  },
  {
    n: '07', icon: '🙏', title: 'Thank every donor personally',
    body: 'When someone donates, send them a personal thank you on WhatsApp or by phone. This creates a connection and they often share your campaign further. Donors who feel appreciated become your biggest advocates.',
    tag: 'Relationships',
  },
  {
    n: '08', icon: '📣', title: 'Ask people to share, not just donate',
    body: 'Most people cannot donate but many can share. Explicitly ask people to share your campaign even if they cannot give. One share from the right person can unlock 10 new donors.',
    tag: 'Growth',
  },
  {
    n: '09', icon: '📊', title: 'Show evidence and proof',
    body: 'If you are raising for medical costs, upload a photo of the hospital bill or doctor\'s letter. If it is for education, show the school fees invoice. Evidence builds trust and removes doubt from potential donors.',
    tag: 'Credibility',
  },
]

export default function FundraisingTipsPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-navy py-20 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">The ultimate guide</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-5" style={{ letterSpacing: -1 }}>
              How to raise more,<br /><span className="text-primary">faster</span>
            </h1>
            <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed mb-8">
              9 proven tips from the most successful campaigns on Every Giving. Follow these and your chances of hitting your goal increase dramatically.
            </p>
            <Link href="/create" className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30 text-sm">
              Start your campaign →
            </Link>
          </div>
        </section>

        {/* Quick wins strip */}
        <section className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-4xl mx-auto px-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { stat: '3×', label: 'More raised by verified campaigns' },
                { stat: '48h', label: 'Most critical window to share' },
                { stat: '73%', label: 'Campaigns with photos hit their goal' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="font-nunito font-black text-primary text-3xl mb-1">{s.stat}</div>
                  <div className="text-gray-400 text-xs leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="py-14 bg-gray-50">
          <div className="max-w-4xl mx-auto px-5">
            <div className="flex flex-col gap-5">
              {TIPS.map((tip, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-3xl">{tip.icon}</div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="font-nunito font-black text-navy text-lg">{tip.title}</div>
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{tip.tag}</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{tip.body}</p>
                  </div>
                  <div className="font-nunito font-black text-gray-100 text-4xl flex-shrink-0 hidden md:block">{tip.n}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-primary text-center px-5">
          <h2 className="font-nunito font-black text-white text-3xl mb-3">Ready to start?</h2>
          <p className="text-white/70 text-sm mb-7">Apply these tips from day one. Free to create. Verified in minutes.</p>
          <Link href="/create" className="inline-block bg-white text-primary font-nunito font-black px-10 py-4 rounded-full hover:-translate-y-0.5 transition-all shadow-xl text-sm">
            Create your campaign →
          </Link>
        </section>

      </main>
      <Footer />
    </>
  )
}
