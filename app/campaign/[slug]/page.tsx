import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Footer from '@/components/layout/Footer'
import { sanityClient } from '@/lib/sanity.client'
import {
  campaignBySlugQuery,
  campaignDonationsBySlugQuery,
  campaignUpdatesBySlugQuery,
} from '@/lib/sanity.queries'
import { urlFor } from '@/lib/sanity.image'
import { PortableText } from '@portabletext/react'
import { ProgressBar } from '@/components/cms/ProgressBar'
import { DonationCard } from '@/components/cms/DonationCard'

type PageParams = {
  slug: string
}

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: PageParams
}): Promise<Metadata> {
  const campaign = await sanityClient.fetch(campaignBySlugQuery, {
    slug: params.slug,
  })

  if (!campaign) {
    return {
      title: 'Campaign not found · Every Giving',
    }
  }

  const title = `${campaign.title} · Every Giving`
  const description = `Support ${campaign.beneficiaryName} - ${campaign.category} campaign on Every Giving.`
  const image = campaign.coverImage
    ? urlFor(campaign.coverImage).width(1200).height(630).fit('crop').url()
    : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function CampaignPage({
  params,
}: {
  params: PageParams
}) {
  const campaign = await sanityClient.fetch(campaignBySlugQuery, {
    slug: params.slug,
  })

  if (!campaign) {
    notFound()
  }

  const [donations, updates] = await Promise.all([
    sanityClient.fetch(campaignDonationsBySlugQuery, { slug: params.slug }),
    sanityClient.fetch(campaignUpdatesBySlugQuery, { slug: params.slug }),
  ])

  const goalAmount: number = campaign.goalAmount || 0
  const amountRaised: number = campaign.amountRaised || 0

  return (
    <>
      <main className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="h-72 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm relative">
                {campaign.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={urlFor(campaign.coverImage)
                      .width(1200)
                      .height(600)
                      .fit('crop')
                      .url()}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-7xl">
                    💚
                  </div>
                )}
                {campaign.verificationLevel && (
                  <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {campaign.verificationLevel.toUpperCase()} VERIFIED
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {campaign.category && (
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-light px-3 py-1 rounded-full">
                      {campaign.category}
                    </span>
                  )}
                  {campaign.status && (
                    <span className="text-xs font-semibold text-gray-500">
                      Status: {campaign.status}
                    </span>
                  )}
                </div>
                <h1 className="font-nunito font-black text-navy text-2xl sm:text-3xl mb-3 leading-tight">
                  {campaign.title}
                </h1>
                {campaign.beneficiaryName && (
                  <p className="text-sm text-gray-500 mb-5">
                    Beneficiary:{' '}
                    <span className="font-semibold text-navy">
                      {campaign.beneficiaryName}
                    </span>
                    {campaign.hospitalName && (
                      <>
                        {' '}
                        · {campaign.hospitalName}
                      </>
                    )}
                  </p>
                )}

                <ProgressBar
                  goalAmount={goalAmount}
                  amountRaised={amountRaised}
                />
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                <h2 className="font-nunito font-black text-navy text-lg mb-4">
                  Story
                </h2>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <PortableText value={campaign.story} />
                </div>
              </div>

              {updates.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
                  <h2 className="font-nunito font-black text-navy text-lg mb-4">
                    Updates
                  </h2>
                  <div className="space-y-5">
                    {updates.map((u: any) => (
                      <article key={u._id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                        <h3 className="font-semibold text-sm text-navy mb-1">
                          {u.updateTitle}
                        </h3>
                        <div className="text-xs text-gray-400 mb-2">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </div>
                        <div className="prose prose-sm max-w-none text-gray-700">
                          <PortableText value={u.updateBody} />
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
                <h3 className="font-nunito font-black text-navy text-lg mb-3">
                  Donate
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  This is a read-only demo integration. Wire this form to your
                  payment provider and Sanity mutations for production.
                </p>
                <button className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
                  Donate now
                </button>
              </div>

              {donations.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-nunito font-black text-navy text-lg mb-4">
                    Recent donations
                  </h3>
                  <div className="flex flex-col gap-4">
                    {donations.slice(0, 10).map((d: any) => (
                      <DonationCard
                        key={d._id}
                        donorName={d.donorName}
                        amount={d.amount}
                        message={d.message}
                        createdAt={d.createdAt}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

