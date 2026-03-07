'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

const CATEGORIES = ['All', 'Medical', 'Education', 'Church & Faith', 'Emergency', 'Business', 'Memorial', 'Community', 'Events']

const EMOJI: Record<string, string> = {
  Medical: '🏥', Education: '🎓', 'Church & Faith': '⛪', Emergency: '🆘',
  Business: '💼', Memorial: '🕊', Community: '🏘', Events: '🎉', Other: '💚',
}

function CampaignCard({ campaign }: { campaign: any }) {
  const pct = campaign.goal_amount ? Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100) : 0
  return (
    <Link href={`/campaigns/${campaign.id}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group">
      <div className="h-40 bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center text-5xl relative">
        {EMOJI[campaign.category] || '💚'}
        {campaign.verified && (
          <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">✓ Verified</div>
        )}
      </div>
      <div className="p-5">
        <div className="font-nunito font-black text-navy text-sm mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-snug">{campaign.title}</div>
        <div className="text-gray-400 text-xs mb-4 line-clamp-2 leading-relaxed">{campaign.story?.substring(0, 100)}…</div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-bold text-navy">₵{(campaign.raised_amount || 0).toLocaleString()} raised</span>
          <span className="text-primary font-bold">{pct}%</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">Goal: ₵{(campaign.goal_amount || 0).toLocaleString()}</div>
      </div>
    </Link>
  )
}

// Placeholder cards for when DB is empty
function PlaceholderCard({ i }: { i: number }) {
  const examples = [
    { title: 'Help Ama pay for her kidney surgery', category: 'Medical', raised: 3200, goal: 8000 },
    { title: "Kofi's University Fees Appeal", category: 'Education', raised: 1500, goal: 5000 },
    { title: 'New Roof for St. Peter\'s Church Kumasi', category: 'Church & Faith', raised: 12000, goal: 30000 },
    { title: 'Emergency funds for flood victims in Accra', category: 'Emergency', raised: 5600, goal: 10000 },
    { title: 'Start Abena\'s seamstress business', category: 'Business', raised: 800, goal: 2000 },
    { title: 'Funeral and burial support for Kwesi\'s family', category: 'Memorial', raised: 4200, goal: 6000 },
  ]
  const c = examples[i % examples.length]
  const pct = Math.round((c.raised / c.goal) * 100)
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-40 bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center text-5xl relative">
        {EMOJI[c.category] || '💚'}
        <div className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">✓ Verified</div>
      </div>
      <div className="p-5">
        <div className="font-nunito font-black text-navy text-sm mb-1.5 line-clamp-2 leading-snug">{c.title}</div>
        <div className="text-gray-400 text-xs mb-4">Example campaign</div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="font-bold text-navy">₵{c.raised.toLocaleString()} raised</span>
          <span className="text-primary font-bold">{pct}%</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">Goal: ₵{c.goal.toLocaleString()}</div>
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let query = supabase.from('campaigns').select('*').order('created_at', { ascending: false })
    supabase.from('campaigns').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        setCampaigns(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = campaigns.filter(c => {
    const matchCat = category === 'All' || c.category === category
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <>
      <Navbar />
      <main>

        {/* Header */}
        <section className="bg-navy relative overflow-hidden py-16">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-4xl mx-auto px-5 text-center">
            <h1 className="font-nunito font-black text-white text-3xl md:text-5xl tracking-tight mb-4" style={{ letterSpacing: -1 }}>
              Browse campaigns
            </h1>
            <p className="text-white/40 text-sm mb-8">All verified fundraisers on Every Giving.</p>
            <div className="relative max-w-lg mx-auto">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Search campaigns…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm pl-11 pr-5 py-4 rounded-full outline-none focus:border-primary/50 transition-all" />
            </div>
          </div>
        </section>

        {/* Category filter */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10 overflow-x-auto">
          <div className="max-w-5xl mx-auto px-5 py-3 flex gap-2 min-w-max">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${category === cat ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {cat !== 'All' && EMOJI[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-5xl mx-auto px-5">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(c => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            ) : campaigns.length === 0 ? (
              // No campaigns in DB yet — show placeholders
              <div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-center text-sm text-amber-700">
                  <strong>Coming soon</strong> — No campaigns live yet. Here's a preview of what campaigns will look like.
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => <PlaceholderCard key={i} i={i} />)}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-nunito font-black text-navy text-xl mb-2">No campaigns found</div>
                <p className="text-gray-400 text-sm mb-5">Try a different search term or category.</p>
                <button onClick={() => { setSearch(''); setCategory('All') }}
                  className="bg-primary text-white font-nunito font-black text-sm px-6 py-3 rounded-full">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-5 text-center">
            <div className="font-nunito font-black text-navy text-2xl mb-2">Need to raise money?</div>
            <p className="text-gray-400 text-sm mb-6">Start a verified campaign in under 15 minutes. 0% platform fee.</p>
            <Link href="/create"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-9 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/25 text-sm">
              Start your campaign →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
