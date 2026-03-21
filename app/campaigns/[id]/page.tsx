import Link from 'next/link'
import { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DonationForm from '@/components/campaigns/DonationForm'
import CampaignShare from '@/components/campaigns/CampaignShare'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { Campaign } from '@/types'

export const dynamic = 'force-dynamic'

const EMOJI: Record<string, string> = {
  medical: '🏥', emergency: '🆘', education: '🎓', charity: '🤲', faith: '⛪',
  community: '🏘', environment: '🌿', business: '💼', family: '👨‍👩',
  sports: '⚽', events: '🎉', wishes: '🌟', competition: '🏆', travel: '✈️', volunteer: '🙌',
}

async function getCampaign(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, profiles(full_name, phone)')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error(`[getCampaign] Error fetching campaign ${id}:`, error)
    return null
  }
  
  if (!data) {
    console.warn(`[getCampaign] No data found for campaign ${id}`)
    return null
  }

  return data as Campaign
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const campaign = await getCampaign(params.id)
  if (!campaign) return { title: 'Campaign Not Found | EveryGiving' }

  return {
    title: `${campaign.title} | EveryGiving`,
    description: campaign.story?.substring(0, 160),
    openGraph: {
      title: campaign.title,
      description: campaign.story?.substring(0, 160),
      images: campaign.image_url ? [{ url: campaign.image_url }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description: campaign.story?.substring(0, 160),
      images: campaign.image_url ? [campaign.image_url] : [],
    }
  }
}

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const campaign = await getCampaign(params.id)

  if (!campaign) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-surface-alt flex flex-col items-center justify-center p-5" style={{ background: 'var(--surface-alt)' }}>
          <div className="text-6xl mb-4">🔦</div>
          <h1 className="font-nunito font-black text-navy text-2xl mb-2" style={{ color: 'var(--navy)' }}>Campaign not found</h1>
          <p className="text-muted mb-2 text-center text-xs font-mono bg-border p-2 rounded" style={{ color: 'var(--text-muted)', background: 'var(--border)' }}>Looking for ID: {params.id}</p>
          <p className="text-muted mb-6 text-center" style={{ color: 'var(--text-muted)' }}>The campaign you are looking for might have been closed or moved.</p>
          <Link href="/campaigns" className="bg-primary text-white font-bold px-6 py-3 rounded-full">Explore other campaigns</Link>
        </div>
        <Footer />
      </>
    )
  }

  const raised = campaign.raised_amount || 0
  const goal = campaign.goal_amount || 0
  const pct = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0
  const emoji = campaign.category ? EMOJI[campaign.category.toLowerCase()] || '💚' : '💚'
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/campaigns/${campaign.id}`
  const shareText = `Help support "${campaign.title}" on EveryGiving 💚`

  return (
    <>
      <Navbar />
      <main className="bg-surface-alt min-h-screen" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-6xl mx-auto px-5 py-10">
          <Link href="/campaigns" className="text-muted text-sm hover:text-primary transition-colors mb-6 inline-flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-muted)' }}>
            <span className="text-lg">←</span> Back to campaigns
          </Link>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* ── LEFT: campaign details ── */}
            <div className="md:col-span-8">
              {/* Campaign image / emoji */}
              <div className="aspect-video bg-surface rounded-3xl flex items-center justify-center text-8xl mb-8 border border-border shadow-sm relative overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {campaign.image_url ? (
                  <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
                ) : (
                  <span>{emoji}</span>
                )}
                {campaign.verified && (
                  <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg shadow-primary/20">
                    <span className="text-base text-white">✓</span> Verified
                  </div>
                )}
              </div>

              <div className="bg-surface rounded-3xl border border-border shadow-sm p-8 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary-light px-4 py-1.5 rounded-full">{campaign.category}</span>
                  {campaign.verified && <span className="text-xs font-bold text-primary flex items-center gap-1">Identity verified</span>}
                </div>
                <h1 className="font-nunito font-black text-navy text-3xl md:text-4xl mb-6 leading-tight select-none" style={{ color: 'var(--navy)' }}>
                  {campaign.title}
                </h1>
                
                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border" style={{ borderBottomColor: 'var(--border)' }}>
                  <div className="w-12 h-12 bg-surface-alt rounded-full flex items-center justify-center text-xl" style={{ background: 'var(--surface-alt)' }}>👤</div>
                  <div>
                    <div className="text-xs text-muted font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>Campaign Organiser</div>
                    <div className="font-nunito font-black text-navy" style={{ color: 'var(--navy)' }}>{campaign.profiles?.full_name || 'Anonymous'}</div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none dark:prose-invert">
                  <p className="text-main leading-relaxed text-lg whitespace-pre-line" style={{ color: 'var(--text-main)' }}>{campaign.story}</p>
                </div>
              </div>

              {/* Share */}
              <div className="bg-surface rounded-3xl border border-border shadow-sm p-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="font-nunito font-black text-navy text-xl mb-6" style={{ color: 'var(--navy)' }}>Spread the word</div>
                <CampaignShare shareUrl={shareUrl} shareText={shareText} />
              </div>
            </div>

            {/* ── RIGHT: progress + donate ── */}
            <div className="md:col-span-4 sticky top-10">
              <div className="bg-surface rounded-3xl border border-border shadow-sm p-8 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-nunito font-black text-primary text-4xl" style={{ color: 'var(--primary)' }}>₵{(campaign.raised_amount || 0).toLocaleString()}</span>
                    <span className="text-muted text-sm font-bold" style={{ color: 'var(--text-muted)' }}>raised</span>
                  </div>
                  <div className="text-muted text-sm mb-4 font-medium italic" style={{ color: 'var(--text-muted)' }}>Target goal: ₵{(campaign.goal_amount || 0).toLocaleString()}</div>
                  <div className="h-3 bg-border rounded-full overflow-hidden mb-2 shadow-inner" style={{ background: 'var(--border)' }}>
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: 'var(--primary)' }} />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary font-black" style={{ color: 'var(--primary)' }}>{pct}% funded</span>
                    <span className="text-muted font-bold" style={{ color: 'var(--text-muted)' }}>{campaign.donations?.length || 0} donations</span>
                  </div>
                </div>

                <DonationForm campaign={campaign} />
              </div>

              <div className="bg-navy rounded-3xl p-8 text-white">
                <div className="text-2xl mb-4">🛡️</div>
                <h3 className="font-nunito font-black text-lg mb-2">Our Safety Policy</h3>
                <p className="text-white/60 text-xs leading-relaxed mb-6">
                  EveryGiving identity-verifies fundraisers using the Ghana Card. We use industry-standard encryption to protect your data and payments.
                </p>
                <Link href="/trust" className="text-primary text-xs font-black hover:underline uppercase tracking-widest">Learn more →</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
