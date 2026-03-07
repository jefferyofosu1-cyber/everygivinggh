'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/campaigns', label: 'Campaigns', icon: '📋' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/donations', label: 'Donations', icon: '💰' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/admin/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('full_name, is_admin').eq('id', user.id).single()
      if (!profile?.is_admin) { router.replace('/admin/login'); return }
      setAdmin({ name: profile.full_name || user.email || 'Admin', email: user.email || '' })
      setChecking(false)
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <div className="text-white/40 text-sm">Verifying access…</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-white/5 flex flex-col transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/5">
          <Link href="/admin" className="font-nunito font-black text-xl">
            <span className="text-primary">Every</span><span className="text-white">Giving</span>
          </Link>
          <div className="text-white/30 text-xs mt-0.5 font-mono">Admin Console</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-primary/15 text-primary' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0">
              {admin?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-bold truncate">{admin?.name}</div>
              <div className="text-white/30 text-xs truncate">{admin?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <span>🚪</span> Sign out
          </button>
          <Link href="/" target="_blank"
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white/30 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
            <span>🌐</span> View live site
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── MAIN ── */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* Top bar */}
        <header className="bg-gray-900 border-b border-white/5 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/40 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <div className="text-white/30 text-xs font-mono hidden md:block">{pathname}</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-white/30 text-xs">Live</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
