'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { trackFundraiserSignup } from '@/lib/crm'

export default function SignupPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()

    // 1. Create Supabase auth account
    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
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

    // 2. Create profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        phone: form.phone,
      })

      // 3. Add to Brevo + send welcome email (non-blocking)
      trackFundraiserSignup({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      })
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-nunito font-black text-2xl tracking-tight">
            <span className="text-primary">Every</span><span className="text-white">Giving</span>
          </Link>
          <div className="text-white/40 text-sm mt-2">Create your free account</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="font-nunito font-black text-white text-xl mb-1">Get started</h1>
          <p className="text-white/40 text-sm mb-6">Free forever. No platform fee.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-white/50 block mb-1.5">First name</label>
                <input
                  type="text" required value={form.firstName}
                  onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                  placeholder="Ama"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/50 block mb-1.5">Last name</label>
                <input
                  type="text" value={form.lastName}
                  onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  placeholder="Mensah"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 block mb-1.5">Email address</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="ama@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 block mb-1.5">Phone (MoMo number)</label>
              <input
                type="tel" value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="024 000 0000"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div>
              <label className="text-xs font-bold text-white/50 block mb-1.5">Password</label>
              <input
                type="password" required minLength={8} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="At least 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm mt-2">
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <span className="text-white/40 text-sm">Already have an account? </span>
            <Link href="/auth/login" className="text-primary font-bold text-sm hover:text-primary-dark transition-colors">Sign in</Link>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-5 leading-relaxed">
          By creating an account you agree to our Terms of Service and Privacy Policy.
          Your information is protected and never shared with third parties.
        </p>
      </div>
    </div>
  )
}
