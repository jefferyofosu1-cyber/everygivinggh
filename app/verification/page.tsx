'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const TIERS = [
  {
    tier: 'Basic',
    price: '₵20',
    priceNum: 20,
    border: 'border-gray-200',
    badge: 'Basic Verified',
    badgeColor: 'bg-gray-100 text-gray-600',
    recommended: false,
    checks: [
      'Email confirmed',
      'Phone number verified',
      'Ghana Card upload required',
      'ID number required',
      'Basic Verified badge',
    ],
    note: 'Good for small personal campaigns',
    noteColor: 'bg-gray-50 text-gray-500',
    limit: 'Campaigns up to ₵5,000',
  },
  {
    tier: 'Standard',
    price: '₵50',
    priceNum: 50,
    border: 'border-primary',
    badge: 'Verified ✓',
    badgeColor: 'bg-primary-light text-primary-dark',
    recommended: true,
    checks: [
      'Everything in Basic',
      'Selfie matched via facial recognition',
      'NIA database cross-check',
      'Full Verified badge on campaign',
      'Priority in search results',
    ],
    note: 'Most popular — highest donor confidence',
    noteColor: 'bg-primary-light text-primary-dark',
    limit: 'Campaigns up to ₵50,000',
  },
  {
    tier: 'Premium',
    price: '₵100',
    priceNum: 100,
    border: 'border-amber-400',
    badge: 'Premium ★',
    badgeColor: 'bg-amber-50 text-amber-700',
    recommended: false,
    checks: [
      'Everything in Standard',
      'Supporting documents reviewed',
      'Hospital bill / admission letter accepted',
      'Premium badge + top listing placement',
      'Dedicated campaign support',
    ],
    note: 'Best for campaigns above ₵50,000',
    noteColor: 'bg-amber-50 text-amber-700',
    limit: 'Unlimited campaign goal',
  },
]

export default function VerificationPage() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-navy py-20 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-primary/30">
              Identity verification
            </div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-5 leading-tight">
              Verified fundraisers<br />raise more money
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto">
              Your Ghana Card confirms you are who you say you are. Donors trust verified campaigns — and give more to them.
            </p>
          </div>
        </section>

        {/* How verification works */}
        <section className="py-16 bg-gray-50 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-2">What verification requires</h2>
              <p className="text-gray-400 text-sm">All tiers require identity documents. The tier you choose determines how deeply your documents are verified.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  n: '01', title: 'Ghana Card upload',
                  desc: 'Upload a clear photo of the front of your Ghana Card. Your ID number must be visible. This is required for all verification tiers.',
                  required: 'Required for all tiers',
                },
                {
                  n: '02', title: 'Enter your ID number',
                  desc: 'Manually type your Ghana Card ID number. This is cross-referenced against your uploaded card to confirm accuracy.',
                  required: 'Required for all tiers',
                },
                {
                  n: '03', title: 'Selfie (Standard & Premium)',
                  desc: 'Take a live selfie using your phone camera. Our facial recognition matches your face to the photo on your Ghana Card for deeper verification.',
                  required: 'Standard & Premium only',
                },
              ].map((step, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="font-nunito font-black text-primary/30 text-3xl mb-3">{step.n}</div>
                  <h3 className="font-nunito font-extrabold text-navy text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{step.desc}</p>
                  <div className="bg-primary-light text-primary-dark text-xs font-bold px-3 py-2 rounded-lg">
                    {step.required}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification tiers */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-10">
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-2">Choose your verification tier</h2>
              <p className="text-gray-400 text-sm">All tiers require your Ghana Card. Higher tiers unlock larger campaigns and more donor trust.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {TIERS.map((tier, i) => (
                <div key={i}
                  onClick={() => setSelectedTier(tier.tier)}
                  className={`bg-white border-2 ${selectedTier === tier.tier ? 'border-primary shadow-xl shadow-primary/10' : tier.border} rounded-2xl p-6 relative cursor-pointer transition-all hover:-translate-y-0.5 ${tier.recommended ? 'shadow-lg shadow-primary/10' : ''}`}>
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Recommended
                    </div>
                  )}
                  <div className="font-nunito font-black text-navy text-lg mb-0.5">{tier.tier}</div>
                  <div className="font-nunito font-black text-primary text-3xl mb-1">{tier.price}</div>
                  <div className="text-gray-400 text-xs mb-3">one-time fee</div>
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-4 ${tier.badgeColor}`}>{tier.badge}</div>
                  <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Includes</div>
                  <div className="flex flex-col gap-2 mb-4">
                    {tier.checks.map((c, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-primary flex-shrink-0 mt-0.5 font-bold">✓</span>
                        {c}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-3 mb-4">
                    <div className="text-xs text-gray-400 font-bold">{tier.limit}</div>
                  </div>
                  <div className={`text-xs font-bold px-3 py-2 rounded-lg ${tier.noteColor}`}>{tier.note}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/create"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-9 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/25 text-sm">
                Start a campaign and choose your tier →
              </Link>
            </div>
          </div>
        </section>

        {/* Privacy strip */}
        <section className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h3 className="font-nunito font-black text-navy text-xl mb-3">Your data is protected</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto mb-5">
              Your Ghana Card and selfie are used only for identity verification. We never share this data with donors or third parties. All documents are encrypted and handled in compliance with Ghana's Data Protection Act 2012.
            </p>
            <div className="flex flex-wrap justify-center gap-5 text-xs text-gray-400">
              <span>✓ End-to-end encrypted</span>
              <span>✓ Never shared with donors</span>
              <span>✓ Ghana Data Protection Act compliant</span>
              <span>✓ NIA-verified</span>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
