'use client'
import Link from 'next/link'
import { usePageContent, cms } from '@/lib/content'

const TIPS = [
  {
    n: '01', icon: '*', title: 'Use a real, personal photo',
    tag: 'Most impactful',
    tagColor: 'bg-primary-light text-primary',
    body: 'Campaigns with a clear personal photo raise significantly more. Use a real photo of yourself or the person you are raising for. Avoid stock photos - donors can tell immediately.',
    stat: '68%', statLabel: 'more raised with a personal photo',
  },
  {
    n: '02', icon: '*', title: 'Tell a complete, specific story',
    tag: 'Writing',
    tagColor: 'bg-blue-50 text-blue-600',
    body: 'Explain who you are, what happened, why you need help, and exactly how the money will be used. "I need GH₵8,000 for my daughter\'s surgery at Korle Bu Teaching Hospital" beats "help me please" every single time.',
    stat: '3x', statLabel: 'more trust with specific details',
  },
  {
    n: '03', icon: '*', title: 'Get verified before you share',
    tag: 'Trust',
    tagColor: 'bg-amber-50 text-amber-600',
    body: 'Donors give significantly more to verified campaigns. Upload your Ghana Card and complete verification before sharing widely. The Verified badge is the single most important trust signal on the platform.',
    stat: '3x', statLabel: 'more raised by verified campaigns',
  },
  {
    n: '04', icon: '*', title: 'Share on WhatsApp within the first hour',
    tag: 'Sharing',
    tagColor: 'bg-green-50 text-green-600',
    body: 'The first 48 hours are critical. Share your link in every WhatsApp group you are in - write a personal message, not just a link drop. Explain who you are and why you need help. Early momentum signals credibility.',
    stat: '48h', statLabel: 'is the most critical sharing window',
  },
  {
    n: '05', icon: '*', title: 'Post updates consistently',
    tag: 'Momentum',
    tagColor: 'bg-purple-50 text-purple-600',
    body: 'Campaigns that post updates raise more. Show donors the money is being used well. Even a short "We are 40% there - thank you!" message keeps momentum going and encourages new donors to give.',
    stat: '2x', statLabel: 'more raised by campaigns with updates',
  },
  {
    n: '06', icon: '*', title: 'Set a goal you can realistically hit',
    tag: 'Strategy',
    tagColor: 'bg-rose-50 text-rose-600',
    body: 'Campaigns that reach 30% in the first week almost always hit their target. Set a goal you can achieve - you can always raise more. A very high goal that stalls looks like failure and discourages new donors.',
    stat: '30%', statLabel: 'in week 1 predicts overall success',
  },
  {
    n: '07', icon: '*', title: 'Thank every donor personally',
    tag: 'Relationships',
    tagColor: 'bg-teal-50 text-teal-600',
    body: 'When someone donates, send them a personal WhatsApp thank you within 24 hours. Donors who feel appreciated become your biggest advocates and often share your campaign with their own networks.',
    stat: '5x', statLabel: 'more shares from personally thanked donors',
  },
  {
    n: '08', icon: '*', title: 'Ask specifically for shares, not just donations',
    tag: 'Growth',
    tagColor: 'bg-orange-50 text-orange-600',
    body: 'Most people cannot donate but can share. Explicitly say "even if you cannot give, please share this." One share from the right person can unlock 10 new donors you would never have reached otherwise.',
    stat: '1 share', statLabel: 'can reach 50+ new potential donors',
  },
  {
    n: '09', icon: '*', title: 'Show evidence and documentation',
    tag: 'Credibility',
    tagColor: 'bg-indigo-50 text-indigo-600',
    body: 'Upload a photo of the hospital bill, school fees invoice, or doctor letter. Evidence removes doubt. Transparency builds the trust that translates directly into more donations and more sharing.',
    stat: '73%', statLabel: 'of donors want to see proof of need',
  },
]

export default function FundraisingTipsPage() {
  const c = usePageContent('fundraising-tips')
  return (
    <>
      <main>

        {/* Hero */}
        <section className="bg-navy py-16 px-5 relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6">
               {cms(c, 'settings', 'headline', '9 proven tips')}
            </div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl mb-4" style={{ letterSpacing: -1 }}>
              Raise more money.<br />
              <span className="text-primary">Here is how.</span>
            </h1>
            <p className="text-white/55 text-base max-w-xl mx-auto leading-relaxed">
              {cms(c, 'settings', 'subtext', 'These are the patterns we see in EveryGiving campaigns that consistently hit their goals. Apply them and raise significantly more.')}
            </p>
          </div>
        </section>

        {/* Tips list */}
        <section className="py-16 bg-white px-5">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {TIPS.map((tip) => (
              <div key={tip.n} className="bg-white rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all p-6 md:p-8">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 text-3xl mt-0.5">{tip.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono-dm text-xs text-gray-300 font-medium">{tip.n}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tip.tagColor}`}>{tip.tag}</span>
                    </div>
                    <h2 className="font-nunito font-black text-navy text-lg md:text-xl mb-3">{tip.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{tip.body}</p>
                    <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5">
                      <span className="font-nunito font-black text-primary text-xl">{tip.stat}</span>
                      <span className="text-gray-500 text-xs leading-tight">{tip.statLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary px-5">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-nunito font-black text-white text-3xl md:text-4xl mb-3">Ready to put these into practice?</h2>
            <p className="text-white/70 text-sm mb-8 max-w-md mx-auto">Create your verified campaign in minutes and apply every tip from day one.</p>
            <Link href="/create" className="inline-block bg-white hover:bg-gray-50 text-primary font-nunito font-black px-10 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl text-sm">
              Start your campaign now
            </Link>
          </div>
        </section>

      </main>
    </>
  )
}
