import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--footer-bg)', borderTop: '1px solid var(--border)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-2">
              <Image src="/logo.png" alt="EveryGiving" width={32} height={32} className="rounded-lg" />
              <span className="font-nunito font-black text-xl" style={{ color: 'var(--text-main)' }}><span style={{ color: 'var(--primary)' }}>Every</span>Giving</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[200px]" style={{ color: 'var(--text-muted)' }}>
              Ghana's trusted crowdfunding platform. Verified giving. Mobile money. Full transparency.
            </p>
          </div>
          <div>
            <div className="font-nunito font-bold text-sm mb-3" style={{ color: 'var(--text-main)' }}>Fundraise</div>
            <div className="flex flex-col gap-2">
              <Link href="/create" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Start a fundraiser</Link>
              <Link href="/fundraise#how-to-start" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>How it works</Link>
              <Link href="/fundraise#categories" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Fundraising categories</Link>
              <Link href="/fundraise#team" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Team fundraising</Link>
              <Link href="/fundraise#charity" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Charity fundraising</Link>
              <Link href="/fundraise#corporate" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Corporate giving</Link>
            </div>
          </div>
          <div>
            <div className="font-nunito font-bold text-sm mb-3" style={{ color: 'var(--text-main)' }}>Discover</div>
            <div className="flex flex-col gap-2">
              <Link href="/campaigns" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>All campaigns</Link>
              <Link href="/campaigns?category=medical" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Medical</Link>
              <Link href="/campaigns?category=education" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Education</Link>
              <Link href="/campaigns?category=church" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Church</Link>
            </div>
          </div>
          <div>
            <div className="font-nunito font-bold text-sm mb-3" style={{ color: 'var(--text-main)' }}>Company</div>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>About us</Link>
              <Link href="/help" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Help Centre</Link>
              <Link href="/contact" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Contact</Link>
              <Link href="/transparency" className="text-sm transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Transparency</Link>
            </div>
          </div>
        </div>

        {/* Legal strip */}
        <div className="pt-8 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className="text-xs transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Terms &amp; Conditions</Link>
            <Link href="/privacy" className="text-xs transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
            <Link href="/how-it-works" className="text-xs transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>How it works</Link>
            <Link href="/campaigns" className="text-xs transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>Browse campaigns</Link>
            <Link href="mailto:business@everygiving.org" className="text-xs transition-colors hover:text-primary" style={{ color: 'var(--text-muted)' }}>business@everygiving.org</Link>
          </div>
        </div>

        <div className="pt-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>© 2026 Every Giving. Built in Ghana · 0% platform fee · Always free</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--primary)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>everygiving.org</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
