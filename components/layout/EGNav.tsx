'use client'

import Link from 'next/link'

interface EGNavProps {
  active?: string
  dark?: boolean
}

export default function EGNav({ active, dark = false }: EGNavProps) {
  const bg = dark ? '#1A1A18' : '#FFFFFF'
  const border = dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E8E4DC'
  const logoColor = dark ? '#FFFFFF' : '#1A1A18'
  const linkColor = dark ? 'rgba(255,255,255,0.65)' : '#4A4A44'
  const linkActiveColor = dark ? '#FFFFFF' : '#1A1A18'
  const dividerColor = dark ? 'rgba(255,255,255,0.12)' : '#E8E4DC'
  const signinBorder = dark ? '1px solid rgba(255,255,255,0.20)' : '1px solid #E8E4DC'
  const signinColor = dark ? '#FFFFFF' : '#1A1A18'

  const links = [
    { href: '/campaigns',               label: 'Browse campaigns' },
    { href: '/how-it-works',            label: 'How it works' },
    { href: '/fees',                    label: 'Fees' },
    { href: '/about',                   label: 'About' },
  ]

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: 58,
      background: bg, borderBottom: border,
      position: 'sticky', top: 0, zIndex: 100,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Font import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>

      {/* Logo */}
      <Link href="/" style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 19, color: logoColor, textDecoration: 'none',
      }}>
        Every<em style={{ color: '#0A6B4B', fontStyle: 'normal' }}>Giving</em>
      </Link>

      {/* Centre links */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {links.map(l => (
          <Link key={l.href} href={l.href} style={{
            fontSize: 13, fontWeight: 500,
            color: active === l.href ? linkActiveColor : linkColor,
            padding: '7px 11px', borderRadius: 6,
            textDecoration: 'none',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* Right CTAs */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 1, height: 18, background: dividerColor }} />
        <Link href="/auth/login" style={{
          fontSize: 13, fontWeight: 500, color: signinColor,
          padding: '7px 13px', border: signinBorder, borderRadius: 8,
          textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
        }}>Sign in</Link>
        <Link href="/create" style={{
          fontSize: 13, fontWeight: 600, color: '#fff',
          background: '#0A6B4B', padding: '8px 16px', borderRadius: 8,
          textDecoration: 'none', fontFamily: "'DM Sans', sans-serif",
        }}>Start a campaign</Link>
      </div>
    </nav>
  )
}
