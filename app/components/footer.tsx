import Link from 'next/link';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <Heart className="w-6 h-6 text-green-500 fill-current" />
              <span>Every<span className="text-green-500">Giving</span></span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Ghana's most trusted crowdfunding platform. Verified campaigns, transparent tracking, and instant MoMo payouts.
            </p>
            <div className="space-y-2">
              <a href="mailto:support@everygiving.com" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-500 transition">
                <Mail className="w-4 h-4" /> support@everygiving.com
              </a>
              <a href="tel:+233241234567" className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-500 transition">
                <Phone className="w-4 h-4" /> +233 (0) 24 123 4567
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4" /> Accra, Ghana
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/how-it-works" className="text-sm text-gray-400 hover:text-green-500 transition">How It Works</Link></li>
              <li><Link href="/start-fundraiser" className="text-sm text-gray-400 hover:text-green-500 transition">Start a Fundraiser</Link></li>
              <li><Link href="/campaigns" className="text-sm text-gray-400 hover:text-green-500 transition">Browse Campaigns</Link></li>
              <li><Link href="/success-stories" className="text-sm text-gray-400 hover:text-green-500 transition">Success Stories</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-gray-400 hover:text-green-500 transition">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-400 hover:text-green-500 transition">Contact</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-400 hover:text-green-500 transition">FAQ</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-400 hover:text-green-500 transition">Blog</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-gray-400 hover:text-green-500 transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-sm text-gray-400 hover:text-green-500 transition">Privacy Policy</Link></li>
              <li><Link href="/verification" className="text-sm text-gray-400 hover:text-green-500 transition">Verification Policy</Link></li>
              <li><Link href="/fees" className="text-sm text-gray-400 hover:text-green-500 transition">Fee Structure</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© {currentYear} Every Giving. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-green-500 transition">Privacy</Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-green-500 transition">Terms</Link>
            <div className="flex gap-4">
              <a href="https://facebook.com/everygivinggh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/everygivinggh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/everygivinggh" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
