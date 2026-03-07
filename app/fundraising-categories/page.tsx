import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const CATEGORIES = [
  { name: 'Medical', emoji: '🏥', slug: 'medical', desc: 'Surgery, hospital bills, treatment costs, medication and recovery support.', examples: ['Kidney transplant', 'Cancer treatment', 'Emergency surgery', 'Dialysis costs'] },
  { name: 'Emergency', emoji: '🆘', slug: 'emergency', desc: 'Urgent crises — fire, floods, accidents and unexpected disasters.', examples: ['House fire', 'Flood damage', 'Accident recovery', 'Sudden death expenses'] },
  { name: 'Education', emoji: '🎓', slug: 'education', desc: 'School fees, university tuition, scholarships and learning materials.', examples: ["University fees", 'School uniform & books', 'Scholarship support', 'Vocational training'] },
  { name: 'Charity', emoji: '🤲', slug: 'charity', desc: 'Fundraise on behalf of registered charities and non-profit organisations.', examples: ['Orphanage support', 'Food drive', 'Clothes donation', 'Community welfare'] },
  { name: 'Faith', emoji: '⛪', slug: 'faith', desc: 'Church buildings, missions, outreach programmes and faith-based projects.', examples: ['Church roof repair', 'Mission trip', 'Bible distribution', 'Mosque renovation'] },
  { name: 'Community', emoji: '🏘', slug: 'community', desc: 'Local projects, neighbourhood improvements and community welfare.', examples: ['Borehole project', 'Street lighting', 'Community centre', 'Clean-up campaign'] },
  { name: 'Environment', emoji: '🌿', slug: 'environment', desc: 'Tree planting, clean energy, conservation and environmental protection.', examples: ['Tree planting drive', 'Solar panels', 'Beach cleanup', 'Waste recycling'] },
  { name: 'Business', emoji: '💼', slug: 'business', desc: 'Startups, trading capital, business expansion and entrepreneurship.', examples: ['Trading capital', 'Shop startup', 'Equipment purchase', 'Market stall'] },
  { name: 'Family', emoji: '👨‍👩‍👧', slug: 'family', desc: 'Family needs, childcare, home support and household emergencies.', examples: ['Rent arrears', 'Baby essentials', 'Single parent support', 'Home repair'] },
  { name: 'Sports', emoji: '⚽', slug: 'sports', desc: 'Athletes, teams, tournaments and sporting equipment.', examples: ['Tournament fees', 'Sports kit', 'Training camp', 'Athlete sponsorship'] },
  { name: 'Events', emoji: '🎉', slug: 'events', desc: 'Celebrations, concerts, cultural events and community gatherings.', examples: ['Wedding costs', 'Cultural festival', 'School reunion', 'Concert production'] },
  { name: 'Competition', emoji: '🏆', slug: 'competition', desc: 'Academic competitions, talent shows, debates and contests.', examples: ['Debate competition', 'Science olympiad', 'Talent show', 'Quiz competition'] },
  { name: 'Travel', emoji: '✈️', slug: 'travel', desc: 'Travel costs for medical treatment, education, work or humanitarian missions.', examples: ['Medical trip abroad', 'Study abroad fees', 'Mission trip travel', 'Repatriation'] },
  { name: 'Volunteer', emoji: '🙌', slug: 'volunteer', desc: 'Funding volunteer programmes, community service and social impact projects.', examples: ['Teaching volunteering', 'Medical outreach', 'Youth programme', 'Sanitation project'] },
  { name: 'Wishes', emoji: '🌟', slug: 'wishes', desc: 'Life-changing wishes, dreams and personal milestones.', examples: ['Dream birthday', 'First home', 'Life bucket list', 'Special anniversary'] },
  { name: 'Memorial', emoji: '🕊', slug: 'memorial', desc: 'Funeral expenses, burial costs and memorial tributes.', examples: ['Funeral costs', 'Burial support', 'Memorial tribute', 'Obituary funding'] },
  { name: 'Other', emoji: '💚', slug: 'other', desc: "Doesn't fit a category? Start your campaign and describe your cause.", examples: ['Unique causes', 'Personal projects', 'Creative endeavours', 'Custom campaigns'] },
]

export default function FundraisingCategoriesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-navy py-16 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">17 categories</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-4" style={{ letterSpacing: -1 }}>
              Find your cause
            </h1>
            <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">
              Every Giving supports 17 fundraising categories. Whether it's medical, education, faith or community — there is a place for your cause here.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="py-14 bg-gray-50">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {CATEGORIES.map((cat, i) => (
                <Link key={i} href={`/campaigns?category=${cat.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {cat.emoji}
                    </div>
                    <div>
                      <div className="font-nunito font-black text-navy text-lg group-hover:text-primary transition-colors">{cat.name}</div>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{cat.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.examples.map((ex, j) => (
                      <span key={j} className="text-xs bg-gray-50 border border-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{ex}</span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-primary text-center px-5">
          <h2 className="font-nunito font-black text-white text-3xl mb-3">Found your category?</h2>
          <p className="text-white/70 text-sm mb-7">Start your verified campaign in under 15 minutes. Free to create.</p>
          <Link href="/create" className="inline-block bg-white text-primary font-nunito font-black px-10 py-4 rounded-full hover:-translate-y-0.5 transition-all shadow-xl text-sm">
            Start your campaign →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
