'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const FUNDRAISE_MENU = {
  getStarted: [
    { label: 'Start a campaign', desc: 'Create a free, verified fundraiser', href: '/create' },
    { label: 'How it works', desc: 'The complete step-by-step guide', href: '/how-it-works' },
    { label: 'Verification tiers', desc: 'Basic, Standard and Premium — what each includes', href: '/trust' },
  ],
  resources: [
    { label: 'Fundraising categories', desc: '17 causes to raise money for', href: '/categories' },
    { label: 'Fundraising tips', desc: 'Proven tactics to raise more', href: '/tips' },
    { label: 'Team fundraising', desc: 'Raise more when your whole network shares', href: '/team' },
  ],
  more: [
    { label: 'Charity & org sign up', desc: 'Get your organisation\'s Verified page', href: '/orgs' },
    { label: 'Fundraising blog', desc: 'Tips, stories, and practical guides', href: '/blog' },
    { label: 'Transparency', desc: 'How the platform works and where fees go', href: '/transparency' },
  ]
}

const ABOUT_MENU = [
  { label: 'About Us', href: '/about' },
  { label: 'Help Centre', href: '/help' },
  { label: 'Contact', href: '/contact' },
  { label: 'Transparency', href: '/transparency' },
]

export default function NavDropdowns() {
  const [openDropdown, setOpenDropdown] = useState<'fundraise' | 'about' | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={navRef} style={{ display: 'flex', gap: 24, alignItems: 'center', height: '100%', position: 'relative' }}>
      
      {/* ── ABOUT DROPDOWN ── */}
      <div 
        onMouseEnter={() => setOpenDropdown('about')} 
        onMouseLeave={() => setOpenDropdown(null)}
        style={{ height: '100%', display: 'flex', alignItems: 'center' }}
      >
        <button 
          onClick={() => setOpenDropdown(openDropdown === 'about' ? null : 'about')}
          style={{ 
            fontSize: 14, fontWeight: 500, color: '#4A4A44', 
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          About
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: openDropdown === 'about' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {openDropdown === 'about' && (
          <div style={{ position: 'absolute', top: '100%', transform: 'translateX(-50%)', background: '#fff', border: '1px solid #E8E4DC', borderRadius: 12, padding: 8, minWidth: 200, boxShadow: '0 12px 32px rgba(0,0,0,0.08)', zIndex: 10 }}>
            {ABOUT_MENU.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpenDropdown(null)}
                style={{ display: 'block', padding: '10px 14px', fontSize: 13, fontWeight: 500, color: '#1A1A18', borderRadius: 8, transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F9F8F6'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── FUNDRAISE MEGAMENU ── */}
      <div 
        onMouseEnter={() => setOpenDropdown('fundraise')} 
        onMouseLeave={() => setOpenDropdown(null)}
        style={{ height: '100%', display: 'flex', alignItems: 'center' }}
      >
        <button 
          onClick={() => setOpenDropdown(openDropdown === 'fundraise' ? null : 'fundraise')}
          style={{ 
            fontSize: 14, fontWeight: 500, color: '#4A4A44', 
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 4
          }}
        >
          Fundraise
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ transform: openDropdown === 'fundraise' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {openDropdown === 'fundraise' && (
          <div style={{ position: 'absolute', top: '100%', right: 0, width: 800, background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16, padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 40, boxShadow: '0 16px 48px rgba(0,0,0,0.1)', zIndex: 10 }}>
            
            {/* Get Started Col */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8A8A82', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Get Started</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {FUNDRAISE_MENU.getStarted.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpenDropdown(null)} style={{ display: 'block' }} className="nav-item-hover">
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#8A8A82', lineHeight: 1.4 }}>{item.desc}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Resources Col */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8A8A82', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Resources</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {FUNDRAISE_MENU.resources.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpenDropdown(null)} style={{ display: 'block' }} className="nav-item-hover">
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#8A8A82', lineHeight: 1.4 }}>{item.desc}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* More Col */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#8A8A82', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>More</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {FUNDRAISE_MENU.more.map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setOpenDropdown(null)} style={{ display: 'block' }} className="nav-item-hover">
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#8A8A82', lineHeight: 1.4 }}>{item.desc}</div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .nav-item-hover { transition: opacity 0.15s; }
        .nav-item-hover:hover { opacity: 0.7; }
      `}} />
    </div>
  )
}
