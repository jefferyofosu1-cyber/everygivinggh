'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-nunito font-black text-2xl text-primary">EveryGiving</Link>
          <h1 className="font-nunito font-black text-navy text-2xl mt-4 mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to manage your campaigns</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••"
                className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-nunito font-black py-3.5 rounded-xl transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed mt-1">
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">Create one free</Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">← Back to homepage</Link>
        </div>
      </div>
    </div>
  )
}
