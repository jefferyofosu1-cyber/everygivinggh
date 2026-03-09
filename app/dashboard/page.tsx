'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  pending:  { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Under review', icon: '🔍' },
  approved: { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Live',          icon: '✅' },
  rejected: { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Not approved',  icon: '❌' },
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
      <div className="h-2.5 bg-primary rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
    </div>
  )
}

function CampaignCard({ campaign, onShare }: { campaign: any; onShare: (c: any) => void }) {
  const pct = campaign.goal_amount ? Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100) : 0
  const status = STATUS_STYLE[campaign.status] || STATUS_STYLE.pending
  const isLive = campaign.status === 'approved'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Status bar */}
      <div className={`${status.bg} px-5 py-3 flex items-center justify-between`}>
        <div className={`flex items-center gap-2 text-sm font-bold ${status.text}`}>
          <span>{status.icon}</span>
          <span>{status.label}</span>
        </div>
        {isLive && (
          <Link href={`/campaigns/${campaign.id}`} target="_blank"
            className="text-xs text-primary font-bold hover:underline">
            View live →
          </Link>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-nunito font-black text-navy text-lg leading-tight mb-1">{campaign.title}</h3>
            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-semibold">{campaign.category}</span>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-nunito font-black text-primary text-xl">₵{(campaign.raised_amount || 0).toLocaleString()}</div>
            <div className="text-gray-400 text-xs">of ₵{(campaign.goal_amount || 0).toLocaleString()}</div>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar pct={pct} />
        <div className="flex items-center justify-between mt-2 mb-4">
          <span className="text-xs text-gray-400">{pct}% funded</span>
          <span className="text-xs text-gray-400">{campaign.donors_count || 0} donors</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Raised', value: `₵${(campaign.raised_amount || 0).toLocaleString()}` },
            { label: 'Goal', value: `₵${(campaign.goal_amount || 0).toLocaleString()}` },
            { label: 'Tier', value: campaign.verification_tier ? campaign.verification_tier.charAt(0).toUpperCase() + campaign.verification_tier.slice(1) : 'Basic' },
          ].map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="font-nunito font-black text-navy text-sm">{s.value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isLive && (
            <button onClick={() => onShare(campaign)}
              className="flex-1 py-2.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-sm shadow-primary/20">
              📤 Share campaign
            </button>
          )}
          {campaign.status === 'rejected' && (
            <Link href="/create"
              className="flex-1 py-2.5 bg-navy text-white font-nunito font-black rounded-xl text-sm text-center hover:-translate-y-0.5 transition-all">
              🔄 Resubmit
            </Link>
          )}
          {campaign.status === 'pending' && (
            <div className="flex-1 py-2.5 bg-amber-50 text-amber-600 font-bold rounded-xl text-sm text-center border border-amber-100">
              ⏳ Awaiting review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ShareModal({ campaign, onClose }: { campaign: any; onClose: () => void }) {
  const url = `https://everygiving.org/campaigns/${campaign.id}`
  const msg = encodeURIComponent(`Hi! I'm raising money for "${campaign.title}" on EveryGiving — Ghana's verified crowdfunding platform. Every fundraiser is identity verified. Please donate here: ${url}`)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-nunito font-black text-navy text-lg">Share your campaign</h3>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-2xl leading-none">×</button>
        </div>

        <p className="text-gray-500 text-sm mb-4">Share your verified campaign link so donors can give with confidence.</p>

        {/* Link copy */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-500 font-mono truncate">{url}</div>
          <button onClick={copy}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-500 text-white' : 'bg-navy text-white hover:bg-navy/90'}`}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex flex-col gap-2">
          <a href={`https://wa.me/?text=${msg}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl px-4 py-3 text-sm transition-all">
            <span className="text-xl">📱</span> Share on WhatsApp
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-4 py-3 text-sm transition-all">
            <span className="text-xl">📘</span> Share on Facebook
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${msg}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl px-4 py-3 text-sm transition-all">
            <span className="text-xl">🐦</span> Share on X / Twitter
          </a>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [shareTarget, setShareTarget] = useState<any>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const [{ data: prof }, { data: camps }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('campaigns')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setProfile(prof)
      setCampaigns(camps || [])
      setLoading(false)
    })
  }, [router])

  const signOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <div className="text-gray-400 text-sm">Loading your dashboard…</div>
        </div>
      </div>
    </>
  )

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const totalRaised = campaigns.reduce((sum, c) => sum + (c.raised_amount || 0), 0)
  const liveCampaigns = campaigns.filter(c => c.status === 'approved').length
  const pendingCampaigns = campaigns.filter(c => c.status === 'pending').length

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-navy pt-10 pb-16 px-5">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="text-primary text-sm font-bold mb-1">Your dashboard</div>
                <h1 className="font-nunito font-black text-white text-3xl mb-1">
                  Hello, {firstName} 👋
                </h1>
                <p className="text-white/40 text-sm">{profile?.email || user?.email}</p>
              </div>
              <button onClick={signOut} disabled={signingOut}
                className="text-white/30 hover:text-white/60 text-sm font-semibold transition-colors mt-1">
                {signingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { label: 'Total raised', value: `₵${totalRaised.toLocaleString()}` },
                { label: 'Live campaigns', value: liveCampaigns },
                { label: 'Under review', value: pendingCampaigns },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-4 text-center">
                  <div className="font-nunito font-black text-white text-2xl">{s.value}</div>
                  <div className="text-white/40 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-5 -mt-6 pb-16">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-nunito font-black text-navy text-base">Your profile</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[
                { label: 'Full name', value: profile?.full_name || '—' },
                { label: 'Phone / MoMo', value: profile?.phone || '—' },
                { label: 'Location', value: profile?.location || '—' },
                { label: 'Email', value: profile?.email || user?.email || '—' },
              ].map((f, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-1">{f.label}</div>
                  <div className="font-semibold text-navy text-sm truncate">{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaigns */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-nunito font-black text-navy text-xl">Your campaigns</h2>
            <Link href="/create"
              className="bg-primary hover:bg-primary-dark text-white font-nunito font-black text-sm px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5 shadow-sm shadow-primary/20">
              + New campaign
            </Link>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="font-nunito font-black text-navy text-xl mb-2">No campaigns yet</h3>
              <p className="text-gray-400 text-sm mb-6">Start your first campaign in minutes. It is free and takes under 15 minutes to complete.</p>
              <Link href="/create"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-3.5 rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
                Start a campaign →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {campaigns.map(c => (
                <CampaignCard key={c.id} campaign={c} onShare={setShareTarget} />
              ))}
            </div>
          )}

          {/* Help */}
          <div className="mt-8 bg-navy/5 border border-navy/10 rounded-2xl p-5 flex items-start gap-4">
            <div className="text-2xl">💬</div>
            <div>
              <div className="font-bold text-navy text-sm mb-1">Need help?</div>
              <p className="text-gray-500 text-xs leading-relaxed">
                Email us at{' '}
                <a href="mailto:business@everygiving.org" className="text-primary font-semibold">business@everygiving.org</a>
                {' '}and we will get back to you within 24 hours. We review every campaign personally.
              </p>
            </div>
          </div>

        </div>
      </main>

      {shareTarget && <ShareModal campaign={shareTarget} onClose={() => setShareTarget(null)} />}

      <Footer />
    </>
  )
}
