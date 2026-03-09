'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

const EMOJI: Record<string, string> = {
  medical: '🏥', emergency: '🆘', education: '🎓', charity: '🤲', faith: '⛪',
  community: '🏘', environment: '🌿', business: '💼', family: '👨‍👩‍👧',
  sports: '⚽', events: '🎉', wishes: '🌟', competition: '🏆', travel: '✈️', volunteer: '🙌',
}

// Tip options — shown as quick-select buttons
const TIP_OPTIONS = [
  { label: '₵1', value: 1 },
  { label: '₵2', value: 2 },
  { label: '₵5', value: 5 },
  { label: 'Other', value: -1 },
]

// Smart default tip: 5% of donation amount, rounded to nearest whole cedi, min ₵1 max ₵20
function getDefaultTip(amount: number): number {
  if (amount <= 0) return 2
  const pct = Math.round(amount * 0.05)
  return Math.min(Math.max(pct, 1), 20)
}

export default function CampaignPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [donating, setDonating] = useState(false)
  const [donated, setDonated] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    amount: '',
    message: '',
    method: 'MTN MoMo',
  })

  // Tip state
  const [tipEnabled, setTipEnabled] = useState(true)    // pre-ticked
  const [tipPreset, setTipPreset] = useState<number>(2) // default ₵2 until amount entered
  const [tipCustom, setTipCustom] = useState('')        // for 'Other'
  const [tipMode, setTipMode] = useState<'preset' | 'custom'>('preset')

  useEffect(() => {
    if (!params?.id) return
    const supabase = createClient()
    supabase.from('campaigns')
      .select('*, profiles(full_name, phone)')
      .eq('id', params.id).single()
      .then(({ data, error }) => {
        if (error || !data) { router.replace('/campaigns'); return }
        setCampaign(data)
        setLoading(false)
      })
  }, [params?.id])

  // When donation amount changes, update default tip to smart %
  useEffect(() => {
    const amt = parseFloat(form.amount) || 0
    if (tipMode === 'preset') {
      setTipPreset(getDefaultTip(amt))
    }
  }, [form.amount])

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <Footer />
    </>
  )

  if (!campaign) return null

  const pct = campaign.goal_amount
    ? Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100)
    : 0
  const emoji = EMOJI[campaign.category?.toLowerCase()] || '💚'

  // Amounts
  const rawAmount = parseFloat(form.amount) || 0
  const fee = rawAmount > 0 ? (rawAmount * 0.02 + 0.25) : 0
  const fundraiserReceives = rawAmount > 0 ? rawAmount - fee : 0

  const tipAmount = tipEnabled
    ? (tipMode === 'custom' ? (parseFloat(tipCustom) || 0) : tipPreset)
    : 0
  const totalCharged = rawAmount + tipAmount

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault()
    setDonating(true)
    await new Promise(r => setTimeout(r, 1500))
    const supabase = createClient()
    await supabase.from('donations').insert({
      campaign_id: campaign.id,
      donor_name: form.name || 'Anonymous',
      donor_email: form.email,
      amount: rawAmount,
      tip_amount: tipAmount,
      message: form.message,
      payment_method: form.method,
      status: 'pending',
    })
    setDonating(false)
    setDonated(true)
  }

  const shareUrl = `https://everygiving.org/campaigns/${campaign.id}`
  const shareText = `Help support "${campaign.title}" on EveryGiving 💚`

  // ── THANK YOU SCREEN ────────────────────────────────────────────────
  if (donated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-blue-50 flex items-center justify-center px-5 py-12">
          <div className="max-w-md w-full text-center">
            <div className="relative inline-flex w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-primary/30">💚</div>
            </div>
            <h1 className="font-nunito font-black text-navy text-3xl mb-2">
              Thank you{form.name ? `, ${form.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-gray-500 text-sm mb-2">
              Your donation of <strong className="text-primary">₵{rawAmount.toFixed(2)}</strong> is being processed.
            </p>
            {tipAmount > 0 && (
              <p className="text-primary-dark/60 text-xs mb-6">
                Plus your ₵{tipAmount.toFixed(2)} tip to keep EveryGiving free for fundraisers. Thank you. 💚
              </p>
            )}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
              <div className="font-nunito font-black text-navy text-sm mb-4">Share this campaign</div>
              <div className="flex flex-col gap-2.5">
                <a href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm">
                  Share on WhatsApp
                </a>
                <button onClick={() => navigator.clipboard.writeText(shareUrl)}
                  className="py-3 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-600 font-bold rounded-xl text-sm transition-all">
                  🔗 Copy link
                </button>
              </div>
            </div>
            <Link href="/campaigns" className="text-primary text-sm font-bold hover:underline">← Browse more campaigns</Link>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // ── MAIN PAGE ────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-5 py-10">
          <Link href="/campaigns" className="text-gray-400 text-sm hover:text-primary transition-colors mb-6 inline-block">
            ← Back to campaigns
          </Link>

          <div className="grid md:grid-cols-3 gap-8">

            {/* ── LEFT: campaign details ── */}
            <div className="md:col-span-2">
              <div className="h-64 bg-gradient-to-br from-primary-light via-white to-blue-50 rounded-2xl flex items-center justify-center text-8xl mb-6 border border-gray-100 shadow-sm relative overflow-hidden">
                {emoji}
                {campaign.verified && (
                  <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span>✓</span> Verified
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-light px-3 py-1 rounded-full">
                    {campaign.category}
                  </span>
                  {campaign.verified && (
                    <span className="text-xs font-bold text-primary">✓ Identity verified</span>
                  )}
                </div>
                <h1 className="font-nunito font-black text-navy text-2xl md:text-3xl mb-4 leading-tight">
                  {campaign.title}
                </h1>
                <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
                  <span>By <strong className="text-navy">{campaign.profiles?.full_name || 'Anonymous'}</strong></span>
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{campaign.story}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="font-nunito font-black text-navy text-base mb-4">Share this campaign</div>
                <div className="flex gap-3">
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 transition-all">
                    WhatsApp
                  </a>
                  <button onClick={() => navigator.clipboard.writeText(shareUrl)}
                    className="flex-1 py-3 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-600 font-bold rounded-xl text-sm transition-all">
                    🔗 Copy link
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: progress + donate ── */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">

                {/* Progress */}
                <div className="mb-5">
                  <div className="font-nunito font-black text-primary text-3xl mb-0.5">
                    ₵{(campaign.raised_amount || 0).toLocaleString()}
                  </div>
                  <div className="text-gray-400 text-sm mb-3">
                    raised of ₵{campaign.goal_amount?.toLocaleString()} goal
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-gray-400">{pct}% funded</div>
                </div>

                {/* Donate form */}
                <form onSubmit={handleDonate} className="flex flex-col gap-3">

                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Your name</label>
                    <input type="text" value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Ama Mensah"
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-3.5 py-3 text-sm outline-none transition-all" />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">
                      Donation amount (GHC) <span className="text-red-400">*</span>
                    </label>
                    {/* Quick amount presets */}
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {[20, 50, 100, 200].map(preset => (
                        <button key={preset} type="button"
                          onClick={() => setForm(p => ({ ...p, amount: String(preset) }))}
                          className={`text-xs font-bold py-2 rounded-lg border-2 transition-all ${form.amount === String(preset) ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-100 text-gray-500 bg-gray-50 hover:border-primary/40'}`}>
                          ₵{preset}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₵</span>
                      <input type="number" required min="1" value={form.amount}
                        onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                        placeholder="Other amount"
                        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl pl-8 pr-3.5 py-3 text-sm outline-none transition-all" />
                    </div>
                    {rawAmount > 0 && (
                      <div className="mt-1.5 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-400">
                        Fee: ₵{fee.toFixed(2)} · Fundraiser receives:{' '}
                        <strong className="text-primary">₵{fundraiserReceives.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>

                  {/* ── TIP SECTION — appears after amount entered ── */}
                  {rawAmount > 0 && (
                    <div className={`rounded-2xl border-2 transition-all p-4 ${tipEnabled ? 'border-primary/30 bg-primary-light/40' : 'border-gray-100 bg-gray-50'}`}>
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <div className="font-nunito font-black text-navy text-sm mb-0.5">
                            Help keep EveryGiving free 💚
                          </div>
                          <div className="text-xs text-gray-400 leading-relaxed">
                            EveryGiving charges 0% to fundraisers. A small tip from donors keeps the platform running.
                          </div>
                        </div>
                        {/* Toggle */}
                        <button type="button" onClick={() => setTipEnabled(p => !p)}
                          className={`flex-shrink-0 w-11 h-6 rounded-full transition-all relative ${tipEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${tipEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>

                      {tipEnabled && (
                        <>
                          {/* Preset tip buttons */}
                          <div className="grid grid-cols-4 gap-1.5 mb-2">
                            {TIP_OPTIONS.map(opt => {
                              const isCustomMode = opt.value === -1
                              const isActive = isCustomMode
                                ? tipMode === 'custom'
                                : tipMode === 'preset' && tipPreset === opt.value
                              return (
                                <button key={opt.label} type="button"
                                  onClick={() => {
                                    if (isCustomMode) {
                                      setTipMode('custom')
                                    } else {
                                      setTipMode('preset')
                                      setTipPreset(opt.value)
                                    }
                                  }}
                                  className={`text-xs font-bold py-2 rounded-xl border-2 transition-all ${isActive ? 'border-primary bg-primary text-white' : 'border-primary/20 text-primary-dark bg-white hover:border-primary/50'}`}>
                                  {opt.label}
                                </button>
                              )
                            })}
                          </div>

                          {/* Custom input */}
                          {tipMode === 'custom' && (
                            <div className="relative mt-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₵</span>
                              <input type="number" min="0" value={tipCustom}
                                onChange={e => setTipCustom(e.target.value)}
                                placeholder="Enter tip amount"
                                className="w-full border-2 border-primary/30 focus:border-primary rounded-xl pl-7 pr-3 py-2.5 text-sm outline-none transition-all bg-white" />
                            </div>
                          )}

                          {/* Smart suggestion note */}
                          {tipMode === 'preset' && (
                            <div className="text-xs text-primary-dark/50 mt-1.5 text-center">
                              Adding ₵{tipPreset} tip
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Pay with */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Pay with</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['MTN MoMo', 'Vodafone', 'AirtelTigo'].map(m => (
                        <button key={m} type="button" onClick={() => setForm(p => ({ ...p, method: m }))}
                          className={`text-xs font-bold py-2.5 rounded-xl border-2 transition-all ${form.method === m ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-100 text-gray-500 bg-gray-50'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Message (optional)</label>
                    <textarea value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      rows={2} placeholder="A word of encouragement…"
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-3.5 py-3 text-sm outline-none transition-all resize-none" />
                  </div>

                  {/* Total summary — shown when tip is on */}
                  {rawAmount > 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm">
                      <div className="flex justify-between text-gray-500 mb-1">
                        <span>Donation</span>
                        <span>₵{rawAmount.toFixed(2)}</span>
                      </div>
                      {tipAmount > 0 && (
                        <div className="flex justify-between text-gray-500 mb-1">
                          <span>Tip to EveryGiving</span>
                          <span>₵{tipAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between font-nunito font-black">
                        <span className="text-navy">Total</span>
                        <span className="text-primary">₵{totalCharged.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={donating}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm disabled:opacity-60">
                    {donating
                      ? 'Processing…'
                      : rawAmount > 0
                        ? `Donate ₵${totalCharged.toFixed(2)} →`
                        : 'Donate →'}
                  </button>
                  <p className="text-xs text-gray-400 text-center">Secure · MoMo prompt will appear on your phone</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
