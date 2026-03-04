import { CheckCircle, Zap, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            The trusted way to raise money in Ghana
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Why send MoMo directly when you can raise more with trust? Every Giving gives your cause a verified page, transparent tracking, and mobile money — so donors give with confidence.
          </p>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-sm mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Verified identity — donors know you're real</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-300" />
              <span>MTN MoMo, Vodafone Cash & AirtelTigo built-in</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-300" />
              <span>Full transparency — every cedi tracked publicly</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-300" />
              <span>🔒 No platform fee · Verified campaigns · Instant MoMo payout</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/start-fundraiser"
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-300 transition"
            >
              Start a fundraiser
            </Link>
            <Link
              href="/campaigns"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition"
            >
              Browse campaigns
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-b border-gray-200 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">₵2.4M+</div>
              <div className="text-sm text-gray-500">Raised on platform</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">1,200+</div>
              <div className="text-sm text-gray-500">Verified campaigns</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-500">Platform fee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">24hrs</div>
              <div className="text-sm text-gray-500">Avg. verification</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Money Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Mobile Money First</h3>
              <p className="text-gray-600">MTN MoMo, Vodafone Cash & AirtelTigo — the way Ghanaians actually pay</p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Ghana Card Verified</h3>
              <p className="text-gray-600">Every organiser verified by identity — not just email</p>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-xl font-semibold mb-2">Zero Platform Fee</h3>
              <p className="text-gray-600">100% of donations reach the campaign. You keep everything.</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link href="/campaigns" className="text-green-600 font-semibold hover:underline">
              See all →
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Campaigns Section */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Featured campaigns</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Verified causes making a real difference across Ghana</p>
          
          {/* This would be populated with actual campaigns from your database */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Campaign cards would go here */}
          </div>
        </div>
      </div>

      {/* 3 Simple Steps Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Raise money in 3 simple steps</h2>
          <p className="text-xl text-gray-600 text-center mb-8">From idea to funded — takes less than 5 minutes to start</p>
          <p className="text-center mb-12">
            <Link href="/tutorial" className="text-green-600 hover:underline">
              ▶ Watch animated tutorial
            </Link>
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create your campaign</h3>
              <p className="text-gray-600">Tell your story, set your goal, upload a photo. Our guided form makes it easy — no tech skills needed.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Get verified in 24hrs</h3>
              <p className="text-gray-600">Submit your Ghana Card + supporting documents. Verified campaigns raise 3× more money.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Share & receive MoMo</h3>
              <p className="text-gray-600">Share on WhatsApp. Donors pay instantly via MoMo or card. Funds land in your mobile wallet same day.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-green-600 text-white py-20 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to start raising money?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Join over 1,200 Ghanaians already using Every Giving. Free to start. Verified in 24hrs. Instant MoMo payout.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/start-fundraiser"
            className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-300 transition"
          >
            Start your fundraiser
          </Link>
          <Link
            href="/campaigns"
            className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition"
          >
            Browse campaigns
          </Link>
        </div>
        <p className="mt-6 text-sm opacity-75">
          🔒 Ghana Card verified · 0% platform fee · Instant MoMo payout
        </p>
      </div>
    </div>
  );
}
