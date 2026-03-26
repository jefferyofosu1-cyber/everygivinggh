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

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-navy">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/auth-bg.jpg?v=2" 
          alt="Accra Cityscape" 
          fill 
          priority
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent lg:block hidden" />
        <div className="absolute inset-0 bg-navy/60 lg:hidden block" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Left Column: Hero Content */}
        <div className="flex-[0.6] lg:flex-1 flex flex-col justify-between p-6 lg:p-16 text-white min-h-[40vh] lg:min-h-0">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center overflow-hidden">
              <Image src="/logo.png" alt="EveryGiving" width={32} height={32} />
            </div>
            <span className="font-nunito font-black text-2xl tracking-tight">EveryGiving</span>
          </Link>

          <div className="mt-8 lg:mt-0 max-w-xl">
            <div className="flex flex-wrap gap-2 mb-4 lg:mb-8">
              <span className="px-3 py-1 lg:px-4 lg:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] lg:text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Verified giving
              </span>
              <span className="px-3 py-1 lg:px-4 lg:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] lg:text-xs font-bold uppercase tracking-widest text-[#60A5FA]">MoMo Payments</span>
            </div>

            <h1 className="font-nunito font-black text-4xl lg:text-7xl leading-[1.1] mb-4 lg:mb-6">
              Change <span className="text-primary">Lives</span> <br className="hidden lg:block" /> with Every <span className="text-[#60A5FA]">Cedi</span>
            </h1>
            <p className="text-base lg:text-xl text-white/70 leading-relaxed mb-6 lg:mb-10 max-w-lg hidden sm:block">
              The trusted way to raise and give money in Ghana. Support medical bills, school fees, and emergencies with full transparency.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/create" className="px-6 py-3 lg:px-8 lg:py-4 bg-[#3B82F6] hover:bg-blue-600 text-white font-nunito font-black rounded-2xl transition-all hover:-translate-y-1 shadow-lg shadow-blue-500/25 text-sm lg:text-base">
                Start a Campaign
              </Link>
            </div>
          </div>

          <div className="hidden lg:block text-sm text-white/40 font-medium">
            © 2026 EveryGiving Ghana • Secure payment via Paystack
          </div>
        </div>

        {/* Right Column: Login Form Card */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-12 pb-12 lg:pb-0">
          <div className="w-full max-w-[440px] bg-navy/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-7 lg:p-12 shadow-2xl">
            <div className="mb-8 lg:mb-10">
              <h2 className="font-nunito font-black text-white text-2xl lg:text-3xl mb-1 text-center lg:text-left">Welcome Back</h2>
              <p className="text-white/50 text-xs lg:text-sm text-center lg:text-left">Sign in to manage your fundraiser</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-sm text-red-400 font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="name@email.com"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:bg-white/10 rounded-2xl px-6 py-4 text-white text-sm placeholder-white/20 focus:outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Password</label>
                  <Link href="/auth/forgot-password" title="Forgot password?" className="text-[10px] text-white/40 hover:text-white font-black transition-colors uppercase tracking-wider">
                    Forgot?
                  </Link>
                </div>
                <input 
                  type="password" 
                  required 
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#3B82F6]/50 focus:bg-white/10 rounded-2xl px-6 py-4 text-white text-sm placeholder-white/20 focus:outline-none transition-all" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-white font-nunito font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-500/20 text-sm mt-4"
              >
                {loading ? 'Signing in...' : 'Sign in to your account'}
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#101827] px-4 text-white/30 font-bold tracking-widest">Or continue with</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-nunito font-bold rounded-2xl transition-all flex items-center justify-center gap-3 text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <span className="text-sm text-white/40 font-medium">No account yet? </span>
              <Link href="/auth/signup" className="text-white hover:text-[#3B82F6] font-black text-sm transition-colors">Create one free</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
