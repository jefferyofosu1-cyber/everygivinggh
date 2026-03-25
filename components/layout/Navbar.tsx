'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import type { User } from '@supabase/supabase-js'

const FUNDRAISE_MENU = [
  {
    section: 'Get started',
    items: [
      { label: 'Start a campaign', sub: 'Create a free, verified fundraiser', href: '/create', icon: '*' },
      { label: 'How it works', sub: 'The complete step-by-step guide', href: '/how-it-works', icon: '*' },
      { label: 'Verification tiers', sub: 'Basic, Standard and Premium  -  what each includes', href: '/verification', icon: '*' },
    ],
  },
  {
    section: 'Resources',
    items: [
      { label: 'Fundraising categories', sub: '17 causes to raise money for', href: '/fundraising-categories', icon: '*' },
      { label: 'Fundraising tips', sub: 'Proven tactics to raise more', href: '/fundraising-tips', icon: '*' },
      { label: 'Team fundraising', sub: 'Raise more when your whole network shares', href: '/team-fundraising', icon: '*' },
    ],
  },
  {
    section: 'More',
    items: [
      { label: 'Charity & org sign up', sub: "Get your organisation's Verified page", href: '/charity-signup', icon: '*' },
      { label: 'Fundraising blog', sub: 'Tips, stories, and practical guides', href: '/blog', icon: '*' },
      { label: 'Transparency', sub: 'How the platform works and where fees go', href: '/transparency', icon: '*' },
    ],
  },
]

const ABOUT_MENU = [
  { label: 'About us', sub: 'Our story, mission, and values', href: '/about', icon: '*' },
  { label: 'Help Centre', sub: '25+ answers to common questions', href: '/help', icon: '*' },
  { label: 'Contact', sub: 'Reach our team  -  we respond within 2 days', href: '/contact', icon: '*' },
  { label: 'Transparency', sub: 'Fees, verification, and how we operate', href: '/transparency', icon: '*' },
]

function Dropdown({ label, items, isOpen, onToggle, pathname }: {
  label: string
  items: { label: string; sub: string; href: string; icon: string }[]
  isOpen: boolean
  onToggle: () => void
  pathname: string
}) {
  const active = items.some(i => pathname.startsWith(i.href))
  return (
    <div className="relative">
      <button onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isOpen || active ? 'text-primary bg-primary-light dark:text-primary dark:bg-slate-800' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-primary'}`}>
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-gray-200/80 dark:shadow-black/50 border border-gray-200 dark:border-slate-700 p-2 z-50">
          {items.map((item, i) => (
            <Link key={i} href={item.href}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 group transition-all">
              <span className="text-lg mt-0.5 flex-shrink-0">{item.icon}</span>
              <div>
                <div className="font-semibold text-navy dark:text-slate-100 text-sm group-hover:text-primary transition-colors leading-snug">{item.label}</div>
                <div className="text-gray-400 dark:text-slate-400 text-xs leading-snug mt-0.5">{item.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
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

  const toggle = (name: string) => setOpenDropdown(v => v === name ? null : name)

  return (
    <nav ref={navRef} style={{ background: 'var(--header-bg)', borderBottom: scrolled ? 'none' : '1px solid var(--header-border)', transition: 'background-color 0.3s ease, box-shadow 0.3s ease' }} className={`sticky top-0 z-50 ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setOpenDropdown(null)}>
          <Image src="/logo.png" alt="EveryGiving" width={36} height={36} className="rounded-lg" priority />
          <span className="font-nunito font-black text-xl tracking-tight"><span className="text-primary">Every</span><span className="text-navy">Giving</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {/* Search */}
          <Link href="/campaigns" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors" style={{ color: 'var(--text-muted)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
          </Link>

          {/* Donate */}
          <Link href="/donate"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors`}
            style={{ color: pathname === '/donate' ? 'var(--primary)' : 'var(--text-muted)', background: pathname === '/donate' ? 'var(--primary-light)' : 'transparent' }}>
            Donate
          </Link>

          {/* About dropdown (simple) */}
          <Dropdown
            label="About"
            items={ABOUT_MENU}
            isOpen={openDropdown === 'about'}
            onToggle={() => toggle('about')}
            pathname={pathname}
          />

          {/* Fundraise mega dropdown */}
          <div className="relative">
            <button
              onClick={() => toggle('fundraise')}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${openDropdown === 'fundraise' || pathname.startsWith('/fundrais') || pathname.startsWith('/team') || pathname.startsWith('/charity') || pathname.startsWith('/blog') ? 'text-primary bg-primary-light' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
              Fundraise
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === 'fundraise' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {openDropdown === 'fundraise' && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] rounded-2xl shadow-2xl p-6 z-50" style={{ background: 'var(--dropdown-bg)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center text-lg"></div>
                  <div>
                    <div className="font-nunito font-black text-sm" style={{ color: 'var(--navy)' }}>Start fundraising, tips and resources</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Everything you need to raise money in Ghana</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {FUNDRAISE_MENU.map((col, ci) => (
                    <div key={ci}>
                      <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>{col.section}</div>
                      <div className="flex flex-col gap-0.5">
                        {col.items.map((item, ii) => (
                          <Link key={ii} href={item.href}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-start gap-3 p-2.5 rounded-xl group transition-all" style={{ background: 'transparent' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--dropdown-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <span className="text-lg mt-0.5 flex-shrink-0">{item.icon}</span>
                            <div>
                              <div className="font-semibold text-sm group-hover:text-primary transition-colors leading-snug" style={{ color: 'var(--navy)' }}>{item.label}</div>
                              <div className="text-xs leading-snug mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.sub}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Free to start · Ghana Card verified · Trusted giving</span>
                  <Link href="/create" onClick={() => setOpenDropdown(null)}
                    className="bg-primary hover:bg-primary-dark text-white font-nunito font-black text-xs px-5 py-2.5 rounded-full transition-all hover:-translate-y-px shadow-md shadow-primary/20">
                    Start a campaign →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {user ? (
            <>
              <Link href="/dashboard" className="hidden md:block px-4 py-2 rounded-full text-sm font-bold transition-colors" style={{ color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                Dashboard
              </Link>
              <button onClick={signOut} className="hidden md:block text-sm font-bold px-3 py-2 transition-colors" style={{ color: 'var(--text-muted)' }}>
                Sign out
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="hidden md:block px-4 py-2 rounded-full text-sm font-bold transition-colors" style={{ color: 'var(--text-main)', border: '1px solid var(--border)' }}>
              Sign in
            </Link>
          )}
          <Link href="/create" className="px-4 py-2 rounded-full text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all hover:-translate-y-px shadow-sm hover:shadow-md whitespace-nowrap">
            Start a campaign
          </Link>
          <button className="md:hidden p-2 rounded-lg" style={{ color: 'var(--text-muted)' }} onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-5 py-3 flex flex-col gap-0.5 max-h-[80vh] overflow-y-auto" style={{ borderTop: '1px solid var(--border)', background: 'var(--header-bg)' }}>
          <Link href="/campaigns" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-50" onClick={() => setMenuOpen(false)}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
          </Link>
          <Link href="/donate" className="py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-50" onClick={() => setMenuOpen(false)}>Donate</Link>

          {/* About mobile */}
          <div className="border-b border-gray-50">
            <button className="w-full flex items-center justify-between py-2.5 text-sm font-semibold text-gray-700" onClick={() => toggle('about-mobile')}>
              About
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'about-mobile' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {openDropdown === 'about-mobile' && (
              <div className="pb-2 flex flex-col gap-0.5">
                {ABOUT_MENU.map((item, i) => (
                  <Link key={i} href={item.href} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-all">
                    <span>{item.icon}</span>
                    <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Fundraise mobile */}
          <div className="border-b border-gray-50">
            <button className="w-full flex items-center justify-between py-2.5 text-sm font-semibold text-gray-700" onClick={() => toggle('fundraise-mobile')}>
              Fundraise
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${openDropdown === 'fundraise-mobile' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            {openDropdown === 'fundraise-mobile' && (
              <div className="pb-2 flex flex-col gap-0.5">
                {FUNDRAISE_MENU.flatMap(col => col.items).map((item, i) => (
                  <Link key={i} href={item.href} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-all">
                    <span>{item.icon}</span>
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
