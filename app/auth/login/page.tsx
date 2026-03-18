'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (authError) {
      setError(authError.message === 'Invalid login credentials'
        ? 'Incorrect email or password. Please try again.'
        : authError.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <Image src="/logo.jpeg" alt="EveryGiving" width={48} height={48} className="rounded-xl" />
            <span className="font-nunito font-black text-2xl tracking-tight"><span className="text-primary">Every</span><span className="text-white">Giving</span></span>
          </Link>
          <div className="text-white/40 text-sm mt-2">Sign in to your account</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="font-nunito font-black text-white text-xl mb-1">Welcome back</h1>
          <p className="text-white/40 text-sm mb-6">Sign in to manage your campaign</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-white/50 block mb-1.5">Email address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-white/50">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-primary-dark font-semibold transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input type="password" required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Your password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm mt-2">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <span className="text-white/40 text-sm">No account? </span>
            <Link href="/auth/signup" className="text-primary font-bold text-sm hover:text-primary-dark transition-colors">Create one free</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
