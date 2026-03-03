import { Shield, ArrowRight, CheckCircle, Camera, Clock, Star } from 'lucide-react';
import Link from 'next/link';

export default function VerificationPage() {
  // Benefits of verification
  const benefits = [
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Verified Badge",
      description: "Get the ✅ badge on your campaign"
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      title: "Raise More",
      description: "Verified fundraisers raise 3x more"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      title: "Fast Payouts",
      description: "Get funds within 24-48 hours"
    }
  ];

  // Verification steps
  const steps = [
    {
      number: "1",
      title: "Create Account",
      description: "Sign up for free with your email",
      icon: "📝",
      color: "bg-blue-50"
    },
    {
      number: "2",
      title: "Upload Your ID",
      description: "Ghana Card, Voter's ID, or Passport",
      icon: "🪪",
      color: "bg-green-50"
    },
    {
      number: "3",
      title: "Take a Selfie",
      description: "Hold your ID so we can match you",
      icon: "🤳",
      color: "bg-yellow-50"
    },
    {
      number: "4",
      title: "Get Verified",
      description: "Approval within 24-48 hours",
      icon: "✅",
      color: "bg-purple-50"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-white/20 rounded-full p-4 mb-6 backdrop-blur">
            <Shield className="w-12 h-12" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Get Verified Today
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
            Build trust with donors and raise more money. It's free and takes just 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/verify" 
              className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition inline-flex items-center justify-center gap-2 shadow-lg"
            >
              Start Verification <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/how-it-works" 
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition inline-flex items-center justify-center"
            >
              Learn More
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            🔒 Your information is encrypted and secure
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-b border-gray-200 py-6 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">24-48h</div>
              <div className="text-sm text-gray-500">verification time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-500">free to verify</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">3x</div>
              <div className="text-sm text-gray-500">more donations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-gray-500">trusted badge</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Why Get Verified?</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Donors trust verified fundraisers. Here's what you get:
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition">
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Four simple steps to get verified
          </p>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className={`${step.color} rounded-xl p-6 flex items-center gap-4`}>
                <div className="text-4xl">{step.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                      {step.number}
                    </span>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 ml-8">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accepted IDs */}
      <div className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Accepted Identification</h2>
          <p className="text-gray-600 mb-8">Any of these government-issued IDs work</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl mb-2">🟢</div>
              <div className="font-semibold">Ghana Card</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl mb-2">🗳️</div>
              <div className="font-semibold">Voter's ID</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl mb-2">🛂</div>
              <div className="font-semibold">Passport</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-3xl mb-2">🚗</div>
              <div className="font-semibold">Driver's License</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Common Questions</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Is my information safe?</h3>
              <p className="text-gray-600">Yes! Your documents are encrypted and stored securely. We never share your information.</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">How long does it take?</h3>
              <p className="text-gray-600">Most verifications are completed within 24-48 hours. You'll get an email once approved.</p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">Is there a fee?</h3>
              <p className="text-gray-600">No! Verification is completely free. You only pay when you successfully raise funds.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-4">✨</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Verified?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            It's free, takes 2 minutes, and helps you raise more money.
          </p>
          <Link 
            href="/verify" 
            className="bg-green-600 text-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-green-700 transition inline-flex items-center gap-3 shadow-lg"
          >
            <Shield className="w-6 h-6" />
            Start Verification Now
          </Link>
          <p className="mt-6 text-gray-500">
            Have questions? <a href="mailto:support@everygiving.com" className="text-green-600 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </div>
  );
}
