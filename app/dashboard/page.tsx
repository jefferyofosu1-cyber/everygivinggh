'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Campaign, Donation } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'campaigns' | 'donations'>('campaigns')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      fetchData(data.user.id)
    })
  }, [])

  const fetchData = async (userId: string) => {
    const { data: c } = await supabase.from('campaigns').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    const campaignIds = c?.map(x => x.id) || []
    let d: Donation[] = []
    if (campaignIds.length > 0) {
      const { data: don } = await supabase.from('donations').select('*').in('campaign_id', campaignIds).eq('status', 'success').order('created_at', { ascending: false })
      d = don || []
    }
    setCampaigns(c || [])
    setDonations(d)
    setLoading(false)
  }

  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised_amount, 0)
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goal_amount, 0)

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-primary-light text-primary-dark border-primary/20',
    rejected: 'bg-red-50 text-red-600 border-red-200',
  }
  const STATUS_LABEL: Record<string, string> = {
    pending: '⏳ Under review',
    approved: '✅ Live',
    rejected: '❌ Rejected',
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-bounce">💚</div>
      </div>
    </>
  )

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="font-nunito font-black text-navy text-2xl mb-1">My Dashboard</h1>
            <p className="text-gray-400 text-sm">{user?.user_metadata?.full_name || user?.email}</p>
          </div>
          <Link href="/create" className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl text-sm transition-colors shadow">
            + New campaign
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Campaigns', value: campaigns.length, icon: '📋' },
            { label: 'Total raised', value: `₵${totalRaised.toLocaleString()}`, icon: '💰' },
            { label: 'Total goal', value: `₵${totalGoal.toLocaleString()}`, icon: '🎯' },
            { label: 'Donors', value: donations.length, icon: '💚' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="font-nunito font-black text-navy text-xl">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setTab('campaigns')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'campaigns' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>
            My campaigns ({campaigns.length})
          </button>
          <button onClick={() => setTab('donations')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'donations' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>
            Donations received ({donations.length})
          </button>
        </div>

        {/* Campaigns tab */}
        {tab === 'campaigns' && (
          <div className="flex flex-col gap-4">
            {campaigns.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                <div className="text-4xl mb-3">🌱</div>
                <h3 className="font-nunito font-black text-navy mb-2">No campaigns yet</h3>
                <p className="text-gray-400 text-sm mb-5">Start your first fundraiser and raise money for your cause</p>
                <Link href="/create" className="px-6 py-3 bg-primary text-white font-bold rounded-full text-sm hover:bg-primary-dark transition-colors">
                  Create your first campaign →
                </Link>
              </div>
            ) : campaigns.map(c => {
              const pct = Math.min(Math.round((c.raised_amount / c.goal_amount) * 100), 100)
              return (
                <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <h3 className="font-nunito font-extrabold text-navy text-sm leading-snug mb-1 line-clamp-1">{c.title}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                        <span className="text-xs text-gray-400 capitalize">{c.category}</span>
                      </div>
                    </div>
                    <Link href={`/campaigns/${c.id}`} className="text-xs font-bold text-primary hover:underline flex-shrink-0">View →</Link>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-navy">₵{c.raised_amount.toLocaleString()} raised</span>
                    <span className="text-gray-400">of ₵{c.goal_amount.toLocaleString()} · {pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Donations tab */}
        {tab === 'donations' && (
          <div className="flex flex-col gap-3">
            {donations.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
                <div className="text-4xl mb-3">💚</div>
                <p className="text-gray-400 text-sm">No donations yet — share your campaign to get your first donor!</p>
              </div>
            ) : donations.map(d => (
              <div key={d.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-navy">{d.donor_name}</div>
                  {d.message && <div className="text-xs text-gray-400 italic mt-0.5">"{d.message}"</div>}
                  <div className="text-xs text-gray-300 mt-1">{new Date(d.created_at).toLocaleDateString()}</div>
                </div>
                <div className="font-nunito font-black text-primary">₵{d.amount.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
