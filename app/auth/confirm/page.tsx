'use client'
export const dynamic = 'force-dynamic'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!error) {
      const t = setTimeout(() => router.push('/create'), 3000)
      return () => clearTimeout(t)
    }
  }, [error, router])

  if (error) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">❌</div>
          <h1 className="font-nunito font-black text-white text-2xl mb-3">Confirmation failed</h1>
          <p className="text-white/50 text-sm mb-8">The link may have expired. Please sign up again.</p>
          <Link href="/auth/signup"
            className="inline-block bg-primary text-white font-nunito font-black px-8 py-3.5 rounded-full hover:-translate-y-0.5 transition-all">
            Back to sign up
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-primary/30">
            ✅
          </div>
        </div>
        <h1 className="font-nunito font-black text-white text-3xl mb-3">Email confirmed!</h1>
        <p className="text-white/50 text-sm mb-2">Welcome to Every Giving.</p>
        <p className="text-white/30 text-xs mb-10">Taking you to start your campaign shortly…</p>
        <Link href="/create"
          className="inline-block bg-primary text-white font-nunito font-black px-8 py-3.5 rounded-full hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/25 text-sm">
          Start your campaign now →
        </Link>
        <p className="text-white/20 text-xs mt-6">
          Check your inbox  -  your welcome email is on its way.
        </p>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
