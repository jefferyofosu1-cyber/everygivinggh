'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md text-center">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block font-nunito font-black text-2xl tracking-tight">
              <span className="text-primary">Every</span><span className="text-white">Giving</span>
            </Link>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-4xl mb-4"></div>
            <h1 className="font-nunito font-black text-white text-xl mb-2">Password updated</h1>
            <p className="text-white/40 text-sm">Redirecting you to your dashboard…</p>
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
          <div className="text-white/40 text-sm mt-2">Set a new password</div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="font-nunito font-black text-white text-xl mb-1">New password</h1>
          <p className="text-white/40 text-sm mb-6">Enter your new password below.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-white/50 block mb-1.5">New password</label>
              <input type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-white/50 block mb-1.5">Confirm password</label>
              <input type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Confirm your password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary transition-colors" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm mt-2">
              {loading ? 'Updating…' : 'Set new password →'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
