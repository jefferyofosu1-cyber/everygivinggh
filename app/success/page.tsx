'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Heart, Share2 } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get('campaign');
  const amount = searchParams.get('amount');
  const name = searchParams.get('name');

  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch campaign details if campaignId exists
    if (campaignId) {
      // Simulate API call
      setTimeout(() => {
        setCampaign({
          id: campaignId,
          title: 'Help Kwame fund his kidney surgery',
          organizer: 'Kwame Foundation'
        });
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [campaignId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="inline-block bg-green-100 rounded-full p-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Thank You, {name || 'Donor'}! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your donation of <span className="font-bold text-green-600">₵{amount || '0'}</span> has been received.
        </p>

        {/* Campaign Info */}
        {campaign && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
            <Heart className="w-8 h-8 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{campaign.title}</h2>
            <p className="text-gray-500">by {campaign.organizer}</p>
          </div>
        )}

        {/* Share Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Share this campaign</h3>
          <div className="flex justify-center gap-4">
            <button className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition inline-flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href="/campaigns"
            className="block w-full bg-gray-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition"
          >
            Browse More Campaigns
          </Link>
          
          <Link
            href="/"
            className="block w-full border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold hover:border-gray-400 transition"
          >
            Return to Home
          </Link>
        </div>

        {/* Receipt Notice */}
        <p className="mt-8 text-sm text-gray-500">
          A receipt has been sent to your email. Thank you for supporting a verified cause in Ghana! 🇬🇭
        </p>
      </div>
    </div>
  );
}
