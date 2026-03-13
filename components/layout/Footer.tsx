import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div className="col-span-2 md:col-span-1">
            <div className="font-nunito font-black text-xl text-primary mb-2">EveryGiving</div>
            <p className="text-sm text-white/50 leading-relaxed max-w-[200px]">
              Ghana's trusted crowdfunding platform. Verified giving. Mobile money. Full transparency.
            </p>
          </div>
          <div>
            <div className="font-nunito font-bold text-sm text-white mb-3">Fundraise</div>
            <div className="flex flex-col gap-2">
              <Link href="/create" className="text-sm text-white/50 hover:text-primary transition-colors">Start a fundraiser</Link>
              <Link href="/how-it-works" className="text-sm text-white/50 hover:text-primary transition-colors">How it works</Link>
              <Link href="/pricing" className="text-sm text-white/50 hover:text-primary transition-colors">Pricing</Link>
            </div>
          </div>
          <div>
            <div className="font-nunito font-bold text-sm text-white mb-3">Discover</div>
            <div className="flex flex-col gap-2">
              <Link href="/campaigns" className="text-sm text-white/50 hover:text-primary transition-colors">All campaigns</Link>
              <Link href="/campaigns?category=medical" className="text-sm text-white/50 hover:text-primary transition-colors">Medical</Link>
              <Link href="/campaigns?category=education" className="text-sm text-white/50 hover:text-primary transition-colors">Education</Link>
              <Link href="/campaigns?category=church" className="text-sm text-white/50 hover:text-primary transition-colors">Church projects</Link>
            </div>
          </div>
          <div>
            <div className="font-nunito font-bold text-sm text-white mb-3">Support</div>
            <div className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-white/50 hover:text-primary transition-colors">Help centre</Link>
              <Link href="#" className="text-sm text-white/50 hover:text-primary transition-colors">Contact us</Link>
              <Link href="#" className="text-sm text-white/50 hover:text-primary transition-colors">Safety & Trust</Link>
            </div>
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-white/30">© 2026 Every Giving. Built in Ghana 🇬🇭</p>
          <div className="flex gap-5">
            <Link href="#" className="text-xs text-white/30 hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-white/30 hover:text-primary transition-colors">Terms</Link>
            <Link href="#" className="text-xs text-white/30 hover:text-primary transition-colors">Cookies</Link>
            <Link href="/pricing" className="text-xs text-white/30 hover:text-primary transition-colors">Learn about fees</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
