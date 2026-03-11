import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Trust & safety · Every Giving',
  description:
    'Learn how Every Giving protects donors and fundraisers through verification, reviews, and fraud checks.',
}

export default function TrustPage() {
  const pillars = [
    {
      title: 'Identity verification',
      emoji: '🪪',
      body: 'Every fundraiser must verify their identity with Ghana Card or an accepted ID before going live.',
    },
    {
      title: 'Manual review',
      emoji: '👀',
      body: 'Our team reviews campaigns, stories, and documents before approval. Suspicious campaigns are rejected or paused.',
    },
    {
      title: 'Milestone-based payouts',
      emoji: '🏆',
      body: 'Funds are released in stages as milestones are reached, so donors can see progress before each payout.',
    },
    {
      title: 'Secure payments',
      emoji: '🔒',
      body: 'All payments are processed over encrypted connections with trusted Ghanaian payment providers.',
    },
  ]

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <section className="bg-navy text-white py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="font-nunito font-black text-3xl md:text-4xl mb-3">
              Trust & safety
            </h1>
            <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
              We are building Ghana&apos;s most trusted crowdfunding platform.
              Here is how we protect donors and fundraisers.
            </p>
          </div>
        </section>
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-8">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="text-2xl mb-2">{p.emoji}</div>
                <h2 className="font-nunito font-black text-navy text-base mb-1">
                  {p.title}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

