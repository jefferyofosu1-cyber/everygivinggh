'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md text-center">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block font-nunito font-black text-2xl tracking-tight">
              <span className="text-primary">Every</span><span className="text-white">Giving</span>
            </Link>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-4xl mb-4">📧</div>
            <h1 className="font-nunito font-black text-white text-xl mb-2">Check your email</h1>
            <p className="text-white/40 text-sm mb-6">
              We sent a password reset link to <strong className="text-white">{email}</strong>. Click the link in the email to set a new password.
            </p>
            <p className="text-white/20 text-xs">
              Did not receive it? Check your spam folder or{' '}
              <button onClick={() => setSent(false)} className="text-primary hover:underline">try again</button>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-block font-nunito font-black text-2xl tracking-tight">
            <span className="text-primary">Every</span><span className="text-white">Giving</span>
          </Link>
          <div className="text-white/40 text-sm mt-2">Reset your password</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="font-nunito font-black text-white text-xl mb-1">Forgot your password?</h1>
          <p className="text-white/40 text-sm mb-6">Enter your email address and we will send you a link to reset it.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-white/50 block mb-1.5">Email address</label>
              <input type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm mt-2">
              {loading ? 'Sending…' : 'Send reset link →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <Link href="/auth/login" className="text-primary font-bold text-sm hover:text-primary-dark transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
