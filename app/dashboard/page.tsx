'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  pending:  { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Under review' },
  approved: { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500',  label: 'Live' },
  rejected: { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    label: 'Not approved' },
}

// Simple SVG bar chart  -  no external deps
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 h-24 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-navy text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-10">
            ₵{d.value.toLocaleString()}
          </div>
          <div
            className="w-full bg-primary rounded-t-md transition-all duration-700 hover:bg-primary-dark"
            style={{ height: `${Math.max((d.value / max) * 88, d.value > 0 ? 4 : 0)}px` }}
          />
          <span className="text-[9px] text-gray-400 font-medium truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// Sparkline SVG
function Sparkline({ values, color = '#02A95C' }: { values: number[]; color?: string }) {
  if (values.length < 2) return null
  const max = Math.max(...values, 1)
  const min = Math.min(...values)
  const range = max - min || 1
  const h = 40, w = 120
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`)
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 28, circ = 2 * Math.PI * r
  return (
    <svg width="72" height="72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#E5E7EB" strokeWidth="6" />
      <circle cx="36" cy="36" r={r} fill="none" stroke="#02A95C" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={circ - (pct / 100) * circ}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

function CampaignCard({ campaign }: { campaign: any }) {
  const pct = campaign.goal_amount ? Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100) : 0
  const s = STATUS_STYLE[campaign.status] || STATUS_STYLE.pending
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div className={`px-5 py-2.5 flex items-center gap-2 ${s.bg} border-b border-gray-100`}>
        <div className={`w-2 h-2 rounded-full ${s.dot} ${campaign.status === 'pending' ? 'animate-pulse' : ''}`} />
        <span className={`text-xs font-bold ${s.text}`}>{s.label}</span>
        {campaign.status === 'rejected' && (
          <Link href="/create" className="text-xs text-red-600 font-bold ml-auto hover:underline">Resubmit →</Link>
        )}
        {campaign.status === 'pending' && (
          <span className="text-xs text-amber-600 ml-auto">Review within 24h</span>
        )}
      </div>
      <div className="p-5">
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <ProgressRing pct={pct} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-black text-navy">{pct}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-nunito font-black text-navy text-base leading-tight mb-1 truncate">{campaign.title}</h3>
            <div className="text-xs text-gray-400 mb-3">{campaign.category} · {new Date(campaign.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            <div className="flex gap-4 text-sm">
              <div><div className="font-black text-primary text-base">₵{(campaign.raised_amount || 0).toLocaleString()}</div><div className="text-xs text-gray-400">raised</div></div>
              <div><div className="font-black text-navy text-base">₵{(campaign.goal_amount || 0).toLocaleString()}</div><div className="text-xs text-gray-400">goal</div></div>
              <div><div className="font-black text-navy text-base">{campaign.donor_count || 0}</div><div className="text-xs text-gray-400">donors</div></div>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        {campaign.status === 'approved' && (
          <div className="mt-4 flex gap-2">
            <Link href={`/campaigns/${campaign.id}`} className="flex-1 text-center py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition-all">View campaign →</Link>
            <button onClick={() => {
              const url = `${window.location.origin}/campaigns/${campaign.id}`
              navigator.share ? navigator.share({ title: campaign.title, url }) : (navigator.clipboard.writeText(url), alert('Link copied!'))
            }} className="px-4 py-2.5 border-2 border-gray-100 hover:border-primary/30 text-gray-500 hover:text-primary font-bold text-xs rounded-xl transition-all">📲 Share</button>
          </div>
        )}
        {campaign.status === 'pending' && (
          <div className="mt-4 bg-amber-50 rounded-xl px-4 py-3 text-xs text-amber-700">Our team is reviewing your campaign. You will receive an email once a decision is made.</div>
        )}
        {campaign.status === 'rejected' && (
          <div className="mt-4 bg-red-50 rounded-xl px-4 py-3 text-xs text-red-600">Your campaign was not approved. Check your email for the reason, then start a new corrected campaign.</div>
        )}
      </div>
    </div>
  )
}

// ── WITHDRAW MODAL ─────────────────────────────────────────────────────────
function WithdrawModal({ available, profile, onClose }: { available: number; profile: any; onClose: () => void }) {
  const [method, setMethod] = useState<'momo' | 'bank'>(profile?.payout_method || 'momo')
  const [amount, setAmount] = useState('')
  const [step, setStep] = useState<'form' | 'confirm' | 'sent'>('form')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    // In production this calls the Hubtel payout API
    // For now simulate with a 2s delay
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    setStep('sent')
  }

  const amtNum = parseFloat(amount) || 0
  const fee = +(amtNum * 0.02 + 0.25).toFixed(2)
  const receive = +(amtNum - fee).toFixed(2)

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        {step === 'sent' ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">✅</div>
            <h3 className="font-nunito font-black text-navy text-xl mb-2">Withdrawal requested!</h3>
            <p className="text-gray-400 text-sm mb-2">Your request has been submitted. Funds will arrive within 24 hours.</p>
            <p className="text-xs text-gray-300 mb-6">You will receive an SMS confirmation when the transfer completes.</p>
            <button onClick={onClose} className="w-full py-3.5 bg-primary text-white font-nunito font-black rounded-full text-sm">Done</button>
          </div>
        ) : step === 'confirm' ? (
          <div className="p-6">
            <h3 className="font-nunito font-black text-navy text-lg mb-5">Confirm withdrawal</h3>
            <div className="bg-gray-50 rounded-2xl p-5 mb-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Amount requested</span><span className="font-bold text-navy">₵{amtNum.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Transfer fee (2% + ₵0.25)</span><span className="text-gray-500">−₵{fee}</span></div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between"><span className="font-black text-navy">You receive</span><span className="font-black text-primary text-lg">₵{receive.toFixed(2)}</span></div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between"><span className="text-gray-500">To</span>
                <span className="font-bold text-navy">
                  {method === 'momo' ? `${profile?.momo_network?.toUpperCase() || 'MoMo'} · ${profile?.momo_number || ' - '}` : `${profile?.bank_name || 'Bank'} · ${profile?.bank_account || ' - '}`}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 py-3.5 border-2 border-gray-200 text-gray-500 font-bold rounded-full text-sm">← Back</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm disabled:opacity-60 transition-all">
                {loading ? 'Processing…' : 'Confirm withdrawal →'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-nunito font-black text-navy text-lg">Withdraw funds</h3>
              <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div><div className="text-xs text-gray-400 mb-0.5">Available balance</div><div className="font-nunito font-black text-navy text-2xl">₵{available.toLocaleString()}</div></div>
              <div className="text-3xl">💰</div>
            </div>

            {/* Method selector */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {(['momo', 'bank'] as const).map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${method === m ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                  {m === 'momo' ? '📱 MoMo' : '🏦 Bank'}
                </button>
              ))}
            </div>

            {method === 'momo' && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                <div className="text-xs text-gray-400 mb-1">Sending to</div>
                <div className="font-bold text-navy">{profile?.momo_network?.toUpperCase() || 'MoMo'} · {profile?.momo_number || 'Not set'}</div>
                {!profile?.momo_number && <Link href="/dashboard/edit-profile" className="text-xs text-primary font-bold mt-1 inline-block">Set MoMo number →</Link>}
              </div>
            )}
            {method === 'bank' && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                <div className="text-xs text-gray-400 mb-1">Sending to</div>
                <div className="font-bold text-navy">{profile?.bank_name || 'Bank not set'} · {profile?.bank_account || ' - '}</div>
                {!profile?.bank_account && <Link href="/dashboard/edit-profile" className="text-xs text-primary font-bold mt-1 inline-block">Set bank details →</Link>}
              </div>
            )}

            <div className="mb-5">
              <label className="text-xs font-bold text-gray-500 block mb-2">Amount to withdraw <span className="text-red-400">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₵</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0.00" min="10" max={available}
                  className="w-full border-2 border-gray-100 focus:border-primary rounded-xl pl-8 pr-4 py-3.5 text-sm outline-none transition-all" />
              </div>
              {amtNum > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Fee: ₵{fee} · You receive: <span className="text-primary font-bold">₵{receive.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-5">
              {[available * 0.25, available * 0.5, available].map((v, i) => (
                <button key={i} onClick={() => setAmount(v.toFixed(2))}
                  className="flex-1 py-2 bg-gray-50 hover:bg-primary/5 hover:text-primary border border-gray-100 rounded-xl text-xs font-bold text-gray-500 transition-all">
                  {i === 2 ? 'All' : `${(i + 1) * 25}%`}
                </button>
              ))}
            </div>

            <button
              disabled={amtNum < 10 || amtNum > available}
              onClick={() => setStep('confirm')}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
              Continue →
            </button>
            <p className="text-xs text-gray-300 text-center mt-3">Minimum withdrawal: ₵10 · Arrives within 24 hours</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [donations, setDonations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'donations' | 'withdraw'>('overview')
  const [showWithdraw, setShowWithdraw] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)
      const [{ data: prof }, { data: camps }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('campaigns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setProfile(prof)
      const enriched = await Promise.all((camps || []).map(async (c: any) => {
        const { count } = await supabase.from('donations').select('*', { count: 'exact', head: true }).eq('campaign_id', c.id).eq('status', 'success')
        return { ...c, donor_count: count || 0 }
      }))
      setCampaigns(enriched)
      if (camps && camps.length > 0) {
        const ids = camps.map((c: any) => c.id)
        const { data: don } = await supabase.from('donations').select('*').in('campaign_id', ids).eq('status', 'success').order('created_at', { ascending: false }).limit(50)
        setDonations(don || [])
      }
      setLoading(false)
    })
  }, [])

  const totalRaised = campaigns.reduce((s, c) => s + (c.raised_amount || 0), 0)
  const totalDonors = campaigns.reduce((s, c) => s + (c.donor_count || 0), 0)
  const liveCampaigns = campaigns.filter(c => c.status === 'approved')
  const pendingCount = campaigns.filter(c => c.status === 'pending').length

  // Analytics: daily donations for the last 14 days
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const dayDons = donations.filter(don => new Date(don.created_at).toDateString() === d.toDateString())
    const value = dayDons.reduce((s, d) => s + (d.amount || 0), 0)
    return { label, value }
  })

  // Weekly totals for sparkline
  const weeklyTotals = [0,1,2,3,4,5,6,7].map(w => {
    const start = new Date(); start.setDate(start.getDate() - (7 * (7 - w) + 7))
    const end = new Date(); end.setDate(end.getDate() - (7 * (7 - w)))
    return donations.filter(d => {
      const t = new Date(d.created_at)
      return t >= start && t < end
    }).reduce((s, d) => s + (d.amount || 0), 0)
  })

  // Top campaigns by raised
  const topCampaigns = [...campaigns].sort((a, b) => (b.raised_amount || 0) - (a.raised_amount || 0)).slice(0, 3)

  // Avg donation
  const avgDonation = donations.length > 0 ? (totalRaised / donations.length).toFixed(0) : 0

  // Available for withdrawal (approved campaigns only)
  const availableBalance = liveCampaigns.reduce((s, c) => s + (c.raised_amount || 0), 0)

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  )

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-navy px-5 pt-10 pb-20">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <div className="text-white/40 text-sm mb-1">Welcome back</div>
                <h1 className="font-nunito font-black text-white text-3xl">Hey, {firstName} 👋</h1>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowWithdraw(true)}
                  className="bg-white/10 hover:bg-white/20 text-white font-nunito font-black px-5 py-2.5 rounded-full text-sm transition-all border border-white/20">
                  💰 Withdraw
                </button>
                <Link href="/create" className="bg-primary hover:bg-primary-dark text-white font-nunito font-black px-5 py-2.5 rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/30 whitespace-nowrap">
                  + New campaign
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total raised', value: `₵${totalRaised.toLocaleString()}`, sub: `from ${donations.length} donations`, trend: weeklyTotals },
                { label: 'Total donors', value: totalDonors.toLocaleString(), sub: `avg ₵${avgDonation} per donation`, trend: null },
                { label: 'Live campaigns', value: liveCampaigns.length.toString(), sub: pendingCount > 0 ? `${pendingCount} pending review` : 'All approved', trend: null },
                { label: 'Available', value: `₵${availableBalance.toLocaleString()}`, sub: 'ready to withdraw', trend: null },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-4">
                  <div className="text-white/40 text-xs mb-1">{s.label}</div>
                  <div className="font-nunito font-black text-white text-xl leading-tight">{s.value}</div>
                  <div className="text-white/30 text-xs mt-1">{s.sub}</div>
                  {s.trend && <div className="mt-2"><Sparkline values={s.trend} color="rgba(255,255,255,0.6)" /></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-5 -mt-6 pb-16">

          {/* Tabs */}
          <div className="flex gap-1 bg-white shadow-sm border border-gray-100 rounded-2xl p-1 mb-6 overflow-x-auto">
            {(['overview', 'campaigns', 'donations', 'withdraw'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-navy'}`}>
                {tab === 'overview' ? '📊 Overview' : tab === 'campaigns' ? '🚀 Campaigns' : tab === 'donations' ? '💚 Donations' : '💰 Withdraw'}
              </button>
            ))}
          </div>

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-6">

              {/* Donations chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-nunito font-black text-navy text-lg">Donations  -  last 14 days</h2>
                    <div className="text-gray-400 text-xs mt-0.5">Daily totals in GH₵</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-primary text-xl">₵{last14.reduce((s, d) => s + d.value, 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">14-day total</div>
                  </div>
                </div>
                {donations.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-gray-300 text-sm">No donations yet  -  share your campaign to start receiving</div>
                ) : (
                  <BarChart data={last14} />
                )}
              </div>

              {/* Two columns */}
              <div className="grid sm:grid-cols-2 gap-6">

                {/* Top campaigns */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-nunito font-black text-navy text-base mb-4">Top campaigns</h3>
                  {topCampaigns.length === 0 ? (
                    <div className="text-gray-300 text-sm text-center py-4">No campaigns yet</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {topCampaigns.map((c, i) => {
                        const pct = c.goal_amount ? Math.min(Math.round((c.raised_amount / c.goal_amount) * 100), 100) : 0
                        return (
                          <div key={c.id} className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-black text-primary flex-shrink-0">{i + 1}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-navy truncate">{c.title}</div>
                              <div className="h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <div className="text-xs font-black text-primary flex-shrink-0">₵{(c.raised_amount || 0).toLocaleString()}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Profile card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-nunito font-black text-navy text-base">Your profile</h3>
                    <Link href="/dashboard/edit-profile" className="text-xs text-primary font-bold hover:underline">Edit →</Link>
                  </div>
                  <div className="flex flex-col gap-3 text-sm">
                    {[
                      ['Name', profile?.full_name],
                      ['Phone', profile?.phone],
                      ['MoMo number', profile?.momo_number],
                      ['Payout method', profile?.payout_method ? (profile.payout_method === 'momo' ? '📱 Mobile Money' : '🏦 Bank') : null],
                      ['Location', profile?.location],
                    ].map(([label, val]) => (
                      <div key={label as string} className="flex justify-between">
                        <span className="text-gray-400">{label}</span>
                        <span className={`font-semibold ${val ? 'text-navy' : 'text-gray-200'}`}>{val || 'Not set'}</span>
                      </div>
                    ))}
                  </div>
                  {(!profile?.momo_number && !profile?.bank_account) && (
                    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-xs text-amber-700">
                      ⚠️ Set your payout details before withdrawing funds.
                    </div>
                  )}
                </div>
              </div>

              {/* Donation breakdown by campaign */}
              {campaigns.length > 1 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <h3 className="font-nunito font-black text-navy text-base mb-4">Raised per campaign</h3>
                  <div className="flex flex-col gap-3">
                    {campaigns.map(c => {
                      const share = totalRaised > 0 ? ((c.raised_amount || 0) / totalRaised * 100) : 0
                      return (
                        <div key={c.id} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-navy truncate">{c.title}</span>
                              <span className="text-primary font-black ml-2">₵{(c.raised_amount || 0).toLocaleString()}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${share}%` }} />
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">{share.toFixed(0)}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CAMPAIGNS TAB ── */}
          {activeTab === 'campaigns' && (
            <div>
              {campaigns.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <div className="text-5xl mb-4">🚀</div>
                  <h3 className="font-nunito font-black text-navy text-xl mb-2">No campaigns yet</h3>
                  <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Start your first campaign and begin raising funds from people who care.</p>
                  <Link href="/create" className="inline-block bg-primary text-white font-nunito font-black px-8 py-3.5 rounded-full text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20">Start your first campaign →</Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
                </div>
              )}
            </div>
          )}

          {/* ── DONATIONS TAB ── */}
          {activeTab === 'donations' && (
            <div className="flex flex-col gap-4">
              {/* Chart */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-nunito font-black text-navy text-base mb-4">Daily donations  -  last 14 days</h3>
                {donations.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-gray-300 text-sm">No donations yet</div>
                ) : <BarChart data={last14} />}
              </div>
              {/* List */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <h3 className="font-nunito font-black text-navy text-base">All donations ({donations.length})</h3>
                </div>
                {donations.length === 0 ? (
                  <div className="p-8 text-center text-gray-300 text-sm">No donations received yet</div>
                ) : (
                  donations.map((d, i) => (
                    <div key={d.id} className={`flex items-center gap-4 px-5 py-4 ${i < donations.length - 1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm flex-shrink-0">{d.anonymous ? '🫥' : '💚'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-navy text-sm">{d.anonymous ? 'Anonymous donor' : (d.donor_name || 'Someone')}</div>
                        <div className="text-xs text-gray-400 truncate">{campaigns.find(c => c.id === d.campaign_id)?.title || 'Campaign'}</div>
                        {d.message && <div className="text-xs text-gray-500 italic mt-0.5 truncate">"{d.message}"</div>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-primary text-sm">₵{(d.amount || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{new Date(d.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── WITHDRAW TAB ── */}
          {activeTab === 'withdraw' && (
            <div className="flex flex-col gap-4 max-w-lg">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-nunito font-black text-navy text-xl mb-1">Withdraw funds</h2>
                <p className="text-gray-400 text-sm mb-6">Funds from approved campaigns are available to withdraw at any time.</p>

                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Available balance</div>
                    <div className="font-nunito font-black text-navy text-3xl">₵{availableBalance.toLocaleString()}</div>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>

                {/* Payout details */}
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Payout method</span>
                    <span className="font-bold text-navy">{profile?.payout_method === 'bank' ? '🏦 Bank transfer' : '📱 Mobile Money'}</span>
                  </div>
                  {profile?.momo_number && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">MoMo number</span>
                      <span className="font-bold text-navy">{profile.momo_network?.toUpperCase() || ''} · {profile.momo_number}</span>
                    </div>
                  )}
                  {profile?.bank_account && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Bank account</span>
                      <span className="font-bold text-navy">{profile.bank_name} · {profile.bank_account}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Transfer fee</span>
                    <span className="text-gray-500">2% + ₵0.25 per withdrawal</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Arrival time</span>
                    <span className="text-gray-500">Within 24 hours</span>
                  </div>
                </div>

                {(!profile?.momo_number && !profile?.bank_account) ? (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-4">
                    <div className="font-bold text-amber-800 text-sm mb-1">⚠️ Payout details not set</div>
                    <div className="text-amber-700 text-xs mb-3">You need to add your MoMo number or bank account before you can withdraw.</div>
                    <Link href="/dashboard/edit-profile" className="inline-block bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-full">Set payout details →</Link>
                  </div>
                ) : availableBalance === 0 ? (
                  <div className="bg-gray-50 rounded-2xl p-4 text-center text-gray-400 text-sm">No funds available yet. Share your campaign to receive donations.</div>
                ) : (
                  <button onClick={() => setShowWithdraw(true)}
                    className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
                    Withdraw ₵{availableBalance.toLocaleString()} →
                  </button>
                )}
                <p className="text-xs text-gray-300 text-center mt-3">Minimum withdrawal: ₵10</p>
              </div>
            </div>
          )}

        </div>
      </main>

      {showWithdraw && <WithdrawModal available={availableBalance} profile={profile} onClose={() => setShowWithdraw(false)} />}

      <Footer />
    </>
  )
}
