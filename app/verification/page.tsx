import { 
  Shield, 
  CheckCircle, 
  Camera, 
  IdCard, 
  Clock, 
  Heart,
  ArrowRight,
  Star,
  Lock,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';

export default function VerificationPage() {
  // Verification steps
  const steps = [
    {
      emoji: "📱",
      title: "Sign up",
      description: "Create your free account with your email or phone number.",
      color: "bg-blue-50"
    },
    {
      emoji: "🪪",
      title: "Upload your ID",
      description: "Take a clear photo of your Ghana Card, Voter's ID, or Passport.",
      tip: "Make sure all details are clearly visible",
      color: "bg-green-50"
    },
    {
      emoji: "🤳",
      title: "Take a selfie",
      description: "Take a selfie holding your ID so we can match it's really you.",
      tip: "Good lighting helps!",
      color: "bg-yellow-50"
    },
    {
      emoji: "⏱️",
      title: "Wait for approval",
      description: "Our team reviews your documents within 24-48 hours.",
      tip: "You'll get an email and SMS when you're verified",
      color: "bg-purple-50"
    },
    {
      emoji: "✅",
      title: "You're verified!",
      description: "Now you can start fundraising and people will trust your campaign.",
      tip: "Verified fundraisers raise 3x more!",
      color: "bg-pink-50"
    }
  ];

  // ID types accepted
  const idTypes = [
    {
      name: "Ghana Card",
      icon: "🟢",
      description: "National ID card with chip"
    },
    {
      name: "Voter's ID",
      icon: "🗳️",
      description: "Electoral Commission ID"
    },
    {
      name: "Passport",
      icon: "🛂",
      description: "Valid Ghanaian passport"
    },
    {
      name: "Driver's License",
      icon: "🚗",
      description: "Valid driver's license"
    }
  ];

  // Benefits of verification
  const benefits = [
    {
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      title: "Verified badge",
      description: "Get the ✅ badge on your campaign - donors trust verified fundraisers"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: "Raise more money",
      description: "Verified campaigns raise 3x more than unverified ones"
    },
    {
      icon: <Shield className="w-6 h-6 text-green-600" />,
      title: "Higher withdrawal limits",
      description: "Withdraw up to ₵10,000 per month when verified"
    },
    {
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      title: "Faster payouts",
      description: "Verified fundraisers get funds within 24-48 hours"
    }
  ];

  // FAQs
  const faqs = [
    {
      question: "Why do I need to verify?",
      answer: "Verification helps us make sure you're really you! It protects donors from fraud and makes our platform safe for everyone. Plus, verified fundraisers raise more money because people trust them.",
      icon: "🤔"
    },
    {
      question: "Is my information safe?",
      answer: "Absolutely! Your documents are encrypted and stored securely. We only use them to verify your identity - never for anything else. We're GDPR compliant and take your privacy seriously.",
      icon: "🔒"
    },
    {
      question: "How long does verification take?",
      answer: "Most verifications are completed within 24 hours. Sometimes it can take up to 48 hours if we need to double-check something. You'll get an SMS and email as soon as you're verified!",
      icon: "⏰"
    },
    {
      question: "What if my verification is rejected?",
      answer: "No problem! We'll tell you why and you can try again. Common reasons: photo is blurry, ID is expired, or we can't clearly see your face. Just resubmit with clearer photos.",
      icon: "🔄"
    },
    {
      question: "Do I need to verify to donate?",
      answer: "Nope! Anyone can donate without verifying. Verification is only for people who want to start fundraisers.",
      icon: "❤️"
    },
    {
      question: "Is there a fee for verification?",
      answer: "It's completely free! We never charge for verification. You only pay our small platform fee when you successfully raise money.",
      icon: "💰"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 pt-16 pb-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block bg-green-200 rounded-full p-4 mb-6">
            <Shield className="w-10 h-10 text-green-700" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Get <span className="text-green-600">Verified</span> Today
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            Build trust with donors and raise more money. It's free and takes just 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dashboard/verification" 
              className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Start verification <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/how-it-works" 
              className="bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition inline-flex items-center justify-center gap-2 border border-gray-200"
            >
              Learn more
            </Link>
          </div>
          <p className="mt-6 text-gray-500 text-sm flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> Your info is encrypted and secure
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto max-w-5xl px-4">
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
              <div className="text-2xl font-bold text-green-600">🔒</div>
              <div className="text-sm text-gray-500">encrypted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Verify Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why get verified?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Donors trust verified fundraisers. Here's what you get:
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-md hover:shadow-lg transition">
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            How verification works
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Just 5 simple steps - you can do it right from your phone!
          </p>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`${step.color} rounded-2xl p-6 md:p-8 transition hover:shadow-md`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="text-5xl md:text-6xl md:w-24 text-center md:text-left">
                    {step.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-green-600 border-2 border-green-200">
                        {index + 1}
                      </span>
                      <h3 className="text-2xl font-semibold text-gray-800">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-lg mb-2">
                      {step.description}
                    </p>
                    {step.tip && (
                      <p className="text-sm text-green-700 bg-white/60 inline-block px-3 py-1 rounded-full">
                        💡 {step.tip}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accepted IDs Section */}
      <div className="py-20 px-4 bg-green-50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Accepted identification
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Any of these government-issued IDs work
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {idTypes.map((id, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-4xl mb-3">{id.icon}</div>
                <h3 className="font-semibold text-gray-800">{id.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{id.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white/80 rounded-xl p-6 inline-block">
            <p className="text-gray-700">
              <Camera className="w-5 h-5 inline mr-2 text-green-600" />
              Make sure your ID is clearly visible and not expired
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Common questions
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Everything you need to know about verification
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{faq.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="py-16 px-4 bg-gradient-to-r from-green-600 to-green-700">
        <div className="container mx-auto max-w-4xl">
          <div className="text-white text-center">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-3xl font-bold mb-6">Tips for quick verification</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
                <div className="text-2xl mb-2">☀️</div>
                <h4 className="font-semibold mb-2">Good lighting</h4>
                <p className="text-green-50 text-sm">Take photos in bright light so your ID is clear</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold mb-2">Hold steady</h4>
                <p className="text-green-50 text-sm">Keep your phone still to avoid blurry photos</p>
              </div>
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur">
                <div className="text-2xl mb-2">👤</div>
                <h4 className="font-semibold mb-2">Face visible</h4>
                <p className="text-green-50 text-sm">Make sure your face is clearly visible in selfie</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-4 bg-white text-center">
        <div className="container mx-auto max-w-2xl">
          <div className="text-6xl mb-6">✨</div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to get verified?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            It's free, takes 2 minutes, and helps you raise more money.
          </p>
          <Link 
            href="/dashboard/verification" 
            className="bg-green-600 text-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-green-700 transition inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Shield className="w-6 h-6" />
            Start verification
          </Link>
          <p className="mt-6 text-gray-500">
            Have questions? <Link href="/contact" className="text-green-600 hover:underline">Contact us</Link>
          </p>
        </div>
      </div>

      {/* Need Help Section */}
      <div className="border-t border-gray-200 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-600">Need help with verification?</span>
            </div>
            <div className="flex gap-4">
              <a href="tel:+233000000000" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                <Phone className="w-4 h-4" /> Call us
              </a>
              <a href="mailto:support@everygiving.com" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                <Mail className="w-4 h-4" /> Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
