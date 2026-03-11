'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  full_name: string | null
  phone:     string | null
}

interface Campaign {
  id:            string
  title:         string
  story:         string
  category:      string
  goal_amount:   number
  raised_amount: number
  status:        string
  verified:      boolean
  image_url:     string | null
  created_at:    string
  profiles:      Profile | null
}

interface Donation {
  id:             string
  donor_name:     string | null
  amount:         number
  tip_amount:     number | null
  message:        string | null
  payment_method: string | null
  status:         string
  created_at:     string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJI: Record<string, string> = {
  medical: '🏥', emergency: '🆘', education: '🎓', charity: '🤲',
  faith: '⛪', community: '🏘', environment: '🌿', business: '💼',
  family: '👨‍👩‍👧', sports: '⚽', events: '🎉', wishes: '🌟',
  competition: '🏆', travel: '✈️', volunteer: '🙌', memorial: '🕊', other: '💚',
}

const GRADIENT: Record<string, string> = {
  medical: 'from-red-50 to-rose-100',
  emergency: 'from-orange-50 to-amber-100',
  education: 'from-blue-50 to-indigo-100',
  faith: 'from-purple-50 to-violet-100',
  community: 'from-green-50 to-emerald-100',
  family: 'from-pink-50 to-rose-100',
  sports: 'from-yellow-50 to-amber-100',
  default: 'from-primary-light to-blue-50',
}

const QUICK_AMOUNTS = [20, 50, 100, 200]
const TIP_PRESETS   = [1, 2, 5]

function getDefaultTip(amount: number): number {
  if (amount <= 0) return 2
  return Math.min(Math.max(Math.round(amount * 0.05), 1), 20)
}

function daysAgo(dateStr: string): string {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampaignPage() {
  const params = useParams()
  const id     = typeof params?.id === 'string' ? params.id : ''

  const [campaign,      setCampaign]      = useState<Campaign | null>(null)
  const [donations,     setDonations]     = useState<Donation[]>([])
  const [loading,       setLoading]       = useState(true)
  const [donating,      setDonating]      = useState(false)
  const [donated,       setDonated]       = useState(false)
  const [copied,        setCopied]        = useState(false)
  const [showAllDonors, setShowAllDonors] = useState(false)
  const [formError,     setFormError]     = useState('')

  const [form, setForm] = useState({
    name:      '',
    email:     '',
    amount:    '',
    message:   '',
    method:    'MTN MoMo',
    anonymous: false,
  })

  const [tipEnabled, setTipEnabled] = useState(true)
  const [tipValue,   setTipValue]   = useState(2)
  const [tipCustom,  setTipCustom]  = useState('')
  const [tipMode,    setTipMode]    = useState<'preset' | 'custom'>('preset')

  // Fetch campaign + donations
  useEffect(() => {
    if (!id) return
    const supabase = createClient()
    Promise.all([
      supabase
        .from('campaigns')
        .select('*, profiles(full_name, phone)')
        .eq('id', id)
        .single(),
      supabase
        .from('donations')
        .select('*')
        .eq('campaign_id', id)
        .in('status', ['success', 'pending'])
        .order('created_at', { ascending: false })
        .limit(50),
    ]).then(([{ data: camp, error }, { data: don }]) => {
      if (error) console.error('Campaign fetch:', error.message)
      setCampaign(camp as Campaign | null)
      setDonations((don ?? []) as Donation[])
      setLoading(false)
    })
  }, [id])

  // Auto-update default tip when amount changes
  useEffect(() => {
    const amt = parseFloat(form.amount) || 0
    if (tipMode === 'preset') setTipValue(getDefaultTip(amt))
  }, [form.amount, tipMode])

  // ── Derived values ────────────────────────────────────────────────────────
  const rawAmount = parseFloat(form.amount) || 0
  const fee       = rawAmount > 0 ? +(rawAmount * 0.02 + 0.25).toFixed(2) : 0
  const fundraiserGets = rawAmount > 0 ? +(rawAmount - fee).toFixed(2) : 0
  const tipAmount = tipEnabled
    ? tipMode === 'custom' ? +(parseFloat(tipCustom) || 0).toFixed(2) : tipValue
    : 0
  const total = +(rawAmount + tipAmount).toFixed(2)

  const shareUrl  = typeof window !== 'undefined'
    ? window.location.href
    : `https://everygiving.org/campaigns/${id}`
  const shareText = `Help support "${campaign?.title ?? ''}" on EveryGiving`

  const pct   = campaign?.goal_amount
    ? Math.min(Math.round(((campaign.raised_amount ?? 0) / campaign.goal_amount) * 100), 100)
    : 0
  const emoji = EMOJI[(campaign?.category ?? '').toLowerCase()] ?? '💚'
  const grad  = GRADIENT[(campaign?.category ?? '').toLowerCase()] ?? GRADIENT.default

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleCopy() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault()
    if (!rawAmount || !campaign) return
    setDonating(true)
    setFormError('')
    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_id:    campaign.id,
          amount:         rawAmount,
          tip_amount:     tipAmount,
          donor_name:     form.anonymous ? 'Anonymous' : (form.name || 'Anonymous'),
          donor_email:    form.email || undefined,
          message:        form.message || undefined,
          payment_method: form.method,
        }),
      })
      const json = await res.json() as { error?: string }
      if (!res.ok) { setFormError(json.error ?? 'Donation failed. Please try again.'); return }
      setDonated(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setDonating(false)
    }
  }

  const visibleDonors = showAllDonors ? donations : donations.slice(0, 5)

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <Footer />
    </>
  )

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!campaign) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="font-nunito font-black text-navy text-2xl mb-2">Campaign not found</h1>
          <p className="text-gray-400 text-sm mb-2">This campaign may have been removed, not yet approved, or the link may be incorrect.</p>
          <p className="text-gray-300 text-xs mb-6">If you just submitted this campaign, it is under review and will be visible once approved.</p>
          <Link href="/campaigns" className="inline-block bg-primary text-white font-nunito font-black px-8 py-3.5 rounded-full text-sm hover:-translate-y-0.5 transition-all">
            Browse all campaigns
          </Link>
        </div>
      </div>
      <Footer />
    </>
  )

  // ── Thank you ─────────────────────────────────────────────────────────────
  if (donated) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-blue-50 flex items-center justify-center px-5 py-12">
        <div className="max-w-md w-full text-center">
          <div className="relative inline-flex w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl shadow-xl">💚</div>
          </div>
          <h1 className="font-nunito font-black text-navy text-3xl mb-2">
            Thank you{!form.anonymous && form.name ? `, ${form.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-gray-500 text-sm mb-1">
            Your donation of <strong className="text-primary">GH₵{rawAmount.toFixed(2)}</strong> to <strong>{campaign.title}</strong> is being processed.
          </p>
          {tipAmount > 0 && (
            <p className="text-xs text-gray-400 mb-6">Plus GH₵{tipAmount.toFixed(2)} tip to keep EveryGiving free. Thank you.</p>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <p className="font-nunito font-black text-navy text-sm mb-4">Help this campaign reach more people</p>
            <div className="flex flex-col gap-2.5">
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm">
                Share on WhatsApp
              </a>
              <button onClick={handleCopy}
                className="py-3 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-600 font-bold rounded-xl text-sm transition-all">
                {copied ? 'Link copied!' : 'Copy campaign link'}
              </button>
            </div>
          </div>
          <Link href="/campaigns" className="text-primary text-sm font-bold hover:underline">Browse more campaigns</Link>
        </div>
      </div>
      <Footer />
    </>
  )

  // ── Main page ─────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

          <Link href="/campaigns" className="text-gray-400 text-sm hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
            Back to campaigns
          </Link>

          <div className="grid lg:grid-cols-5 gap-8">

            {/* ── LEFT: Campaign info + donors ── */}
            <div className="lg:col-span-3 flex flex-col gap-6">

              {/* Hero */}
              <div className={`h-72 sm:h-80 bg-gradient-to-br ${grad} rounded-2xl flex items-center justify-center text-9xl relative overflow-hidden border border-gray-100 shadow-sm`}>
                {campaign.image_url
                  ? <Image src={campaign.image_url} alt={campaign.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" priority />
                  : <span className="drop-shadow-sm">{emoji}</span>}
                {campaign.verified && (
                  <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    ✓ Verified
                  </div>
                )}
              </div>

              {/* Title + progress */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-light px-3 py-1 rounded-full">
                    {campaign.category}
                  </span>
                  {campaign.verified && (
                    <span className="text-xs font-bold text-primary flex items-center gap-1">✓ Identity verified</span>
                  )}
                </div>
                <h1 className="font-nunito font-black text-navy text-2xl sm:text-3xl mb-3 leading-tight">
                  {campaign.title}
                </h1>
                <p className="text-sm text-gray-400 mb-6">
                  Organised by <strong className="text-navy">{campaign.profiles?.full_name ?? 'Anonymous'}</strong>
                </p>

                <div className="mb-6">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="font-nunito font-black text-primary text-3xl">
                      GH₵{(campaign.raised_amount ?? 0).toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-sm pb-1">
                      raised of GH₵{(campaign.goal_amount ?? 0).toLocaleString()} goal
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span><strong className="text-navy">{donations.length}</strong> {donations.length === 1 ? 'donation' : 'donations'}</span>
                    <span>{pct}% funded</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 transition-all">
                    Share on WhatsApp
                  </a>
                  <button onClick={handleCopy}
                    className="flex-1 py-3 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-600 font-bold rounded-xl text-sm transition-all">
                    {copied ? 'Copied!' : 'Copy link'}
                  </button>
                </div>
              </div>

              {/* Story */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <h2 className="font-nunito font-black text-navy text-lg mb-4">Campaign story</h2>
                <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{campaign.story}</div>
              </div>

              {/* Donors */}
              {donations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                  <h2 className="font-nunito font-black text-navy text-lg mb-6">
                    {donations.length} {donations.length === 1 ? 'donation' : 'donations'}
                  </h2>
                  <div className="flex flex-col gap-4">
                    {visibleDonors.map((d, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-light to-blue-100 flex items-center justify-center text-lg flex-shrink-0 font-black text-primary border border-primary/10">
                          {d.donor_name === 'Anonymous' ? '👤' : (d.donor_name?.charAt(0)?.toUpperCase() ?? '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-nunito font-black text-navy text-sm">{d.donor_name ?? 'Anonymous'}</span>
                            <span className="font-nunito font-black text-primary text-sm whitespace-nowrap">GH₵{(+d.amount).toLocaleString()}</span>
                          </div>
                          {d.message && (
                            <p className="text-gray-500 text-xs leading-relaxed mb-1 italic">"{d.message}"</p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <span>{daysAgo(d.created_at)}</span>
                            {d.payment_method && <><span>·</span><span>{d.payment_method}</span></>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {donations.length > 5 && (
                    <button onClick={() => setShowAllDonors(p => !p)}
                      className="w-full mt-5 py-3 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-500 font-bold rounded-xl text-sm transition-all">
                      {showAllDonors ? 'Show less' : `See all ${donations.length} donations`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT: Sticky donate form ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
                <h3 className="font-nunito font-black text-navy text-lg mb-5">Make a donation</h3>

                <form onSubmit={handleDonate} className="flex flex-col gap-4">

                  {/* Amount */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                      Amount (GHC) <span className="text-red-400">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1.5 mb-2">
                      {QUICK_AMOUNTS.map(p => (
                        <button key={p} type="button"
                          onClick={() => setForm(prev => ({ ...prev, amount: String(p) }))}
                          className={`text-xs font-bold py-2.5 rounded-xl border-2 transition-all ${
                            form.amount === String(p)
                              ? 'border-primary bg-primary text-white'
                              : 'border-gray-100 text-gray-500 bg-gray-50 hover:border-primary/40'}`}>
                          GH₵{p}
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
                        Fee: GH₵{fee.toFixed(2)} (2% + GH₵0.25) · Fundraiser gets <strong className="text-primary">GH₵{fundraiserGets.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>

                  {/* Tip */}
                  {rawAmount > 0 && (
                    <div className={`rounded-2xl border-2 p-4 transition-all ${tipEnabled ? 'border-primary/25 bg-[#f0fdf6]' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-nunito font-black text-navy text-sm">Tip EveryGiving</p>
                          <p className="text-xs text-gray-400 mt-0.5">Keeps the platform free for fundraisers</p>
                        </div>
                        <button type="button" onClick={() => setTipEnabled(p => !p)}
                          className={`flex-shrink-0 w-11 h-6 rounded-full transition-all relative mt-0.5 ${tipEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${tipEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                      {tipEnabled && (
                        <div className="mt-3">
                          <div className="flex gap-1.5">
                            {TIP_PRESETS.map(v => (
                              <button key={v} type="button"
                                onClick={() => { setTipMode('preset'); setTipValue(v) }}
                                className={`flex-1 text-xs font-bold py-2 rounded-xl border-2 transition-all ${
                                  tipMode === 'preset' && tipValue === v
                                    ? 'border-primary bg-primary text-white'
                                    : 'border-primary/20 text-primary bg-white hover:border-primary/50'}`}>
                                GH₵{v}
                              </button>
                            ))}
                            <button type="button" onClick={() => setTipMode('custom')}
                              className={`flex-1 text-xs font-bold py-2 rounded-xl border-2 transition-all ${
                                tipMode === 'custom'
                                  ? 'border-primary bg-primary text-white'
                                  : 'border-primary/20 text-primary bg-white hover:border-primary/50'}`}>
                              Other
                            </button>
                          </div>
                          {tipMode === 'custom' && (
                            <div className="relative mt-2">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₵</span>
                              <input type="number" min="0" value={tipCustom}
                                onChange={e => setTipCustom(e.target.value)}
                                placeholder="Enter tip"
                                className="w-full border-2 border-primary/30 rounded-xl pl-7 pr-3 py-2 text-sm outline-none bg-white focus:border-primary" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-navy uppercase tracking-wider">Your name</label>
                      <label className="flex items-center gap-1.5 text-xs text-gray-400 cursor-pointer">
                        <input type="checkbox" checked={form.anonymous}
                          onChange={e => setForm(p => ({ ...p, anonymous: e.target.checked }))}
                          className="w-3.5 h-3.5 accent-primary" />
                        Give anonymously
                      </label>
                    </div>
                    {!form.anonymous && (
                      <input type="text" value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="Ama Mensah"
                        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-3.5 py-3 text-sm outline-none transition-all" />
                    )}
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Pay with</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['MTN MoMo', 'Vodafone', 'AirtelTigo'] as const).map(m => (
                        <button key={m} type="button" onClick={() => setForm(p => ({ ...p, method: m }))}
                          className={`text-xs font-bold py-2.5 rounded-xl border-2 transition-all ${
                            form.method === m
                              ? 'border-primary bg-primary-light text-primary-dark'
                              : 'border-gray-100 text-gray-500 bg-gray-50 hover:border-primary/30'}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Leave a message</label>
                    <textarea value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      rows={2} placeholder="A word of support..."
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-3.5 py-3 text-sm outline-none resize-none transition-all" />
                  </div>

                  {/* Total */}
                  {rawAmount > 0 && (
                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm">
                      <div className="flex justify-between text-gray-400 mb-1 text-xs">
                        <span>Donation</span><span>GH₵{rawAmount.toFixed(2)}</span>
                      </div>
                      {tipAmount > 0 && (
                        <div className="flex justify-between text-gray-400 mb-1 text-xs">
                          <span>Tip to EveryGiving</span><span>GH₵{tipAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between font-nunito font-black">
                        <span className="text-navy">Total</span>
                        <span className="text-primary">GH₵{total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-xs">{formError}</div>
                  )}

                  <button type="submit" disabled={donating || !rawAmount}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0">
                    {donating ? 'Processing...' : rawAmount > 0 ? `Donate GH₵${total.toFixed(2)}` : 'Donate'}
                  </button>
                  <p className="text-xs text-gray-300 text-center">Secure · MoMo prompt will appear on your phone</p>
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
