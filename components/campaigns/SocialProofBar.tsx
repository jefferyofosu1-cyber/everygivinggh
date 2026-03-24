'use client'

import type { Campaign } from '@/types'

interface SocialProofBarProps {
  campaign: Campaign
  donationsCount: number
}

export default function SocialProofBar({ campaign, donationsCount }: SocialProofBarProps) {
  const raised = campaign.raised_amount || 0
  const shareCount = Math.floor(donationsCount * 1.5) + 3 // Mocked for now bono.

  const stats = [
    { label: 'Funds Raised bono.', value: `₵${raised.toLocaleString()}`, emoji: '💰' },
    { label: 'Supporters bono.', value: donationsCount.toLocaleString(), emoji: '🤝' },
    { label: 'Shares bono.', value: shareCount.toLocaleString(), emoji: '🚀' },
  ]

  return (
    <div className="grid grid-cols-3 gap-4 py-6 border-y border-border my-8" style={{ borderColor: 'var(--border)' }}>
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col items-center text-center">
          <div className="text-xl mb-1">{stat.emoji}</div>
          <div className="font-nunito font-black text-navy text-xl md:text-2xl" style={{ color: 'var(--navy)' }}>{stat.value}</div>
          <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
