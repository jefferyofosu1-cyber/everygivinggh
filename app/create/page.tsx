'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'
import { useEffect } from 'react'

const CATEGORIES = ['Medical', 'Emergency', 'Education', 'Charity', 'Faith', 'Community', 'Environment', 'Business', 'Family', 'Sports', 'Events', 'Competition', 'Travel', 'Volunteer', 'Wishes', 'Memorial', 'Other']

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    priceNum: 0,
    badge: 'Basic Verified',
    badgeColor: 'bg-[var(--surface-alt)] text-[var(--text-muted)]',
    border: 'border-[var(--border)]',
    activeBorder: 'border-[var(--text-muted)]',
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

  // Sync Tier with Goal Amount
  useEffect(() => {
    const goal = parseFloat(campaign.goal) || 0
    if (goal > 50000) {
      setTierId('premium')
    } else if (goal >= 5000) {
      setTierId('standard')
    } else {
      setTierId('basic')
    }
  }, [campaign.goal])

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
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login?returnUrl=/create')
        return
      }

      // 1. Upload Images
      const uploadFile = async (file: File, bucket: string) => {
        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { data, error } = await supabase.storage.from(bucket).upload(path, file)
        if (error) throw error
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
        return publicUrl
      }

      let imageUrl = null
      if (campaign.photo) imageUrl = await uploadFile(campaign.photo, 'campaign-photos')
      
      const idFrontUrl = await uploadFile(identity.idFront!, 'verification-docs')
      const idBackUrl = await uploadFile(identity.idBack!, 'verification-docs')
      let selfieUrl = null
      if (identity.selfie) selfieUrl = await uploadFile(identity.selfie, 'verification-docs')

      // 2. Create Campaign
      const slug = campaign.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const initialStatus = tier.priceNum > 0 ? 'payment_pending' : 'pending'

      const { data: newCampaign, error: insertError } = await supabase
        .from('campaigns')
        .insert({
          organizer_id: user.id,
          title: campaign.title,
          slug,
          category: campaign.category,
          goal_amount: parseFloat(campaign.goal),
          story: campaign.story,
          image_url: imageUrl,
          status: initialStatus,
          verification_tier: tierId,
          id_number: identity.idNumber,
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          selfie_url: selfieUrl
        })
        .select()
        .single()

      if (insertError) throw insertError

      // 3. Handle Payment if required
      if (tier.priceNum > 0) {
        const res = await fetch('/api/verifications/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: newCampaign.id,
            email: user.email
          })
        })
        const payData = await res.json()
        if (payData.authorizationUrl) {
          window.location.href = payData.authorizationUrl
          return
        } else {
          throw new Error(payData.error || 'Failed to initialize payment')
        }
      }

      // 4. Redirect to Success
      router.push(`/create/success?title=${encodeURIComponent(campaign.title)}&slug=${slug}`)
    } catch (error: any) {
      console.error('Creation error:', error)
      alert(`Error creating campaign: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }


  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12 px-5" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block font-nunito font-black text-xl tracking-tight mb-4">
              <span className="text-primary">Every</span><span className="text-navy">Giving</span>
            </Link>
            <h1 className="font-nunito font-black text-navy text-2xl mb-2">Start your campaign</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Free to create. Verified. MoMo-native.</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-0 mb-10">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    i < stepIndex ? 'bg-primary text-white' :
                    i === stepIndex ? 'bg-navy text-white ring-4 ring-navy/20' :
                    'bg-[var(--border)] text-[var(--text-muted)]'
                  }`}>
                    {i < stepIndex ? '✓' : i + 1}
                  </div>
                  <div className={`text-xs mt-1 font-semibold ${i === stepIndex ? 'text-navy' : 'text-[var(--text-muted)]'}`}>{s.label}</div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px flex-1 mx-1 mb-5 transition-all ${i < stepIndex ? 'bg-primary' : 'bg-[var(--border)]'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── STEP 1: CAMPAIGN DETAILS ── */}
          {step === 'campaign' && (
            <div className="rounded-2xl border shadow-sm p-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-nunito font-black text-navy text-xl mb-1">Tell your story</h2>
              <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>Be honest, specific, and personal. Campaigns with real stories raise more.</p>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Campaign title *</label>
                  <input type="text" value={campaign.title}
                    onChange={e => setCampaign(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Help Ama pay for her kidney surgery"
                    maxLength={80}
                    className="w-full border-2 border-[var(--border)] focus:border-primary rounded-xl px-4 py-3 text-sm text-navy placeholder-[var(--text-muted)] outline-none transition-all"
                    style={{ background: 'var(--surface)' }} />
                  <div className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{campaign.title.length}/80</div>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} type="button"
                        onClick={() => setCampaign(p => ({ ...p, category: cat }))}
                        className={`text-xs font-semibold px-3 py-2.5 rounded-xl border-2 transition-all text-left ${campaign.category === cat ? 'border-primary bg-primary-light text-primary-dark' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)] bg-[var(--surface-alt)]'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Fundraising goal (GHC) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: 'var(--text-muted)' }}>₵</span>
                    <input type="number" value={campaign.goal} min="100"
                      onChange={e => setCampaign(p => ({ ...p, goal: e.target.value }))}
                      placeholder="5000"
                      className="w-full border-2 border-[var(--border)] focus:border-primary rounded-xl pl-8 pr-4 py-3 text-sm text-navy placeholder-[var(--text-muted)] outline-none transition-all"
                      style={{ background: 'var(--surface)' }} />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Your story *</label>
                  <textarea value={campaign.story} rows={6}
                    onChange={e => setCampaign(p => ({ ...p, story: e.target.value }))}
                    placeholder="Explain your situation in detail. Who are you raising for? What happened? How will the money be used? Be specific — donors give more when they understand the full picture."
                    className="w-full border-2 border-[var(--border)] focus:border-primary rounded-xl px-4 py-3 text-sm text-navy placeholder-[var(--text-muted)] outline-none transition-all resize-none"
                    style={{ background: 'var(--surface)' }} />
                </div>

                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Campaign photo</label>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden"
                    onChange={e => setCampaign(p => ({ ...p, photo: e.target.files?.[0] || null }))} />
                  <button type="button" onClick={() => photoRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl py-8 text-center transition-all ${campaign.photo ? 'border-primary bg-primary-light' : 'border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--surface-alt)]'}`}>
                    {campaign.photo ? (
                      <div>
                        <div className="text-2xl mb-1"></div>
                        <div className="text-primary font-bold text-sm">{campaign.photo.name}</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-3xl mb-2"></div>
                        <div className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>Upload a photo</div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPG or PNG. Campaigns with photos raise more.</div>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              <button disabled={!canNextCampaign} onClick={() => setStep('tier')}
                className={`w-full mt-7 py-4 font-nunito font-black rounded-full text-sm transition-all ${canNextCampaign ? 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20' : 'bg-[var(--surface-alt)] text-[var(--text-muted)] cursor-not-allowed'}`}>
                Continue to verification →
              </button>
            </div>
          )}

          {/* ── STEP 2: TIER SELECTION ── */}
          {step === 'tier' && (
            <div className="rounded-2xl border shadow-sm p-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-nunito font-black text-navy text-xl mb-1">Choose your verification tier</h2>
              <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>All tiers require your Ghana Card. Higher tiers unlock larger campaigns and more donor trust.</p>

              <div className="flex flex-col gap-4 mb-7">
                {TIERS.map(t => (
                  <div key={t.id}
                    onClick={() => setTierId(t.id)}
                    className={`border-2 rounded-2xl p-5 cursor-pointer transition-all relative ${tierId === t.id ? `${t.activeBorder} bg-[var(--surface-alt)] shadow-md` : `${t.border} bg-[var(--surface)] hover:bg-[var(--surface-alt)]`}`}>
                    {t.recommended && (
                      <div className="absolute -top-2.5 left-5 bg-primary text-white text-xs font-bold px-3 py-0.5 rounded-full">Recommended</div>
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${tierId === t.id ? 'border-primary bg-primary' : 'border-[var(--border)]'}`}>
                        {tierId === t.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-nunito font-black text-navy text-base">{t.name}</span>
                          <span className="font-nunito font-black text-primary text-lg">{t.price}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.badgeColor}`}>{t.badge}</span>
                        </div>
                        <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{t.limit}</div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                          {t.features.map((f, i) => (
                            <div key={i} className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
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
                  className="flex-1 py-4 border-2 border-[var(--border)] hover:border-[var(--text-muted)] font-nunito font-black rounded-full text-sm transition-all"
                  style={{ color: 'var(--text-main)' }}>
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
            <div className="rounded-2xl border shadow-sm p-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-nunito font-black text-navy text-xl">Upload your ID documents</h2>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.badgeColor}`}>{tier.name}</span>
              </div>
              <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
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
                    className="w-full border-2 border-[var(--border)] focus:border-primary rounded-xl px-4 py-3 text-sm text-navy placeholder-[var(--text-muted)] outline-none transition-all font-mono tracking-wider"
                    style={{ background: 'var(--surface)' }} />
                  <div className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>Found on the front of your Ghana Card</div>
                </div>

                {/* ID Front */}
                <div>
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                    Ghana Card — front <span className="text-red-500">*</span>
                  </label>
                  <input ref={idFrontRef} type="file" accept="image/*" className="hidden"
                    onChange={e => handleFileChange(e, 'idFront')} />
                  <button type="button" onClick={() => idFrontRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.idFront ? 'border-primary bg-primary-light' : 'border-[var(--border)] hover:border-primary/40 bg-[var(--surface-alt)]'}`}>
                    {identity.idFront ? (
                      <div><div className="text-2xl mb-1"></div><div className="text-primary font-bold text-sm">{identity.idFront.name}</div><div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Click to change</div></div>
                    ) : (
                      <div><div className="text-2xl mb-1.5"></div><div className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>Upload front of Ghana Card</div><div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPG or PNG. Must be clear and in focus.</div></div>
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
                    className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.idBack ? 'border-primary bg-primary-light' : 'border-[var(--border)] hover:border-primary/40 bg-[var(--surface-alt)]'}`}>
                    {identity.idBack ? (
                      <div><div className="text-2xl mb-1"></div><div className="text-primary font-bold text-sm">{identity.idBack.name}</div><div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Click to change</div></div>
                    ) : (
                      <div><div className="text-2xl mb-1.5"></div><div className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>Upload back of Ghana Card</div><div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>JPG or PNG. Must be clear and in focus.</div></div>
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
                      className={`w-full border-2 border-dashed rounded-xl py-6 text-center transition-all ${identity.selfie ? 'border-primary bg-primary-light' : 'border-[var(--border)] hover:border-primary/40 bg-[var(--surface-alt)]'}`}>
                      {identity.selfie ? (
                        <div><div className="text-2xl mb-1"></div><div className="text-primary font-bold text-sm">{identity.selfie.name}</div><div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Click to change</div></div>
                      ) : (
                        <div><div className="text-2xl mb-1.5"></div><div className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>Take or upload a selfie</div><div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Face forward, good lighting. Used only for ID matching.</div></div>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-7">
                <button onClick={() => setStep('tier')}
                  className="flex-1 py-4 border-2 border-[var(--border)] hover:border-[var(--text-muted)] font-nunito font-black rounded-full text-sm transition-all"
                  style={{ color: 'var(--text-main)' }}>
                  ← Back
                </button>
                <button disabled={!canNextIdentity} onClick={() => setStep('payment')}
                  className={`flex-[2] py-4 font-nunito font-black rounded-full text-sm transition-all ${canNextIdentity ? 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20' : 'bg-[var(--surface-alt)] text-[var(--text-muted)] cursor-not-allowed'}`}>
                  Continue to payment →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: PAYMENT ── */}
          {step === 'payment' && (
            <div className="rounded-2xl border shadow-sm p-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <h2 className="font-nunito font-black text-navy text-xl mb-1">Pay verification fee</h2>
              <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>One-time fee. Covers your identity verification and campaign badge.</p>

              {/* Order summary */}
              <div className="rounded-2xl border p-5 mb-6" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)' }}>
                <div className="font-nunito font-black text-navy text-sm mb-4">Order summary</div>
                <div className="flex flex-col gap-2.5 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Campaign</span>
                    <span className="text-navy font-semibold truncate max-w-[200px]">{campaign.title || 'My campaign'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Verification tier</span>
                    <span className="text-navy font-semibold">{tier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>Badge</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tier.badgeColor}`}>{tier.badge}</span>
                  </div>
                  <div className="border-t border-[var(--border)] pt-2.5 mt-1 flex justify-between font-nunito font-black">
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
                    <div key={i} className="border-2 border-[var(--border)] hover:border-primary rounded-xl p-3 text-center cursor-pointer transition-all text-xs font-bold text-[var(--text-muted)] hover:text-primary hover:bg-primary-light">
                      {method}
                    </div>
                  ))}
                </div>
              </div>

              {tier.priceNum > 0 ? (
                <div className="bg-primary-light border border-primary/15 rounded-xl p-4 mb-6 text-sm" style={{ color: 'var(--text-main)' }}>
                  <strong className="text-navy">Note:</strong> After clicking "Pay & Submit", you will receive a MoMo prompt on your phone to confirm the payment of {tier.price}. Once confirmed, your campaign will be submitted for review.
                </div>
              ) : (
                <div className="rounded-xl border p-4 mb-6 text-sm" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)', color: 'var(--text-main)' }}>
                  <strong className="text-navy">Note:</strong> Your Basic verification is free. After clicking "Submit", your campaign will be reviewed by our team.
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('identity')}
                  className="flex-1 py-4 border-2 border-[var(--border)] hover:border-[var(--text-muted)] font-nunito font-black rounded-full text-sm transition-all"
                  style={{ color: 'var(--text-main)' }}>
                  ← Back
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-60">
                  {submitting ? 'Submitting...' : tier.priceNum > 0 ? `Pay ${tier.price} & Submit →` : 'Submit for review →'}
                </button>
              </div>

              <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
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
