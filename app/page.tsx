import Link from 'next/link';
import { Heart, Search, ArrowRight, CheckCircle, Clock, Zap, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* HERO SECTION */}
      <div className="bg-gradient-to-b from-green-50 to-white pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Ghana's #1 Verified Crowdfunding Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Raise money for <span className="text-green-600">what matters</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join 1,200+ Ghanaians who've raised ₵2.4M+ for medical, education & community causes.
            <span className="block font-semibold text-green-600 mt-2">Free to start. Verified in 24hrs.</span>
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for fundraisers..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Link
                href="/search"
                className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition"
              >
                Search
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/start-fundraiser"
              className="bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition inline-flex items-center justify-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Start Fundraiser
            </Link>
            <Link
              href="/how-it-works"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold hover:border-gray-400 transition"
            >
              How It Works
            </Link>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="border-y border-gray-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <TrendingUp className="w-5 h-5" />
                <span className="text-2xl font-bold text-gray-900">₵2.4M+</span>
              </div>
              <div className="text-sm text-gray-500">raised by Ghanaians</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <CheckCircle className="w-5 h-5" />
                <span className="text-2xl font-bold text-gray-900">1,200+</span>
              </div>
              <div className="text-sm text-gray-500">verified campaigns</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold text-gray-900">24hrs</span>
              </div>
              <div className="text-sm text-gray-500">verification time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <Heart className="w-5 h-5" />
                <span className="text-2xl font-bold text-gray-900">0%</span>
              </div>
              <div className="text-sm text-gray-500">platform fee</div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-3">How it works</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Start raising money in 4 simple steps</p>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tell your story</h3>
              <p className="text-gray-600">Share why you're raising money</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get verified</h3>
              <p className="text-gray-600">Upload your Ghana Card</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share on WhatsApp</h3>
              <p className="text-gray-600">Tell friends and family</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">4️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive MoMo</h3>
              <p className="text-gray-600">Funds go to your mobile money</p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURED CAMPAIGNS */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900">Featured campaigns</h2>
            <Link href="/campaigns" className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Campaign Card 1 */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-6xl">🏥</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Medical</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Help Kay with urgent surgery</h3>
                <p className="text-gray-500 text-sm mb-3">Kay Foundation · Accra</p>
                <div className="h-2 bg-gray-100 rounded-full mb-2">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold">₵12,500 raised</span>
                  <span className="text-gray-500">of ₵50,000</span>
                </div>
              </div>
            </div>

            {/* Campaign Card 2 */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-6xl">🎓</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Education</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">School fees for brilliant student</h3>
                <p className="text-gray-500 text-sm mb-3">Scholarship Fund · Kumasi</p>
                <div className="h-2 bg-gray-100 rounded-full mb-2">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: '17%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold">₵850 raised</span>
                  <span className="text-gray-500">of ₵5,000</span>
                </div>
              </div>
            </div>

            {/* Campaign Card 3 */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <span className="text-6xl">📚</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">Community</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Community Library Project</h3>
                <p className="text-gray-500 text-sm mb-3">Cape Coast Development</p>
                <div className="h-2 bg-gray-100 rounded-full mb-2">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: '21%' }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold">₵3,200 raised</span>
                  <span className="text-gray-500">of ₵15,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Browse by category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/campaigns?category=Medical" className="bg-white p-4 rounded-xl hover:shadow-md transition">
              <div className="text-3xl mb-2">🏥</div>
              <div className="font-medium">Medical</div>
            </Link>
            <Link href="/campaigns?category=Education" className="bg-white p-4 rounded-xl hover:shadow-md transition">
              <div className="text-3xl mb-2">🎓</div>
              <div className="font-medium">Education</div>
            </Link>
            <Link href="/campaigns?category=Emergency" className="bg-white p-4 rounded-xl hover:shadow-md transition">
              <div className="text-3xl mb-2">🚨</div>
              <div className="font-medium">Emergency</div>
            </Link>
            <Link href="/campaigns?category=Church" className="bg-white p-4 rounded-xl hover:shadow-md transition">
              <div className="text-3xl mb-2">⛪</div>
              <div className="font-medium">Church</div>
            </Link>
            <Link href="/campaigns?category=Community" className="bg-white p-4 rounded-xl hover:shadow-md transition">
              <div className="text-3xl mb-2">🏠</div>
              <div className="font-medium">Community</div>
            </Link>
            <Link href="/campaigns?category=Business" className="bg-white p-4 rounded-xl hover:shadow-md transition">
              <div className="text-3xl mb-2">💼</div>
              <div className="font-medium">Business</div>
            </Link>
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="bg-gray-900 text-white py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to start your story?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join 1,200+ Ghanaians who've raised money for what matters.
          </p>
          <Link
            href="/start-fundraiser"
            className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition inline-flex items-center gap-2"
          >
            <Heart className="w-5 h-5" />
            Start Your Fundraiser
          </Link>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm text-gray-400">
            <span>✅ Free to start</span>
            <span>🪪 Ghana Card verified</span>
            <span>⚡ Instant MoMo payout</span>
          </div>
        </div>
      </div>

      {/* SIMPLE FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Heart className="w-5 h-5 text-green-500" />
            <span className="font-bold">EveryGiving</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/how-it-works" className="hover:text-white">How it works</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
          <div className="text-sm text-gray-500">
            © 2024 Every Giving
          </div>
        </div>
      </footer>
    </div>
  );
}
