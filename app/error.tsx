'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[Global Error Boundary]:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--surface-alt)' }}>
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4"></div>
        <h1 className="font-nunito font-black text-navy text-2xl mb-2">Something went wrong</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-3.5 rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
