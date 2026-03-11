import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fundraising Categories',
  description: 'EveryGiving supports 17 fundraising categories - from medical bills to school fees, church projects to business capital. Whatever your cause, there is a place for it here.',
}

const CATEGORIES = [
  { name: 'Medical', emoji: '*', slug: 'medical', colour: 'bg-red-50 border-red-100 text-red-600', desc: 'Surgery, hospital bills, treatment costs, medication, and recovery support.', examples: ['Kidney transplant', 'Cancer treatment', 'Emergency surgery', 'Dialysis costs'] },
  { name: 'Emergency', emoji: 'EM', slug: 'emergency', colour: 'bg-orange-50 border-orange-100 text-orange-600', desc: 'Urgent crises: fire, floods, accidents, and unexpected disasters.', examples: ['House fire', 'Flood damage', 'Accident recovery', 'Sudden death'] },
  { name: 'Education', emoji: '*', slug: 'education', colour: 'bg-blue-50 border-blue-100 text-blue-600', desc: 'School fees, university tuition, scholarships, and learning materials.', examples: ['University fees', 'School uniform', 'Scholarship support', 'Vocational training'] },
  { name: 'Charity', emoji: '*', slug: 'charity', colour: 'bg-purple-50 border-purple-100 text-purple-600', desc: 'Fundraise on behalf of registered charities and non-profit organisations.', examples: ['Orphanage support', 'Food drive', 'Clothes donation', 'Community welfare'] },
  { name: 'Faith', emoji: '*', slug: 'faith', colour: 'bg-amber-50 border-amber-100 text-amber-600', desc: 'Church buildings, missions, outreach programmes, and faith-based projects.', examples: ['Church roof repair', 'Mission trip', 'Bible distribution', 'Mosque renovation'] },
  { name: 'Community', emoji: '*', slug: 'community', colour: 'bg-teal-50 border-teal-100 text-teal-600', desc: 'Local projects, neighbourhood improvements, and community welfare initiatives.', examples: ['Borehole project', 'Street lighting', 'Community centre', 'Clean-up campaign'] },
  { name: 'Environment', emoji: '*', slug: 'environment', colour: 'bg-green-50 border-green-100 text-green-600', desc: 'Tree planting, clean energy, conservation, and environmental protection.', examples: ['Tree planting drive', 'Solar panels', 'Beach cleanup', 'Waste recycling'] },
  { name: 'Business', emoji: '*', slug: 'business', colour: 'bg-slate-50 border-slate-100 text-slate-600', desc: 'Startups, trading capital, business expansion, and entrepreneurship.', examples: ['Trading capital', 'Shop startup', 'Equipment purchase', 'Market stall'] },
  { name: 'Family', emoji: '*', slug: 'family', colour: 'bg-rose-50 border-rose-100 text-rose-600', desc: 'Family needs, childcare, home support, and household emergencies.', examples: ['Rent arrears', 'Baby essentials', 'Single parent support', 'Home repair'] },
  { name: 'Sports', emoji: '*', slug: 'sports', colour: 'bg-cyan-50 border-cyan-100 text-cyan-600', desc: 'Athletes, teams, tournaments, and sporting equipment.', examples: ['Tournament fees', 'Sports kit', 'Training camp', 'Athlete sponsorship'] },
  { name: 'Events', emoji: '*', slug: 'events', colour: 'bg-pink-50 border-pink-100 text-pink-600', desc: 'Celebrations, concerts, cultural events, and community gatherings.', examples: ['Wedding costs', 'Cultural festival', 'School reunion', 'Concert production'] },
  { name: 'Competition', emoji: '*', slug: 'competition', colour: 'bg-yellow-50 border-yellow-100 text-yellow-600', desc: 'Academic competitions, talent shows, debates, and contests.', examples: ['Debate competition', 'Science olympiad', 'Talent show', 'Quiz competition'] },
  { name: 'Travel', emoji: '*', slug: 'travel', colour: 'bg-indigo-50 border-indigo-100 text-indigo-600', desc: 'Travel costs for medical treatment, education, work, or humanitarian missions.', examples: ['Medical trip abroad', 'Study abroad fees', 'Mission trip travel', 'Repatriation'] },
  { name: 'Volunteer', emoji: '*', slug: 'volunteer', colour: 'bg-lime-50 border-lime-100 text-lime-600', desc: 'Funding volunteer programmes, community service, and social impact projects.', examples: ['Teaching volunteering', 'Medical outreach', 'Youth programme', 'Sanitation project'] },
  { name: 'Wishes', emoji: '*', slug: 'wishes', colour: 'bg-violet-50 border-violet-100 text-violet-600', desc: 'Life-changing wishes, personal dreams, and meaningful milestones.', examples: ['Dream birthday', 'First home', 'Life bucket list', 'Special anniversary'] },
  { name: 'Memorial', emoji: '*', slug: 'memorial', colour: 'bg-gray-50 border-gray-200 text-gray-500', desc: 'Funeral expenses, burial costs, and memorial tributes.', examples: ['Funeral costs', 'Burial support', 'Memorial tribute', 'Obituary funding'] },
  { name: 'Other', emoji: '*', slug: 'other', colour: 'bg-primary-light border-primary/20 text-primary', desc: "Does not fit a category? Start your campaign and describe your cause.", examples: ['Unique causes', 'Personal projects', 'Creative endeavours', 'Custom campaigns'] },
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
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-6">
               17 categories
            </div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl mb-4" style={{ letterSpacing: -1 }}>
              Find your cause
            </h1>
            <p className="text-white/55 text-base max-w-xl mx-auto leading-relaxed mb-8">
              EveryGiving supports 17 fundraising categories. Whatever your cause - medical, education, faith, community, or personal - there is a home for it here.
            </p>
            <Link href="/create" className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/25 text-sm">
              Start your campaign
            </Link>
          </div>
        </section>

        {/* Categories grid */}
        <section className="py-16 bg-white px-5">
          <div className="max-w-6xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {CATEGORIES.map((cat) => (
                <Link key={cat.slug} href={`/campaigns?category=${cat.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 hover:border-primary/25 hover:shadow-lg transition-all p-6">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold border mb-4 ${cat.colour}`}>
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{cat.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.examples.map((ex) => (
                      <span key={ex} className="text-xs bg-gray-50 text-gray-500 border border-gray-100 px-2.5 py-1 rounded-full">{ex}</span>
                    ))}
                  </div>
                  <div className="mt-4 text-primary text-xs font-bold group-hover:underline">Browse campaigns</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-gray-50 px-5 border-t border-gray-100">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-nunito font-black text-navy text-3xl mb-3">Ready to start fundraising?</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">Pick your category, create your campaign in minutes, and start raising money from your community.</p>
            <Link href="/create" className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-10 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm">
              Create a free campaign
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
