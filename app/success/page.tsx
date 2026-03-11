'use client'
export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase'

function SuccessContent() {
  const searchParams = useSearchParams()
  const campaignId = searchParams.get('campaign')
  const amount = searchParams.get('amount')
  const name = searchParams.get('name')
  const [campaign, setCampaign] = useState<any>(null)

  useEffect(() => {
    if (campaignId) {
      const supabase = createClient()
      supabase.from('campaigns').select('*').eq('id', campaignId).single()
        .then(({ data }) => setCampaign(data))
    }
  }, [campaignId])

  const shareText = campaign
    ? `I just donated ₵${amount} to "${campaign.title}" on Every Giving! Help them reach their goal `
    : `I just donated on Every Giving  -  Ghana's trusted crowdfunding platform! `
  const shareUrl = campaign
    ? `https://everygivinggh.vercel.app/campaigns/${campaignId}`
    : 'https://everygivinggh.vercel.app'
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-blue-50 flex items-center justify-center px-5 py-12">
      <div className="max-w-lg w-full text-center">

        {/* Success animation */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-primary/30">
            
          </div>
        </div>

        <h1 className="font-nunito font-black text-navy text-3xl md:text-4xl tracking-tight mb-2">
          Thank you{name ? `, ${name}` : ''}!
        </h1>
        <p className="text-gray-500 mb-6">
          Your donation of <strong className="text-primary font-black">₵{amount || '...'}</strong> is on its way
        </p>

        {campaign && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 mx-auto max-w-sm">
            <div className="font-nunito font-bold text-navy text-sm line-clamp-1">{campaign.title}</div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full"
                style={{ width: `${Math.min((campaign.raised_amount / campaign.goal_amount) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs mt-1.5">
              <span className="font-bold text-navy">₵{campaign.raised_amount?.toLocaleString()} raised</span>
              <span className="text-primary font-bold">
                {Math.round((campaign.raised_amount / campaign.goal_amount) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Share section */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="font-nunito font-black text-navy text-lg mb-2">Help them reach their goal</div>
          <p className="text-sm text-gray-400 mb-5">
            Campaigns that are shared raise <strong className="text-navy">4× more money</strong>. Share it now.
          </p>
          <div className="flex flex-col gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-3.5 bg-[#25D366] hover:bg-[#20BD5C] text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-0.5 shadow text-sm">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Share on WhatsApp
            </a>
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-3 bg-black hover:bg-gray-900 text-white font-bold rounded-xl transition-all text-sm">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Share on X (Twitter)
            </a>
            <button
              onClick={() => { navigator.clipboard.writeText(shareUrl); alert('Link copied!') }}
              className="flex items-center justify-center gap-2 py-3 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-600 font-bold rounded-xl transition-all text-sm">
               Copy campaign link
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {campaign && (
            <Link href={`/campaigns/${campaignId}`}
              className="px-5 py-2.5 border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-600 font-bold rounded-xl transition-all text-sm">
              View campaign
            </Link>
          )}
          <Link href="/campaigns"
            className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all text-sm">
            Discover more campaigns
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          A receipt has been sent to your email.{' '}
          <Link href="#" className="text-primary underline">Contact us</Link> if you have questions.
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse"></div>
            <div className="font-nunito font-black text-navy text-xl">Loading...</div>
          </div>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </>
  )
}
