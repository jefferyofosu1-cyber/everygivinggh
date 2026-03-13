'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { usePageContent, cms } from '@/lib/content'

const DEFAULT_STATS = [
  { value: '0%', label: 'Platform fee' },
  { value: '<10 min', label: 'Verification time' },
  { value: '3', label: 'MoMo networks' },
  { value: '2026', label: 'Founded in Ghana' },
]

const HOW_STEPS = [
  { n: '01', title: 'Create your campaign', desc: 'Write your story, set your goal, add a photo, and pick a category. The guided form takes under 5 minutes  -  no technical knowledge needed.', time: '5 minutes', color: 'bg-primary-light border-primary/20 text-primary' },
  { n: '02', title: 'Verify your identity', desc: 'Upload your Ghana Card and a selfie. Our team reviews your documents and confirms your identity  -  usually within 24 hours.', time: 'Within 24 hours', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { n: '03', title: 'Share your campaign', desc: 'Your campaign goes live with a Verified badge. Share your link on WhatsApp, Facebook, or anywhere else. We include pre-written share messages to make it effortless.', time: 'Instant', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { n: '04', title: 'Receive donations', desc: 'Donors pay via MTN MoMo, Vodafone Cash, or AirtelTigo. Every donation lands directly in your registered MoMo wallet  -  same day.', time: 'Same day payout', color: 'bg-primary-light border-primary/20 text-primary' },
]

const GUARANTEE_POINTS = [
  { icon: '*', title: 'Identity verified', desc: 'Every fundraiser confirms their identity before going live. No anonymous campaigns.' },
  { icon: '₵', title: 'Zero platform fee  -  always', desc: 'We never take a percentage of what you raise. Every cedi your donors give goes directly to you.' },
  { icon: '*', title: 'Full transparency', desc: 'Every donation is visible on the campaign page. Nothing is hidden from donors.' },
  { icon: '*', title: 'Same-day MoMo payouts', desc: 'Donations reach your MoMo wallet the same day they are made  -  no holding periods.' },
  { icon: '*', title: 'Fraud protection', desc: 'We monitor all campaigns for suspicious activity and report fraud to Ghanaian authorities without delay.' },
  { icon: '*', title: 'Real support', desc: 'Email business@everygiving.org. Payout issues are resolved same day. All other enquiries within 2 business days.' },
]

const COUNTRIES = [
  { name: 'Ghana', flag: '🇬🇭', status: 'Full support', detail: 'All features  -  campaigns, verification, MoMo payouts', active: true },
  { name: 'Nigeria', flag: '🇳🇬', status: 'Coming soon', detail: 'Planned expansion with local payment methods', active: false },
  { name: 'Kenya', flag: '🇰🇪', status: 'Coming soon', detail: 'M-Pesa integration planned', active: false },
  { name: "Côte d'Ivoire", flag: '🇨🇮', status: 'Coming soon', detail: 'Orange Money & Wave integration planned', active: false },
]

const RESOURCES = [
  { label: 'Fundraising tips for Ghana', href: '/help', icon: '*' },
  { label: 'How to write a campaign story', href: '/help', icon: '*' },
  { label: 'WhatsApp sharing guide', href: '/help', icon: '*' },
  { label: 'Verification walkthrough', href: '/how-it-works', icon: '*' },
  { label: 'Help Centre & FAQ', href: '/help', icon: '*' },
  { label: 'Terms & Conditions', href: '/terms', icon: '*' },
  { label: 'Privacy Policy', href: '/privacy', icon: '*' },
  { label: 'Contact us', href: '/contact', icon: '*' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
      {children}
    </div>
  )
}

export default function AboutPage() {
  const c = usePageContent('about')
  const stats = (cms(c, 'stats', 'items', null) as unknown as any[] || DEFAULT_STATS)
  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <section className="bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.15) 0%, transparent 60%)' }} />
          <div className="relative max-w-5xl mx-auto px-5 py-20 md:py-28">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-8 tracking-widest uppercase">
              About EveryGiving
            </div>
            <h1 className="font-nunito font-black text-white leading-none mb-6" style={{ fontSize: 'clamp(40px,7vw,72px)', letterSpacing: -2 }}>
              {cms(c, 'hero', 'headline', 'Giving should be')}<br /><span className="text-primary">{cms(c, 'hero', 'highlight', 'trusted.')}</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-xl mb-10">
              {cms(c, 'hero', 'subtext', "EveryGiving is Ghana's verified crowdfunding platform  -  connecting fundraisers and donors through identity verification, zero platform fees, and same-day MoMo payouts.")}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
              {stats.map((s: any) => (
                <div key={s.label} className="bg-navy px-6 py-5 text-center">
                  <div className="font-nunito font-black text-primary text-2xl md:text-3xl leading-none mb-1">{s.value || s.val}</div>
                  <div className="text-white/30 text-xs">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── STICKY NAV ── */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 overflow-x-auto">
          <div className="max-w-5xl mx-auto px-5">
            <div className="flex gap-0 min-w-max">
              {[
                ['#how-it-works', 'How it works'],
                ['#guarantee', 'Giving Guarantee'],
                ['#countries', 'Supported countries'],
                ['#pricing', 'Pricing'],
                ['#help', 'Help Centre'],
                ['#about', 'About EveryGiving'],
                ['#press', 'Press Centre'],
                ['#careers', 'Careers'],
                ['#resources', 'More resources'],
              ].map(([href, label]) => (
                <a key={href} href={href}
                  className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors px-4 py-4 whitespace-nowrap border-b-2 border-transparent hover:border-primary">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* ── HOW EVERYGIVING WORKS ── */}
        <section id="how-it-works" className="py-20 bg-white scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>How EveryGiving works</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">From idea to funded in 4 steps</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-12">No forms to print, no queues to join, no bank account required. Just your story, your Ghana Card, and your MoMo number.</p>
            <div className="grid md:grid-cols-2 gap-5">
              {HOW_STEPS.map((step, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-7 relative overflow-hidden">
                  <div className="absolute top-5 right-6 font-nunito font-black text-gray-100 text-5xl leading-none select-none">{step.n}</div>
                  <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-4 ${step.color}`}>{step.time}</div>
                  <div className="font-nunito font-black text-navy text-lg mb-2 relative">{step.title}</div>
                  <div className="text-gray-500 text-sm leading-relaxed relative">{step.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/how-it-works" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                See the full walkthrough →
              </Link>
            </div>
          </div>
        </section>

        {/* ── GIVING GUARANTEE ── */}
        <section id="guarantee" className="py-20 bg-gray-50 border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>EveryGiving Giving Guarantee</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">Our promise to every user</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-12">The EveryGiving Guarantee is our commitment to every fundraiser and donor. These are not aspirations  -  they are the minimum standard we hold ourselves to.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {GUARANTEE_POINTS.map((g, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:-translate-y-0.5 transition-transform">
                  <div className="text-2xl mb-3">{g.icon}</div>
                  <div className="font-nunito font-black text-navy text-sm mb-2">{g.title}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{g.desc}</div>
                </div>
              ))}
            </div>
            <div className="bg-navy rounded-2xl p-7 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="font-nunito font-black text-white text-lg mb-1">Not meeting our guarantee?</div>
                <div className="text-white/40 text-sm">Contact us and we will investigate within 24 hours.</div>
              </div>
              <Link href="/contact" className="flex-shrink-0 bg-primary hover:bg-primary-dark text-white font-nunito font-black px-7 py-3 rounded-full transition-all hover:-translate-y-0.5 text-sm">
                Report an issue
              </Link>
            </div>
          </div>
        </section>

        {/* ── SUPPORTED COUNTRIES ── */}
        <section id="countries" className="py-20 bg-white border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Supported countries</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">Where Every Giving works</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-10">EveryGiving is fully live in Ghana. West African expansion is underway.</p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {COUNTRIES.map((c, i) => (
                <div key={i} className={`rounded-2xl p-6 border-2 flex items-start gap-4 ${c.active ? 'bg-primary-light border-primary/20' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="text-3xl flex-shrink-0">{c.flag}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-nunito font-black text-navy text-base">{c.name}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${c.active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>{c.status}</span>
                    </div>
                    <div className="text-gray-500 text-sm">{c.detail}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-xs text-center">
              Interested in bringing Every Giving to your country?{' '}
              <a href="mailto:business@everygiving.org?subject=Country Expansion" className="text-primary font-semibold hover:underline">Email us</a>
            </p>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-20 bg-primary relative overflow-hidden scroll-mt-14">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-4xl mx-auto px-5">
            <div className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Pricing</div>
            <h2 className="font-nunito font-black text-white text-3xl md:text-4xl tracking-tight mb-10 leading-tight">One number: 0% platform fee.</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Platform fee on donations', val: '0%', note: 'Always. No exceptions.' },
                { label: 'Account creation fee', val: '₵0', note: 'Free to sign up.' },
                { label: 'Withdrawal fee (Every Giving)', val: '₵0', note: 'We never charge to withdraw.' },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 border border-white/15 rounded-2xl p-6 text-center">
                  <div className="font-nunito font-black text-white text-4xl mb-2">{item.val}</div>
                  <div className="text-white/60 text-sm mb-1">{item.label}</div>
                  <div className="text-white/30 text-xs">{item.note}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-6">
              <div className="font-nunito font-black text-white text-base mb-2">One thing to be aware of</div>
              <p className="text-white/60 text-sm leading-relaxed max-w-2xl">Mobile money network operators (MTN, Vodafone, AirtelTigo) charge their own standard transfer fees. These are set by the networks  -  EveryGiving itself charges nothing on top.</p>
            </div>
          </div>
        </section>

        {/* ── HELP CENTRE ── */}
        <section id="help" className="py-20 bg-white border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Help Centre</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">Common questions, answered</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-10">Our Help Centre covers every common question about campaigns, verification, payments, and accounts.</p>
            <div className="grid md:grid-cols-2 gap-3 mb-8">
              {[
                { q: 'How do I start a campaign?', href: '/help' },
                { q: 'Why do I need to verify my identity?', href: '/help' },
                { q: 'How quickly will I receive my money?', href: '/help' },
                { q: 'Can I donate anonymously?', href: '/help' },
                { q: 'What if my verification fails?', href: '/help' },
                { q: "What happens if I don't reach my goal?", href: '/help' },
              ].map((item, i) => (
                <Link key={i} href={item.href}
                  className="flex items-center justify-between gap-3 bg-gray-50 hover:bg-primary-light border border-gray-100 hover:border-primary/20 rounded-xl px-5 py-4 transition-all group">
                  <span className="text-sm text-gray-600 group-hover:text-navy font-medium">{item.q}</span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-primary flex-shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link href="/help" className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white font-nunito font-black px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 text-sm">
                Visit the full Help Centre →
              </Link>
            </div>
          </div>
        </section>

        {/* ── ABOUT EVERYGIVING ── */}
        <section id="about" className="py-20 bg-gray-50 border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>About EveryGiving</SectionLabel>
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-6 leading-tight">Built in Ghana.<br />For Ghana.</h2>
                <div className="flex flex-col gap-5 text-sm text-gray-500 leading-relaxed">
                  <p>{cms(c, 'founder', 'originStory', 'EveryGiving was founded in 2026 by Jeffery Ofosu after seeing people he knew struggle to raise money for medical emergencies  -  sending MoMo requests to strangers who had no way to verify if the cause was real.')}</p>
                  <p>The idea was straightforward: verify identity, build trust, and make every cedi count. If donations went straight to MoMo, fundraisers would get their money fast. And if the platform charged 0%, every cedi would reach the person who needs it.</p>
                  <p>Ghana has always had a culture of communal giving  -  from susu groups to church fundraisers to emergency appeals. Every Giving is a modern infrastructure for that ancient generosity.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
                  <div className="w-16 h-16 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="font-nunito font-black text-primary text-2xl">{(cms(c, 'founder', 'name', 'Jeffery Ofosu') as string).charAt(0)}</span>
                  </div>
                  <div className="font-nunito font-black text-navy text-lg mb-0.5">{cms(c, 'founder', 'name', 'Jeffery Ofosu')}</div>
                  <div className="text-primary text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>{cms(c, 'founder', 'title', 'Founder & CEO')}</div>
                  <div className="text-gray-500 text-sm leading-relaxed">{cms(c, 'founder', 'bio', 'Building Every Giving to make verified crowdfunding accessible to every Ghanaian.')}</div>
                </div>
                <div className="bg-navy rounded-2xl p-6 text-center">
                  <div className="font-nunito font-black text-white text-lg mb-1">{cms(c, 'founder', 'missionQuote', '"Ghana has always given."')}</div>
                  <div className="text-white/40 text-sm">&quot;We&apos;re making it easier.&quot;</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRESS CENTRE ── */}
        <section id="press" className="py-20 bg-white border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Press Centre</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">Media &amp; press enquiries</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-10">Journalists, bloggers, and media organisations are welcome to cover Every Giving. We respond to press enquiries within 3 business days.</p>
            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="font-nunito font-black text-navy text-base mb-3">Brand assets</div>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">Our logo, wordmark, colour palette, and brand guidelines are available for press use. Please do not alter the logo or use colours outside our brand guide.</p>
                <Link href="/brand-guide" className="inline-block text-primary font-bold text-sm hover:underline">View brand guide →</Link>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="font-nunito font-black text-navy text-base mb-3">Key facts for press</div>
                <div className="flex flex-col gap-2 text-sm">
                  {(cms(c, 'pressFacts', 'items', null) as unknown as any[] || [
                    { key: 'Founded', value: '2026, Ghana' },
                    { key: 'Platform type', value: 'Verified crowdfunding' },
                    { key: 'Platform fee', value: '0%  -  always' },
                    { key: 'Verification', value: 'Ghana Card reviewed by our team' },
                    { key: 'Payments', value: 'MTN MoMo, Vodafone Cash, AirtelTigo' },
                    { key: 'Contact', value: 'business@everygiving.org' },
                  ]).map((item: any) => (
                    <div key={item.key} className="flex justify-between">
                      <span className="text-gray-400">{item.key}</span>
                      <span className="text-navy font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-navy rounded-2xl p-6 flex flex-col md:flex-row items-center gap-5">
              <div className="flex-1">
                <div className="font-nunito font-black text-white text-base mb-1">Press contact</div>
                <div className="text-white/40 text-sm">For interviews, quotes, or media requests.</div>
              </div>
              <a href="mailto:business@everygiving.org?subject=Press Enquiry"
                className="flex-shrink-0 bg-primary hover:bg-primary-dark text-white font-nunito font-black px-7 py-3 rounded-full transition-all hover:-translate-y-0.5 text-sm">
                Email press team
              </a>
            </div>
          </div>
        </section>

        {/* ── CAREERS ── */}
        <section id="careers" className="py-20 bg-gray-50 border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Careers</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">Build something that matters</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-10">Every Giving is an early-stage platform building the infrastructure for verified giving in Ghana and across West Africa. We are looking for people who care about trust, transparency, and financial access.</p>
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm mb-6">
              <div className="text-4xl mb-4">🇬🇭</div>
              <div className="font-nunito font-black text-navy text-xl mb-3">No open roles right now</div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-6">We don't have any open positions at the moment, but we are always interested in hearing from talented people who are passionate about our mission.</p>
              <a href="mailto:business@everygiving.org?subject=Careers  -  Speculative Application"
                className="inline-block bg-navy hover:bg-navy/90 text-white font-nunito font-black px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 text-sm">
                Send a speculative application
              </a>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '*', label: 'Remote-first', desc: 'Work from anywhere in Ghana' },
                { icon: '*', label: 'Early stage', desc: 'Real ownership and impact from day one' },
                { icon: '*', label: 'Mission-driven', desc: 'Building something that genuinely helps people' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 text-center">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-nunito font-black text-navy text-sm mb-1">{item.label}</div>
                  <div className="text-gray-400 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MORE RESOURCES ── */}
        <section id="resources" className="py-20 bg-white border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>More resources</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">Everything else you need</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-10">Guides, policies, and tools to help you get the most out of Every Giving.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {RESOURCES.map((r, i) => (
                <Link key={i} href={r.href}
                  className="bg-gray-50 hover:bg-primary-light border border-gray-100 hover:border-primary/20 rounded-2xl p-5 transition-all hover:-translate-y-0.5 group">
                  <div className="text-2xl mb-3">{r.icon}</div>
                  <div className="font-nunito font-extrabold text-navy text-sm group-hover:text-primary transition-colors leading-snug">{r.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.15) 0%, transparent 65%)' }} />
          <div className="relative max-w-3xl mx-auto px-5 text-center">
            <div className="font-nunito font-black text-white mb-4 leading-tight" style={{ fontSize: 'clamp(28px,5vw,48px)', letterSpacing: -1 }}>
              Ready to raise money<br /><span className="text-primary">the right way?</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-md mx-auto">Free to start. Verified in minutes. Every cedi goes to you.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/create" className="bg-primary hover:bg-primary-dark text-white font-nunito font-black px-9 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/25 text-sm">
                Start a campaign →
              </Link>
              <Link href="/campaigns" className="border-2 border-white/15 hover:border-white/40 text-white font-nunito font-bold px-7 py-4 rounded-full transition-all text-sm">
                Browse campaigns
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
