import Link from 'next/link'
import { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import DonationForm from '@/components/campaigns/DonationForm'
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
    
  if (error || !data) return null
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
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
          <div className="text-6xl mb-4">🔦</div>
          <h1 className="font-nunito font-black text-navy text-2xl mb-2">Campaign not found</h1>
          <p className="text-gray-500 mb-6 text-center">The campaign you are looking for might have been closed or moved.</p>
          <Link href="/campaigns" className="bg-primary text-white font-bold px-6 py-3 rounded-full">Explore other campaigns</Link>
        </div>
        <Footer />
      </>
    )
  }

  const pct = campaign.goal_amount ? Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100) : 0
  const emoji = campaign.category ? EMOJI[campaign.category.toLowerCase()] || '💚' : '💚'
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/campaigns/${campaign.id}`
  const shareText = `Help support "${campaign.title}" on EveryGiving 💚`

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <Link href="/campaigns" className="text-gray-400 text-sm hover:text-primary transition-colors mb-6 inline-flex items-center gap-1.5 font-bold">
            <span className="text-lg">←</span> Back to campaigns
          </Link>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* ── LEFT: campaign details ── */}
            <div className="md:col-span-8">
              {/* Campaign image / emoji */}
              <div className="aspect-video bg-gradient-to-br from-primary-light via-white to-blue-50 rounded-3xl flex items-center justify-center text-8xl mb-8 border border-gray-100 shadow-sm relative overflow-hidden">
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

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary-light px-4 py-1.5 rounded-full">{campaign.category}</span>
                  {campaign.verified && <span className="text-xs font-bold text-primary flex items-center gap-1">Identity verified</span>}
                </div>
                <h1 className="font-nunito font-black text-navy text-3xl md:text-4xl mb-6 leading-tight select-none">
                  {campaign.title}
                </h1>
                
                <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">👤</div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Campaign Organiser</div>
                    <div className="font-nunito font-black text-navy">{campaign.profiles?.full_name || 'Anonymous'}</div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none">
                  <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{campaign.story}</p>
                </div>
              </div>

              {/* Share */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="font-nunito font-black text-navy text-xl mb-6">Spread the word</div>
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white font-black rounded-2xl text-sm hover:-translate-y-1 transition-all shadow-lg shadow-[#25D366]/20"
                  >
                    WhatsApp
                  </a>
                  <button 
                    onClick={() => { /* This will actually need to be a small client component or inline JS if we want it in a server component */ }}
                    className="py-4 border-2 border-gray-100 hover:border-primary hover:text-primary text-gray-600 font-black rounded-2xl text-sm transition-all"
                  >
                    Copy link
                  </button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: progress + donate ── */}
            <div className="md:col-span-4 sticky top-10">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-6">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-nunito font-black text-primary text-4xl">₵{(campaign.raised_amount || 0).toLocaleString()}</span>
                    <span className="text-gray-400 text-sm font-bold">raised</span>
                  </div>
                  <div className="text-gray-400 text-sm mb-4 font-medium italic">Target goal: ₵{(campaign.goal_amount || 0).toLocaleString()}</div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-primary font-black">{pct}% funded</span>
                    <span className="text-gray-400 font-bold">{campaign.donations?.length || 0} donations</span>
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
