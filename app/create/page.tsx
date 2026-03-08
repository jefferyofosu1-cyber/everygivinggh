'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

const CATEGORIES = [
  'Medical','Emergency','Education','Charity','Faith','Community',
  'Environment','Business','Family','Sports','Events','Competition',
  'Travel','Volunteer','Wishes','Memorial','Other',
]

const ID_TYPES = [
  { id: 'ghana-card', label: 'Ghana Card', placeholder: 'GHA-XXXXXXXXX-X', hint: 'Found on the front of your Ghana Card', icon: '🪪' },
  { id: 'passport', label: 'Passport', placeholder: 'G 0000000', hint: 'Found on the photo page of your passport', icon: '📘' },
  { id: 'drivers-license', label: "Driver's Licence", placeholder: 'DVLA-XXXXXXXXXX', hint: 'Found on the front of your DVLA card', icon: '🚗' },
  { id: 'voters-id', label: "Voter's ID", placeholder: 'EC-XXXXXXXXXX', hint: 'Found on your Electoral Commission ID card', icon: '🗳️' },
  { id: 'nhis', label: 'NHIS Card', placeholder: 'NHIS-XXXXXXXXX', hint: 'National Health Insurance Scheme card number', icon: '🏥' },
  { id: 'other', label: 'Other ID', placeholder: 'ID number', hint: 'Enter the ID number from your document', icon: '📄' },
]

const TIERS = [
  {
    id: 'basic', name: 'Basic', price: 'Free', priceNum: 0,
    badge: 'Basic', badgeColor: 'bg-gray-100 text-gray-600',
    border: 'border-gray-200', activeBorder: 'border-gray-500',
    desc: 'ID upload only. Get started for free.',
    limit: 'Campaigns up to ₵5,000',
    features: ['Any accepted ID upload', 'ID number verification', 'Basic badge'],
    selfie: false,
  },
  {
    id: 'standard', name: 'Standard', price: '₵20', priceNum: 20,
    badge: '✓ Verified', badgeColor: 'bg-primary-light text-primary-dark',
    border: 'border-primary/30', activeBorder: 'border-primary',
    recommended: true,
    desc: 'ID + selfie facial match. Full verified badge.',
    limit: 'Campaigns up to ₵50,000',
    features: ['ID upload + ID number', 'Selfie + facial match', 'Full Verified badge', 'Priority in listings'],
    selfie: true,
  },
  {
    id: 'premium', name: 'Premium', price: '₵50', priceNum: 50,
    badge: '★ Premium', badgeColor: 'bg-amber-50 text-amber-700',
    border: 'border-amber-200', activeBorder: 'border-amber-500',
    desc: 'Full verification + document review + top placement.',
    limit: 'Unlimited campaign goal',
    features: ['Everything in Standard', 'Supporting documents reviewed', 'Premium badge + top placement', 'Dedicated support channel'],
    selfie: true,
  },
]

type Step = 'campaign' | 'tier' | 'identity' | 'payment' | 'done'

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('campaign')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [campaign, setCampaign] = useState({ title: '', category: '', goal: '', story: '' })
  const [tierId, setTierId] = useState('standard')
  const tier = TIERS.find(t => t.id === tierId)!

  const [idTypeId, setIdTypeId] = useState('')
  const idType = ID_TYPES.find(i => i.id === idTypeId)
  const [identity, setIdentity] = useState({ idNumber: '', idFront: null as File | null, idBack: null as File | null, selfie: null as File | null })
  const idFrontRef = useRef<HTMLInputElement>(null)
  const idBackRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  const canNextCampaign = campaign.title.trim() && campaign.category && campaign.goal && campaign.story.trim().length > 30
  const canNextIdentity = idTypeId && identity.idNumber.trim() && identity.idFront && identity.idBack && (tier.selfie ? !!identity.selfie : true)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'idFront' | 'idBack' | 'selfie') => {
    const file = e.target.files?.[0] || null
    setIdentity(p => ({ ...p, [field]: file }))
  }

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const supabase = createClient()
    const { error } = await supabase.storage.from('campaign-docs').upload(path, file, { upsert: true })
    if (error) { console.error('Upload error:', error); return null }
    const { data } = supabase.storage.from('campaign-docs').getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const ts = Date.now()
      const uid = user.id
      let idFrontUrl = null, idBackUrl = null, selfieUrl = null

      if (identity.idFront) idFrontUrl = await uploadFile(identity.idFront, `${uid}/${ts}-front.jpg`)
      if (identity.idBack) idBackUrl = await uploadFile(identity.idBack, `${uid}/${ts}-back.jpg`)
      if (identity.selfie) selfieUrl = await uploadFile(identity.selfie, `${uid}/${ts}-selfie.jpg`)

      const res = await fetch('/api/campaign-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: campaign.title,
          category: campaign.category,
          goal_amount: campaign.goal,
          story: campaign.story,
          tier: tier.name,
          idType: idType?.label || idTypeId,
          idNumber: identity.idNumber,
          idFrontUrl, idBackUrl, selfieUrl,
        }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Submission failed'); setSubmitting(false); return }

      setStep('done')
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    }
    setSubmitting(false)
  }

  const STEPS = ['Campaign', 'Tier', 'Identity', 'Payment']
  const stepIdx = { campaign: 0, tier: 1, identity: 2, payment: 3, done: 4 }[step]

  if (step === 'done') return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-blue-50 flex items-center justify-center px-5 py-16">
        <div className="max-w-md w-full text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-primary/30">🎉</div>
          </div>
          <h1 className="font-nunito font-black text-navy text-3xl mb-3">Campaign submitted!</h1>
          <p className="text-gray-500 text-sm mb-2">Check your email — we've sent a confirmation to your inbox.</p>
          <p className="text-gray-400 text-xs mb-8 max-w-sm mx-auto leading-relaxed">Your campaign and ID documents are under review. We'll email you once it's live — usually within 2 hours.</p>
          <div className="flex flex-col gap-3">
            {[
              { icon:'📧', text:'Check your email for confirmation' },
              { icon:'⏱', text:'Review takes under 2 hours' },
              { icon:'📱', text:'You\'ll get an email when you go live' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-600 shadow-sm">
                <span className="text-xl">{item.icon}</span>{item.text}
              </div>
            ))}
          </div>
          <Link href="/" className="inline-block mt-8 text-primary font-bold text-sm hover:underline">← Back to homepage</Link>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-10 px-5">
        <div className="max-w-2xl mx-auto">

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${i < stepIdx ? 'bg-primary text-white' : i === stepIdx ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-gray-200 text-gray-400'}`}>
                    {i < stepIdx ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-bold hidden sm:block ${i === stepIdx ? 'text-primary' : i < stepIdx ? 'text-gray-400' : 'text-gray-300'}`}>{s}</span>
                  {i < STEPS.length - 1 && <div className={`h-0.5 w-8 sm:w-16 ml-1 rounded-full ${i < stepIdx ? 'bg-primary' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* ── STEP 1: CAMPAIGN ── */}
          {step === 'campaign' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="font-nunito font-black text-navy text-2xl mb-1">Tell your story</h2>
              <p className="text-gray-400 text-sm mb-7">Be specific and honest — campaigns with detailed stories raise significantly more.</p>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Campaign title <span className="text-red-400">*</span></label>
                  <input type="text" value={campaign.title} onChange={e => setCampaign(p=>({...p,title:e.target.value}))}
                    placeholder="e.g. Help me pay for my mother's surgery at Korle Bu"
                    className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Category <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => setCampaign(p=>({...p,category:cat}))}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border-2 transition-all ${campaign.category === cat ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-gray-50'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Goal amount (GHC) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₵</span>
                    <input type="number" min="1" value={campaign.goal} onChange={e => setCampaign(p=>({...p,goal:e.target.value}))}
                      placeholder="5000"
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Your story <span className="text-red-400">*</span></label>
                  <textarea rows={5} value={campaign.story} onChange={e => setCampaign(p=>({...p,story:e.target.value}))}
                    placeholder="Tell donors who you are, what happened, why you need help, and exactly how the money will be used. Be specific and personal — people give more when they connect with your story."
                    className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none" />
                  <div className={`text-xs mt-1 ${campaign.story.length < 30 ? 'text-gray-300' : 'text-primary'}`}>{campaign.story.length} characters {campaign.story.length < 30 ? `(write at least ${30 - campaign.story.length} more)` : '✓'}</div>
                </div>
                <button disabled={!canNextCampaign} onClick={() => setStep('tier')}
                  className={`w-full py-4 font-nunito font-black rounded-full text-sm transition-all ${canNextCampaign ? 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                  Continue to verification tier →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: TIER ── */}
          {step === 'tier' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="font-nunito font-black text-navy text-2xl mb-1">Choose your verification level</h2>
              <p className="text-gray-400 text-sm mb-7">Higher verification = more trust = more donations. The verification fee is a one-time payment.</p>
              <div className="flex flex-col gap-3 mb-7">
                {TIERS.map(t => (
                  <div key={t.id} onClick={() => setTierId(t.id)}
                    className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${tierId === t.id ? t.activeBorder + ' bg-gray-50' : t.border + ' hover:bg-gray-50'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${tierId === t.id ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                        {tierId === t.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-nunito font-black text-navy text-base">{t.name}</span>
                          <span className={`font-nunito font-black text-lg ${t.id === 'basic' ? 'text-gray-500' : 'text-primary'}`}>{t.price}</span>
                          {t.recommended && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">Recommended</span>}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.badge}</span>
                        </div>
                        <div className="text-gray-400 text-xs mb-2">{t.limit}</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {t.features.map((f, i) => (
                            <div key={i} className="text-xs text-gray-500 flex items-center gap-1"><span className="text-primary font-bold">✓</span> {f}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('campaign')} className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-nunito font-black rounded-full text-sm">← Back</button>
                <button onClick={() => setStep('identity')} className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm hover:-translate-y-0.5 shadow-lg shadow-primary/20">
                  Continue to ID upload →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: IDENTITY ── */}
          {step === 'identity' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="font-nunito font-black text-navy text-2xl mb-1">Upload your ID document</h2>
              <p className="text-gray-400 text-sm mb-7">All documents are encrypted and used only for identity verification. Never shared with donors.</p>

              {/* Step 1: choose ID type */}
              <div className="mb-6">
                <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-3">Select your ID type <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ID_TYPES.map(id => (
                    <button key={id.id} type="button" onClick={() => setIdTypeId(id.id)}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 text-left transition-all ${idTypeId === id.id ? 'border-primary bg-primary-light' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                      <span className="text-xl flex-shrink-0">{id.icon}</span>
                      <span className={`text-xs font-bold ${idTypeId === id.id ? 'text-primary-dark' : 'text-gray-600'}`}>{id.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {idType && (
                <div className="flex flex-col gap-5">
                  {/* ID Number */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">
                      {idType.label} number <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={identity.idNumber}
                      onChange={e => setIdentity(p=>({...p,idNumber:e.target.value}))}
                      placeholder={idType.placeholder}
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all font-mono tracking-wider" />
                    <div className="text-xs text-gray-400 mt-1">{idType.hint}</div>
                  </div>

                  {/* Front */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">{idType.label} — front <span className="text-red-400">*</span></label>
                    <input ref={idFrontRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e,'idFront')} />
                    <button type="button" onClick={() => idFrontRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.idFront ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary/40 bg-gray-50'}`}>
                      {identity.idFront
                        ? <div><div className="text-2xl mb-1">✅</div><div className="text-primary font-bold text-sm">{identity.idFront.name}</div><div className="text-gray-400 text-xs mt-0.5">Tap to change</div></div>
                        : <div><div className="text-2xl mb-1.5">{idType.icon}</div><div className="text-gray-500 font-semibold text-sm">Upload front of {idType.label}</div><div className="text-gray-400 text-xs mt-1">JPG or PNG · Clear and in focus</div></div>}
                    </button>
                  </div>

                  {/* Back */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">{idType.label} — back <span className="text-red-400">*</span></label>
                    <input ref={idBackRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e,'idBack')} />
                    <button type="button" onClick={() => idBackRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.idBack ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary/40 bg-gray-50'}`}>
                      {identity.idBack
                        ? <div><div className="text-2xl mb-1">✅</div><div className="text-primary font-bold text-sm">{identity.idBack.name}</div><div className="text-gray-400 text-xs mt-0.5">Tap to change</div></div>
                        : <div><div className="text-2xl mb-1.5">{idType.icon}</div><div className="text-gray-500 font-semibold text-sm">Upload back of {idType.label}</div><div className="text-gray-400 text-xs mt-1">JPG or PNG · Clear and in focus</div></div>}
                    </button>
                  </div>

                  {/* Selfie — Standard/Premium only */}
                  {tier.selfie && (
                    <div>
                      <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Selfie — face match <span className="text-red-400">*</span></label>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-700">
                        Good lighting · Face forward · No sunglasses or hats · Must match your ID photo
                      </div>
                      <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden" onChange={e => handleFileChange(e,'selfie')} />
                      <button type="button" onClick={() => selfieRef.current?.click()}
                        className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.selfie ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary/40 bg-gray-50'}`}>
                        {identity.selfie
                          ? <div><div className="text-2xl mb-1">✅</div><div className="text-primary font-bold text-sm">{identity.selfie.name}</div><div className="text-gray-400 text-xs mt-0.5">Tap to change</div></div>
                          : <div><div className="text-2xl mb-1.5">🤳</div><div className="text-gray-500 font-semibold text-sm">Take or upload a selfie</div><div className="text-gray-400 text-xs mt-1">Face forward · Good lighting</div></div>}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-7">
                <button onClick={() => setStep('tier')} className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-nunito font-black rounded-full text-sm">← Back</button>
                <button disabled={!canNextIdentity} onClick={() => tier.priceNum === 0 ? handleSubmit() : setStep('payment')}
                  className={`flex-[2] py-4 font-nunito font-black rounded-full text-sm transition-all ${canNextIdentity ? 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                  {tier.priceNum === 0 ? 'Submit campaign →' : 'Continue to payment →'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: PAYMENT (Standard & Premium only) ── */}
          {step === 'payment' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="font-nunito font-black text-navy text-2xl mb-1">Pay verification fee</h2>
              <p className="text-gray-400 text-sm mb-7">One-time payment. Covers your identity verification and campaign badge.</p>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
                <div className="font-nunito font-black text-navy text-sm mb-4">Order summary</div>
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Campaign</span><span className="text-navy font-semibold truncate max-w-[200px]">{campaign.title}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Verification tier</span><span className="text-navy font-semibold">{tier.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Badge</span><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.badgeColor}`}>{tier.badge}</span></div>
                  <div className="border-t border-gray-200 pt-2.5 mt-1 flex justify-between font-nunito font-black">
                    <span className="text-navy">Total</span>
                    <span className="text-primary text-lg">{tier.price}</span>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <div className="text-xs font-bold text-navy uppercase tracking-wider mb-3">Pay with mobile money</div>
                <div className="grid grid-cols-3 gap-3">
                  {['MTN MoMo','Vodafone Cash','AirtelTigo'].map((m,i) => (
                    <div key={i} className="border-2 border-gray-100 hover:border-primary rounded-xl p-3 text-center cursor-pointer transition-all text-xs font-bold text-gray-500 hover:text-primary hover:bg-primary-light">{m}</div>
                  ))}
                </div>
              </div>
              <div className="bg-primary-light border border-primary/15 rounded-xl p-4 mb-6 text-sm text-gray-600">
                <strong className="text-navy">Note:</strong> After clicking "Pay & Submit", you will receive a MoMo prompt on your phone to confirm {tier.price}. Once paid, your campaign goes to our review team.
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>}
              <div className="flex gap-3">
                <button onClick={() => setStep('identity')} className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-nunito font-black rounded-full text-sm">← Back</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-60">
                  {submitting ? 'Submitting…' : `Pay ${tier.price} & Submit →`}
                </button>
              </div>
              <p className="text-xs text-gray-300 text-center mt-4">Secure · Encrypted · Ghana Data Protection Act compliant</p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
