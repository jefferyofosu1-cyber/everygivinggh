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
    <div className="min-h-screen flex items-center justify-center px-5 py-12" style={{ background: 'var(--surface-alt)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-4 group">
            <div className="w-16 h-16 rounded-2xl shadow-sm border flex items-center justify-center overflow-hidden transition-transform group-hover:-translate-y-1" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <Image src="/logo.jpeg" alt="EveryGiving" width={64} height={64} />
            </div>
            <span className="font-nunito font-black text-3xl tracking-tight text-navy">
              <span className="text-primary">Every</span>Giving
            </span>
          </Link>
          <div className="text-sm mt-3 font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Sign in to your account</div>
        </div>

        <div className="border rounded-3xl p-8 shadow-xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h1 className="font-nunito font-black text-navy text-2xl mb-1">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Sign in to manage your campaign</p>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-black text-navy/40 uppercase tracking-widest block mb-2 ml-1">Email address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full bg-[var(--surface-alt)] border-2 border-[var(--border)] focus:border-primary/20 focus:bg-[var(--surface)] rounded-2xl px-5 py-4 text-navy text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="text-xs font-black text-navy/40 uppercase tracking-widest">Password</label>
                <Link href="/auth/forgot-password" title="Forgot password?" className="text-xs text-primary hover:text-primary-dark font-black transition-colors">
                  Forgot?
                </Link>
              </div>
              <input type="password" required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Your password"
                className="w-full bg-[var(--surface-alt)] border-2 border-[var(--border)] focus:border-primary/20 focus:bg-[var(--surface)] rounded-2xl px-5 py-4 text-navy text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-nunito font-black rounded-2xl transition-all hover:-translate-y-1 shadow-lg shadow-primary/20 text-sm mt-2">
              {loading ? 'Signing in\u2026' : 'Sign in to EveryGiving \u2192'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No account yet? </span>
            <Link href="/auth/signup" className="text-primary font-black text-sm hover:text-primary-dark transition-colors">Create one free</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
