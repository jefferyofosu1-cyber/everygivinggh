import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div className="col-span-2 md:col-span-1">
            <div className="font-nunito font-black text-xl mb-2">
              <span className="text-primary">Every</span>Giving
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-[200px]">
              Ghana's trusted crowdfunding platform. Verified giving. Mobile money. Full transparency.
            </p>
          </div>
          <div>
            <div className="font-nunito font-bold text-sm text-white mb-3">Fundraise</div>
            <div className="flex flex-col gap-2">
              <Link href="/create" className="text-sm text-white/50 hover:text-primary transition-colors">Start a fundraiser</Link>
              <Link href="/how-it-works" className="text-sm text-white/50 hover:text-primary transition-colors">How it works</Link>
              <Link href="/verification" className="text-sm text-white/50 hover:text-primary transition-colors">Verification tiers</Link>
            </div>
          </div>
          <div>
            <div className="font-nunito font-bold text-sm text-white mb-3">Discover</div>
            <div className="flex flex-col gap-2">
              <Link href="/campaigns" className="text-sm text-white/50 hover:text-primary transition-colors">All campaigns</Link>
              <Link href="/campaigns?category=medical" className="text-sm text-white/50 hover:text-primary transition-colors">Medical</Link>
              <Link href="/campaigns?category=education" className="text-sm text-white/50 hover:text-primary transition-colors">Education</Link>
              <Link href="/campaigns?category=church" className="text-sm text-white/50 hover:text-primary transition-colors">Church</Link>
            </div>
          </div>
          <div>
            <div className="font-nunito font-bold text-sm text-white mb-3">Company</div>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-white/50 hover:text-primary transition-colors">About us</Link>
              <Link href="/help" className="text-sm text-white/50 hover:text-primary transition-colors">Help Centre</Link>
              <Link href="/contact" className="text-sm text-white/50 hover:text-primary transition-colors">Contact</Link>
              <Link href="/transparency" className="text-sm text-white/50 hover:text-primary transition-colors">Transparency</Link>
            </div>
          </div>
        </div>

        {/* Legal strip */}
        <div className="pt-8 pb-4 border-b border-white/10">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className="text-xs text-white/30 hover:text-primary transition-colors">Terms &amp; Conditions</Link>
            <Link href="/privacy" className="text-xs text-white/30 hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/how-it-works" className="text-xs text-white/30 hover:text-primary transition-colors">How it works</Link>
            <Link href="/campaigns" className="text-xs text-white/30 hover:text-primary transition-colors">Browse campaigns</Link>
            <Link href="mailto:business@everygiving.org" className="text-xs text-white/30 hover:text-primary transition-colors">business@everygiving.org</Link>
          </div>
        </div>

        <div className="pt-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/30">© 2026 Every Giving. Built in Ghana 🇬🇭 · 0% platform fee · Always free</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-white/20">everygiving.org</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
