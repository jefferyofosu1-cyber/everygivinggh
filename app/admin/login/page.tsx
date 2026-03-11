'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
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

    const { data: profile } = await supabase
      .from('profiles').select('is_admin').eq('id', data.user.id).single()

    if (!profile?.is_admin) {
      await supabase.auth.signOut()
      setError('You do not have admin access.')
      setLoading(false)
      return
    }

    router.replace('/admin')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <Link href="/" className="inline-block font-nunito font-black text-2xl">
            <span className="text-[#02A95C]">Every</span><span className="text-white">Giving</span>
          </Link>
          <p className="text-white/30 text-xs mt-1 tracking-widest font-mono uppercase">Admin Access</p>
        </div>

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
              <label className="text-xs font-bold text-white/40 block mb-1.5 uppercase tracking-wider">Password</label>
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

        <p className="text-center text-white/20 text-xs mt-6">
          Not an admin?{' '}
          <Link href="/" className="text-white/40 hover:text-[#02A95C] transition-colors">Go to main site</Link>
        </p>
      </div>
    </div>
  )
}
