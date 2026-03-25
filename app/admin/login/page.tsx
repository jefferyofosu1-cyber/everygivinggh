'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NextImage from 'next/image'
import { createClient } from '@/lib/supabase'

type View = 'login' | 'forgot' | 'sent'

export default function AdminLoginPage() {
  const router = useRouter()
  const [view,     setView]     = useState<View>('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    // Check DB is_admin OR env var root admin email
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
    const isEnvAdmin = adminEmail && data.user.email?.toLowerCase() === adminEmail.toLowerCase()

    if (isEnvAdmin) {
      router.replace('/admin')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single()

    if (profile?.is_admin) {
      router.replace('/admin')
      return
    }

    await supabase.auth.signOut()
    setError('You do not have admin access.')
    setLoading(false)
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/login`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setView('sent')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <NextImage src="/logo.png" alt="EveryGiving" width={56} height={56} className="rounded-xl" />
            <span className="font-nunito font-black text-2xl"><span className="text-[#02A95C]">Every</span><span className="text-white">Giving</span></span>
          </Link>
          <p className="text-white/30 text-xs mt-1 tracking-widest font-mono uppercase">Admin Access</p>
        </div>

        {view === 'login' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h1 className="font-nunito font-black text-white text-xl mb-1">Sign in</h1>
            <p className="text-white/30 text-sm mb-6">Admin accounts only.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@everygiving.org"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => { setError(''); setView('forgot') }}
                    className="text-xs text-white/30 hover:text-[#02A95C] transition-colors">
                    Forgot password?
                  </button>
                </div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#02A95C] hover:bg-[#017A42] disabled:opacity-50 text-white font-nunito font-black rounded-xl transition-all text-sm mt-1">
                {loading ? 'Signing in...' : 'Sign in to admin'}
              </button>
            </form>
          </div>
        )}

        {view === 'forgot' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h1 className="font-nunito font-black text-white text-xl mb-1">Reset password</h1>
            <p className="text-white/30 text-sm mb-6">
              Enter your admin email and we will send a reset link.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@everygiving.org"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#02A95C] transition-colors" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-[#02A95C] hover:bg-[#017A42] disabled:opacity-50 text-white font-nunito font-black rounded-xl transition-all text-sm">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
              <button type="button" onClick={() => { setError(''); setView('login') }}
                className="w-full py-2 text-white/30 hover:text-white text-xs transition-colors">
                Back to sign in
              </button>
            </form>
          </div>
        )}

        {view === 'sent' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-[#02A95C]/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📧</span>
            </div>
            <h1 className="font-nunito font-black text-white text-xl mb-2">Check your email</h1>
            <p className="text-white/40 text-sm mb-1">A password reset link was sent to</p>
            <p className="text-[#02A95C] text-sm font-semibold mb-6">{email}</p>
            <p className="text-white/20 text-xs mb-6">
              Click the link in the email to set a new password. Check your spam folder if you do not see it.
            </p>
            <button onClick={() => { setView('login'); setError('') }}
              className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-sm font-semibold rounded-xl transition-all">
              Back to sign in
            </button>
          </div>
        )}

        <p className="text-center text-white/20 text-xs mt-6">
          Not an admin?{' '}
          <Link href="/" className="text-white/40 hover:text-[#02A95C] transition-colors">Go to main site</Link>
        </p>
      </div>
    </div>
  )
}
