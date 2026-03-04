import { 
  Heart, 
  Search, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Phone,
  Globe,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  // Stats data
  const stats = [
    { value: '₵2.4M+', label: 'raised by Ghanaians', icon: <TrendingUp className="w-5 h-5" /> },
    { value: '1,200+', label: 'verified campaigns', icon: <CheckCircle className="w-5 h-5" /> },
    { value: '0%', label: 'platform fee', icon: <Heart className="w-5 h-5" /> },
    { value: '24hrs', label: 'verification time', icon: <Clock className="w-5 h-5" /> },
  ];

  // How it works steps
  const steps = [
    {
      number: '1',
      title: 'Tell your story',
      description: 'Share what you\'re raising for—medical bills, school fees, emergencies, or community projects.',
      icon: '📝',
      color: 'bg-blue-50'
    },
    {
      number: '2',
      title: 'Get verified',
      description: 'Submit your Ghana Card. We verify your identity in 24 hours so donors can trust you.',
      icon: '✅',
      color: 'bg-green-50'
    },
    {
      number: '3',
      title: 'Share with your people',
      description: 'Share on WhatsApp, Facebook, and Instagram. Your community wants to help!',
      icon: '📱',
      color: 'bg-purple-50'
    },
    {
      number: '4',
      title: 'Receive MoMo instantly',
      description: 'Funds go straight to your mobile money—MTN, Vodafone, or AirtelTigo.',
      icon: '⚡',
      color: 'bg-yellow-50'
    },
  ];

  // Featured campaigns (static for now)
  const featuredCampaigns = [
    {
      id: 1,
      title: 'Help Kay with urgent medical surgery',
      organizer: 'Kay Foundation',
      location: 'Accra, Ghana',
      raised: 12500,
      goal: 50000,
      category: 'Medical',
      verified: true,
      image: '🏥',
    },
    {
      id: 2,
      title: 'My First Every Giving Campaign',
      organizer: 'Jeffery Ofosu',
      location: 'Kumasi, Ghana',
      raised: 0,
      goal: 5000,
      category: 'Education',
      verified: true,
      image: '🎓',
    },
    {
      id: 3,
      title: 'Community Library Project',
      organizer: 'Cape Coast Development',
      location: 'Cape Coast, Ghana',
      raised: 3200,
      goal: 15000,
      category: 'Community',
      verified: false,
      image: '📚',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - GoFundMe Style */}
      <div className="bg-gradient-to-b from-green-50 to-white pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="w-4 h-4" />
              <span>Ghana's most trusted crowdfunding platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              The trusted way to raise money in Ghana
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Why send MoMo directly when you can raise more with trust? Every Giving gives your cause a verified page, transparent tracking, and mobile money.
            </p>

            {/* Search Bar - Prominent like GoFundMe */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for fundraisers..."
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm"
                    readOnly
                  />
                </div>
                <Link
                  href="/search"
                  className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition inline-flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  Search
                </Link>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/start-fundraiser"
                className="bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition inline-flex items-center justify-center gap-2"
              >
                Start a fundraiser <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/how-it-works"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 transition"
              >
                How it works
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - Like GoFundMe's trust signals */}
      <div className="border-y border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* How It Works Section - Clean and Simple */}
      <div className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Raise money in 4 simple steps
            </h2>
            <p className="text-xl text-gray-600">
              From idea to funded — takes less than 5 minutes to start
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`${step.color} rounded-2xl p-8 h-full hover:shadow-md transition`}>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-green-600 border-2 border-green-200">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 text-2xl text-gray-300">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/how-it-works" className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-1">
              Learn more about how it works <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Campaigns - GoFundMe Style Grid */}
      <div className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                Featured campaigns
              </h2>
              <p className="text-xl text-gray-600">
                Verified causes making a real difference across Ghana
              </p>
            </div>
            <Link href="/campaigns" className="mt-4 md:mt-0 text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-1">
              View all campaigns <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Campaign Card Image */}
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
                    <span className="bg-white/90 text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium backdrop-blur">
                      {campaign.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
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

                  {/* Amount */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ₵{campaign.raised.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        raised of ₵{campaign.goal.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-green-600">
                      {Math.round((campaign.raised / campaign.goal) * 100)}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Every Giving - Trust Section */}
      <div className="bg-gray-50 py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Ghanaians trust Every Giving
            </h2>
            <p className="text-xl text-gray-600">
              We're building the most trusted fundraising platform in Ghana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Ghana Card Verified</h3>
              <p className="text-gray-600 leading-relaxed">Every fundraiser is verified with Ghana Card — not just email. Donors know you're real.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant MoMo Payout</h3>
              <p className="text-gray-600 leading-relaxed">Funds go straight to your MTN MoMo, Vodafone Cash, or AirtelTigo — fast and free.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Zero Platform Fee</h3>
              <p className="text-gray-600 leading-relaxed">100% of donations go to your cause. We don't take a cut — you keep everything.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories - Social Proof */}
      <div className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real people, real stories
            </h2>
            <p className="text-xl text-gray-600">
              Join over 1,200 Ghanaians who've raised money for what matters
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-5xl mb-4">🙏</div>
              <p className="text-gray-700 mb-4 italic">"I raised ₵3,500 for my mother's surgery in just two weeks. My church shared the campaign!"</p>
              <div className="font-semibold text-gray-900">— Akua M.</div>
              <div className="text-sm text-gray-500">Accra</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-5xl mb-4">🏠</div>
              <p className="text-gray-700 mb-4 italic">"After a fire destroyed our home, our community came together and raised ₵8,000."</p>
              <div className="font-semibold text-gray-900">— Kwame A.</div>
              <div className="text-sm text-gray-500">Kumasi</div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-5xl mb-4">🎓</div>
              <p className="text-gray-700 mb-4 italic">"I was nervous to ask for help with school fees, but my friends showed up. I'm now in my final semester!"</p>
              <div className="font-semibold text-gray-900">— Esi F.</div>
              <div className="text-sm text-gray-500">Cape Coast</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA - Big and Bold */}
      <div className="bg-gray-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">
            Ready to start your story?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of Ghanaians who've raised money for medical bills, education, emergencies, and community projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/start-fundraiser"
              className="bg-green-600 text-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-green-700 transition inline-flex items-center justify-center gap-3"
            >
              <Heart className="w-6 h-6" />
              Start your fundraiser
            </Link>
            <Link
              href="/campaigns"
              className="bg-white text-gray-900 px-10 py-5 rounded-full text-xl font-semibold hover:bg-gray-100 transition"
            >
              Browse campaigns
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-400">
            🔒 Free to start · Ghana Card verified · Instant MoMo payout
          </p>
        </div>
      </div>
    </div>
  );
}
