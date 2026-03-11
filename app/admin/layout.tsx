'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

const NAV = [
  { href: '/admin',           label: 'Dashboard', icon: '📊', exact: true  },
  { href: '/admin/campaigns', label: 'Campaigns', icon: '📋', exact: false },
  { href: '/admin/users',     label: 'Users',     icon: '👥', exact: false },
  { href: '/admin/donations', label: 'Donations', icon: '💰', exact: false },
]

interface AdminInfo {
  name:  string
  email: string
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()

  const [checking,     setChecking]     = useState(true)
  const [authorized,   setAuthorized]   = useState(false)
  const [admin,        setAdmin]        = useState<AdminInfo | null>(null)
  const [sidebarOpen,  setSidebarOpen]  = useState(false)

  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) { setChecking(false); return }
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/admin/login'); return }
      const { data: profile } = await supabase
        .from('profiles').select('full_name, is_admin').eq('id', user.id).single()
      if (!profile?.is_admin) { router.replace('/admin/login'); return }
      setAdmin({ name: (profile.full_name as string | null) ?? user.email ?? 'Admin', email: user.email ?? '' })
      setAuthorized(true)
      setChecking(false)
    })
  }, [pathname, router, isLoginPage])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (isLoginPage) return <>{children}</>

  if (checking) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-white/30 text-xs">Checking access...</div>
      </div>
    </div>
  )

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-gray-900 border-r border-white/5 flex flex-col transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 border-b border-white/5">
          <Link href="/admin" className="font-nunito font-black text-lg">
            <span className="text-primary">Every</span><span className="text-white">Giving</span>
          </Link>
          <div className="text-white/20 text-xs mt-0.5 font-mono tracking-widest">ADMIN</div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-primary/15 text-primary' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center font-black text-white text-xs flex-shrink-0">
              {admin?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-white text-xs font-bold truncate">{admin?.name}</div>
              <div className="text-white/20 text-xs truncate">{admin?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            Sign out
          </button>
          <Link href="/" target="_blank"
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/30 hover:text-primary hover:bg-primary/5 rounded-lg transition-all">
            View live site
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="bg-gray-900 border-b border-white/5 px-5 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/40 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="text-white/20 text-xs font-mono hidden md:block">{pathname}</div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-white/20 text-xs">Live</span>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
