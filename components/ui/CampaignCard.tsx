import Link from 'next/link'
import Image from 'next/image'
import type { Campaign } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  medical: 'bg-green-50',
  education: 'bg-blue-50',
  church: 'bg-indigo-50',
  emergency: 'bg-red-50',
  business: 'bg-amber-50',
  community: 'bg-purple-50',
}

const CATEGORY_EMOJI: Record<string, string> = {
  medical: '🏥', education: '🎓', church: '⛪',
  emergency: '🚨', business: '💼', community: '🏡',
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const pct = Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100)
  const bg = CATEGORY_COLORS[campaign.category] || 'bg-gray-50'
  const emoji = CATEGORY_EMOJI[campaign.category] || '💚'

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer group">
        {/* Image / placeholder */}
        <div className={`${bg} h-44 flex items-center justify-center text-5xl relative`}>
          {campaign.image_url ? (
            <Image src={campaign.image_url} alt={campaign.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          ) : (
            <span>{emoji}</span>
          )}
          <div className="absolute top-2 left-2 bg-white/95 text-xs font-bold px-2 py-1 rounded-full capitalize">
            {emoji} {campaign.category}
          </div>
          {campaign.verified && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
              ✓ Verified
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-nunito font-extrabold text-navy text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            {campaign.profiles?.full_name || 'Anonymous'} · {campaign.location || 'Ghana'}
          </p>

          {/* Progress */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="font-nunito font-black text-navy text-sm">₵{campaign.raised_amount.toLocaleString()}</div>
              <div className="text-xs text-gray-400">of ₵{campaign.goal_amount.toLocaleString()}</div>
            </div>
            <div className="bg-primary-light text-primary font-bold text-xs px-2 py-1 rounded-full">
              {pct}%
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
