import { 
  UserPlus, 
  FileText, 
  Share2, 
  Wallet, 
  Shield, 
  Heart, 
  TrendingUp, 
  Globe,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  // Main steps for fundraisers
  const fundraiserSteps = [
    {
      icon: <UserPlus className="w-12 h-12 text-green-600" />,
      title: "1. Create an Account",
      description: "Sign up in minutes. We'll verify your identity to ensure trust and security on our platform.",
      details: "You'll need a valid email and Ghana Card or Voter's ID for verification."
    },
    {
      icon: <FileText className="w-12 h-12 text-green-600" />,
      title: "2. Start Your Campaign",
      description: "Tell your story, set a fundraising goal, and add photos. Our team reviews each campaign.",
      details: "Include clear details about your cause and how the funds will be used."
    },
    {
      icon: <Share2 className="w-12 h-12 text-green-600" />,
      title: "3. Share Your Story",
      description: "Share your campaign on social media, WhatsApp, and with friends and family.",
      details: "The more you share, the more you raise. We provide sharing tools to help."
    },
    {
      icon: <Wallet className="w-12 h-12 text-green-600" />,
      title: "4. Receive Funds",
      description: "Withdraw funds directly to your mobile money (MoMo) or bank account.",
      details: "Funds are transferred within 3-5 business days after verification."
    }
  ];

  // Features highlights
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Verified Campaigns",
      description: "Every campaign is verified to ensure authenticity and prevent fraud."
    },
    {
      icon: <Heart className="w-8 h-8 text-green-600" />,
      title: "Zero Platform Fees",
      description: "It's completely free to start a campaign. We only charge a small 5% fee on funds raised."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: "Real-Time Tracking",
      description: "Track your donations and campaign progress in real-time from your dashboard."
    },
    {
      icon: <Globe className="w-8 h-8 text-green-600" />,
      title: "Global Reach",
      description: "Accept donations from anywhere in the world. Supporters can pay via mobile money or card."
    }
  ];

  // FAQ items
  const faqs = [
    {
      question: "How long does verification take?",
      answer: "Most campaigns are verified within 24-48 hours. We'll notify you via email once your campaign is approved."
    },
    {
      question: "What documents do I need to verify my identity?",
      answer: "You'll need a valid government-issued ID (Ghana Card, Voter's ID, or Passport) and a clear photo of yourself."
    },
    {
      question: "How do I withdraw funds?",
      answer: "Funds can be withdrawn to your mobile money wallet (MTN, Vodafone, AirtelTigo) or bank account. Withdrawals are processed within 3-5 business days."
    },
    {
      question: "Is there a minimum or maximum goal?",
      answer: "There's no minimum goal. Maximum goal is subject to verification level - higher goals require additional verification."
    },
    {
      question: "What happens if I don't reach my goal?",
      answer: "You still receive all funds raised, minus our platform fee. There's no all-or-nothing requirement."
    },
    {
      question: "How are campaigns verified?",
      answer: "Our team reviews each campaign, checks IDs, contacts references, and may request additional documentation for large goals."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            How Every Giving Works
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Your trusted platform for transparent giving in Ghana — every cedi tracked, every cause verified.
          </p>
          <Link 
            href="/start-fundraiser" 
            className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
          >
            Start Your Campaign <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          Start Raising Funds in 4 Simple Steps
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Everything you need to launch a successful fundraising campaign
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {fundraiserSteps.map((step, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition relative group"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-xl border-4 border-white">
                {index + 1}
              </div>
              <div className="mb-6 transform group-hover:scale-110 transition">
                {step.icon}
              </div>
              <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600 mb-4">{step.description}</p>
              <p className="text-sm text-gray-500 border-t pt-4 italic">
                {step.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Why Choose Every Giving?
          </h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            We're building Ghana's most trusted fundraising platform
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 text-center">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          Everything you need to know about fundraising on Every Giving
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-lg font-semibold mb-3 flex items-start gap-2">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{faq.question}</span>
              </h3>
              <p className="text-gray-600 ml-8">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Start Your Fundraiser?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join hundreds of Ghanaians who have raised funds for medical emergencies, education, and community projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/start-fundraiser" 
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
            >
              Start a Fundraiser
            </Link>
            <Link 
              href="/campaigns" 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition"
            >
              Browse Campaigns
            </Link>
          </div>
          <p className="mt-6 text-sm opacity-75">
            Have questions? <a href="/contact" className="underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
}
