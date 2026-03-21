import Link from 'next/link'
import Image from 'next/image'
import type { Campaign } from '@/types'

const CATEGORY_COLORS: Record<string, string> = {
  medical: 'bg-primary-light',
  education: 'bg-blue-50 dark:bg-blue-900/20',
  church: 'bg-indigo-50 dark:bg-indigo-900/20',
  emergency: 'bg-red-50 dark:bg-red-900/20',
  business: 'bg-amber-50 dark:bg-amber-900/20',
  community: 'bg-purple-50 dark:bg-purple-900/20',
}

const CATEGORY_EMOJI: Record<string, string> = {
  medical: '', education: '', church: '',
  emergency: '', business: '', community: '',
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const goal = campaign.goal_amount || 0
  const raised = campaign.raised_amount || 0
  const pct = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0
  const bg = CATEGORY_COLORS[campaign.category?.toLowerCase() || ''] || 'bg-gray-50'
  const emoji = CATEGORY_EMOJI[campaign.category?.toLowerCase() || ''] || ''

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <div className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer group" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {/* Image / placeholder */}
        <div className={`${bg} h-44 flex items-center justify-center text-5xl relative`}>
          {campaign.image_url ? (
            <Image src={campaign.image_url} alt={campaign.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
          ) : (
            <span>{emoji}</span>
          )}
          <div className="absolute top-2 left-2 bg-surface/90 dark:bg-slate-900/90 text-xs font-bold px-2 py-1 rounded-full capitalize" style={{ color: 'var(--text-main)' }}>
            {emoji} {campaign.category}
          </div>
          {campaign.verified && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
               Verified
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-nunito font-extrabold text-navy text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors" style={{ color: 'var(--navy)' }}>
            {campaign.title}
          </h3>
          <p className="text-xs text-muted mb-3" style={{ color: 'var(--text-muted)' }}>
            {campaign.profiles?.full_name || 'Anonymous'} · {campaign.location || 'Ghana'}
          </p>

          {/* Progress */}
          <div className="h-1.5 bg-border rounded-full overflow-hidden mb-2" style={{ background: 'var(--border)' }}>
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'var(--primary)' }}
            />
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="font-nunito font-black text-navy text-sm" style={{ color: 'var(--navy)' }}>₵{raised.toLocaleString()}</div>
              <div className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>of ₵{goal.toLocaleString()}</div>
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
