'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { usePageContent, cms } from '@/lib/content'

const FALLBACK_POSTS = [
  {
    slug: 'how-to-write-a-fundraising-story',
    category: 'Tips',
    title: 'How to write a fundraising story that moves people to give',
    excerpt: 'Your story is your most powerful fundraising asset. Here is how to write one that builds trust, creates genuine emotion, and moves people to act.',
    read_time: '5 min read',
    created_at: 'March 2026',
    featured: true,
  },
  {
    slug: 'why-verification-matters',
    category: 'Verification',
    title: 'Why verification makes your campaign raise more',
    excerpt: 'Donors are cautious  -  and rightfully so. Here is the data on how verified campaigns perform compared to unverified ones.',
    read_time: '4 min read',
    created_at: 'March 2026',
    featured: false,
  },
  {
    slug: 'whatsapp-fundraising-guide',
    category: 'Sharing',
    title: 'The complete guide to fundraising on WhatsApp',
    excerpt: 'WhatsApp is Ghana\'s most powerful fundraising channel. Here is how to share your campaign the right way and get people to actually donate.',
    read_time: '6 min read',
    created_at: 'February 2026',
    featured: false,
  },
  {
    slug: 'medical-fundraising-ghana',
    category: 'Medical',
    title: 'How to raise money for medical bills in Ghana',
    excerpt: 'Medical campaigns are the most common  -  and the most urgent. A step-by-step guide for hospital bills, surgery, and treatment costs.',
    read_time: '5 min read',
    created_at: 'February 2026',
    featured: false,
  },
  {
    slug: 'church-fundraising-guide',
    category: 'Faith',
    title: 'Church fundraising in Ghana: building projects, missions, and ministry',
    excerpt: 'Faith-based campaigns are among the most successful on the platform. Here\'s how to structure your church fundraiser for maximum results.',
    read_time: '4 min read',
    created_at: 'January 2026',
    featured: false,
  },
  {
    slug: 'education-fundraising',
    category: 'Education',
    title: 'Raising school fees: a guide for students and their families',
    excerpt: 'University fees, school books, WASSCE levies  -  education campaigns succeed when they are specific, verified, and actively shared.',
    read_time: '4 min read',
    created_at: 'January 2026',
    featured: false,
  },
  {
    slug: 'team-fundraising-tips',
    category: 'Team',
    title: '7 ways to get your team to actually share  -  not just like',
    excerpt: 'Creating a team campaign is straightforward. Getting everyone to genuinely participate is harder. Here are 7 tactics that actually work.',
    read_time: '3 min read',
    created_at: 'December 2025',
    featured: false,
  },
  {
    slug: 'first-48-hours',
    category: 'Strategy',
    title: 'What to do in the first 48 hours',
    excerpt: 'The first two days are the most critical. Campaigns that gain momentum early are far more likely to hit their goal. Here\'s your hour-by-hour plan.',
    read_time: '5 min read',
    created_at: 'December 2025',
    featured: false,
  },
]

const CATEGORIES = ['All', 'Tips', 'Verification', 'Sharing', 'Medical', 'Faith', 'Education', 'Team', 'Strategy']

export default function BlogPage() {
  const c = usePageContent('blog')
  const [allPosts, setAllPosts] = useState(FALLBACK_POSTS)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/blog', { cache: 'no-store' })
        const json = await res.json()
        if (json.posts && json.posts.length > 0) {
          setAllPosts(json.posts)
        }
      } catch (err) {
        console.error('Failed to load blog posts:', err)
        // Keep fallback posts
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [])

  const filtered = selectedCategory === 'All'
    ? allPosts
    : allPosts.filter(p => p.category === selectedCategory)

  const featured = filtered.find((p: any) => p.featured)
  const rest = filtered.filter((p: any) => !p.featured)

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-navy relative overflow-hidden py-24">
          <div className="relative max-w-4xl mx-auto px-5 text-center text-white">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">Fundraising blog</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-4" style={{ letterSpacing: -1 }}>
              {cms(c, 'settings', 'headline', 'Tips, stories\nand guides')}
            </h1>
            <p className="text-white/50 text-sm max-w-lg mx-auto">{cms(c, 'settings', 'subtext', 'Practical guides, fundraising tactics, and real stories  -  written by the EveryGiving team.')}</p>
          </div>
        </section>

        {/* Category pills */}
        <div className="bg-white border-b border-gray-100 overflow-x-auto">
          <div className="max-w-5xl mx-auto px-5 py-3 flex gap-2 min-w-max">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <section className="py-12 bg-gray-50">
          <div className="max-w-5xl mx-auto px-5">

            {/* Featured post */}
            {featured && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8 hover:shadow-md transition-all group">
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-auto bg-gradient-to-br from-primary-light via-white to-blue-50 flex items-center justify-center text-7xl">
                    ⭐
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">Featured</span>
                      <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full">{featured.category}</span>
                    </div>
                    <h2 className="font-nunito font-black text-navy text-2xl mb-3 leading-snug group-hover:text-primary transition-colors">{featured.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">{featured.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{featured.read_time} · {new Date(featured.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                      <Link href={`/blog/${featured.slug}`} className="text-primary text-sm font-bold hover:underline">Read →</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Post grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
                ))}
              </div>
            ) : rest.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map((post, i) => (
                  <Link key={i} href={`/blog/${post.slug}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden group">
                    <div className="h-40 bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center text-5xl">
                      📝
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{post.category}</span>
                        <span className="text-gray-300 text-xs">{post.read_time}</span>
                      </div>
                      <h3 className="font-nunito font-black text-navy text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">{post.title}</h3>
                      <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">{post.excerpt}</p>
                      <div className="text-xs text-gray-300 mt-3">{new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">📚</div>
                <div className="font-nunito font-black text-navy text-xl mb-2">No blog posts yet</div>
                <p className="text-gray-400 text-sm">Check back soon for tips and guides.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-primary text-center px-5">
          <h2 className="font-nunito font-black text-white text-2xl mb-2">Ready to put these tips to work?</h2>
          <p className="text-white/70 text-sm mb-6">Start your verified campaign in under 15 minutes.</p>
          <Link href="/create" className="inline-block bg-white text-primary font-nunito font-black px-9 py-4 rounded-full hover:-translate-y-0.5 transition-all shadow-xl text-sm">
            Start your campaign →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
