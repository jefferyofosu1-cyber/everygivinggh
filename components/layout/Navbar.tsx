'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const FUNDRAISE_MENU = [
  {
    section: 'Get started',
    items: [
      { label: 'Start a campaign', sub: 'Create your fundraiser in minutes', href: '/create', icon: '🚀' },
      { label: 'How it works', sub: 'Step-by-step guide with examples', href: '/how-it-works', icon: '📖' },
      { label: 'Verification tiers', sub: 'Basic, Standard and Premium explained', href: '/verification', icon: '🪪' },
    ],
  },
  {
    section: 'Resources',
    items: [
      { label: 'Fundraising categories', sub: 'Find the right category for your cause', href: '/campaigns', icon: '📋' },
      { label: 'Fundraising tips', sub: 'How to raise more, faster', href: '/fundraise#tips', icon: '💡' },
      { label: 'Team fundraising', sub: 'Fundraise together as a group', href: '/fundraise#team', icon: '👥' },
    ],
  },
  {
    section: 'More',
    items: [
      { label: 'Charity fundraising', sub: 'Raise money for a registered charity', href: '/fundraise#charity', icon: '🤲' },
      { label: 'Sign up as a charity', sub: 'Claim and verify your charity page', href: '/fundraise#signup-charity', icon: '✅' },
      { label: 'Fundraising blog', sub: 'Tips, stories and resources', href: '/fundraise#blog', icon: '✍️' },
    ],
  },
]

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [fundraiseOpen, setFundraiseOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)

    // Close dropdown on outside click
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setFundraiseOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-nunito font-black text-xl tracking-tight flex-shrink-0">
          <span className="text-primary">Every</span><span className="text-navy">Giving</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">

          {/* Search */}
          <Link href="/campaigns"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </Link>

          {/* Donate */}
          <Link href="/campaigns"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname === '/campaigns' ? 'text-primary bg-primary-light' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
            Donate
          </Link>

          {/* About */}
          <Link href="/about"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname === '/about' ? 'text-primary bg-primary-light' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
            About
          </Link>

          {/* Fundraise — dropdown trigger */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setFundraiseOpen(v => !v)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${fundraiseOpen || pathname.startsWith('/fundraise') ? 'text-primary bg-primary-light' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
              Fundraise
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${fundraiseOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {/* Mega dropdown */}
            {fundraiseOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[640px] bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 p-6 z-50">

                {/* Header */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center text-lg">🌱</div>
                  <div>
                    <div className="font-nunito font-black text-navy text-sm">Start fundraising, tips and resources</div>
                    <div className="text-gray-400 text-xs">Everything you need to raise money in Ghana</div>
                  </div>
                </div>

                {/* 3-column grid */}
                <div className="grid grid-cols-3 gap-6">
                  {FUNDRAISE_MENU.map((col, ci) => (
                    <div key={ci}>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">{col.section}</div>
                      <div className="flex flex-col gap-1">
                        {col.items.map((item, ii) => (
                          <Link key={ii} href={item.href}
                            onClick={() => setFundraiseOpen(false)}
                            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 group transition-all">
                            <span className="text-lg mt-0.5 flex-shrink-0">{item.icon}</span>
                            <div>
                              <div className="font-semibold text-navy text-sm group-hover:text-primary transition-colors leading-snug">{item.label}</div>
                              <div className="text-gray-400 text-xs leading-snug mt-0.5">{item.sub}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Free to start · Ghana Card verified · 0% platform fee</span>
                  <Link href="/create"
                    onClick={() => setFundraiseOpen(false)}
                    className="bg-primary hover:bg-primary-dark text-white font-nunito font-black text-xs px-5 py-2.5 rounded-full transition-all hover:-translate-y-px shadow-md shadow-primary/20">
                    Start a campaign →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="hidden md:block px-4 py-2 rounded-full text-sm font-bold text-gray-700 border border-gray-200 hover:border-primary hover:text-primary transition-colors">
                Dashboard
              </Link>
              <button onClick={signOut} className="hidden md:block text-sm font-bold text-gray-400 hover:text-gray-600 px-3 py-2 transition-colors">
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="hidden md:block px-4 py-2 rounded-full text-sm font-bold text-gray-700 border border-gray-200 hover:border-primary hover:text-primary transition-colors">
              Sign in
            </Link>
          )}
          <Link href="/create"
            className="px-4 py-2 rounded-full text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all hover:-translate-y-px shadow-sm hover:shadow-md whitespace-nowrap">
            Start a campaign
          </Link>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3 flex flex-col gap-0.5">
          <Link href="/campaigns" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-50" onClick={() => setMenuOpen(false)}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
          </Link>
          <Link href="/campaigns" className="py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-50" onClick={() => setMenuOpen(false)}>Donate</Link>
          <Link href="/about" className="py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-50" onClick={() => setMenuOpen(false)}>About</Link>

          {/* Mobile fundraise — accordion */}
          <div className="border-b border-gray-50">
            <button className="w-full flex items-center justify-between py-2.5 text-sm font-semibold text-gray-700"
              onClick={() => setFundraiseOpen(v => !v)}>
              Fundraise
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${fundraiseOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {fundraiseOpen && (
              <div className="pb-3 flex flex-col gap-0.5">
                {FUNDRAISE_MENU.flatMap(col => col.items).map((item, i) => (
                  <Link key={i} href={item.href}
                    onClick={() => { setMenuOpen(false); setFundraiseOpen(false) }}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-all">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link href="/dashboard" className="py-2.5 text-sm font-semibold text-gray-700" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { signOut(); setMenuOpen(false) }} className="py-2.5 text-left text-sm font-semibold text-red-500">Sign out</button>
            </>
          ) : (
            <Link href="/auth/login" className="py-2.5 text-sm font-semibold text-gray-700" onClick={() => setMenuOpen(false)}>Sign in</Link>
          )}
        </div>
      )}
    </nav>
  )
}
