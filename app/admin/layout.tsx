'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import NextImage from 'next/image'
import { createClient } from '@/lib/supabase'

interface AdminUser {
  name:  string
  email: string
}

const NAV = [
  { href: '/admin',            label: 'Dashboard',    icon: '', exact: true  },
  { href: '/admin/campaigns',  label: 'Campaigns',    icon: '', exact: false },
  { href: '/admin/donations',  label: 'Donations',    icon: '', exact: false },
  { href: '/admin/users',      label: 'Users',        icon: '', exact: false },
  { href: '/admin/roles',      label: 'Roles',        icon: '', exact: false },
  { href: '/admin/audit-logs', label: 'Audit Logs',   icon: '', exact: false },
  { href: '/admin/verification', label: 'Verification', icon: '', exact: false },
  { href: '/admin/payouts',    label: 'Payouts',      icon: '', exact: false },
  { href: '/admin/payments',   label: 'Payments',     icon: '', exact: false },
  { href: '/admin/support',    label: 'Support',      icon: '', exact: false },
  { href: '/admin/disputes',   label: 'Disputes',     icon: '', exact: false },
  { href: '/admin/reports',    label: 'Reports',      icon: '', exact: false },
  { href: '/admin/settings',   label: 'Settings',     icon: '', exact: false },
  { href: '/admin/media',      label: 'Media',        icon: '', exact: false },
  { href: '/admin/content',    label: 'Content',      icon: '', exact: false },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router      = useRouter()
  const pathname    = usePathname()
  const [checking,    setChecking]    = useState(true)
  const [authorized,  setAuthorized]  = useState(false)
  const [adminUser,   setAdminUser]   = useState<AdminUser | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isLogin = pathname === '/admin/login'

  useEffect(() => {
    if (isLogin) { setChecking(false); return }
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.replace('/admin/login'); return }

      // Check DB is_admin OR env var root admin email
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
      const isEnvAdmin = adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()

      if (!isEnvAdmin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (!profile?.is_admin) {
          await supabase.auth.signOut()
          router.replace('/admin/login')
          return
        }
      }

      setAdminUser({
        name:  user.email ?? 'Admin',
        email: user.email ?? '',
      })
      setAuthorized(true)
      setChecking(false)
    })
  }, [pathname, isLogin, router])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (isLogin) return <>{children}</>

  if (checking) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#02A95C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-white/30 text-xs">Checking access...</p>
      </div>
    </div>
  )

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 bg-[#111827] border-r border-white/5 flex flex-col overflow-y-auto transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <NextImage src="/logo.jpeg" alt="EveryGiving" width={28} height={28} className="rounded-md" />
            <span className="font-nunito font-black text-lg"><span className="text-[#02A95C]">Every</span><span className="text-white">Giving</span></span>
          </Link>
          <p className="text-white/20 text-[10px] mt-0.5 tracking-widest font-mono">ADMIN</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(item => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active ? 'bg-[#02A95C]/15 text-[#02A95C]' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}>
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + actions */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 bg-[#02A95C] rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0">
              {adminUser?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{adminUser?.name}</p>
              <p className="text-white/20 text-xs truncate">{adminUser?.email}</p>
            </div>
          </div>
          <button onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
            Sign out
          </button>
          <Link href="/" target="_blank"
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white/30 hover:text-[#02A95C] hover:bg-[#02A95C]/5 rounded-lg transition-all">
            View live site
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <header className="bg-[#111827] border-b border-white/5 px-5 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-white/40 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <p className="text-white/20 text-xs font-mono hidden md:block">{pathname}</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#02A95C] rounded-full animate-pulse" />
            <span className="text-white/20 text-xs">Live</span>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-7">{children}</main>
      </div>
    </div>
  )
}
