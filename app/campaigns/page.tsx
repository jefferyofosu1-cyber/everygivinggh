import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CampaignCard from '@/components/ui/CampaignCard'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const revalidate = 60

const CATEGORIES = ['all', 'medical', 'education', 'church', 'emergency', 'business', 'community']
const EMOJI: Record<string, string> = { all: '🌍', medical: '🏥', education: '🎓', church: '⛪', emergency: '🆘', business: '💼', community: '🏡' }

export default async function CampaignsPage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category || 'all'
  const supabase = createServerSupabaseClient()

  let query = supabase.from('campaigns').select('*, profiles(full_name)').eq('status', 'approved').order('created_at', { ascending: false })
  if (category !== 'all') query = query.eq('category', category)
  const { data: campaigns } = await query

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Header */}
        <div className="bg-navy py-12 px-5">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-nunito font-black text-white text-3xl tracking-tight mb-2">Discover campaigns</h1>
            <p className="text-white/50 text-sm">Verified causes across Ghana — every cedi tracked transparently</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="bg-gray-50 border-b border-gray-100 px-5 py-4 sticky top-16 z-40">
          <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto scrollbar-none">
            {CATEGORIES.map(cat => (
              <a key={cat} href={`/campaigns${cat !== 'all' ? `?category=${cat}` : ''}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  category === cat ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                }`}>
                {EMOJI[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </a>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-5 py-10">
          {campaigns && campaigns.length > 0 ? (
            <>
              <p className="text-sm text-gray-400 mb-6">{campaigns.length} campaigns found</p>
              <div className="grid md:grid-cols-3 gap-5">
                {campaigns.map((c: any) => <CampaignCard key={c.id} campaign={c} />)}
              </div>
            </>
          ) : (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🌱</div>
              <h3 className="font-nunito font-black text-navy text-xl mb-2">No campaigns yet in this category</h3>
              <p className="text-gray-400 text-sm mb-6">Be the first to start a fundraiser here</p>
              <a href="/create" className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-colors text-sm">
                Start a campaign →
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
