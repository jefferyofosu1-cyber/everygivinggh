'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md text-center">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block font-nunito font-black text-3xl tracking-tight text-navy">
              <span className="text-primary">Every</span>Giving
            </Link>
          </div>
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/50">
            <div className="text-5xl mb-6">📩</div>
            <h1 className="font-nunito font-black text-navy text-2xl mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              We sent a password reset link to <strong className="text-navy">{email}</strong>. Please check your inbox and click the link to set a new password.
            </p>
            <div className="pt-6 border-t border-gray-50">
              <p className="text-gray-400 text-xs">
                Did not receive it? Check your spam folder or{' '}
                <button onClick={() => setSent(false)} className="text-primary font-bold hover:underline">try again</button>.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-4 group">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden transition-transform group-hover:-translate-y-1">
              <Image src="/logo.jpeg" alt="EveryGiving" width={64} height={64} />
            </div>
            <span className="font-nunito font-black text-3xl tracking-tight text-navy">
              <span className="text-primary">Every</span>Giving
            </span>
          </Link>
          <div className="text-gray-400 text-sm mt-3 font-bold uppercase tracking-widest">Reset your password</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl shadow-gray-200/50">
          <h1 className="font-nunito font-black text-navy text-2xl mb-1">Forgot password?</h1>
          <p className="text-gray-400 text-sm mb-8">Enter your email and we'll send you a link to reset it.</p>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-black text-navy/40 uppercase tracking-widest block mb-2 ml-1">Email address</label>
              <input type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl px-5 py-4 text-navy text-sm placeholder-gray-300 focus:outline-none transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-nunito font-black rounded-2xl transition-all hover:-translate-y-1 shadow-lg shadow-primary/20 text-sm mt-2">
              {loading ? 'Sending link…' : 'Send reset link →'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <Link href="/auth/login" className="text-primary font-black text-sm hover:text-primary-dark transition-colors">
              ← Back to sign in
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
