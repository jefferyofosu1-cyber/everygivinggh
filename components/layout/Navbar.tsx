'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-nunito font-black text-xl text-primary tracking-tight">
          Every<span className="text-navy">Giving</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/campaigns" className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">Discover</Link>
          <Link href="/how-it-works" className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">How it works</Link>
          <Link href="/verification" className="px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">Verification</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard" className="hidden md:block px-4 py-2 rounded-full text-sm font-bold text-gray-700 border border-gray-200 hover:border-primary hover:text-primary transition-colors">Dashboard</Link>
              <button onClick={signOut} className="hidden md:block px-4 py-2 rounded-full text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors">Sign out</button>
            </>
          ) : (
            <Link href="/auth/login" className="hidden md:block px-4 py-2 rounded-full text-sm font-bold text-gray-700 border border-gray-200 hover:border-primary hover:text-primary transition-colors">Sign in</Link>
          )}
          <Link href="/create" className="px-4 py-2 rounded-full text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all hover:-translate-y-px shadow-sm hover:shadow-md">
            Start fundraiser
          </Link>
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-3 flex flex-col gap-1">
          <Link href="/campaigns" className="py-2 text-sm font-semibold text-gray-700" onClick={() => setMenuOpen(false)}>Discover campaigns</Link>
          <Link href="/how-it-works" className="py-2 text-sm font-semibold text-gray-700" onClick={() => setMenuOpen(false)}>How it works</Link>
          <Link href="/verification" className="py-2 text-sm font-semibold text-gray-700" onClick={() => setMenuOpen(false)}>Verification</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="py-2 text-sm font-semibold text-gray-700" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { signOut(); setMenuOpen(false) }} className="py-2 text-left text-sm font-semibold text-red-500">Sign out</button>
            </>
          ) : (
            <Link href="/auth/login" className="py-2 text-sm font-semibold text-gray-700" onClick={() => setMenuOpen(false)}>Sign in</Link>
          )}
        </div>
      )}
    </nav>
  )
}
