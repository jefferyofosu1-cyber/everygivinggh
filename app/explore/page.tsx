import { sanityClient } from '@/lib/sanity.client'
import {
  allCampaignsQuery,
  categoriesQuery,
} from '@/lib/sanity.queries'
import { CampaignCard } from '@/components/cms/CampaignCard'
import { CategoryFilter } from '@/components/cms/CategoryFilter'

type SearchParams = {
  q?: string
  category?: string
  page?: string
}

const PAGE_SIZE = 9

export const revalidate = 60

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const page = Math.max(parseInt(searchParams.page || '1', 10), 1)
  const q = (searchParams.q || '').trim()
  const category = (searchParams.category || '').trim()

  const [campaigns, categories] = await Promise.all([
    sanityClient.fetch(
      allCampaignsQuery,
    ),
    sanityClient.fetch(categoriesQuery),
  ])

  const filtered = campaigns.filter((c: any) => {
    const matchCategory = !category || c.category === category
    const matchSearch =
      !q ||
      c.title.toLowerCase().includes(q.toLowerCase()) ||
      (c.beneficiaryName || '').toLowerCase().includes(q.toLowerCase())
    return matchCategory && matchSearch
  })

  const start = (page - 1) * PAGE_SIZE
  const pageItems = filtered.slice(start, start + PAGE_SIZE)
  const hasNext = start + PAGE_SIZE < filtered.length

  return (
    <>
      <main className="min-h-screen" style={{ background: 'var(--surface-alt)' }}>
        <section className="bg-navy text-white py-14">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h1
              className="font-nunito font-black text-3xl md:text-5xl tracking-tight mb-4"
              style={{ letterSpacing: -1 }}
            >
              Explore campaigns
            </h1>
            <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto">
              Verified fundraisers across Ghana for medical care, education,
              churches, and community needs.
            </p>
          </div>
        </section>

        <section className="py-6 border-b sticky top-0 z-10" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="max-w-5xl mx-auto px-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CategoryFilter
              categories={categories.map((c: any) => ({
                slug: c.slug,
                name: c.name,
                icon: c.icon,
              }))}
            />
            {/* Search is kept simple via query param; users can type in the URL query for now */}
          </div>
        </section>

        <section className="py-10">
          <div className="max-w-5xl mx-auto px-6">
            {pageItems.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="text-4xl mb-3">🔍</div>
                <div className="font-nunito font-black text-navy text-xl mb-2">
                  No campaigns found
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Try a different category or search term.
                </p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pageItems.map((c: any) => (
                    <CampaignCard
                      key={c._id}
                      slug={c.slug}
                      title={c.title}
                      coverImage={c.coverImage}
                      category={c.category}
                      goalAmount={c.goalAmount}
                      amountRaised={c.amountRaised || 0}
                      verificationLevel={c.verificationLevel}
                      status={c.status}
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center mt-8 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span>
                    Showing{' '}
                    <strong>
                      {start + 1}-{Math.min(start + PAGE_SIZE, filtered.length)}
                    </strong>{' '}
                    of <strong>{filtered.length}</strong> campaigns
                  </span>
                  <div className="flex gap-3">
                    {page > 1 && (
                      <a
                        href={`/explore?page=${page - 1}${
                          category ? `&category=${category}` : ''
                        }${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                        className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-primary hover:text-primary"
                      >
                        Previous
                      </a>
                    )}
                    {hasNext && (
                      <a
                        href={`/explore?page=${page + 1}${
                          category ? `&category=${category}` : ''
                        }${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                        className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-primary hover:text-primary"
                      >
                        Next
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
