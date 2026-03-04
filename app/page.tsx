'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Search, 
  Shield, 
  Zap, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  ChevronRight,
  Clock,
  Users,
  Phone,
  Activity,
  Church,
  GraduationCap,
  AlertCircle,
  Users2,
  Briefcase,
  Home,
  Droplet
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Medical', icon: Activity, slug: 'medical', desc: 'Surgery, treatment, hospital bills' },
  { name: 'Church', icon: Church, slug: 'church', desc: 'Buildings, missions, outreach' },
  { name: 'Education', icon: GraduationCap, slug: 'education', desc: 'School fees, scholarships' },
  { name: 'Emergency', icon: AlertCircle, slug: 'emergency', desc: 'Fire, floods, urgent crises' },
  { name: 'Community', icon: Users2, slug: 'community', desc: 'Local projects, welfare' },
  { name: 'Business', icon: Briefcase, slug: 'business', desc: 'Startups, trading capital' }
];

// Custom hook for counting animation
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!start) return;
    
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, duration, start]);
  
  return count;
}

// Sample campaign data
const FEATURED_CAMPAIGNS = [
  {
    id: '1',
    title: 'Help Kwame fund his kidney surgery at Korle Bu',
    organizer: 'Kwame Foundation',
    location: 'Accra, Ghana',
    raised: 12500,
    goal: 50000,
    category: 'Medical',
    verified: true,
    donors: 47,
    daysLeft: 12
  },
  {
    id: '2',
    title: 'Send Abena to university — first in her family',
    organizer: 'Abena Mensah',
    location: 'Kumasi, Ghana',
    raised: 3200,
    goal: 15000,
    category: 'Education',
    verified: true,
    donors: 31,
    daysLeft: 25
  },
  {
    id: '3',
    title: 'Fire destroyed our home in Tema — urgent help',
    organizer: 'Yaw Darko',
    location: 'Tema, Ghana',
    raised: 850,
    goal: 25000,
    category: 'Emergency',
    verified: true,
    donors: 12,
    daysLeft: 8
  },
  {
    id: '4',
    title: 'Lighthouse Chapel Accra — Build our new sanctuary',
    organizer: 'Lighthouse Chapel',
    location: 'Accra, Ghana',
    raised: 45000,
    goal: 120000,
    category: 'Church',
    verified: true,
    donors: 210,
    daysLeft: 45
  },
  {
    id: '5',
    title: 'Help Maame expand her fabric business in Kumasi Market',
    organizer: 'Maame Asante',
    location: 'Kumasi, Ghana',
    raised: 2800,
    goal: 8000,
    category: 'Business',
    verified: true,
    donors: 52,
    daysLeft: 18
  },
  {
    id: '6',
    title: 'Cancer treatment for Auntie Ama — urgent chemo needed',
    organizer: 'Efua Boateng',
    location: 'Cape Coast, Ghana',
    raised: 6700,
    goal: 20000,
    category: 'Medical',
    verified: true,
    donors: 19,
    daysLeft: 15
  }
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  
  const statsRef = useRef(null);
  
  const raisedCount = useCountUp(2400000, 2000, statsVisible);
  const campaignsCount = useCountUp(1200, 2000, statsVisible);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Medical': return <Activity className="w-4 h-4" />;
      case 'Church': return <Church className="w-4 h-4" />;
      case 'Education': return <GraduationCap className="w-4 h-4" />;
      case 'Emergency': return <AlertCircle className="w-4 h-4" />;
      case 'Community': return <Users2 className="w-4 h-4" />;
      case 'Business': return <Briefcase className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 py-4 px-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            Every<span className="text-gray-900">Giving</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/campaigns" className="text-gray-600 hover:text-green-600">Browse</Link>
            <Link href="/how-it-works" className="text-gray-600 hover:text-green-600">How It Works</Link>
            <Link href="/success-stories" className="text-gray-600 hover:text-green-600">Stories</Link>
            <Link href="/about" className="text-gray-600 hover:text-green-600">About</Link>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-4">
            <Link href="/search" className="text-gray-600 hover:text-green-600">
              <Search className="w-5 h-5" />
            </Link>
            <Link
              href="/start-fundraiser"
              className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-700 transition"
            >
              Start Fundraiser
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-green-50 to-white pt-16 pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Ghana's #1 Verified Crowdfunding Platform
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 max-w-4xl mx-auto">
            The trusted way to raise money in Ghana
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Why send MoMo directly when you can raise more with trust? 
            Every Giving gives your cause a verified page, transparent tracking, and mobile money.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for fundraisers..."
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Link
                href={`/search?q=${searchQuery}`}
                className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition"
              >
                Search
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Verified identity</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              <span>Instant MoMo payout</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>0% platform fee</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>Transparent tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="border-y border-gray-200 bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">
                ₵{(raisedCount / 1000000).toFixed(1)}M+
              </div>
              <div className="text-sm text-gray-500">raised on platform</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {campaignsCount.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-500">verified campaigns</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">0%</div>
              <div className="text-sm text-gray-500">platform fee</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">24hrs</div>
              <div className="text-sm text-gray-500">avg. verification</div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Campaigns Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-3">Live campaigns right now</h2>
              <p className="text-xl text-gray-600">Verified causes making a real difference across Ghana</p>
            </div>
            <Link href="/campaigns" className="text-green-600 font-semibold hover:text-green-700 hidden md:block">
              View all campaigns →
            </Link>
          </div>

          {/* Campaign Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_CAMPAIGNS.slice(0, 3).map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
              >
                <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 relative flex items-center justify-center">
                  <div className="text-green-600">
                    {getCategoryIcon(campaign.category)}
                  </div>
                  {campaign.verified && (
                    <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs px-2 py-1 rounded-full">
                    {campaign.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 line-clamp-2">
                    {campaign.title}
                  </h3>
                  <div className="text-sm text-gray-500 mb-3">
                    {campaign.organizer} · {campaign.location}
                  </div>
                  <div className="mb-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${(campaign.raised / campaign.goal) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-900">
                      {formatCurrency(campaign.raised)}
                    </span>
                    <span className="text-gray-500">
                      of {formatCurrency(campaign.goal)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {campaign.donors} donors
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {campaign.daysLeft} days left
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile View All Link */}
          <div className="text-center mt-8 md:hidden">
            <Link href="/campaigns" className="text-green-600 font-semibold">
              View all campaigns →
            </Link>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            What do you need help with?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-10">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.slug}
                  href={`/campaigns?category=${cat.slug}`}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-md transition"
                >
                  <div className="flex justify-center mb-2">
                    <Icon className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="font-semibold text-gray-900">{cat.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{cat.desc}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Raise money in 3 simple steps
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            From idea to funded — takes less than 5 minutes to start
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create your campaign</h3>
              <p className="text-gray-600">Tell your story, set your goal, upload a photo.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get verified in 24hrs</h3>
              <p className="text-gray-600">Submit your Ghana Card. Verified campaigns raise 3× more.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-green-600 mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Share & receive MoMo</h3>
              <p className="text-gray-600">Share on WhatsApp. Funds land in your mobile wallet.</p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              href="/how-it-works"
              className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-2"
            >
              Watch animated tutorial <Play className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to start your story?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Join 1,200+ Ghanaians already using Every Giving. Free to start. Verified in 24hrs.
          </p>
          <Link
            href="/start-fundraiser"
            className="bg-green-600 text-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-green-700 transition inline-flex items-center gap-3"
          >
            <Heart className="w-6 h-6" />
            Start Your Fundraiser
          </Link>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-400">
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Free to start</span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Ghana Card verified</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Instant MoMo payout</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="text-2xl font-bold text-white mb-4 block">
                Every<span className="text-green-500">Giving</span>
              </Link>
              <p className="text-sm">Ghana's most trusted crowdfunding platform.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/campaigns" className="hover:text-white">Browse Campaigns</Link></li>
                <li><Link href="/success-stories" className="hover:text-white">Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/fees" className="hover:text-white">Fee Structure</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© 2024 Every Giving. All rights reserved. Ghana</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
