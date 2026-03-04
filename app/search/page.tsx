'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Types for our search results
interface Campaign {
  id: string;
  title: string;
  story: string;
  category: string;
  location: string;
  goalAmount: number;
  raisedAmount: number;
  organizerName: string;
  verified: boolean;
  imageUrl?: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data - replace with your Supabase fetch
  const mockCampaigns: Campaign[] = [
    {
      id: '1',
      title: 'Help Kay with Medical Bills',
      story: 'Emergency surgery needed for heart condition...',
      category: 'Medical',
      location: 'Accra, Ghana',
      goalAmount: 50000,
      raisedAmount: 12500,
      organizerName: 'Kay Foundation',
      verified: true,
    },
    {
      id: '2',
      title: 'My First Every Giving Campaign',
      story: 'Help me build transparent giving in Ghana...',
      category: 'Education',
      location: 'Kumasi, Ghana',
      goalAmount: 5000,
      raisedAmount: 0,
      organizerName: 'Jeffery Ofosu',
      verified: true,
    },
    {
      id: '3',
      title: 'Community Library Project',
      story: 'Building a library for local children...',
      category: 'Community',
      location: 'Cape Coast, Ghana',
      goalAmount: 15000,
      raisedAmount: 3200,
      organizerName: 'Cape Coast Development',
      verified: false,
    },
  ];

  const categories = [
    'all',
    'Medical',
    'Education',
    'Emergency',
    'Church',
    'Community',
    'Business',
  ];

  // Filter campaigns based on search and category
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call - replace with actual Supabase query
    setTimeout(() => {
      let filtered = [...mockCampaigns];
      
      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(campaign => 
          campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
          campaign.organizerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Filter by category
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(campaign => 
          campaign.category === selectedCategory
        );
      }
      
      setResults(filtered);
      setLoading(false);
    }, 500);
  }, [searchQuery, selectedCategory]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Search Input - GoFundMe style */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fundraisers..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition ${
                showFilters || selectedCategory !== 'all' ? 'border-green-500 text-green-600' : 'border-gray-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filter</span>
              {selectedCategory !== 'all' && (
                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs">
                  {selectedCategory}
                </span>
              )}
            </button>
          </div>

          {/* Category Filters - Expandable */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    selectedCategory === category
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Categories' : category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          {loading ? (
            <p>Searching...</p>
          ) : (
            <p>{results.length} {results.length === 1 ? 'fundraiser' : 'fundraisers'} found</p>
          )}
        </div>

        {/* Results Grid - GoFundMe style cards */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaigns/${campaign.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
              >
                {/* Image Placeholder - Replace with actual campaign image */}
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
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-green-600 transition">
                    {campaign.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {campaign.story}
                  </p>

                  {/* Organizer and Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="truncate">{campaign.organizerName}</span>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{campaign.location}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-full"
                        style={{ width: `${calculateProgress(campaign.raisedAmount, campaign.goalAmount)}%` }}
                      />
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-bold text-lg">
                        {formatCurrency(campaign.raisedAmount)}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        raised of {formatCurrency(campaign.goalAmount)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {Math.round(calculateProgress(campaign.raisedAmount, campaign.goalAmount))}%
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // No results state
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No fundraisers found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-green-600 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
