import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function VerificationPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-navy py-20 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5 border border-primary/30">
              Automatic verification
            </div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-5 leading-tight">
              Verified in minutes,<br />not days
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto">
              Our automated system checks your Ghana Card and matches your selfie in real time. No waiting for manual review — once your identity is confirmed, your campaign goes live.
            </p>
          </div>
        </section>

        {/* Why verification matters */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-5">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-4">Why this matters</h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Donors are generous — but they hesitate when they cannot confirm who is behind a campaign. A single verified badge removes that hesitation and directly increases donations.
                </p>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Our identity check is fully automated. Your Ghana Card details are matched against the NIA database and your selfie is compared using facial recognition — the entire process takes under 10 minutes.
                </p>
                <div className="bg-primary-light border border-primary/20 rounded-xl p-4">
                  <div className="font-nunito font-bold text-primary-dark mb-1">Verified campaigns raise significantly more</div>
                  <div className="text-sm text-primary-dark/70">Our data consistently shows verified campaigns attract more donors and larger donations than unverified ones.</div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { stat: 'Under 10 min', label: 'Average verification time', icon: 'Clock' },
                  { stat: '100%', label: 'Automated — no manual review', icon: 'Zap' },
                  { stat: 'Instant', label: 'Campaign goes live once verified', icon: 'CheckCircle' },
                  { stat: '0', label: 'Fraudulent campaigns passed verification', icon: 'Shield' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                      {s.stat.split(' ')[0]}
                    </div>
                    <div>
                      <div className="font-nunito font-black text-navy text-sm">{s.stat}</div>
                      <div className="text-xs text-gray-400">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How automatic verification works */}
        <section className="py-16 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-12">
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-3">How it works</h2>
              <p className="text-gray-400 text-sm">Fully automated. Completed in minutes from your phone.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  n: '01',
                  title: 'Upload your Ghana Card',
                  desc: 'Take a clear photo of your Ghana Card (front and back). Our system reads the details automatically — name, date of birth, ID number.',
                  detail: 'Checked against NIA database in real time',
                },
                {
                  n: '02',
                  title: 'Take a selfie',
                  desc: 'Using your phone camera, take a live selfie. Our facial recognition compares your face to the photo on your Ghana Card.',
                  detail: 'Liveness detection prevents photo spoofing',
                },
                {
                  n: '03',
                  title: 'Go live automatically',
                  desc: 'Once your identity is confirmed, your campaign is automatically verified and goes live with the Verified badge — no waiting.',
                  detail: 'Takes under 10 minutes end to end',
                },
              ].map((step, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="font-nunito font-black text-primary/30 text-3xl mb-4">{step.n}</div>
                  <h3 className="font-nunito font-extrabold text-navy mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{step.desc}</p>
                  <div className="bg-primary-light text-primary-dark text-xs font-bold px-3 py-2 rounded-lg">
                    {step.detail}
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
              <h2 className="font-nunito font-black text-navy text-3xl tracking-tight mb-2">Verification tiers</h2>
              <p className="text-gray-400 text-sm">Choose the level that matches your campaign size</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  tier: 'Basic',
                  price: 'Free',
                  border: 'border-gray-200',
                  badge: 'No badge',
                  badgeColor: 'bg-gray-100 text-gray-500',
                  recommended: false,
                  checks: [
                    'Email confirmed',
                    'Phone number active',
                    'No identity check',
                    'No verified badge',
                  ],
                  note: 'Lower donor trust — raises less',
                  noteColor: 'bg-gray-50 text-gray-500',
                },
                {
                  tier: 'Standard',
                  price: '₵20',
                  border: 'border-primary',
                  badge: 'Verified badge',
                  badgeColor: 'bg-primary-light text-primary-dark',
                  recommended: true,
                  checks: [
                    'Ghana Card verified',
                    'Selfie matched via facial recognition',
                    'NIA database cross-check',
                    'Verified badge on campaign',
                  ],
                  note: 'Most popular — highest donor confidence',
                  noteColor: 'bg-primary-light text-primary-dark',
                },
                {
                  tier: 'Premium',
                  price: '₵50',
                  border: 'border-amber-400',
                  badge: 'Premium badge',
                  badgeColor: 'bg-amber-50 text-amber-700',
                  recommended: false,
                  checks: [
                    'Everything in Standard',
                    'Supporting documents reviewed',
                    'Hospital bill / admission letter',
                    'Premium badge + priority listing',
                  ],
                  note: 'Best for campaigns above ₵10,000',
                  noteColor: 'bg-amber-50 text-amber-700',
                },
              ].map((tier, i) => (
                <div key={i} className={`bg-white border-2 ${tier.border} rounded-2xl p-6 relative ${tier.recommended ? 'shadow-lg shadow-primary/10' : ''}`}>
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      Recommended
                    </div>
                  )}
                  <div className="font-nunito font-black text-navy text-lg mb-1">{tier.tier}</div>
                  <div className="font-nunito font-black text-primary text-2xl mb-1">{tier.price}</div>
                  <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-4 ${tier.badgeColor}`}>{tier.badge}</div>
                  <div className="flex flex-col gap-2 mb-4">
                    {tier.checks.map((c, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className="text-primary flex-shrink-0 mt-0.5">—</span>
                        {c}
                      </div>
                    ))}
                  </div>
                  <div className={`text-xs font-bold px-3 py-2 rounded-lg ${tier.noteColor}`}>{tier.note}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <h3 className="font-nunito font-black text-navy text-xl mb-3">Your data is protected</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-lg mx-auto mb-6">
              Your Ghana Card details and selfie are used only for identity verification and are never shared with donors or third parties. All data is encrypted and handled in compliance with Ghana's Data Protection Act.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">— End-to-end encrypted</span>
              <span className="flex items-center gap-1">— Never shared with donors</span>
              <span className="flex items-center gap-1">— Ghana Data Protection Act compliant</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-center px-5">
          <h2 className="font-nunito font-black text-white text-2xl mb-3">Get verified in minutes</h2>
          <p className="text-white/75 text-sm mb-6">Create your campaign and complete verification from your phone.</p>
          <Link href="/create" className="inline-block px-8 py-3.5 bg-white text-primary font-nunito font-black rounded-full hover:-translate-y-0.5 transition-all shadow text-sm">
            Start a verified campaign
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
