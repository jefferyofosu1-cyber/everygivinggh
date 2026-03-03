'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import type { Campaign } from '@/types'

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, raised: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', data.user.id).single()
      if (!profile?.is_admin) { toast.error('Admin access required'); router.push('/'); return }
      fetchData()
    })
  }, [])

  useEffect(() => { if (!loading) fetchData() }, [filter])

  const fetchData = async () => {
    const { data: c } = await supabase.from('campaigns').select('*, profiles(full_name, phone)')
      .eq('status', filter).order('created_at', { ascending: false })
    const { data: all } = await supabase.from('campaigns').select('status, raised_amount')
    const pending = all?.filter(x => x.status === 'pending').length || 0
    const approved = all?.filter(x => x.status === 'approved').length || 0
    const raised = all?.reduce((sum, x) => sum + (x.raised_amount || 0), 0) || 0
    setCampaigns(c || [])
    setStats({ total: all?.length || 0, pending, approved, raised })
    setLoading(false)
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('campaigns').update({ status, verified: status === 'approved' }).eq('id', id)
    if (error) { toast.error('Failed to update'); return }
    toast.success(status === 'approved' ? '✅ Campaign approved!' : '❌ Campaign rejected')
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-nunito font-black text-navy text-2xl mb-1">Admin Panel</h1>
            <p className="text-gray-400 text-sm">Review and manage campaign submissions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Pending review', value: stats.pending, color: 'text-amber-500', icon: '⏳' },
            { label: 'Approved', value: stats.approved, color: 'text-primary', icon: '✅' },
            { label: 'Total campaigns', value: stats.total, color: 'text-navy', icon: '📋' },
            { label: 'Total raised', value: `₵${stats.raised.toLocaleString()}`, color: 'text-primary', icon: '💰' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className={`font-nunito font-black text-xl ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          {['pending', 'approved', 'rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === f ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>
              {f} {f === 'pending' && stats.pending > 0 && <span className="ml-1 bg-amber-400 text-white text-xs rounded-full px-1.5 py-0.5">{stats.pending}</span>}
            </button>
          ))}
        </div>

        {/* Campaign list */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-400 text-sm">No {filter} campaigns</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {campaigns.map(c => {
              const pct = Math.min(Math.round((c.raised_amount / c.goal_amount) * 100), 100)
              return (
                <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="font-nunito font-extrabold text-navy text-sm mb-1 line-clamp-1">{c.title}</h3>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                        <span>👤 {(c as any).profiles?.full_name}</span>
                        <span>📱 {(c as any).profiles?.phone}</span>
                        <span className="capitalize">📁 {c.category}</span>
                        <span>🎯 ₵{c.goal_amount.toLocaleString()}</span>
                        <span>🏷️ {c.verification_tier}</span>
                        <span>📅 {new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <a href={`/campaigns/${c.id}`} target="_blank" className="text-xs font-bold text-primary hover:underline flex-shrink-0">View →</a>
                  </div>

                  {c.story && (
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3 bg-gray-50 rounded-lg p-3">{c.story}</p>
                  )}

                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>

                  {filter === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(c.id, 'approved')}
                        className="flex-1 py-2 bg-primary-light border border-primary/20 text-primary-dark font-bold text-sm rounded-xl hover:bg-primary hover:text-white transition-all">
                        ✅ Approve campaign
                      </button>
                      <button onClick={() => updateStatus(c.id, 'rejected')}
                        className="flex-1 py-2 bg-red-50 border border-red-200 text-red-600 font-bold text-sm rounded-xl hover:bg-red-500 hover:text-white transition-all">
                        ❌ Reject campaign
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
