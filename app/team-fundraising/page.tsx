import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Team Fundraising',
  description: 'Raise more together. Team fundraising on EveryGiving lets a group of people unite behind one campaign and reach goals no individual could reach alone.',
}

const STEPS = [
  { n: '01', icon: '*', title: 'One person creates', desc: 'The organiser creates the campaign, sets the goal, and writes the story. Takes about 5 minutes.' },
  { n: '02', icon: '*', title: 'Invite your team', desc: 'Share the campaign link with friends, family, teammates, classmates, or colleagues via WhatsApp.' },
  { n: '03', icon: '*', title: 'Everyone shares', desc: 'Each person shares the campaign across their own networks. The more people share, the further it travels.' },
  { n: '04', icon: '*', title: 'All donations, one pot', desc: 'Every donation - regardless of who shared the link - goes directly to the same campaign goal.' },
]

const USE_CASES = [
  { icon: '*', title: 'Medical bills', desc: 'A family unites to cover the cost of a parent\'s surgery. The church group shares. The workplace donates. The community shows up.' },
  { icon: '*', title: 'School fees', desc: 'An entire extended family pools effort to send the brightest child to university. One campaign. Every relative shares.' },
  { icon: '*', title: 'Church projects', desc: 'The entire congregation fundraises for a new roof. Every member becomes a fundraiser. Every network is activated.' },
  { icon: '*', title: 'Community projects', desc: 'A neighbourhood committee raises money for a borehole. The whole community becomes the fundraising team.' },
  { icon: '*', title: 'Sports teams', desc: 'The team captain creates a campaign for tournament fees. Every player shares with family. Supporters donate.' },
  { icon: '*', title: 'Events & celebrations', desc: 'A group of friends raises money for a surprise party or reunion. One campaign, everyone contributes and invites.' },
]

const STATS = [
  { number: '4×', label: 'more raised', sub: 'compared to solo campaigns' },
  { number: '10+', label: 'sharers average', sub: 'per team campaign' },
  { number: '48h', label: 'fastest to fund', sub: 'when teams mobilise quickly' },
]

export default function TeamFundraisingPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-navy py-20 px-5 relative overflow-hidden">
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6">
               Team fundraising
            </div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl mb-5" style={{ letterSpacing: -1 }}>
              Your whole network.<br />
              <span className="text-primary">One campaign.</span>
            </h1>
            <p className="text-white/55 text-base max-w-xl mx-auto leading-relaxed mb-8">
              Team fundraising lets a group of people rally behind a single campaign. Everyone shares, everyone contributes - and the total raised far exceeds what one person could achieve alone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/create" className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/25 text-sm">
                Start a team campaign
              </Link>
              <Link href="/how-it-works" className="inline-block border-2 border-white/20 hover:border-white/40 text-white font-nunito font-bold px-8 py-4 rounded-full transition-all text-sm">
                How it works
              </Link>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-primary py-8 px-5">
          <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.number}>
                <div className="font-nunito font-black text-white text-3xl md:text-4xl">{s.number}</div>
                <div className="text-white font-bold text-sm mt-0.5">{s.label}</div>
                <div className="text-white/60 text-xs mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 px-5" style={{ background: 'var(--surface)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl mb-3">How team fundraising works</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>One campaign. Multiple fundraisers. Far bigger results. Here is exactly how it happens.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <div key={step.n} className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-[calc(100%-12px)] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0" />
                  )}
                  <div className="relative rounded-2xl p-6 border hover:border-primary/20 hover:shadow-md transition-all" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)' }}>
                    <div className="font-mono-dm text-xs text-primary font-bold mb-3 bg-primary/10 inline-block px-2 py-1 rounded-md">{step.n}</div>
                    <div className="text-3xl mb-3">{step.icon}</div>
                    <h3 className="font-nunito font-black text-navy text-base mb-2">{step.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="py-20 px-5" style={{ background: 'var(--surface-alt)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl mb-3">Who uses team fundraising?</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>From families to faith communities - team fundraising works for any group with a shared goal.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {USE_CASES.map((uc) => (
                <div key={uc.title} className="rounded-2xl p-6 border hover:border-primary/20 hover:shadow-md transition-all" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="text-3xl mb-4">{uc.icon}</div>
                  <h3 className="font-nunito font-black text-navy text-base mb-2">{uc.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="py-20 px-5" style={{ background: 'var(--surface)' }}>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl mb-3">Tips for a successful team campaign</h2>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { tip: 'Appoint a campaign leader', detail: 'One person should own the campaign, post updates, and coordinate the team. Campaigns without a clear owner go quiet fast.' },
                { tip: 'Share in the first hour', detail: 'The first 48 hours are critical. As soon as the campaign is live, every team member should share it immediately in every WhatsApp group.' },
                { tip: 'Ask for shares, not just donations', detail: 'Most people cannot donate but can share. Tell your team: "Even if you cannot give right now, please share - that is just as important."' },
                { tip: 'Post updates every few days', detail: 'Update the campaign with progress. Tag your team in updates. Donors who see active campaigns give again and share more.' },
                { tip: 'Get verified before sharing', detail: 'A Verified badge makes your campaign 3x more trusted. Complete ID verification before you start sharing widely.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 rounded-2xl p-5 border" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)' }}>
                  <div className="flex-shrink-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-nunito font-black text-xs mt-0.5">{i + 1}</div>
                  <div>
                    <div className="font-nunito font-black text-navy text-sm mb-1">{item.tip}</div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-navy relative overflow-hidden py-24">
          <div className="relative max-w-4xl mx-auto px-5 text-center text-white">
            <h2 className="font-nunito font-black text-white text-3xl md:text-4xl mb-4">Ready to raise more together?</h2>
            <p className="text-white/55 mb-8">Create your campaign in 5 minutes. Invite your team. Share widely. Watch donations arrive.</p>
            <Link href="/create" className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-10 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30 text-sm">
              Start your team campaign
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
