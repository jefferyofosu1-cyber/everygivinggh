'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function CampaignsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="max-w-7xl mx-auto px-5 py-24 text-center">
      <div className="text-6xl mb-6">🏜️</div>
      <h2 className="font-nunito font-black text-navy text-3xl mb-4">Could not load campaigns</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        We encountered an error while trying to fetch the latest campaigns. Please try again or explore other parts of the platform.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={reset}
          className="bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-4 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
        >
          Try again
        </button>
        <Link
          href="/"
          className="border-2 border-gray-100 hover:border-primary text-gray-500 hover:text-primary font-nunito font-black px-8 py-4 rounded-xl transition-all"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}
