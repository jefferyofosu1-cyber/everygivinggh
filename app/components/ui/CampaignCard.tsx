import Link from 'next/link';
import { CheckCircle, Users, Clock } from 'lucide-react';

interface CampaignCardProps {
  campaign: {
    id: string;
    title: string;
    organizer: string;
    location: string;
    raised: number;
    goal: number;
    category: string;
    verified: boolean;
    donors: number;
    daysLeft: number;
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const progress = (campaign.raised / campaign.goal) * 100;

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
    >
      {/* Image Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-green-100 to-green-200 relative">
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

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-green-600 line-clamp-2">
          {campaign.title}
        </h3>
        <div className="text-sm text-gray-500 mb-3">
          {campaign.organizer} · {campaign.location}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-bold text-gray-900">
            {formatCurrency(campaign.raised)}
          </span>
          <span className="text-gray-500">
            of {formatCurrency(campaign.goal)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
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
  );
}
