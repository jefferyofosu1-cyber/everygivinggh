'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const CATEGORIES = ['Medical', 'Emergency', 'Education', 'Charity', 'Faith', 'Community', 'Environment', 'Business', 'Family', 'Sports', 'Events', 'Competition', 'Travel', 'Volunteer', 'Wishes', 'Memorial', 'Other']

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceNum: 0,
    badge: 'Basic Verified',
    badgeColor: 'bg-gray-100 text-gray-600',
    border: 'border-gray-200',
    activeBorder: 'border-gray-500',
    desc: 'ID upload + ID number. Basic badge.',
    limit: 'Campaigns up to ₵5,000',
    features: ['Ghana Card upload', 'ID number verification', 'Basic Verified badge'],
    selfie: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '₵50',
    priceNum: 50,
    badge: 'Verified ✓',
    badgeColor: 'bg-primary-light text-primary-dark',
    border: 'border-primary/30',
    activeBorder: 'border-primary',
    recommended: true,
    desc: 'ID + selfie + NIA check. Full badge.',
    limit: 'Campaigns up to ₵50,000',
    features: ['Ghana Card upload', 'ID number verification', 'Selfie + facial recognition', 'NIA database check', 'Full Verified badge'],
    selfie: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₵100',
    priceNum: 100,
    badge: 'Premium ★',
    badgeColor: 'bg-amber-50 text-amber-700',
    border: 'border-amber-200',
    activeBorder: 'border-amber-500',
    desc: 'Full verification + document review.',
    limit: 'More than GHC 50,000',
    features: ['Everything in Standard', 'Supporting documents reviewed', 'Premium badge + top placement', 'Dedicated support'],
    selfie: true,
  },
]

type Step = 'campaign' | 'tier' | 'identity' | 'payment' | 'done'

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('campaign')
  const [submitting, setSubmitting] = useState(false)

  // Campaign form
  const [campaign, setCampaign] = useState({
    title: '', category: '', goal: '', story: '', photo: null as File | null,
  })
  const photoRef = useRef<HTMLInputElement>(null)

  // Tier
  const [tierId, setTierId] = useState<string>('standard')
  const tier = TIERS.find(t => t.id === tierId)!

  // Identity
  const [identity, setIdentity] = useState({
    idNumber: '',
    idFront: null as File | null,
    idBack: null as File | null,
    selfie: null as File | null,
  })
  const idFrontRef = useRef<HTMLInputElement>(null)
  const idBackRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  // Payment (simulate)
  const [paid, setPaid] = useState(false)

  const steps: { id: Step; label: string }[] = [
    { id: 'campaign', label: 'Campaign' },
    { id: 'tier', label: 'Verification' },
    { id: 'identity', label: 'ID documents' },
    { id: 'payment', label: 'Payment' },
  ]
  const stepIndex = steps.findIndex(s => s.id === step)

  const canNextCampaign = campaign.title && campaign.category && campaign.goal && campaign.story

  const canNextIdentity = identity.idNumber && identity.idFront && identity.idBack &&
    (tier.selfie ? !!identity.selfie : true)

  const handleFileSelect = (
    ref: React.RefObject<HTMLInputElement>,
    field: 'idFront' | 'idBack' | 'selfie' | 'photo'
  ) => {
    ref.current?.click()
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'idFront' | 'idBack' | 'selfie'
  ) => {
    const file = e.target.files?.[0] || null
    setIdentity(p => ({ ...p, [field]: file }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500))
    setStep('done')
    setSubmitting(false)
  }

  // ── DONE SCREEN ──────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-blue-50 flex items-center justify-center px-5 py-16">
          <div className="max-w-lg w-full text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-primary/30">🎉</div>
            </div>
            <h1 className="font-nunito font-black text-navy text-3xl mb-3">Campaign submitted!</h1>
            <p className="text-gray-500 text-sm mb-2">Your campaign and identity documents are being reviewed.</p>
            <p className="text-gray-400 text-xs mb-8">You'll receive an email once your campaign is live. This usually takes under 10 minutes.</p>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-left">
              <div className="font-nunito font-black text-navy text-sm mb-4">What happens next</div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '📧', text: 'Check your email for a verification confirmation' },
                  { icon: '✅', text: `Your ${tier.name} verification will be processed` },
                  { icon: '🚀', text: 'Your campaign goes live with your Verified badge' },
                  { icon: '📱', text: 'Share on WhatsApp to start receiving donations' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                    <span>{item.icon}</span><span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/campaigns"
                className="px-7 py-3 bg-primary text-white font-nunito font-black rounded-full text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20">
                Browse campaigns
              </Link>
              <Link href="/"
                className="px-7 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-full text-sm hover:border-primary hover:text-primary transition-all">
                Go home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12 px-5">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block font-nunito font-black text-xl tracking-tight mb-4">
              <span className="text-primary">Every</span><span className="text-navy">Giving</span>
            </Link>
            <h1 className="font-nunito font-black text-navy text-2xl mb-2">Start your campaign</h1>
            <p className="text-gray-400 text-sm">Free to create. Verified. MoMo-native.</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-0 mb-10">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    i < stepIndex ? 'bg-primary text-white' :
                    i === stepIndex ? 'bg-navy text-white ring-4 ring-navy/20' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <div className={`text-xs mt-1 font-semibold ${i === stepIndex ? 'text-navy' : 'text-gray-400'}`}>{s.label}</div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px flex-1 mx-1 mb-5 transition-all ${i < stepIndex ? 'bg-primary' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── STEP 1: CAMPAIGN DETAILS ── */}
          {step === 'campaign' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="font-nunito font-black text-navy text-xl mb-1">Tell your story</h2>
              <p className="text-gray-400 text-sm mb-7">Be honest, specific, and personal. Campaigns with real stories raise more.</p>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Campaign title *</label>
                  <input type="text" value={campaign.title}
                    onChange={e => setCampaign(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Help Ama pay for her kidney surgery"
                    maxLength={80}
                    className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 outline-none transition-all" />
                  <div className="text-xs text-gray-300 mt-1 text-right">{campaign.title.length}/80</div>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button"
                        onClick={() => setCampaign(p => ({ ...p, category: cat }))}
                        className={`text-xs font-semibold px-3 py-2.5 rounded-xl border-2 transition-all text-left ${campaign.category === cat ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-gray-50'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Fundraising goal (GHC) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₵</span>
                    <input type="number" value={campaign.goal} min="100"
                      onChange={e => setCampaign(p => ({ ...p, goal: e.target.value }))}
                      placeholder="5000"
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl pl-8 pr-4 py-3 text-sm text-navy placeholder-gray-300 outline-none transition-all" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Your story *</label>
                  <textarea value={campaign.story} rows={6}
                    onChange={e => setCampaign(p => ({ ...p, story: e.target.value }))}
                    placeholder="Explain your situation in detail. Who are you raising for? What happened? How will the money be used? Be specific — donors give more when they understand the full picture."
                    className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 outline-none transition-all resize-none" />
                </div>

                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Campaign photo</label>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden"
                    onChange={e => setCampaign(p => ({ ...p, photo: e.target.files?.[0] || null }))} />
                  <button type="button" onClick={() => photoRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl py-8 text-center transition-all ${campaign.photo ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                    {campaign.photo ? (
                      <div>
                        <div className="text-2xl mb-1">🖼️</div>
                        <div className="text-primary font-bold text-sm">{campaign.photo.name}</div>
                        <div className="text-gray-400 text-xs mt-1">Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl mb-2">📷</div>
                        <div className="text-gray-500 font-semibold text-sm">Upload a photo</div>
                        <div className="text-gray-400 text-xs mt-1">JPG or PNG. Campaigns with photos raise more.</div>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <button disabled={!canNextCampaign} onClick={() => setStep('tier')}
                className={`w-full mt-7 py-4 font-nunito font-black rounded-full text-sm transition-all ${canNextCampaign ? 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                Continue to verification →
              </button>
            </div>
          )}

          {/* ── STEP 2: TIER SELECTION ── */}
          {step === 'tier' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="font-nunito font-black text-navy text-xl mb-1">Choose your verification tier</h2>
              <p className="text-gray-400 text-sm mb-7">All tiers require your Ghana Card. Higher tiers unlock larger campaigns and more donor trust.</p>

              <div className="flex flex-col gap-4 mb-7">
                {TIERS.map(t => (
                  <div key={t.id}
                    onClick={() => setTierId(t.id)}
                    className={`border-2 rounded-2xl p-5 cursor-pointer transition-all relative ${tierId === t.id ? `${t.activeBorder} bg-gray-50 shadow-md` : `${t.border} hover:bg-gray-50`}`}>
                    {t.recommended && (
                      <div className="absolute -top-2.5 left-5 bg-primary text-white text-xs font-bold px-3 py-0.5 rounded-full">Recommended</div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${tierId === t.id ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                        {tierId === t.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-nunito font-black text-navy text-base">{t.name}</span>
                          <span className="font-nunito font-black text-primary text-lg">{t.price}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.badge}</span>
                        </div>
                        <div className="text-gray-400 text-xs mb-2">{t.limit}</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {t.features.map((f, i) => (
                            <div key={i} className="text-xs text-gray-500 flex items-center gap-1">
                              <span className="text-primary font-bold">✓</span> {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('campaign')}
                  className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-nunito font-black rounded-full text-sm transition-all">
                  ← Back
                </button>
                <button onClick={() => setStep('identity')}
                  className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
                  Continue to ID upload →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: IDENTITY DOCUMENTS ── */}
          {step === 'identity' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-nunito font-black text-navy text-xl">Upload your ID documents</h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.badgeColor}`}>{tier.name}</span>
              </div>
              <p className="text-gray-400 text-sm mb-7">
                All information is encrypted and used only for identity verification. Never shared with donors.
              </p>

              <div className="flex flex-col gap-6">

                {/* ID Number */}
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                    Ghana Card ID number <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={identity.idNumber}
                    onChange={e => setIdentity(p => ({ ...p, idNumber: e.target.value }))}
                    placeholder="GHA-XXXXXXXXX-X"
                    className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 outline-none transition-all font-mono tracking-wider" />
                  <div className="text-xs text-gray-400 mt-1.5">Found on the front of your Ghana Card</div>
                </div>

                {/* ID Front */}
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                    Ghana Card — front <span className="text-red-500">*</span>
                  </label>
                  <input ref={idFrontRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileChange(e, 'idFront')} />
                  <button type="button" onClick={() => idFrontRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.idFront ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary/40 bg-gray-50'}`}>
                    {identity.idFront ? (
                      <div><div className="text-2xl mb-1">✅</div><div className="text-primary font-bold text-sm">{identity.idFront.name}</div><div className="text-gray-400 text-xs mt-0.5">Click to change</div></div>
                    ) : (
                      <div><div className="text-2xl mb-1.5">🪪</div><div className="text-gray-500 font-semibold text-sm">Upload front of Ghana Card</div><div className="text-gray-400 text-xs mt-1">JPG or PNG. Must be clear and in focus.</div></div>
                    )}
                  </button>
                </div>

                {/* ID Back */}
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                    Ghana Card — back <span className="text-red-500">*</span>
                  </label>
                  <input ref={idBackRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileChange(e, 'idBack')} />
                  <button type="button" onClick={() => idBackRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.idBack ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary/40 bg-gray-50'}`}>
                    {identity.idBack ? (
                      <div><div className="text-2xl mb-1">✅</div><div className="text-primary font-bold text-sm">{identity.idBack.name}</div><div className="text-gray-400 text-xs mt-0.5">Click to change</div></div>
                    ) : (
                      <div><div className="text-2xl mb-1.5">🪪</div><div className="text-gray-500 font-semibold text-sm">Upload back of Ghana Card</div><div className="text-gray-400 text-xs mt-1">JPG or PNG. Must be clear and in focus.</div></div>
                    )}
                  </button>
                </div>

                {/* Selfie — Standard and Premium only */}
                {tier.selfie && (
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                      Selfie — facial match <span className="text-red-500">*</span>
                    </label>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-700">
                      <strong>Important:</strong> Take your selfie in good lighting, facing forward. Make sure your face is clearly visible — no sunglasses or hats.
                    </div>
                    <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden"
                      onChange={e => handleFileChange(e, 'selfie')} />
                    <button type="button" onClick={() => selfieRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.selfie ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary/40 bg-gray-50'}`}>
                      {identity.selfie ? (
                        <div><div className="text-2xl mb-1">✅</div><div className="text-primary font-bold text-sm">{identity.selfie.name}</div><div className="text-gray-400 text-xs mt-0.5">Click to change</div></div>
                      ) : (
                        <div><div className="text-2xl mb-1.5">🤳</div><div className="text-gray-500 font-semibold text-sm">Take or upload a selfie</div><div className="text-gray-400 text-xs mt-1">Face forward, good lighting. Used only for ID matching.</div></div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-7">
                <button onClick={() => setStep('tier')}
                  className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-nunito font-black rounded-full text-sm transition-all">
                  ← Back
                </button>
                <button disabled={!canNextIdentity} onClick={() => setStep('payment')}
                  className={`flex-[2] py-4 font-nunito font-black rounded-full text-sm transition-all ${canNextIdentity ? 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                  Continue to payment →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: PAYMENT ── */}
          {step === 'payment' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="font-nunito font-black text-navy text-xl mb-1">Pay verification fee</h2>
              <p className="text-gray-400 text-sm mb-7">One-time fee. Covers your identity verification and campaign badge.</p>

              {/* Order summary */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
                <div className="font-nunito font-black text-navy text-sm mb-4">Order summary</div>
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Campaign</span>
                    <span className="text-navy font-semibold truncate max-w-[200px]">{campaign.title || 'My campaign'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verification tier</span>
                    <span className="text-navy font-semibold">{tier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Badge</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.badgeColor}`}>{tier.badge}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2.5 mt-1 flex justify-between font-nunito font-black">
                    <span className="text-navy">Total</span>
                    <span className="text-primary text-lg">{tier.price}</span>
                  </div>
                </div>
              </div>

              {/* Payment method */}
              <div className="mb-6">
                <div className="text-xs font-bold text-navy uppercase tracking-wider mb-3">Pay with mobile money</div>
                <div className="grid grid-cols-3 gap-3">
                  {['MTN MoMo', 'Vodafone Cash', 'AirtelTigo'].map((method, i) => (
                    <div key={i} className="border-2 border-gray-100 hover:border-primary rounded-xl p-3 text-center cursor-pointer transition-all text-xs font-bold text-gray-500 hover:text-primary hover:bg-primary-light">
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              {tier.priceNum > 0 ? (
                <div className="bg-primary-light border border-primary/15 rounded-xl p-4 mb-6 text-sm text-gray-600">
                  <strong className="text-navy">Note:</strong> After clicking "Pay & Submit", you will receive a MoMo prompt on your phone to confirm the payment of {tier.price}. Once confirmed, your campaign will be submitted for review.
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 text-sm text-gray-600">
                  <strong className="text-navy">Note:</strong> Your Basic verification is free. After clicking "Submit", your campaign will be reviewed by our team.
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('identity')}
                  className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-nunito font-black rounded-full text-sm transition-all">
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-60">
                  {submitting ? 'Submitting...' : tier.priceNum > 0 ? `Pay ${tier.price} & Submit →` : 'Submit for review →'}
                </button>
              </div>

              <p className="text-xs text-gray-300 text-center mt-4">
                Secure payment · Encrypted · Ghana Data Protection Act compliant
              </p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
