'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { trackFundraiserSignup } from '@/lib/crm'

export default function SignupPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/create`

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
        email: form.email,
      })
      trackFundraiserSignup({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      })
    }

    setLoading(false)
    setSubmitted(true)
  }

  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (authError) {
      setError(authError.message)
    }
  }

  // -- CHECK EMAIL SCREEN --
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 py-12" style={{ background: 'var(--surface-alt)' }}>
        <div className="max-w-md w-full text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-primary/30 text-white">
              \u2713
            </div>
          </div>
          <h1 className="font-nunito font-black text-navy text-3xl mb-3">Check your email</h1>
          <p className="text-sm mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>
            We sent a confirmation link to
          </p>
          <p className="text-primary font-black text-lg mb-8">{form.email}</p>

          <div className="border rounded-3xl p-8 shadow-xl text-left mb-8" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="text-navy text-xs font-black mb-4 uppercase tracking-widest opacity-40">Next steps</div>
            <div className="flex flex-col gap-4 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              <div className="flex gap-3">
                <span className="text-primary font-black">1.</span>
                <span>Click the link in the email we just sent you.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-black">2.</span>
                <span>Your account will be activated instantly.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-black">3.</span>
                <span>You'll be redirected to start your fundraiser!</span>
              </div>
            </div>
          </div>

          <div className="text-xs mb-8 italic" style={{ color: 'var(--text-muted)' }}>
            Didn't get it? Check your spam folder or wait a few minutes.
          </div>

          <Link href="/auth/signup"
            className="text-primary font-black text-sm hover:underline transition-colors">
            \u2190 Use a different email
          </Link>
        </div>
      </div>
    )
  }

  // -- SIGNUP FORM --
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12" style={{ background: 'var(--surface-alt)' }}>
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-4 group">
            <div className="w-16 h-16 rounded-2xl shadow-sm border flex items-center justify-center overflow-hidden transition-transform group-hover:-translate-y-1" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <Image src="/logo.png" alt="EveryGiving" width={64} height={64} />
            </div>
            <span className="font-nunito font-black text-3xl tracking-tight text-navy">
              <span className="text-primary">Every</span>Giving
            </span>
          </Link>
          <div className="text-sm mt-3 font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Create your free account</div>
        </div>

        <div className="border rounded-3xl p-8 shadow-xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h1 className="font-nunito font-black text-navy text-2xl mb-1">Get started</h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Free forever. 0% platform fee.</p>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-navy/40 uppercase tracking-widest block mb-1.5 ml-1">First name</label>
                <input type="text" required value={form.firstName}
                  onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="Ama"
                  className="w-full bg-[var(--surface-alt)] border-2 border-[var(--border)] focus:border-primary/20 focus:bg-[var(--surface)] rounded-2xl px-5 py-4 text-navy text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs font-black text-navy/40 uppercase tracking-widest block mb-1.5 ml-1">Last name</label>
                <input type="text" value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="Mensah"
                  className="w-full bg-[var(--surface-alt)] border-2 border-[var(--border)] focus:border-primary/20 focus:bg-[var(--surface)] rounded-2xl px-5 py-4 text-navy text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-navy/40 uppercase tracking-widest block mb-1.5 ml-1">Email address</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="ama@example.com"
                className="w-full bg-[var(--surface-alt)] border-2 border-[var(--border)] focus:border-primary/20 focus:bg-[var(--surface)] rounded-2xl px-5 py-4 text-navy text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all" />
            </div>

            <div>
              <label className="text-xs font-black text-navy/40 uppercase tracking-widest block mb-1.5 ml-1">Phone (MoMo number)</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="024 000 0000"
                className="w-full bg-[var(--surface-alt)] border-2 border-[var(--border)] focus:border-primary/20 focus:bg-[var(--surface)] rounded-2xl px-5 py-4 text-navy text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all" />
            </div>

            <div>
              <label className="text-xs font-black text-navy/40 uppercase tracking-widest block mb-1.5 ml-1">Password</label>
              <input type="password" required minLength={8} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="At least 8 characters"
                className="w-full bg-[var(--surface-alt)] border-2 border-[var(--border)] focus:border-primary/20 focus:bg-[var(--surface)] rounded-2xl px-5 py-4 text-navy text-sm placeholder-[var(--text-muted)] focus:outline-none transition-all" />
            </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-nunito font-black rounded-2xl transition-all hover:-translate-y-1 shadow-lg shadow-primary/20 text-sm mt-2">
                {loading ? 'Creating account...' : 'Create free account \u2192'}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Or continue with</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-4 bg-white hover:bg-gray-50 border border-gray-200 text-navy font-nunito font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
          </form>

          <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link href="/auth/login" className="text-primary font-black text-sm hover:text-primary-dark transition-colors">Sign in</Link>
          </div>
        </div>

        <p className="text-center text-xs mt-8 leading-relaxed px-4" style={{ color: 'var(--text-muted)' }}>
          By creating an account you agree to our{' '}
          <Link href="/terms" className="text-navy font-bold hover:text-primary">Terms</Link> and{' '}
          <Link href="/privacy" className="text-navy font-bold hover:text-primary">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
