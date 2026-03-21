import Link from 'next/link'
import { Suspense } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CampaignCard from '@/components/ui/CampaignCard'
import CampaignFilters from '@/components/campaigns/CampaignFilters'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Campaign } from '@/types'

export const dynamic = 'force-dynamic'

async function getCampaigns(searchParams: { category?: string; q?: string }) {
  const supabase = await createServerSupabaseClient()
  
  let query = supabase
    .from('campaigns')
    .select('*, profiles(full_name, phone)')
    .eq('status', 'approved') // Changed from 'live' to match HomePage
    .order('created_at', { ascending: false })

  if (searchParams.category && searchParams.category !== 'All') {
    query = query.eq('category', searchParams.category)
  }

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error loading campaigns:', error)
    return { campaigns: [], error: error.message }
  }

  if (data) {
    console.log(`[getCampaigns] Loaded ${data.length} campaigns. IDs:`, data.map(c => c.id))
  }

  return { campaigns: data as Campaign[] || [], error: null }
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const { campaigns, error } = await getCampaigns(searchParams)

  return (
    <>
      <Navbar />
      <main>
        <Suspense fallback={<div className="h-40 bg-navy animate-pulse" />}>
          <CampaignFilters 
            initialCategory={searchParams.category} 
            initialSearch={searchParams.q} 
          />
        </Suspense>

        <section className="py-12 bg-surface-alt min-h-[400px]" style={{ background: 'var(--surface-alt)' }}>
          <div className="max-w-5xl mx-auto px-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-center text-sm text-red-700">
                Could not load campaigns right now. {error}
              </div>
            )}

            {campaigns.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {campaigns.map(c => (
                  <CampaignCard key={c.id} campaign={c} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-nunito font-black text-navy text-xl mb-2" style={{ color: 'var(--navy)' }}>No campaigns found</div>
                <p className="text-muted text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Try a different search or category.</p>
                <Link 
                  href="/campaigns"
                  className="inline-block bg-primary text-white font-nunito font-black text-sm px-6 py-3 rounded-full shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 bg-surface border-t border-border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="max-w-3xl mx-auto px-5 text-center">
            <div className="font-nunito font-black text-navy text-2xl mb-2" style={{ color: 'var(--navy)' }}>Need to raise money?</div>
            <p className="text-muted text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Start a verified campaign in under 15 minutes. 0% platform fee.</p>
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
