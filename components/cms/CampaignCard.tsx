import Link from 'next/link'
type SanityImage = { asset?: { _ref?: string; _id?: string } } | string | null
import { urlFor } from '@/lib/sanity.image'
import { ProgressBar } from './ProgressBar'

export type CampaignCardProps = {
  slug: string
  title: string
  coverImage?: SanityImage
  category?: string
  goalAmount: number
  amountRaised: number
  verificationLevel?: 'basic' | 'standard' | 'premium' | string
  status?: string
}

const CATEGORY_EMOJI: Record<string, string> = {
  medical: '🏥',
  church: '⛪',
  education: '🎓',
  emergency: '🆘',
  community: '🏘',
}

export function CampaignCard({
  slug,
  title,
  coverImage,
  category,
  goalAmount,
  amountRaised,
  verificationLevel,
  status,
}: CampaignCardProps) {
  const emoji = category ? CATEGORY_EMOJI[category] ?? '💚' : '💚'
  const badge =
    status === 'completed'
      ? 'Completed'
      : verificationLevel === 'premium'
      ? 'Premium verified'
      : verificationLevel === 'standard'
      ? 'Verified'
      : verificationLevel === 'basic'
      ? 'Basic verified'
      : null

  return (
    <Link
      href={`/campaign/${slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
    >
      <div className="h-48 relative overflow-hidden bg-gray-100">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={urlFor(coverImage).width(800).height(400).fit('crop').url()}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center text-5xl">
            {emoji}
          </div>
        )}
        {badge && (
          <div className="absolute top-3 right-3 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wide">
            {badge}
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="font-bold text-navy text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {title}
        </div>
        {category && (
          <div className="text-xs text-gray-400 mb-3 capitalize">
            {emoji} {category}
          </div>
        )}
        <ProgressBar goalAmount={goalAmount} amountRaised={amountRaised} />
      </div>
    </Link>
  )
}

