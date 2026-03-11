'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => { subscription.unsubscribe(); window.removeEventListener('scroll', handleScroll) }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/campaigns', label: 'Donate' },
    { href: '/about', label: 'About' },
    { href: '/fundraise', label: 'Fundraise' },
  ]

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-md' : 'border-b border-gray-100'}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" className="font-nunito font-black text-xl tracking-tight">
          <span className="text-primary">Every</span><span className="text-navy">Giving</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {/* Search */}
          <Link href="/campaigns"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
          </Link>
          {navLinks.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${pathname === link.href ? 'text-primary bg-primary-light' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}>
              {link.label}
            </Link>
          ))}
        </div>

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
          <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3 flex flex-col gap-1">
          <Link href="/campaigns" className="py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-50 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search campaigns
          </Link>
          <Link href="/campaigns" className="py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-50" onClick={() => setMenuOpen(false)}>Donate</Link>
          <Link href="/about" className="py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-50" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/fundraise" className="py-2.5 text-sm font-semibold text-gray-700 border-b border-gray-50" onClick={() => setMenuOpen(false)}>Fundraise</Link>
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
