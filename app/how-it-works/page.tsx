import { 
  Heart, 
  Share2, 
  Users, 
  Target, 
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
  MessageCircle,
  Camera
} from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  // Simple, friendly steps
  const steps = [
    {
      emoji: "📝",
      title: "Tell your story",
      description: "Share what you're raising money for—medical bills, education, emergencies, or a community project. Be honest and personal.",
      tip: "Stories with photos raise 5x more!",
      color: "bg-blue-50"
    },
    {
      emoji: "🎯",
      title: "Set your goal",
      description: "Choose a fundraising target. Don't worry—you can always adjust it later, and you keep whatever you raise even if you don't hit your goal.",
      tip: "Most successful campaigns raise between ₵1,000-₵5,000",
      color: "bg-green-50"
    },
    {
      emoji: "🤝",
      title: "Share with your people",
      description: "Send your campaign to friends, family, and community. Share on WhatsApp, Facebook, and Instagram—every share helps!",
      tip: "The first 48 hours are crucial—start with your closest supporters",
      color: "bg-purple-50"
    },
    {
      emoji: "❤️",
      title: "Watch the love pour in",
      description: "Get notifications when people donate. Post updates to thank supporters and show your progress.",
      tip: "Fundraisers who post updates raise 3x more!",
      color: "bg-pink-50"
    },
    {
      emoji: "💸",
      title: "Withdraw your funds",
      description: "Transfer money directly to your mobile money (MoMo) or bank account. Funds arrive within 3-5 business days.",
      tip: "You can withdraw at any time, even before reaching your goal",
      color: "bg-yellow-50"
    }
  ];

  // Real talk FAQs
  const faqs = [
    {
      question: "Does it cost anything to start?",
      answer: "Nope! It's completely free to start a campaign. We only charge a small 5% fee on what you raise—so if you raise ₵1,000, we take ₵50 to keep the platform running.",
      icon: "💰"
    },
    {
      question: "What can I raise money for?",
      answer: "Almost anything! Medical expenses, school fees, emergencies, church projects, community initiatives, helping a friend in need. If it matters to you, it matters to us.",
      icon: "🎁"
    },
    {
      question: "How do people find my campaign?",
      answer: "Most donors come from your own network—friends, family, and community. We give you easy tools to share on WhatsApp, Facebook, and Instagram. Some campaigns also get discovered through our platform!",
      icon: "🌍"
    },
    {
      question: "Is it safe?",
      answer: "Absolutely. We verify every campaign and use secure payment processing. Your donors' information is protected, and funds are held safely until you withdraw them.",
      icon: "🛡️"
    },
    {
      question: "What if I don't reach my goal?",
      answer: "No problem! You keep every cedi raised. There's no all-or-nothing requirement. Every little bit helps, and you can always extend your campaign.",
      icon: "✨"
    }
  ];

  // Success stories
  const stories = [
    {
      name: "Akua M.",
      story: "I raised ₵3,500 for my mother's surgery in just two weeks. My church shared the campaign, and people I hadn't seen in years donated!",
      emoji: "🙏"
    },
    {
      name: "Kwame A.",
      story: "My community came together to help rebuild after a fire. We raised ₵8,000—more than we ever imagined!",
      emoji: "🏠"
    },
    {
      name: "Esi F.",
      story: "I was nervous to ask for help with my school fees, but within days my friends and family showed up. I'm now in my final semester!",
      emoji: "🎓"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section - Warm and welcoming */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 pt-16 pb-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-block bg-green-200 rounded-full p-3 mb-6">
            <Heart className="w-8 h-8 text-green-700 fill-current" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            How <span className="text-green-600">Every Giving</span> works
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            Start a fundraiser in minutes. Get help from people who care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/start-fundraiser" 
              className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Start a fundraiser <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/campaigns" 
              className="bg-white text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition inline-flex items-center justify-center gap-2 border border-gray-200"
            >
              Browse campaigns
            </Link>
          </div>
          <p className="mt-6 text-gray-500 text-sm">
            ✨ Free to start • 5% platform fee only on what you raise • Withdraw anytime
          </p>
        </div>
      </div>

      {/* Stats Bar - Social proof */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">₵50K+</div>
              <div className="text-sm text-gray-500">raised so far</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">200+</div>
              <div className="text-sm text-gray-500">campaigns</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">1,000+</div>
              <div className="text-sm text-gray-500">donors</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">24-48h</div>
              <div className="text-sm text-gray-500">verification time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section - Friendly cards */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Here's how to get started
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            It's easier than you think. We'll guide you every step of the way.
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
                    <p className="text-sm text-green-700 bg-white/60 inline-block px-3 py-1 rounded-full">
                      💡 {step.tip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real Stories Section */}
      <div className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Real people, real stories
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Join hundreds of Ghanaians who've gotten the help they needed.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-3">{story.emoji}</div>
                <p className="text-gray-700 mb-4 italic">"{story.story}"</p>
                <p className="font-semibold text-green-700">— {story.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section - Conversational */}
      <div className="py-20 px-4 bg-green-50">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Got questions? We've got answers.
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Real talk about fundraising.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{faq.icon}</span>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 text-lg">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips from the community */}
      <div className="py-16 px-4 bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-3xl p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-6xl">💪</div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  Tips from successful fundraisers
                </h3>
                <ul className="space-y-2 text-green-50">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Share a clear photo of yourself or your cause</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Post updates every few days—people love to see progress</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Share on WhatsApp groups first—your close community will rally</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <span>Thank every donor personally—it makes them feel appreciated</span>
                  </li>
                </ul>
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
            Ready to start your story?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            You've got this. And we've got you.
          </p>
          <Link 
            href="/start-fundraiser" 
            className="bg-green-600 text-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-green-700 transition inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
          >
            <Heart className="w-6 h-6" />
            Start your fundraiser
          </Link>
          <p className="mt-6 text-gray-500">
            Free to start • 5% platform fee • Withdraw anytime
          </p>
        </div>
      </div>
    </div>
  );
}
