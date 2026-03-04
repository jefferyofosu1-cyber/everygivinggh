import { 
  Search, 
  Heart, 
  Shield, 
  Zap, 
  Clock,
  ArrowRight,
  CheckCircle,
  Play,
  ChevronRight,
  TrendingUp,
  Users,
  Phone,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  // Stats data
  const stats = [
    { value: '₵2.4M+', label: 'raised by Ghanaians', icon: <TrendingUp className="w-5 h-5" /> },
    { value: '1,200+', label: 'verified campaigns', icon: <CheckCircle className="w-5 h-5" /> },
    { value: '24hrs', label: 'verification time', icon: <Clock className="w-5 h-5" /> },
    { value: '0%', label: 'platform fee', icon: <Heart className="w-5 h-5" /> },
  ];

  // Featured campaigns
  const featuredCampaigns = [
    {
      id: '1',
      title: 'Help Kay with urgent medical surgery',
      organizer: 'Kay Foundation',
      location: 'Accra, Ghana',
      raised: 12500,
      goal: 50000,
      category: 'Medical',
      verified: true,
      donors: 87,
      daysLeft: 12,
      image: '🏥',
    },
    {
      id: '2',
      title: 'Community Library Project',
      organizer: 'Cape Coast Development',
      location: 'Cape Coast, Ghana',
      raised: 3200,
      goal: 15000,
      category: 'Community',
      verified: true,
      donors: 43,
      daysLeft: 18,
      image: '📚',
    },
    {
      id: '3',
      title: 'School fees for brilliant student',
      organizer: 'Scholarship Fund',
      location: 'Kumasi, Ghana',
      raised: 850,
      goal: 5000,
      category: 'Education',
      verified: false,
      donors: 12,
      daysLeft: 25,
      image: '🎓',
    },
  ];

  // Categories
  const categories = [
    { name: 'Medical', icon: '🏥', color: 'bg-red-50', textColor: 'text-red-600' },
    { name: 'Education', icon: '🎓', color: 'bg-blue-50', textColor: 'text-blue-600' },
    { name: 'Emergency', icon: '🚨', color: 'bg-orange-50', textColor: 'text-orange-600' },
    { name: 'Church', icon: '⛪', color: 'bg-purple-50', textColor: 'text-purple-600' },
    { name: 'Community', icon: '🏠', color: 'bg-green-50', textColor: 'text-green-600' },
    { name: 'Business', icon: '💼', color: 'bg-yellow-50', textColor: 'text-yellow-600' },
  ];

  // Success stories
  const stories = [
    {
      name: 'Akua M.',
      story: 'I raised ₵3,500 for my mother\'s surgery in just two weeks. My church shared the campaign!',
      location: 'Accra',
      emoji: '🙏',
    },
    {
      name: 'Kwame A.',
      story: 'After a fire destroyed our home, our community came together and raised ₵8,000.',
      location: 'Kumasi',
      emoji: '🏠',
    },
    {
      name: 'Esi F.',
      story: 'I was nervous to ask for help with school fees, but my friends showed up. I\'m now in my final semester!',
      location: 'Cape Coast',
      emoji: '🎓',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* ===== SECTION 1: HERO + PRIMARY CTA ===== */}
      <div className="bg-gradient-to-b from-green-50 to-white pt-8 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Trust Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Ghana's #1 Verified Crowdfunding Platform
            </span>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
              Raise money for <span className="text-green-600">what matters</span> — with trust, not just hope
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join 1,200+ Ghanaians who've raised ₵2.4M+ for medical, education & community causes. 
              <span className="font-semibold text-green-600 block mt-2">Free to start. Verified in 24hrs.</span>
            </p>

            {/* Search Bar - Catches Donors */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for fundraisers..."
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                  />
                </div>
                <Link
                  href="/search"
                  className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  Search
                </Link>
              </div>
            </div>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/start-fundraiser"
                className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition inline-flex items-center justify-center gap-2 shadow-lg"
              >
                <Heart className="w-5 h-5" />
                Start Fundraiser
              </Link>
              <Link
                href="/how-it-works"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 transition inline-flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                How It Works
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                    {stat.icon}
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 2: TRUST SIGNALS ===== */}
      <div className="py-16 px-4 border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Ghanaians trust Every Giving</h2>
            <p className="text-lg text-gray-600">We've built trust from the ground up</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Ghana Card</h3>
              <p className="text-sm text-gray-500">Identity verified</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">MoMo Now</h3>
              <p className="text-sm text-gray-500">Instant payout</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">24hrs</h3>
              <p className="text-sm text-gray-500">Quick verification</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">0% Fee</h3>
              <p className="text-sm text-gray-500">Platform fee</p>
            </div>
          </div>

          {/* Media Mentions */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400 mb-4">Featured in</p>
            <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
              <span className="text-xl font-semibold text-gray-400">JoyNews</span>
              <span className="text-xl font-semibold text-gray-400">Citi FM</span>
              <span className="text-xl font-semibold text-gray-400">Graphic</span>
              <span className="text-xl font-semibold text-gray-400">3News</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 3: HOW IT WORKS ===== */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Start raising money in 4 steps</h2>
            <p className="text-xl text-gray-600">From idea to funded — takes less than 5 minutes</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 shadow-sm relative">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Tell your story</h3>
              <p className="text-gray-600 text-sm">Share why you're raising money—medical, school, or community</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm relative">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get verified</h3>
              <p className="text-gray-600 text-sm">Upload Ghana Card—verified in 24hrs</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm relative">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share on WhatsApp</h3>
              <p className="text-gray-600 text-sm">One-tap sharing to friends and family</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm relative">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">4️⃣</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive MoMo</h3>
              <p className="text-gray-600 text-sm">Funds go straight to your mobile money</p>
            </div>
          </div>

          {/* Video Tutorial Link */}
          <div className="text-center">
            <Link 
              href="/how-it-works" 
              className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 text-lg"
            >
              <Play className="w-5 h-5 fill-green-600" />
              Watch 1-minute tutorial
            </Link>
          </div>
        </div>
      </div>

      {/* ===== SECTION 4: FEATURED CAMPAIGNS ===== */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Featured campaigns</h2>
              <p className="text-xl text-gray-600">Real people, real results</p>
            </div>
            <Link 
              href="/campaigns" 
              className="mt-4 md:mt-0 text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-1"
            >
              View all campaigns <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {campaign.image}
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {campaign.verified && (
                      <span className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    <span className="bg-white/90 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium">
                      {campaign.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition line-clamp-2">
                    {campaign.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <span className="font-medium text-gray-700">{campaign.organizer}</span>
                    <span>·</span>
                    <span>{campaign.location}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-bold text-gray-900">₵{campaign.raised.toLocaleString()}</span>
                      <span className="text-gray-500"> raised of ₵{campaign.goal.toLocaleString()}</span>
                    </div>
                    <span className="text-gray-500">{campaign.donors} donors</span>
                  </div>

                  {/* Days Left */}
                  <div className="mt-3 text-xs text-gray-400">
                    {campaign.daysLeft} days left
                  </div>

                  {/* Donate Button */}
                  <div className="mt-4">
                    <span className="block w-full bg-green-50 text-green-600 text-center py-3 rounded-lg font-medium group-hover:bg-green-600 group-hover:text-white transition">
                      Donate Now
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SECTION 5: SUCCESS STORIES ===== */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Real stories from real people</h2>
            <p className="text-xl text-gray-600">Join 1,200+ Ghanaians who've raised money for what matters</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
                <div className="text-5xl mb-4">{story.emoji}</div>
                <p className="text-gray-700 mb-4 italic">"{story.story}"</p>
                <div className="font-semibold text-gray-900">{story.name}</div>
                <div className="text-sm text-gray-500">{story.location}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/success-stories"
              className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-1"
            >
              Read more stories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== SECTION 6: CATEGORY EXPLORER ===== */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Find a cause to support</h2>
            <p className="text-xl text-gray-600">Browse campaigns by category</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/campaigns?category=${category.name}`}
                className={`${category.color} rounded-xl p-6 text-center hover:shadow-md transition group`}
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className={`font-semibold ${category.textColor}`}>{category.name}</div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/campaigns"
              className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-1"
            >
              Browse all categories <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== SECTION 7: FAQ ===== */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Got questions? We've got answers</h2>
            <p className="text-xl text-gray-600">Everything you need to know about fundraising</p>
          </div>

          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 group">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-lg">Is it really free to start?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-4 text-gray-600">Yes! It's completely free to start a campaign. We only charge a small 5% fee on funds raised—so if you raise ₵1,000, we take ₵50 to keep the platform running.</p>
            </details>

            <details className="bg-white rounded-xl p-6 group">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-lg">How do I get verified?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-4 text-gray-600">Upload your Ghana Card, Voter's ID, or Passport. Take a clear photo and a selfie holding your ID. We'll verify within 24 hours.</p>
            </details>

            <details className="bg-white rounded-xl p-6 group">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-lg">How do I withdraw money?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-4 text-gray-600">Funds go directly to your mobile money wallet—MTN MoMo, Vodafone Cash, or AirtelTigo. Withdraw anytime, even before reaching your goal.</p>
            </details>

            <details className="bg-white rounded-xl p-6 group">
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-lg">Is my information safe?</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition" />
              </summary>
              <p className="mt-4 text-gray-600">Absolutely! Your documents are encrypted and stored securely. We never share your personal information.</p>
            </details>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/faq"
              className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-1"
            >
              View all FAQs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ===== SECTION 8: FINAL CTA ===== */}
      <div className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to start your story?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join 1,200+ Ghanaians who've raised money for medical bills, education, emergencies, and community projects.
          </p>
          
          <Link
            href="/start-fundraiser"
            className="bg-green-600 text-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-green-700 transition inline-flex items-center justify-center gap-3 shadow-lg hover:shadow-xl mb-6"
          >
            <Heart className="w-6 h-6" />
            Start Your Fundraiser
          </Link>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-2">✅ Free to start</span>
            <span className="flex items-center gap-2">🪪 Ghana Card verified</span>
            <span className="flex items-center gap-2">⚡ Instant MoMo payout</span>
          </div>
        </div>
      </div>
    </div>
  );
}
