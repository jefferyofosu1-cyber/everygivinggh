import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--surface-alt)' }}>
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4"></div>
        <h1 className="font-nunito font-black text-navy text-3xl mb-2">Page not found</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-3.5 rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
          >
            Go home
          </Link>
          <Link
            href="/campaigns"
            className="inline-block border-2 hover:border-primary hover:text-primary font-nunito font-black px-8 py-3.5 rounded-full text-sm transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            Browse campaigns
          </Link>
        </div>
      </div>
    </div>
  )
}
