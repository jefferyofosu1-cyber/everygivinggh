import { Shield, CheckCircle, Camera, Clock, Heart, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';

export default function VerificationPage() {
  const steps = [
    {
      emoji: "📱",
      title: "Sign up",
      description: "Create your free account with your email or phone.",
      color: "bg-blue-50"
    },
    {
      emoji: "🪪",
      title: "Upload your ID",
      description: "Take a clear photo of your Ghana Card, Voter's ID, or Passport.",
      color: "bg-green-50"
    },
    {
      emoji: "🤳",
      title: "Take a selfie",
      description: "Take a selfie holding your ID so we can match it's really you.",
      color: "bg-yellow-50"
    },
    {
      emoji: "⏱️",
      title: "Wait for approval",
      description: "Our team reviews your documents within 24-48 hours.",
      color: "bg-purple-50"
    }
  ];

  const benefits = [
    {
      title: "Verified badge",
      description: "Get the ✅ badge on your campaign"
    },
    {
      title: "Raise more money",
      description: "Verified campaigns raise 3x more"
    },
    {
      title: "Higher limits",
      description: "Withdraw up to ₵10,000 per month"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 pt-16 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-green-200 rounded-full p-4 mb-6">
            <Shield className="w-10 h-10 text-green-700" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Get <span className="text-green-600">Verified</span> Today
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Build trust with donors and raise more money. It's free and takes just 2 minutes.
          </p>
          <Link 
            href="/dashboard/verification" 
            className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition inline-flex items-center gap-2 shadow-lg"
          >
            Start verification <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How verification works</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Just 4 simple steps</p>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className={`${step.color} rounded-2xl p-6`}>
                <div className="flex items-center gap-6">
                  <div className="text-5xl">{step.emoji}</div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-green-600 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to get verified?</h2>
          <p className="text-xl mb-8 opacity-90">It's free and helps you raise more money.</p>
          <Link 
            href="/dashboard/verification" 
            className="bg-white text-green-600 px-10 py-5 rounded-full text-xl font-semibold hover:bg-gray-100 transition inline-flex items-center gap-3"
          >
            <Shield className="w-6 h-6" />
            Start verification
          </Link>
        </div>
      </div>
    </div>
  );
}
