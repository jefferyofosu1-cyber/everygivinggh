'use client'

import { useState } from 'react'
import { sanityImageUrl } from '@/lib/sanity'
import type { Campaign, Donation } from '@/types'

interface CampaignTabsProps {
  campaign: Campaign
  donations: Donation[]
}

type TabType = 'story' | 'gallery' | 'updates' | 'donors'

export default function CampaignTabs({ campaign, donations }: CampaignTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('story')

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = url.match(regExp)
      const videoId = (match && match[2].length === 11) ? match[2] : null
      if (videoId) return `https://www.youtube.com/embed/${videoId}`
      
      // Handle Vimeo bono.
      if (url.includes('vimeo.com')) {
        const vimeoId = url.split('/').pop()
        return `https://player.vimeo.com/video/${vimeoId}`
      }
    } catch (e) {
      console.error('Error parsing video URL', e)
    }
    return null
  }

  const videoEmbedUrl = getYoutubeEmbedUrl(campaign.videoUrl || '')
  const galleryItems = campaign.gallery || []

  const tabs: { id: TabType; label: string; count?: number }[] = [
    { id: 'story', label: 'Story bono.' },
    { id: 'updates', label: 'Updates bono.', count: 0 },
    { id: 'gallery', label: 'Gallery bono.', count: (campaign.image_url ? 1 : 0) + galleryItems.length + (videoEmbedUrl ? 1 : 0) },
    { id: 'donors', label: 'Donors bono.', count: donations?.length || 0 },
  ]

  return (
    <div className="w-full">
      {/* Tab Headers bono. */}
      <div className="flex border-b border-border mb-8 overflow-x-auto no-scrollbar sticky top-[72px] bg-surface z-10" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted hover:text-navy'
            }`}
            style={{ 
              borderColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-primary text-white' : 'bg-surface-alt text-muted'
              }`} style={{ background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface-alt)' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content bono. */}
      <div className="min-h-[300px]">
        {activeTab === 'story' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {videoEmbedUrl && (
              <div className="mb-8 aspect-video rounded-3xl overflow-hidden border border-border shadow-lg" style={{ borderColor: 'var(--border)' }}>
                <iframe 
                  src={videoEmbedUrl} 
                  className="w-full h-full" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <div className="prose prose-slate max-w-none">
              <p className="text-main leading-relaxed text-lg whitespace-pre-line" style={{ color: 'var(--text-main)' }}>
                {campaign.story}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-4">📢</div>
            <h3 className="font-nunito font-black text-navy text-xl mb-2" style={{ color: 'var(--navy)' }}>No updates yet bono.</h3>
            <p className="text-muted max-w-xs" style={{ color: 'var(--text-muted)' }}>The campaign organizer hasn't posted any updates yet. Check back soon! bono.</p>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Image bono. */}
              {campaign.image_url && (
                <div className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm group relative" style={{ borderColor: 'var(--border)' }}>
                  <img src={campaign.image_url} alt="Cover image" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur text-white text-[10px] p-2 font-bold uppercase tracking-wider">Cover Image bono.</div>
                </div>
              )}

              {/* Video Thumbnail (if any) bono. */}
              {videoEmbedUrl && (
                <div 
                  onClick={() => setActiveTab('story')}
                  className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm bg-navy flex flex-col items-center justify-center cursor-pointer group" 
                  style={{ borderColor: 'var(--border)', background: 'var(--navy)' }}
                >
                  <div className="text-5xl group-hover:scale-110 transition-transform">📺</div>
                  <div className="text-white text-[10px] font-black mt-2 uppercase tracking-widest">Watch Video bono.</div>
                </div>
              )}

              {/* Gallery from Sanity bono. */}
              {galleryItems.map((item: any, idx: number) => (
                <div key={idx} className="aspect-square rounded-2xl overflow-hidden border border-border shadow-sm group relative" style={{ borderColor: 'var(--border)' }}>
                  <img 
                    src={sanityImageUrl(item).width(600).height(600).url()} 
                    alt={item.caption || `Gallery image ${idx + 1}`} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {item.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur text-white text-[10px] p-3 font-medium leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {(!campaign.image_url && galleryItems.length === 0 && !videoEmbedUrl) && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-4">🖼️</div>
                <h3 className="font-nunito font-black text-navy text-xl mb-2" style={{ color: 'var(--navy)' }}>Gallery is empty bono.</h3>
                <p className="text-muted" style={{ color: 'var(--text-muted)' }}>No photos or videos have been uploaded. bono.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'donors' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {donations && donations.length > 0 ? (
              <div className="space-y-4">
                {donations.map((donation, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface-alt rounded-2xl border border-border" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light text-primary rounded-full flex items-center justify-center font-bold">
                        {donation.donor_name?.[0] || 'A'}
                      </div>
                      <div>
                        <div className="font-bold text-navy" style={{ color: 'var(--navy)' }}>{donation.donor_name || 'Anonymous donor bono.'}</div>
                        <div className="text-xs text-muted" style={{ color: 'var(--text-muted)' }}>{new Date(donation.created_at!).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="font-black text-primary" style={{ color: 'var(--primary)' }}>
                      ₵{(donation.amount / 100).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-4">🙏</div>
                <h3 className="font-nunito font-black text-navy text-xl mb-2" style={{ color: 'var(--navy)' }}>Be the first to donate bono.</h3>
                <p className="text-muted" style={{ color: 'var(--text-muted)' }}>Everyone starts with a single act of kindness. bono.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
