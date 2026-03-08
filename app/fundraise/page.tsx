'use client'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

// ─── DATA ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { icon: '🏥', label: 'Medical', desc: 'Hospital bills, surgery, treatment, and recovery costs.', href: '/campaigns?category=medical' },
  { icon: '🎓', label: 'Education', desc: 'School fees, university costs, and learning materials.', href: '/campaigns?category=education' },
  { icon: '⛪', label: 'Church & Faith', desc: 'Building projects, community outreach, and ministry work.', href: '/campaigns?category=church' },
  { icon: '🆘', label: 'Emergency', desc: 'Sudden disasters, accidents, and urgent crises.', href: '/campaigns?category=emergency' },
  { icon: '💼', label: 'Business', desc: 'Starting or growing a small business or livelihood.', href: '/campaigns?category=business' },
  { icon: '🕊', label: 'Memorial', desc: 'Funeral costs, burials, and remembrance funds.', href: '/campaigns?category=memorial' },
  { icon: '🏘', label: 'Community', desc: 'Local projects, clean water, roads, and shared resources.', href: '/campaigns?category=community' },
  { icon: '🎉', label: 'Events', desc: 'Celebrations, reunions, and community gatherings.', href: '/campaigns?category=events' },
]

const BLOG_POSTS = [
  { emoji: '📱', tag: 'Sharing tips', title: 'How to share your campaign on WhatsApp and raise more', desc: 'The right message at the right time can double your donations. This is the exact WhatsApp strategy that works for Ghanaian fundraisers.', time: '4 min read' },
  { emoji: '📝', tag: 'Campaign writing', title: 'How to write a campaign story that makes people give', desc: 'Donors give to people, not problems. Learn how to tell your story honestly, clearly, and compellingly.', time: '6 min read' },
  { emoji: '📸', tag: 'Photos & media', title: 'The right photo for your campaign — and how to take it', desc: 'Campaigns with strong photos raise significantly more. Here is what works and what to avoid.', time: '3 min read' },
  { emoji: '🔄', tag: 'Keeping donors updated', title: 'Why posting updates doubles your donations', desc: 'Donors who see a campaign update are twice as likely to share it. Learn how to write updates that sustain momentum.', time: '4 min read' },
]

const CORPORATE_BENEFITS = [
  { icon: '🤝', title: 'CSR & community impact', desc: 'Support verified community campaigns as part of your Corporate Social Responsibility programme.' },
  { icon: '🏆', title: 'Employee giving campaigns', desc: 'Match employee donations or run internal giving drives for causes your team believes in.' },
  { icon: '📊', title: 'Full transparency', desc: 'Every donation is tracked and publicly visible. Full reports show exactly where contributions go.' },
  { icon: '🎯', title: 'Cause alignment', desc: 'Choose campaigns aligned with your company\'s values — medical, education, community, or emergency.' },
]

const EVENT_TYPES = [
  { icon: '🎂', label: 'Birthday fundraisers', desc: 'Ask for donations instead of gifts. Raise money for a cause on your special day.' },
  { icon: '💒', label: 'Wedding fundraisers', desc: 'Let guests contribute to a cause you care about as a wedding gift.' },
  { icon: '🏃', label: 'Sponsored challenges', desc: 'Run a marathon, climb a hill, or complete a challenge — get sponsored for every kilometre.' },
  { icon: '🎓', label: 'Graduation fundraisers', desc: 'Celebrate your achievement and give back — raise money for your school or community.' },
  { icon: '⚽', label: 'Sports events', desc: 'Charity matches, tournaments, and sports days with proceeds going to your chosen cause.' },
  { icon: '🎤', label: 'Concerts & shows', desc: 'Perform for a purpose — sell tickets or take donations at your event.' },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>
      {children}
    </div>
  )
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function FundraisePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ════════════════════════════════════
            HERO
        ════════════════════════════════════ */}
        <section className="bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.12) 0%, transparent 65%)', transform: 'translate(25%, -25%)' }} />
          <div className="relative max-w-5xl mx-auto px-5 py-20 md:py-28">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-8 tracking-widest uppercase">
              Fundraising
            </div>
            <h1 className="font-nunito font-black text-white leading-none mb-6" style={{ fontSize: 'clamp(40px,7vw,72px)', letterSpacing: -2 }}>
              Raise money for<br /><span className="text-primary">anything that matters.</span>
            </h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-xl mb-10">
              Medical bills. School fees. Community projects. If your cause is real and you can verify it, EveryGiving helps you raise what you need — identity-verified, free to start, and paid directly to your MoMo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/create"
                className="bg-primary hover:bg-primary-dark text-white font-nunito font-black px-9 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/30 text-sm">
                Start your fundraiser →
              </Link>
              <Link href="#how-to-start"
                className="border-2 border-white/15 hover:border-white/40 text-white font-nunito font-bold px-7 py-4 rounded-full transition-all text-sm">
                How it works
              </Link>
            </div>
          </div>
        </section>

        {/* ── PAGE NAV ── */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 overflow-x-auto">
          <div className="max-w-5xl mx-auto px-5">
            <div className="flex gap-0 min-w-max">
              {[
                ['#how-to-start', 'How to start a fundraiser'],
                ['#categories', 'Fundraising categories'],
                ['#team', 'Team fundraising'],
                ['#blog', 'Fundraising blog'],
                ['#charity', 'Charity fundraising'],
                ['#signup-charity', 'Sign up as a charity'],
                ['#corporate', 'Corporate fundraising'],
                ['#events', 'Event fundraising'],
              ].map(([href, label]) => (
                <a key={href} href={href}
                  className="text-xs font-semibold text-gray-400 hover:text-primary transition-colors px-4 py-4 whitespace-nowrap border-b-2 border-transparent hover:border-primary">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* ════════════════════════════════════
            HOW TO START A FUNDRAISER
        ════════════════════════════════════ */}
        <section id="how-to-start" className="py-20 bg-white scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>How to start a fundraiser</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
              Live in under 15 minutes
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-12">
              Starting a campaign on EveryGiving is the fastest way to raise money in Ghana. No bank account. No complicated forms. Just your story, your ID, and your MoMo number.
            </p>

            {/* Steps */}
            <div className="relative">
              {/* Connector line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gray-100 hidden md:block" />
              <div className="flex flex-col gap-6">
                {[
                  { n: 1, title: 'Create your account', body: 'Sign up with your email and mobile number — takes 60 seconds. Start building your campaign immediately.', time: '1 minute', cta: null },
                  { n: 2, title: 'Tell your story', body: 'Write your story in your own words. Explain what the money is for, how much you need, and why it matters. A photo is essential — campaigns with photos consistently raise more.', time: '5–10 minutes', cta: null },
                  { n: 3, title: 'Verify your identity', body: 'Upload your Ghana Card and take a selfie. Our system matches your face to your ID and confirms your identity with the EveryGiving team review. This is what earns you the Verified badge.', time: 'Within 24 hours', cta: null },
                  { n: 4, title: 'Share your campaign', body: 'Once live, share your campaign link on WhatsApp, Facebook, or wherever your network is. We provide a ready-made WhatsApp message to make it immediate.', time: 'Instant', cta: null },
                  { n: 5, title: 'Receive donations to your MoMo', body: 'Donations go directly to your MTN MoMo, Vodafone Cash, or AirtelTigo wallet. Same-day payouts. Zero platform fee. Every cedi is yours.', time: 'Same day', cta: { label: 'Start now →', href: '/create' } },
                ].map((step, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center flex-shrink-0 relative z-10 shadow-md">
                      <span className="font-nunito font-black text-primary text-lg">{step.n}</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex-1">
                      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
                        <div className="font-nunito font-black text-navy text-base">{step.title}</div>
                        <div className="text-xs font-bold text-primary bg-primary-light border border-primary/20 px-3 py-1 rounded-full">{step.time}</div>
                      </div>
                      <div className="text-gray-500 text-sm leading-relaxed">{step.body}</div>
                      {step.cta && (
                        <Link href={step.cta.href} className="inline-block mt-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black text-xs px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5">
                          {step.cta.label}
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            FUNDRAISING CATEGORIES
        ════════════════════════════════════ */}
        <section id="categories" className="py-20 bg-gray-50 border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Fundraising categories</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
              What are you raising for?
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-10">
              EveryGiving supports 17 fundraising categories. Whatever your cause, there is a place for it here — and donors who care.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {CATEGORIES.map((cat, i) => (
                <Link key={i} href={cat.href}
                  className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-primary/20 hover:bg-primary-light hover:-translate-y-0.5 transition-all group shadow-sm">
                  <div className="text-3xl mb-3">{cat.icon}</div>
                  <div className="font-nunito font-black text-navy text-sm mb-1.5 group-hover:text-primary transition-colors">{cat.label}</div>
                  <div className="text-gray-400 text-xs leading-relaxed">{cat.desc}</div>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link href="/campaigns"
                className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                Browse all campaigns by category →
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            TEAM FUNDRAISING
        ════════════════════════════════════ */}
        <section id="team" className="py-20 bg-white border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Team fundraising</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
              Stronger together
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-12">
              When a group rallies behind a single campaign, they raise more — and faster. Team fundraising on EveryGiving lets multiple people promote the same verified page.
            </p>
            <div className="grid md:grid-cols-2 gap-8 items-center mb-10">
              <div>
                <div className="flex flex-col gap-5">
                  {[
                    { icon: '👥', title: 'One campaign, many fundraisers', desc: 'The campaign organiser creates the fundraiser and shares a team link. Every team member promotes the same page — all donations flow to the same goal.' },
                    { icon: '📣', title: 'Broader reach', desc: 'When 10 people each share with their WhatsApp contacts, the campaign reaches hundreds of potential donors. Team fundraising multiplies your reach exponentially.' },
                    { icon: '🏅', title: 'Visible contributors', desc: 'Team members who help promote the campaign can be credited on the page. Recognition drives action — people share more when they are acknowledged.' },
                    { icon: '💬', title: 'Group accountability', desc: 'The team can see donation progress in real time. Shared goals drive shared action — teams don\'t let each other down.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="text-xl flex-shrink-0 mt-0.5">{item.icon}</div>
                      <div>
                        <div className="font-nunito font-extrabold text-navy text-sm mb-1">{item.title}</div>
                        <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-navy rounded-2xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.15), transparent 70%)', transform: 'translate(30%,-30%)' }} />
                <div className="relative">
                  <div className="text-5xl mb-4">🤝</div>
                  <div className="font-nunito font-black text-white text-xl mb-3">Fundraise as a group</div>
                  <p className="text-white/40 text-sm leading-relaxed mb-6">
                    Churches, schools, families, and friend groups raise significantly more when they organise a team around a single campaign.
                  </p>
                  <Link href="/create"
                    className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-7 py-3 rounded-full transition-all hover:-translate-y-0.5 text-sm">
                    Start a team campaign
                  </Link>
                </div>
              </div>
            </div>

            {/* Use cases */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <div className="font-nunito font-black text-navy text-base mb-4">Popular team fundraising uses</div>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  'Church building fund drives',
                  'Family medical emergency appeals',
                  'School alumni fundraisers',
                  'Community water project collections',
                  'Football club equipment funds',
                  'Old Students Association projects',
                ].map((use, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    {use}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            FUNDRAISING BLOG
        ════════════════════════════════════ */}
        <section id="blog" className="py-20 bg-gray-50 border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Fundraising blog</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
              Tips to raise more
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-10">
              Practical guides written for Ghanaian fundraisers — covering how to write your story, share effectively, and keep your donors engaged.
            </p>
            <div className="grid md:grid-cols-2 gap-5 mb-8">
              {BLOG_POSTS.map((post, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:-translate-y-0.5 transition-transform group cursor-pointer">
                  <div className="bg-gray-50 h-28 flex items-center justify-center text-5xl border-b border-gray-100">
                    {post.emoji}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-primary-light text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-primary/20">{post.tag}</span>
                      <span className="text-gray-300 text-xs">{post.time}</span>
                    </div>
                    <div className="font-nunito font-black text-navy text-base mb-2 leading-snug group-hover:text-primary transition-colors">{post.title}</div>
                    <div className="text-gray-500 text-sm leading-relaxed">{post.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/help"
                className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white font-nunito font-black px-7 py-3.5 rounded-full transition-all hover:-translate-y-0.5 text-sm">
                More guides in the Help Centre →
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            CHARITY FUNDRAISING
        ════════════════════════════════════ */}
        <section id="charity" className="py-20 bg-white border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Charity fundraising</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
              Raise funds for your NGO or charity
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-12">
              Every Giving supports registered NGOs, charities, and faith-based organisations in Ghana. If you serve your community, we help you fund it.
            </p>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="flex flex-col gap-5">
                {[
                  { icon: '✅', title: 'Verified Charity badge', desc: 'Registered charities and NGOs receive a dedicated Verified Charity badge — distinct from individual fundraiser badges — so donors know exactly who they are supporting.' },
                  { icon: '📋', title: 'Multiple campaigns at once', desc: 'Charities can manage multiple campaigns simultaneously — one for each project, programme, or emergency appeal.' },
                  { icon: '📊', title: 'Donor reporting', desc: 'Download full donation reports for your records, board meetings, and donor acknowledgements.' },
                  { icon: '🔄', title: 'Recurring giving', desc: 'Allow your donors to set up recurring monthly contributions — building a sustainable income for your organisation rather than relying on one-off appeals.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="text-xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="font-nunito font-extrabold text-navy text-sm mb-1">{item.title}</div>
                      <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-primary rounded-2xl p-7 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                  <div className="relative">
                    <div className="font-nunito font-black text-white text-xl mb-3">Who qualifies?</div>
                    <div className="flex flex-col gap-2">
                      {[
                        'Registered NGOs in Ghana',
                        'Faith-based organisations',
                        'Community foundations',
                        'School PTAs and alumni groups',
                        'Hospital support organisations',
                        'Youth and sports organisations',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                          <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                  <div className="font-nunito font-black text-navy text-base mb-2">Not sure if you qualify?</div>
                  <div className="text-gray-400 text-sm mb-4">Email us and we will review your organisation within 48 hours.</div>
                  <a href="mailto:business@everygiving.org?subject=Charity Registration"
                    className="inline-block text-primary font-bold text-sm hover:underline">
                    business@everygiving.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            SIGN UP AS A CHARITY
        ════════════════════════════════════ */}
        <section id="signup-charity" className="py-20 bg-navy relative overflow-hidden scroll-mt-14">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.1), transparent 70%)', transform: 'translate(-30%, 30%)' }} />
          <div className="relative max-w-4xl mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-primary mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Sign up as a charity</div>
                <h2 className="font-nunito font-black text-white text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
                  Get your Verified Charity badge
                </h2>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                  Registered charities and NGOs on Every Giving get a special badge that distinguishes them from individual fundraisers. Donors trust verified organisations more — and give more.
                </p>
                <div className="flex flex-col gap-3 mb-8">
                  {[
                    'Submit your organisation registration documents',
                    'Provide a contact person and verified email address',
                    'Complete a brief verification review — typically within 48 hours',
                    'Receive your Verified Charity badge and go live',
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-black text-xs">{i + 1}</span>
                      </div>
                      <span className="text-white/70 text-sm">{step}</span>
                    </div>
                  ))}
                </div>
                <Link href="/create"
                  className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/20 text-sm">
                  Register your charity →
                </Link>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Platform fee', val: '0%', sub: 'Same as individual fundraisers' },
                  { label: 'Active campaigns', val: 'Unlimited', sub: 'No limit' },
                  { label: 'Verification time', val: '48 hrs', sub: 'Reviewed by our team · typically 48 hours' },
                  { label: 'Donor reporting', val: 'Full export', sub: 'CSV download, always' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex items-center justify-between">
                    <span className="text-white/50 text-sm">{item.label}</span>
                    <div className="text-right">
                      <div className="font-nunito font-black text-primary text-base">{item.val}</div>
                      <div className="text-white/25 text-xs">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            CORPORATE FUNDRAISING
        ════════════════════════════════════ */}
        <section id="corporate" className="py-20 bg-white border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Corporate fundraising</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
              Give back with your company
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-12">
              Businesses across Ghana use Every Giving for CSR initiatives, staff giving programmes, and community investment. Zero platform fees mean your budget goes further.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-10">
              {CORPORATE_BENEFITS.map((item, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex gap-4">
                  <div className="text-2xl flex-shrink-0">{item.icon}</div>
                  <div>
                    <div className="font-nunito font-black text-navy text-sm mb-2">{item.title}</div>
                    <div className="text-gray-500 text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Corporate examples */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
              <div className="font-nunito font-black text-navy text-base mb-4">How companies use Every Giving</div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: 'Donation matching', desc: 'Match every cedi your employees donate. EveryGiving tracks and reports every contribution.' },
                  { title: 'End-of-year giving', desc: 'Launch a campaign at year-end and invite staff, clients, and partners to contribute to a cause that matters.' },
                  { title: 'Supplier giving days', desc: 'Invite your supply chain to give alongside your business — build a culture of generosity around your brand.' },
                ].map((item, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
                    <div className="font-nunito font-black text-navy text-sm mb-2">{item.title}</div>
                    <div className="text-gray-500 text-xs leading-relaxed">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-navy rounded-2xl p-7 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="font-nunito font-black text-white text-lg mb-1">Interested in corporate giving?</div>
                <div className="text-white/40 text-sm">We will set up a tailored giving programme for your company.</div>
              </div>
              <a href="mailto:business@everygiving.org?subject=Corporate Fundraising"
                className="flex-shrink-0 bg-primary hover:bg-primary-dark text-white font-nunito font-black px-7 py-3 rounded-full transition-all hover:-translate-y-0.5 text-sm">
                Get in touch
              </a>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            EVENT FUNDRAISING
        ════════════════════════════════════ */}
        <section id="events" className="py-20 bg-gray-50 border-t border-gray-100 scroll-mt-14">
          <div className="max-w-4xl mx-auto px-5">
            <SectionLabel>Event fundraising</SectionLabel>
            <h2 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-4 leading-tight">
              Fundraise around an event
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xl mb-10">
              Every milestone is an opportunity to give back. Link your celebration, challenge, or competition to a cause on Every Giving and let the people who show up make a difference.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {EVENT_TYPES.map((event, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:-translate-y-0.5 transition-transform">
                  <div className="text-3xl mb-3">{event.icon}</div>
                  <div className="font-nunito font-black text-navy text-sm mb-2">{event.label}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{event.desc}</div>
                </div>
              ))}
            </div>

            {/* How event fundraising works */}
            <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-6">
              <div className="font-nunito font-black text-navy text-base mb-4">How to run an event fundraiser</div>
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  { n: '1', text: 'Create your campaign and set your event date as the deadline' },
                  { n: '2', text: 'Include the link when you send invitations or announce your event' },
                  { n: '3', text: 'Display the live campaign total on a screen at your event' },
                  { n: '4', text: 'Announce the total raised and thank your donors — live, in the room' },
                ].map((step, i) => (
                  <div key={i} className="text-center">
                    <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="font-nunito font-black text-primary text-base">{step.n}</span>
                    </div>
                    <div className="text-gray-500 text-xs leading-relaxed">{step.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Link href="/create"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-9 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/25 text-sm">
                Create your event fundraiser →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="py-20 bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(2,169,92,.12) 0%, transparent 70%)' }} />
          <div className="relative max-w-3xl mx-auto px-5 text-center">
            <div className="font-nunito font-black text-white mb-4 leading-tight" style={{ fontSize: 'clamp(28px,5vw,48px)', letterSpacing: -1 }}>
              Your cause deserves<br /><span className="text-primary">to be funded.</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Free to start. Verified in minutes. Every cedi goes directly to you — no platform fee, ever.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/create"
                className="bg-primary hover:bg-primary-dark text-white font-nunito font-black px-9 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/25 text-sm">
                Start your fundraiser →
              </Link>
              <Link href="/campaigns"
                className="border-2 border-white/15 hover:border-white/40 text-white font-nunito font-bold px-7 py-4 rounded-full transition-all text-sm">
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
