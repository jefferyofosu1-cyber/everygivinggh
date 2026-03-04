// app/tutorial/page.tsx
import { Play, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">How Every Giving Works</h1>
        <p className="text-xl text-gray-600 mb-8">Watch this quick tutorial to learn how to start fundraising in minutes.</p>

        {/* Video placeholder - replace with actual video embed */}
        <div className="bg-gray-200 rounded-2xl aspect-video flex items-center justify-center mb-8">
          <div className="text-center">
            <div className="bg-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-green-700 transition">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <p className="text-gray-600">Tutorial video coming soon</p>
          </div>
        </div>

        {/* Steps summary */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Quick steps:</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <span className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center text-green-600 font-bold">1</span>
              <div>
                <h3 className="font-semibold">Tell your story</h3>
                <p className="text-gray-600">Share why you're raising money</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center text-green-600 font-bold">2</span>
              <div>
                <h3 className="font-semibold">Get verified</h3>
                <p className="text-gray-600">Upload your Ghana Card for verification</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center text-green-600 font-bold">3</span>
              <div>
                <h3 className="font-semibold">Share with friends</h3>
                <p className="text-gray-600">Share on WhatsApp and social media</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center text-green-600 font-bold">4</span>
              <div>
                <h3 className="font-semibold">Receive MoMo</h3>
                <p className="text-gray-600">Funds go straight to your mobile money</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
