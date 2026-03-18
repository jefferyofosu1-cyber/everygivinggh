import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import SearchBar from './ui/SearchBar'
import NavDropdowns from './ui/NavDropdowns'

export default async function Navbar() {
  let userEmail: string | null = null
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    userEmail = user?.email ?? null
  } catch {
    // Not authenticated — no-op
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', height: 72,
      background: '#FFFFFF', borderBottom: '1px solid #E8E4DC',
      position: 'sticky', top: 0, zIndex: 200,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Left: Logo */}
      <Link href="/" style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1A1A18', textDecoration: 'none', flexShrink: 0 }}>
        Every<em style={{ color: '#0A6B4B', fontStyle: 'normal' }}>Giving</em>
      </Link>

      {/* Center: Search */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', '@media (max-width: 900px)': { display: 'none' } } as any}>
        <div style={{ display: 'none', width: '100%', '@media (min-width: 900px)': { display: 'block' } } as any}>
          <SearchBar />
        </div>
      </div>

      {/* Right: Menus + CTAs */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', height: '100%' }}>
        {/* Dropdowns hidden on narrow screens (handled properly in a real mobile menu, for now hidden via inline logic representation) */}
        <div style={{ display: 'none', '@media (min-width: 900px)': { display: 'block' } } as any} className="desktop-menus">
          <NavDropdowns />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {userEmail ? (
            <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A18', padding: '9px 16px', border: '1px solid #E8E4DC', borderRadius: 8, textDecoration: 'none' }}>
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A18', padding: '9px 16px', border: '1px solid #E8E4DC', borderRadius: 8, textDecoration: 'none' }}>
              Sign in
            </Link>
          )}
          <Link href="/create" style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18', background: '#F9F8F6', padding: '10px 18px', borderRadius: 8, textDecoration: 'none', border: '1px solid #E8E4DC' }}>
            Start a campaign
          </Link>
          <Link href="/campaigns" style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#0A6B4B', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', boxShadow: '0 4px 12px rgba(10,107,75,0.2)' }}>
            Donate
          </Link>
        </div>
      </div>

      {/* CSS for responsive hiding that inline styles can't do */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 900px) {
          .desktop-menus { display: none !important; }
        }
        @media (min-width: 900px) {
          .desktop-menus { display: block !important; height: 100%; }
        }
      `}} />
    </nav>
  )
}
