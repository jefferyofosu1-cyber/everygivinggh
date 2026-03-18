'use client'

import { useState } from 'react'

interface VideoModalProps {
  videoId: string
  thumbnailUrl: string
  title: string
}

export default function VideoModal({ videoId, thumbnailUrl, title }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        style={{ 
          position: 'relative', width: '100%', maxWidth: 300, aspectRatio: '9/16', 
          borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)', background: '#1A1A18',
          margin: '0 auto', flexShrink: 0
        }}
        className="video-thumb-hover"
      >
        <img src={thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
        
        {/* Play Button Overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            width: 72, height: 72, background: 'rgba(255,255,255,0.95)', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none" style={{ marginLeft: 6 }}>
              <path d="M22.5 12.268C24.5 13.4227 24.5 16.3103 22.5 17.465L4.5 27.8573C2.5 29.012 0 17.5682 0 15.2587V4.47432C0 2.16484 2.5 0.720959 4.5 1.87566L22.5 12.268Z" fill="#0A6B4B"/>
            </svg>
          </div>
        </div>
      </div>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{ 
            position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.9)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', width: '100%', maxWidth: 400, aspectRatio: '9/16', background: '#000', borderRadius: 16, overflow: 'hidden' }}
          >
            <button 
              onClick={() => setIsOpen(false)}
              style={{ position: 'absolute', top: 16, right: 16, width: 36, height: 36, background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 10, fontSize: 20 }}
            >
              ×
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&loop=1&playlist=${videoId}&controls=1&rel=0&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .video-thumb-hover { transition: transform 0.2s ease; }
        .video-thumb-hover:hover { transform: translateY(-4px) scale(1.02); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />
    </>
  )
}
