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
    emoji: '🟢',
    badge: 'Basic', badgeColor: 'bg-gray-100 text-gray-600',
    border: 'border-gray-200', activeBorder: 'border-gray-500',
    desc: 'ID upload only. No fee ever.',
    goalRange: 'Up to GH₵5,000',
    goalMax: 5000,
    features: ['ID photo upload', 'ID number recorded', 'Basic badge on campaign'],
    selfie: false,
    canDefer: false,
    color: 'gray',
  },
  {
    id: 'standard', name: 'Standard', price: 'GH₵50', priceNum: 50,
    emoji: '✅',
    badge: '✓ Verified', badgeColor: 'bg-primary-light text-primary-dark',
    border: 'border-primary/30', activeBorder: 'border-primary',
    recommended: true,
    desc: 'ID + selfie reviewed. Full Verified badge.',
    goalRange: 'GH₵5,000 – GH₵10,000',
    goalMax: 10000,
    features: ['ID + selfie reviewed by our team', 'Full Verified badge', 'Priority in listings'],
    selfie: true,
    canDefer: true,
    color: 'green',
  },
  {
    id: 'premium', name: 'Premium', price: 'GH₵100', priceNum: 100,
    emoji: '⭐',
    badge: '★ Premium', badgeColor: 'bg-amber-50 text-amber-700',
    border: 'border-amber-200', activeBorder: 'border-amber-500',
    desc: 'Full document review. Premium badge.',
    goalRange: 'GH₵10,000 – GH₵50,000',
    goalMax: 50000,
    features: ['Everything in Standard', 'Supporting documents reviewed', 'Premium badge + top placement', 'Priority support'],
    selfie: true,
    canDefer: true,
    color: 'amber',
  },
  {
    id: 'gold', name: 'Gold', price: 'GH₵200', priceNum: 200,
    emoji: '🥇',
    badge: '🥇 Gold', badgeColor: 'bg-yellow-50 text-yellow-700',
    border: 'border-yellow-300', activeBorder: 'border-yellow-500',
    desc: 'For large campaigns. Gold badge.',
    goalRange: 'GH₵50,000 – GH₵100,000',
    goalMax: 100000,
    features: ['Everything in Premium', 'Gold badge', 'Featured placement', 'Review within 12 hrs'],
    selfie: true,
    canDefer: true,
    color: 'yellow',
  },
  {
    id: 'diamond', name: 'Diamond', price: 'GH₵500', priceNum: 500,
    emoji: '💎',
    badge: '💎 Diamond', badgeColor: 'bg-blue-50 text-blue-700',
    border: 'border-blue-300', activeBorder: 'border-blue-500',
    desc: 'Unlimited goal. Diamond badge.',
    goalRange: 'GH₵100,000 and above',
    goalMax: Infinity,
    features: ['Everything in Gold', 'Diamond badge', 'Homepage featured', 'Review within 6 hrs', 'Personal campaign manager'],
    selfie: true,
    canDefer: true,
    color: 'blue',
  },
]

type Step = 'campaign' | 'tier' | 'identity' | 'payment' | 'done'
type PayMode = 'now' | 'defer'

function suggestedTierId(goal: number) {
  if (goal <= 5000) return 'basic'
  if (goal <= 10000) return 'standard'
  if (goal <= 50000) return 'premium'
  if (goal <= 100000) return 'gold'
  return 'diamond'
}

export default function CreatePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('campaign')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [payMode, setPayMode] = useState<PayMode>('now')

  const [campaign, setCampaign] = useState({ title: '', category: '', goal: '', story: '' })
  const [tierId, setTierId] = useState('standard')
  const tier = TIERS.find(t => t.id === tierId)!

  const [idTypeId, setIdTypeId] = useState('')
  const idType = ID_TYPES.find(i => i.id === idTypeId)
  const [identity, setIdentity] = useState({ idNumber: '', idFront: null as File | null, selfie: null as File | null })
  const idFrontRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  const goalNum = parseFloat(campaign.goal) || 0

  const handleGoalChange = (val: string) => {
    setCampaign(p => ({ ...p, goal: val }))
    const g = parseFloat(val) || 0
    if (g > 0) setTierId(suggestedTierId(g))
  }

  const canNextCampaign = campaign.title.trim() && campaign.category && campaign.goal && campaign.story.trim().length > 30
  const canNextIdentity = idTypeId && identity.idNumber.trim() && identity.idFront && (tier.selfie ? !!identity.selfie : true)

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
      let idFrontUrl = null, selfieUrl = null

      if (identity.idFront) idFrontUrl = await uploadFile(identity.idFront, `${uid}/${ts}-front.jpg`)
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
          fee_amount: tier.priceNum,
          fee_deferred: tier.priceNum > 0 && payMode === 'defer',
          idType: idType?.label || idTypeId,
          idNumber: identity.idNumber,
          idFrontUrl, selfieUrl,
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

  // ── DONE ─────────────────────────────────────────────────────────────────
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
          <p className="text-gray-500 text-sm mb-2">Check your email — a confirmation has been sent to your inbox.</p>
          <p className="text-gray-400 text-xs mb-6 max-w-sm mx-auto leading-relaxed">
            Your campaign and identity documents are under review. We will email you once it is approved — usually within 24 hours.
          </p>
          {payMode === 'defer' && tier.priceNum > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left">
              <div className="font-bold text-amber-800 text-sm mb-1">💡 Deferred fee — how it works</div>
              <div className="text-amber-700 text-xs leading-relaxed">
                Your <strong>{tier.name}</strong> verification fee of <strong>{tier.price}</strong> will be automatically deducted from your first donations once your campaign is live. You pay nothing today.
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3 mb-8">
            {[
              { icon: '📧', text: 'Check your email for confirmation' },
              { icon: '⏱', text: 'Review usually within 24 hours' },
              { icon: '📱', text: "You'll get an email when you go live" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-600 shadow-sm">
                <span className="text-xl">{item.icon}</span>{item.text}
              </div>
            ))}
          </div>
          <Link href="/" className="inline-block text-primary font-bold text-sm hover:underline">← Back to homepage</Link>
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

          {/* Progress */}
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
              <p className="text-gray-400 text-sm mb-7">Be specific and honest. Campaigns with detailed, personal stories raise significantly more.</p>
              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Campaign title <span className="text-red-400">*</span></label>
                  <input type="text" value={campaign.title} onChange={e => setCampaign(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Help cover my mother's surgery costs at Korle Bu Teaching Hospital"
                    className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Category <span className="text-red-400">*</span></label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button" onClick={() => setCampaign(p => ({ ...p, category: cat }))}
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
                    <input type="number" min="1" value={campaign.goal}
                      onChange={e => handleGoalChange(e.target.value)}
                      placeholder="5000"
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl pl-9 pr-4 py-3 text-sm outline-none transition-all" />
                  </div>
                  {goalNum > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-primary">
                      <span>{TIERS.find(t => t.id === suggestedTierId(goalNum))?.emoji}</span>
                      <span>Suggested tier for ₵{goalNum.toLocaleString()}: <strong>{TIERS.find(t => t.id === suggestedTierId(goalNum))?.name}</strong></span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Your story <span className="text-red-400">*</span></label>
                  <textarea rows={5} value={campaign.story} onChange={e => setCampaign(p => ({ ...p, story: e.target.value }))}
                    placeholder="Tell donors who you are, what happened, why you need help, and exactly how the money will be used. Specificity builds trust — and trust drives donations."
                    className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none" />
                  <div className={`text-xs mt-1 ${campaign.story.length < 30 ? 'text-gray-300' : 'text-primary'}`}>
                    {campaign.story.length} characters {campaign.story.length < 30 ? `(write at least ${30 - campaign.story.length} more)` : '✓'}
                  </div>
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
              <h2 className="font-nunito font-black text-navy text-2xl mb-1">Choose your verification tier</h2>
              <p className="text-gray-400 text-sm mb-2">Each tier sets the maximum goal your campaign can raise. Higher tiers include deeper review and stronger badges — which builds more donor trust.</p>

              {goalNum > 0 && (
                <div className="bg-primary-light border border-primary/20 rounded-xl px-4 py-3 mb-6 text-sm text-primary-dark">
                  Your goal is <strong>₵{goalNum.toLocaleString()}</strong> — <strong>{TIERS.find(t => t.id === suggestedTierId(goalNum))?.name} tier</strong> is selected automatically. You can change it below.
                </div>
              )}

              <div className="flex flex-col gap-3 mb-7">
                {TIERS.map(t => {
                  const isLocked = goalNum > 0 && goalNum > t.goalMax
                  const isSelected = tierId === t.id && !isLocked
                  return (
                    <div key={t.id}
                      onClick={() => !isLocked && setTierId(t.id)}
                      className={`rounded-2xl border-2 p-5 transition-all ${isLocked ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'} ${isSelected ? t.activeBorder + ' bg-gray-50 shadow-sm' : t.border + ' hover:bg-gray-50'}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${isSelected ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xl leading-none">{t.emoji}</span>
                            <span className="font-nunito font-black text-navy text-base">{t.name}</span>
                            <span className={`font-nunito font-black text-base ${t.id === 'basic' ? 'text-gray-500' : 'text-primary'}`}>{t.price}</span>
                            {t.recommended && <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">Recommended</span>}
                            {isLocked && <span className="text-xs bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-full font-bold">Goal exceeds limit</span>}
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.badge}</span>
                          </div>
                          <div className="text-xs text-gray-400 font-semibold mb-2">{t.goalRange}</div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            {t.features.map((f, i) => (
                              <div key={i} className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="text-primary font-bold">✓</span> {f}
                              </div>
                            ))}
                          </div>
                          {t.canDefer && isSelected && (
                            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                              💡 Pay {t.price} now or defer — deducted from first donations
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
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
              <h2 className="font-nunito font-black text-navy text-2xl mb-1">Upload your identity document</h2>
              <p className="text-gray-400 text-sm mb-7">All documents are encrypted and used solely for identity verification. They are never shared with donors or third parties.</p>

              <div className="mb-6">
                <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-3">Select your ID document type <span className="text-red-400">*</span></label>
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
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">
                      {idType.label} number <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={identity.idNumber}
                      onChange={e => setIdentity(p => ({ ...p, idNumber: e.target.value }))}
                      placeholder={idType.placeholder}
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all font-mono tracking-wider" />
                    <div className="text-xs text-gray-400 mt-1">{idType.hint}</div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Photo of your {idType.label} <span className="text-red-400">*</span></label>
                    <input ref={idFrontRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileChange(e, 'idFront')} />
                    <button type="button" onClick={() => idFrontRef.current?.click()}
                      className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.idFront ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-primary/40 bg-gray-50'}`}>
                      {identity.idFront
                        ? <div><div className="text-2xl mb-1">✅</div><div className="text-primary font-bold text-sm">{identity.idFront.name}</div><div className="text-gray-400 text-xs mt-0.5">Tap to change</div></div>
                        : <div><div className="text-2xl mb-1.5">{idType.icon}</div><div className="text-gray-500 font-semibold text-sm">Upload a photo of your {idType.label}</div><div className="text-gray-400 text-xs mt-1">JPG or PNG · Clear and in focus</div></div>}
                    </button>
                  </div>


                  {tier.selfie && (
                    <div>
                      <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Selfie photo <span className="text-red-400">*</span></label>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-xs text-amber-700">
                        Good lighting · Face forward · No sunglasses or hats · Must match your ID photo
                      </div>
                      <input ref={selfieRef} type="file" accept="image/*" capture="user" className="hidden" onChange={e => handleFileChange(e, 'selfie')} />
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

              {error && <div className="mt-5 bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">{error}</div>}
              <div className="flex gap-3 mt-4">
                <button onClick={() => setStep('tier')} className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-nunito font-black rounded-full text-sm">← Back</button>
                <button disabled={!canNextIdentity || submitting} onClick={() => tier.priceNum === 0 ? handleSubmit() : setStep('payment')}
                  className={`flex-[2] py-4 font-nunito font-black rounded-full text-sm transition-all ${canNextIdentity && !submitting ? 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                  {submitting ? 'Submitting…' : tier.priceNum === 0 ? 'Submit campaign →' : 'Continue to payment →'}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: PAYMENT ── */}
          {step === 'payment' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="font-nunito font-black text-navy text-2xl mb-1">Verification fee</h2>
              <p className="text-gray-400 text-sm mb-6">One-time fee for your {tier.name} verification badge. Choose when you want to pay.</p>

              {/* Order summary */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
                <div className="font-nunito font-black text-navy text-sm mb-4">Order summary</div>
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Campaign</span>
                    <span className="text-navy font-semibold truncate max-w-[200px]">{campaign.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tier</span>
                    <span className="text-navy font-semibold">{tier.emoji} {tier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Goal limit</span>
                    <span className="text-navy font-semibold">{tier.goalRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Badge</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.badgeColor}`}>{tier.badge}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2.5 mt-1 flex justify-between font-nunito font-black">
                    <span className="text-navy">Verification fee</span>
                    <span className="text-primary text-lg">{tier.price}</span>
                  </div>
                </div>
              </div>

              {/* Pay now vs Defer */}
              <div className="mb-6">
                <div className="text-xs font-bold text-navy uppercase tracking-wider mb-3">When would you like to pay?</div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button type="button" onClick={() => setPayMode('now')}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${payMode === 'now' ? 'border-primary bg-primary-light shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 mb-3 flex items-center justify-center transition-all ${payMode === 'now' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {payMode === 'now' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div className="font-nunito font-black text-navy text-sm mb-1">💳 Pay now</div>
                    <div className="text-xs text-gray-500 leading-relaxed">Pay {tier.price} today by MoMo. Your campaign enters review immediately.</div>
                  </button>

                  <button type="button" onClick={() => setPayMode('defer')}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${payMode === 'defer' ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 mb-3 flex items-center justify-center transition-all ${payMode === 'defer' ? 'border-amber-500 bg-amber-500' : 'border-gray-300'}`}>
                      {payMode === 'defer' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div className="font-nunito font-black text-navy text-sm mb-1">⏳ Defer payment</div>
                    <div className="text-xs text-gray-500 leading-relaxed">Pay nothing today. {tier.price} is automatically deducted from your first donations.</div>
                  </button>
                </div>

                {/* Defer explanation */}
                {payMode === 'defer' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 leading-relaxed">
                    <strong className="block mb-1.5">How deferred payment works:</strong>
                    Once your campaign is approved and live, the first <strong>{tier.price}</strong> received from donations will be held and applied to your verification fee. Every donation after that goes directly to you. You start raising money before you pay anything.
                  </div>
                )}

                {/* Pay now — MoMo selector */}
                {payMode === 'now' && (
                  <div className="mt-2">
                    <div className="text-xs font-bold text-navy uppercase tracking-wider mb-3">Pay with mobile money</div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {['MTN MoMo', 'Vodafone Cash', 'AirtelTigo'].map((m, i) => (
                        <div key={i} className="border-2 border-gray-100 hover:border-primary rounded-xl p-3 text-center cursor-pointer transition-all text-xs font-bold text-gray-500 hover:text-primary hover:bg-primary-light">{m}</div>
                      ))}
                    </div>
                    <div className="bg-primary-light border border-primary/15 rounded-xl p-4 text-sm text-gray-600">
                      <strong className="text-navy">Note:</strong> After tapping &quot;Pay &amp; Submit&quot;, a MoMo prompt will appear on your phone to authorise {tier.price}. Once confirmed, your campaign goes to our review team.
                    </div>
                  </div>
                )}
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 mb-4 text-sm">{error}</div>}

              <div className="flex gap-3">
                <button onClick={() => setStep('identity')} className="flex-1 py-4 border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-nunito font-black rounded-full text-sm">← Back</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-60">
                  {submitting ? 'Submitting…' : payMode === 'defer' ? `Submit & defer ${tier.price} →` : `Pay ${tier.price} & Submit →`}
                </button>
              </div>
              <p className="text-xs text-gray-300 text-center mt-4">Encrypted · Secure · Ghana Data Protection Act 2012 compliant</p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
