// app/page.tsx
import { Search, CheckCircle, Zap, Shield, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Image from 'next/image';

// This is a Server Component that fetches campaigns directly
export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch active campaigns, including the organizer's name from profiles
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      story,
      category,
      location,
      goal_amount,
      raised_amount,
      verified,
      image_url,
      profiles!campaigns_user_id_fkey (
        full_name
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6); // Show 6 featured campaigns

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            The trusted way to raise money in Ghana
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Why send MoMo directly when you can raise more with trust? Every Giving gives your cause a verified page, transparent tracking, and mobile money.
          </p>
          
          {/* GoFundMe-Style Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/search"
                className="flex-1 bg-white text-gray-800 px-6 py-4 rounded-full text-lg flex items-center justify-between hover:shadow-xl transition"
              >
                <span className="text-gray-500">🔍 Search for fundraisers...</span>
                <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-semibold">
                  Search
                </span>
              </Link>
              <Link
                href="/start-fundraiser"
                className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-300 transition inline-flex items-center justify-center gap-2"
              >
                Start a fundraiser
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Verified identity</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-300" />
              <span>Instant MoMo payout</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-300" />
              <span>0% platform fee</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-300" />
              <span>Transparent tracking</span>
            </div>
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

      {/* Featured Campaigns Grid - GoFundMe Style */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2">Featured campaigns</h2>
              <p className="text-gray-600">Verified causes making a real difference across Ghana</p>
            </div>
            <Link href="/search" className="text-green-600 font-semibold hover:underline">
              See all →
            </Link>
          </div>

          {/* Campaign Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns?.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
              >
                {/* Campaign Image */}
                <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 relative">
                  {campaign.verified && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <span>✓</span>
                      <span>Verified</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {campaign.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-green-600 transition line-clamp-2">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {campaign.story}
                  </p>

                  {/* Organizer */}
                  <div className="text-sm text-gray-500 mb-3">
                    {campaign.profiles?.full_name || 'Anonymous'} · {campaign.location || 'Ghana'}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${calculateProgress(campaign.raised_amount || 0, campaign.goal_amount)}%` }}
                      />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-bold text-lg">
                        {formatCurrency(campaign.raised_amount || 0)}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        raised of {formatCurrency(campaign.goal_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Rest of your existing content (3 steps, features, etc.) */}
      {/* ... keep your great explanatory sections below ... */}

      {/* 3 Simple Steps Section */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Raise money in 3 simple steps</h2>
          <p className="text-xl text-gray-600 text-center mb-12">From idea to funded — takes less than 5 minutes to start</p>
          
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
            href="/search"
            className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition"
          >
            Browse campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
