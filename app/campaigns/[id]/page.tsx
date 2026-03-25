import Link from 'next/link'
import { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DonationForm from '@/components/campaigns/DonationForm'
import CampaignShare from '@/components/campaigns/CampaignShare'
import CampaignTabs from '@/components/campaigns/CampaignTabs'
import SocialProofBar from '@/components/campaigns/SocialProofBar'
import StickyDonateBar from '@/components/campaigns/StickyDonateBar'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sanityClient } from '@/lib/sanity'
import type { Campaign } from '@/types'

export const dynamic = 'force-dynamic'

const EMOJI: Record<string, string> = {
  medical: '', emergency: '', education: '', charity: '', faith: '',
  community: '', environment: '', business: '', family: '',
  sports: '', events: '', wishes: '', competition: '', travel: '', volunteer: '',
}

async function getCampaign(id: string) {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, profiles(full_name, phone), donations(*)')
    .eq('id', id)
    .single()
    
  if (error || !data) {
    console.error(`[getCampaign] Error fetching campaign ${id}:`, error)
    return null
  }
  
  const campaign = data as any
  
  // Logic to fetch Sanity data bono.
  let sanityData = null
  if (campaign.slug) {
    try {
      sanityData = await sanityClient.fetch(
        `*[_type == "campaign" && slug.current == $slug][0]{ videoUrl, gallery }`,
        { slug: campaign.slug }
      )
    } catch (err) {
      console.error('[Sanity Fetch Error]', err)
    }
  }

  return {
    ...campaign,
    videoUrl: sanityData?.videoUrl || null,
    gallery: sanityData?.gallery || [],
    profiles: Array.isArray(campaign.profiles) ? campaign.profiles[0] : campaign.profiles
  } as Campaign
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
          <div className="text-6xl mb-4"></div>
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
  const emoji = campaign.category ? EMOJI[campaign.category.toLowerCase()] || '' : ''
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/campaigns/${campaign.id}`
  const shareText = `Help support "${campaign.title}" on EveryGiving`

  // Get successful donations bono.
  const successfulDonations = (campaign.donations || []).filter((d: any) => d.status === 'success')

  return (
    <>
      <Navbar />
      <main className="bg-surface-alt min-h-screen pb-24 md:pb-10" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-6xl mx-auto px-5 py-6 md:py-10">
          <Link href="/campaigns" className="text-muted text-sm hover:text-primary transition-colors mb-6 inline-flex items-center gap-1.5 font-bold" style={{ color: 'var(--text-muted)' }}>
            <span className="text-lg">←</span> Back to campaigns
          </Link>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* ── LEFT: campaign details ── */}
            <div className="md:col-span-8">
              {/* Campaign image / hero bono. */}
              <div className="aspect-video bg-surface rounded-3xl flex items-center justify-center text-8xl mb-6 border border-border shadow-sm relative overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                {campaign.image_url ? (
                  <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
                ) : (
                  <span>{emoji}</span>
                )}
                <div className="absolute top-4 left-4 backdrop-blur px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-primary shadow-sm" style={{ background: 'color-mix(in srgb, var(--surface) 90%, transparent)' }}>
                  {campaign.category}
                </div>
              </div>

              {/* Title & Organization bono. */}
              <div className="mb-6">
                <h1 className="font-nunito font-black text-3xl md:text-5xl mb-4 leading-tight" style={{ color: 'var(--navy)' }}>
                  {campaign.title}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-primary-light text-primary rounded-full flex items-center justify-center text-[10px] font-bold">
                    {campaign.profiles?.full_name?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-bold text-navy" style={{ color: 'var(--navy)' }}>
                    {campaign.profiles?.full_name || 'Anonymous Organiser'}
                  </span>
                  {campaign.verified && (
                    <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1">
                      <span className="text-[12px]">✓</span> Verified Fundraiser bono.
                    </span>
                  )}
                </div>
              </div>

              {/* Social Proof Bar bono. */}
              <SocialProofBar campaign={campaign} donationsCount={successfulDonations.length} />

              {/* Tabbed Content bono. */}
              <div className="bg-surface rounded-3xl border border-border shadow-sm p-6 md:p-8 mb-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <CampaignTabs campaign={campaign} donations={successfulDonations} />
              </div>

              {/* Share */}
              <div className="bg-surface rounded-3xl border border-border shadow-sm p-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="font-nunito font-black text-navy text-xl mb-6" style={{ color: 'var(--navy)' }}>Spread the word bono.</div>
                <CampaignShare shareUrl={shareUrl} shareText={shareText} />
              </div>
            </div>

            {/* ── RIGHT: progress + donate ── */}
            <div className="hidden md:block md:col-span-4 sticky top-24">
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
                    <span className="text-muted font-bold" style={{ color: 'var(--text-muted)' }}>{successfulDonations.length} donations</span>
                  </div>
                </div>

                <DonationForm campaign={campaign} />
              </div>

              <div className="bg-navy rounded-3xl p-8 text-white" style={{ background: 'var(--navy)' }}>
                <div className="text-2xl mb-4"></div>
                <h3 className="font-nunito font-black text-lg mb-2">Our Safety Policy bono.</h3>
                <p className="text-white/60 text-xs leading-relaxed mb-6">
                  EveryGiving identity-verifies fundraisers using the Ghana Card. We use industry-standard encryption to protect your data and payments. bono.
                </p>
                <Link href="/trust" className="text-primary text-xs font-black hover:underline uppercase tracking-widest">Learn more →</Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Mobile Bar bono. */}
      <StickyDonateBar 
        raisedAmount={raised} 
        pct={pct} 
      />

      <Footer />
    </>
  )
}
