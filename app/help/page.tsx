'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const CATEGORIES = [
  { id: 'all', label: 'All questions' },
  { id: 'fundraisers', label: 'Fundraisers' },
  { id: 'donors', label: 'Donors' },
  { id: 'verification', label: 'Verification' },
  { id: 'payments', label: 'Payments & MoMo' },
  { id: 'account', label: 'My account' },
]

const FAQS = [
  // FUNDRAISERS
  {
    cat: 'fundraisers',
    q: 'How do I start a campaign?',
    a: 'Click "Start a campaign" at the top of the page. Fill in your story, set your goal, upload a photo, and choose a category. The whole process takes under 5 minutes. Your campaign goes live once you complete identity verification.',
  },
  {
    cat: 'fundraisers',
    q: 'Is Every Giving really free?',
    a: 'Yes — completely. EveryGiving charges 0% platform fees on all donations. Every cedi your donors give goes directly to you. Note that your mobile money operator (MTN, Vodafone, AirtelTigo) may charge standard transfer fees on withdrawals. These are set by the networks and are outside our control.',
  },
  {
    cat: 'fundraisers',
    q: 'What types of campaigns are allowed?',
    a: 'We allow campaigns for medical bills, education fees, emergency relief, community and church projects, business support, memorial and funeral costs, and other genuine personal causes. We do not allow campaigns for political purposes, illegal activities, or anything that is deceptive or misleading. If you are unsure whether your campaign qualifies, email us at business@everygiving.org.',
  },
  {
    cat: 'fundraisers',
    q: 'What happens if I don\'t reach my goal?',
    a: 'You keep everything you raise. EveryGiving uses a keep-what-you-raise model — no minimum target, no penalty. If you raise ₵500 of a ₵5,000 goal, that ₵500 is yours to withdraw immediately.',
  },
  {
    cat: 'fundraisers',
    q: 'Can I edit my campaign after it goes live?',
    a: 'Yes. Update your story, photos, and goal at any time from your dashboard. Campaigns that post regular updates raise significantly more than those that go quiet after launch.',
  },
  {
    cat: 'fundraisers',
    q: 'How do I share my campaign?',
    a: 'From your campaign page, tap Share. We generate a ready-made WhatsApp message with your campaign link. You can also copy the link for Facebook, X, or anywhere else. Campaigns shared within the first 24 hours raise significantly more.',
  },

  // VERIFICATION
  {
    cat: 'verification',
    q: 'Why do I need to verify my identity?',
    a: "Verification is what sets EveryGiving apart from simply sending MoMo requests. When donors see a Verified badge, they know your identity has been reviewed and confirmed by the EveryGiving team. Verified campaigns raise more — because donors give with confidence.",
  },
  {
    cat: 'verification',
    q: 'What documents do I need to verify?',
    a: "You need a valid Ghana Card (National Identification Card). During verification you will upload a clear photo of the front and back of your Ghana Card, and a selfie. Our team reviews your documents and confirms your identity — usually within 24 hours.",
  },
  {
    cat: 'verification',
    q: 'How long does verification take?',
    a: "Our team reviews submitted documents and typically approves campaigns within 24 hours. You will receive an email the moment your campaign is approved and live.",
  },
  {
    cat: 'verification',
    q: 'My verification failed — what do I do?',
    a: "Common reasons for failure: photo quality is too low, the ID is expired, the name on your account doesn't exactly match your ID, or the selfie lighting was too dark. Retry with better lighting and a clearer photo. If the issue persists, email business@everygiving.org and we will investigate.",
  },
  {
    cat: 'verification',
    q: 'Is my Ghana Card data safe?',
    a: 'Yes. Identity documents are transmitted over encrypted connections (HTTPS/TLS) and processed under strict data protection agreements. Raw ID images are not stored on our servers after verification completes. See our Privacy Policy for full details.',
  },
  {
    cat: 'verification',
    q: 'Can I run a campaign without being verified?',
    a: 'You can create a campaign without verification, but it will not show the Verified badge. Unverified campaigns typically raise significantly less than verified ones because donors cannot confirm the fundraiser\'s identity. We strongly recommend completing verification before sharing your campaign.',
  },

  // PAYMENTS
  {
    cat: 'payments',
    q: 'How do I receive my donations?',
    a: 'Donations are sent directly to the mobile money number you registered with. We support MTN MoMo, Vodafone Cash, and AirtelTigo Money. Payouts are typically processed the same day donations are received, subject to our payment provider\'s processing times.',
  },
  {
    cat: 'payments',
    q: 'What mobile money networks do you support?',
    a: 'We support MTN Mobile Money, Vodafone Cash, and AirtelTigo Money. Donors can pay and fundraisers can receive on any of these networks.',
  },
  {
    cat: 'payments',
    q: 'How quickly will I receive my money?',
    a: 'Payouts are processed same-day in most cases. Occasionally payment provider processing times may cause a delay of up to 1 business day. If you have not received a payout within 2 business days of a donation being made, contact us at business@everygiving.org with your campaign name and we will investigate.',
  },
  {
    cat: 'payments',
    q: 'Can donors get a refund?',
    a: 'Donations are generally non-refundable as they are voluntary contributions. Refunds may be considered in cases of documented fraud or if a campaign is removed for violating our terms. If you believe you have donated to a fraudulent campaign, contact us immediately at business@everygiving.org.',
  },
  {
    cat: 'payments',
    q: 'Are there any fees on withdrawals?',
    a: 'EveryGiving charges 0% on withdrawals. Your mobile money operator may charge standard transfer fees — these are set by MTN, Vodafone, or AirtelTigo and are outside our control.',
  },

  // DONORS
  {
    cat: 'donors',
    q: 'How do I know a campaign is legitimate?',
    a: "Look for the green Verified badge on the campaign. This means the fundraiser's identity documents have been reviewed and confirmed by the EveryGiving team using their Ghana Card. While verification confirms identity, we also encourage you to read the campaign story carefully, check for regular updates, and only give what you are comfortable with.",
  },
  {
    cat: 'donors',
    q: 'Can I donate anonymously?',
    a: 'Yes. Tick "Donate anonymously" when making your donation. Your name appears as "Anonymous Donor" on the campaign page. Your identity is still recorded internally for fraud prevention — but is never shown to the fundraiser or other donors.',
  },
  {
    cat: 'donors',
    q: 'Do I need an account to donate?',
    a: 'No. You can donate as a guest without an account. Creating an account lets you track your giving history, receive campaign updates, and access your donation receipts.',
  },
  {
    cat: 'donors',
    q: 'Will I receive a receipt for my donation?',
    a: 'Yes. A receipt is emailed to you after every donation, including the campaign name, fundraiser name, amount, date, and transaction reference.',
  },

  // ACCOUNT
  {
    cat: 'account',
    q: 'How do I reset my password?',
    a: "Click \"Forgot password\" on the login page. Enter your registered email and we will send a reset link. The link expires after 24 hours. If you don't receive it, check your spam folder or email business@everygiving.org.",
  },
  {
    cat: 'account',
    q: 'Can I change my registered mobile money number?',
    a: 'Yes. Update your MoMo number in account settings. For security, changes to your payout number require identity re-verification — protecting you from unauthorised changes.',
  },
  {
    cat: 'account',
    q: 'How do I delete my account?',
    a: 'Email business@everygiving.org with subject line "Account deletion request" from your registered email. We will process it within 5 business days. Note: we are legally required to retain certain financial records for up to 7 years post-deletion. See our Privacy Policy for details.',
  },
  {
    cat: 'account',
    q: 'Can I have more than one campaign running at a time?',
    a: 'Yes. Verified fundraisers can run multiple campaigns at once. Each campaign must be for a distinct, legitimate cause and comply with our Terms and Conditions.',
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${open ? 'border-primary/20 shadow-sm' : 'border-gray-100'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-gray-50 transition-colors">
        <span className="font-nunito font-extrabold text-navy text-sm leading-snug">{q}</span>
        <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${open ? 'bg-primary rotate-45' : 'bg-gray-100'}`}>
          <svg className={`w-3.5 h-3.5 transition-colors ${open ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-gray-50">
          <p className="text-sm text-gray-500 leading-relaxed pt-4">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = FAQS.filter(faq => {
    const matchCat = activeCategory === 'all' || faq.cat === activeCategory
    const matchSearch = search === '' ||
      faq.q.toLowerCase().includes(search.toLowerCase()) ||
      faq.a.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <Navbar />
      <main>

        {/* ── HEADER ── */}
        <section className="bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.12) 0%, transparent 65%)' }} />
          <div className="relative max-w-3xl mx-auto px-5 py-16 md:py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              Help Centre
            </div>
            <h1 className="font-nunito font-black text-white text-3xl md:text-5xl tracking-tight mb-4 leading-tight" style={{ letterSpacing: -1 }}>
              How can we help?
            </h1>
            <p className="text-white/40 text-sm mb-8">Common questions about fundraising, verification, and payments on EveryGiving.</p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm pl-11 pr-5 py-4 rounded-full outline-none focus:border-primary/50 focus:bg-white/15 transition-all"
              />
            </div>
          </div>
        </section>

        {/* ── QUICK LINKS ── */}
        <section className="bg-white border-b border-gray-100 py-6">
          <div className="max-w-3xl mx-auto px-5">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === cat.id ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ LIST ── */}
        <section className="py-14 bg-gray-50">
          <div className="max-w-3xl mx-auto px-5">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🤔</div>
                <div className="font-nunito font-black text-navy text-xl mb-2">No results found</div>
                <p className="text-gray-400 text-sm mb-6">Try a different search term or browse all questions.</p>
                <button onClick={() => { setSearch(''); setActiveCategory('all') }}
                  className="bg-primary text-white font-nunito font-black text-sm px-6 py-3 rounded-full hover:-translate-y-0.5 transition-all">
                  Show all questions
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((faq, i) => (
                  <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── STILL NEED HELP ── */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-5">
            <div className="text-center mb-10">
              <h2 className="font-nunito font-black text-navy text-2xl tracking-tight mb-2">Still need help?</h2>
              <p className="text-gray-400 text-sm">We respond to all enquiries within 2 business days.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: '✉️',
                  title: 'Email us',
                  desc: 'For account issues, verification problems, or anything else.',
                  action: 'business@everygiving.org',
                  href: 'mailto:business@everygiving.org',
                  btn: 'Send email',
                },
                {
                  icon: '📋',
                  title: 'Read the Terms',
                  desc: 'Full details on how the platform works, fees, and your rights.',
                  action: 'Terms & Conditions',
                  href: '/terms',
                  btn: 'Read terms',
                },
                {
                  icon: '🔒',
                  title: 'Privacy questions',
                  desc: 'Data access requests, deletion, or privacy concerns.',
                  action: 'Privacy Policy',
                  href: '/privacy',
                  btn: 'Read privacy',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-nunito font-black text-navy text-base mb-2">{item.title}</div>
                  <div className="text-gray-400 text-xs leading-relaxed mb-4">{item.desc}</div>
                  <Link href={item.href}
                    className="inline-block bg-navy hover:bg-navy/90 text-white font-nunito font-black text-xs px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5">
                    {item.btn}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
