import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function TeamFundraisingPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-navy py-20 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">Team fundraising</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-5" style={{ letterSpacing: -1 }}>
              Raise more<br /><span className="text-primary">together</span>
            </h1>
            <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed mb-8">
              Team fundraising lets a group of people rally around a single campaign. Everyone shares, everyone contributes — and the total raised is far higher than one person acting alone.
            </p>
            <Link href="/create" className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30 text-sm">
              Start a team campaign →
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-2">How team fundraising works</h2>
              <p className="text-gray-400 text-sm">One campaign. Multiple fundraisers. Bigger results.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-5">
              {[
                { n: '01', icon: '🚀', title: 'One person creates', desc: 'The campaign organiser creates the main fundraiser page and sets the goal.' },
                { n: '02', icon: '👥', title: 'Invite your team', desc: 'Share the campaign link with friends, family, colleagues or classmates.' },
                { n: '03', icon: '📱', title: 'Everyone shares', desc: 'Each team member shares the campaign in their own networks on WhatsApp, Facebook and more.' },
                { n: '04', icon: '💰', title: 'All donations go to one pot', desc: 'Every donation — regardless of who shared the link — goes to the same campaign.' },
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">{step.icon}</div>
                  <div className="font-nunito font-black text-navy text-sm mb-2">{step.title}</div>
                  <div className="text-gray-400 text-xs leading-relaxed">{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team types */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-10">
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-2">Who uses team fundraising?</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { icon: '🎓', title: 'Students & classmates', desc: 'A student in need of school fees gets their entire class sharing the campaign. 30 people each reaching 50 contacts is 1,500 potential donors.', example: 'Example: "Help Kofi pay his final year fees — shared by his entire class"' },
                { icon: '⛪', title: 'Churches & congregations', desc: 'A church fundraises for a new roof. The pastor shares in Sunday service, the youth group shares on WhatsApp — everyone contributes to the same goal.', example: 'Example: "New roof for Redemption Chapel — give anything you can"' },
                { icon: '🏥', title: 'Family medical campaigns', desc: 'A family member is ill. The entire extended family shares one campaign instead of everyone creating separate payment requests.', example: 'Example: "Aunty Grace\'s surgery — shared by the Mensah family"' },
                { icon: '🏘', title: 'Community projects', desc: 'A community borehole, school building or road repair. Community leaders and members all share a single verified campaign.', example: 'Example: "Borehole for Breman Asikuma — community fundraiser"' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-nunito font-black text-navy text-base mb-2">{item.title}</div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{item.desc}</p>
                  <div className="bg-primary-light border border-primary/15 rounded-xl p-3 text-xs text-primary-dark font-medium italic">{item.example}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why team is better */}
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { icon: '📣', stat: '5×', label: 'More reach', desc: 'A team of 10 people sharing reaches 5× more people than one person sharing alone.' },
                { icon: '💚', stat: '2×', label: 'More raised', desc: 'Team campaigns consistently raise more because every member feels personally responsible.' },
                { icon: '🔒', stat: '1', label: 'Verified campaign', desc: 'One verified campaign is more trustworthy than multiple unverified payment links.' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-nunito font-black text-primary text-3xl mb-1">{item.stat}</div>
                  <div className="font-nunito font-black text-navy text-sm mb-2">{item.label}</div>
                  <div className="text-gray-400 text-xs leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-primary text-center px-5">
          <h2 className="font-nunito font-black text-white text-3xl mb-3">Start your team campaign</h2>
          <p className="text-white/70 text-sm mb-7">One person creates. Everyone shares. Free to start.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/create" className="inline-block bg-white text-primary font-nunito font-black px-10 py-4 rounded-full hover:-translate-y-0.5 transition-all shadow-xl text-sm">
              Create team campaign →
            </Link>
            <Link href="/fundraising-tips" className="inline-block border-2 border-white/30 hover:border-white/60 text-white font-nunito font-bold px-7 py-4 rounded-full text-sm transition-all">
              Read fundraising tips
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
