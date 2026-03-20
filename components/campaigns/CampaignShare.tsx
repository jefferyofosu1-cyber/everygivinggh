'use client'

import { useState } from 'react'

export default function CampaignShare({ 
  shareUrl, 
  shareText 
}: { 
  shareUrl: string
  shareText: string 
}) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
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
        onClick={copyToClipboard}
        className={`py-4 border-2 font-black rounded-2xl text-sm transition-all ${copied ? 'border-primary text-primary bg-primary-light' : 'border-gray-100 hover:border-primary hover:text-primary text-gray-600'}`}
      >
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}
