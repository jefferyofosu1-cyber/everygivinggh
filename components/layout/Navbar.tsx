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
      { label: 'Fundraising categories', sub: '17 causes to raise money for', href: '/fundraising-categories', icon: '📋' },
      { label: 'Fundraising tips', sub: 'How to raise more, faster', href: '/fundraising-tips', icon: '💡' },
      { label: 'Team fundraising', sub: 'Fundraise together as a group', href: '/team-fundraising', icon: '👥' },
    ],
  },
  {
    section: 'More',
    items: [
      { label: 'Charity & org sign up', sub: 'Register your charity or organisation', href: '/charity-signup', icon: '🤲' },
      { label: 'Fundraising blog', sub: 'Tips, stories and resources', href: '/blog', icon: '✍️' },
      { label: 'Transparency', sub: 'How we operate and where fees go', href: '/transparency', icon: '🔍' },
    ],
  },
]

const ABOUT_MENU = [
  { label: 'About us', sub: 'Our mission and story', href: '/about', icon: '💚' },
  { label: 'Help Centre', sub: '25+ answers to common questions', href: '/help', icon: '❓' },
  { label: 'Contact', sub: 'Get in touch with our team', href: '/contact', icon: '📬' },
  { label: 'Transparency', sub: 'Fees, verification and how we operate', href: '/transparency', icon: '🔍' },
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
        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isOpen || active ? 'text-primary bg-primary-light' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
        {label}
        <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 p-2 z-50">
          {items.map((item, i) => (
            <Link key={i} href={item.href}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 group transition-all">
              <span className="text-lg mt-0.5 flex-shrink-0">{item.icon}</span>
              <div>
                <div className="font-semibold text-navy text-sm group-hover:text-primary transition-colors leading-snug">{item.label}</div>
                <div className="text-gray-400 text-xs leading-snug mt-0.5">{item.sub}</div>
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
    <nav ref={navRef} className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">

        <Link href="/" className="font-nunito font-black text-xl tracking-tight flex-shrink-0" onClick={() => setOpenDropdown(null)}>
          <span className="text-primary">Every</span><span className="text-navy">Giving</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {/* Search */}
          <Link href="/campaigns" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
          </Link>

          {/* Donate */}
          <Link href="/donate"
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname === '/donate' ? 'text-primary bg-primary-light' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
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
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[620px] bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 p-6 z-50">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                  <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center text-lg">🌱</div>
                  <div>
                    <div className="font-nunito font-black text-navy text-sm">Start fundraising, tips and resources</div>
                    <div className="text-gray-400 text-xs">Everything you need to raise money in Ghana</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-5">
                  {FUNDRAISE_MENU.map((col, ci) => (
                    <div key={ci}>
                      <div className="text-xs font-bold uppercase tracking-widest text-gray-300 mb-3">{col.section}</div>
                      <div className="flex flex-col gap-0.5">
                        {col.items.map((item, ii) => (
                          <Link key={ii} href={item.href}
                            onClick={() => setOpenDropdown(null)}
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
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Free to start · Ghana Card verified · 2% + ₵0.25 transaction fee only</span>
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
          <Link href="/create" className="px-4 py-2 rounded-full text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all hover:-translate-y-px shadow-sm hover:shadow-md whitespace-nowrap">
            Start a campaign
          </Link>
          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3 flex flex-col gap-0.5 max-h-[80vh] overflow-y-auto">
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
