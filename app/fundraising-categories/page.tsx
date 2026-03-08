import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const CATEGORIES = [
  { name:'Medical', emoji:'🏥', slug:'medical', desc:'Surgery, hospital bills, treatment costs, medication and recovery support.', img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80&auto=format&fit=crop', examples:['Kidney transplant','Cancer treatment','Emergency surgery','Dialysis costs'] },
  { name:'Emergency', emoji:'🆘', slug:'emergency', desc:'Urgent crises — fire, floods, accidents and unexpected disasters.', img:'https://images.unsplash.com/photo-1564419320408-38bb6f3c32ba?w=400&q=80&auto=format&fit=crop', examples:['House fire','Flood damage','Accident recovery','Sudden death'] },
  { name:'Education', emoji:'🎓', slug:'education', desc:'School fees, university tuition, scholarships and learning materials.', img:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80&auto=format&fit=crop', examples:['University fees','School uniform','Scholarship support','Vocational training'] },
  { name:'Charity', emoji:'🤲', slug:'charity', desc:'Fundraise on behalf of registered charities and non-profit organisations.', img:'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&q=80&auto=format&fit=crop', examples:['Orphanage support','Food drive','Clothes donation','Community welfare'] },
  { name:'Faith', emoji:'⛪', slug:'faith', desc:'Church buildings, missions, outreach programmes and faith-based projects.', img:'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=400&q=80&auto=format&fit=crop', examples:['Church roof repair','Mission trip','Bible distribution','Mosque renovation'] },
  { name:'Community', emoji:'🏘', slug:'community', desc:'Local projects, neighbourhood improvements and community welfare.', img:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80&auto=format&fit=crop', examples:['Borehole project','Street lighting','Community centre','Clean-up campaign'] },
  { name:'Environment', emoji:'🌿', slug:'environment', desc:'Tree planting, clean energy, conservation and environmental protection.', img:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80&auto=format&fit=crop', examples:['Tree planting drive','Solar panels','Beach cleanup','Waste recycling'] },
  { name:'Business', emoji:'💼', slug:'business', desc:'Startups, trading capital, business expansion and entrepreneurship.', img:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80&auto=format&fit=crop', examples:['Trading capital','Shop startup','Equipment purchase','Market stall'] },
  { name:'Family', emoji:'👨‍👩‍👧', slug:'family', desc:'Family needs, childcare, home support and household emergencies.', img:'https://images.unsplash.com/photo-1520350094754-f0fdcac35c1c?w=400&q=80&auto=format&fit=crop', examples:['Rent arrears','Baby essentials','Single parent support','Home repair'] },
  { name:'Sports', emoji:'⚽', slug:'sports', desc:'Athletes, teams, tournaments and sporting equipment.', img:'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&q=80&auto=format&fit=crop', examples:['Tournament fees','Sports kit','Training camp','Athlete sponsorship'] },
  { name:'Events', emoji:'🎉', slug:'events', desc:'Celebrations, concerts, cultural events and community gatherings.', img:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80&auto=format&fit=crop', examples:['Wedding costs','Cultural festival','School reunion','Concert production'] },
  { name:'Competition', emoji:'🏆', slug:'competition', desc:'Academic competitions, talent shows, debates and contests.', img:'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&q=80&auto=format&fit=crop', examples:['Debate competition','Science olympiad','Talent show','Quiz competition'] },
  { name:'Travel', emoji:'✈️', slug:'travel', desc:'Travel costs for medical treatment, education, work or humanitarian missions.', img:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80&auto=format&fit=crop', examples:['Medical trip abroad','Study abroad fees','Mission trip travel','Repatriation'] },
  { name:'Volunteer', emoji:'🙌', slug:'volunteer', desc:'Funding volunteer programmes, community service and social impact projects.', img:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80&auto=format&fit=crop', examples:['Teaching volunteering','Medical outreach','Youth programme','Sanitation project'] },
  { name:'Wishes', emoji:'🌟', slug:'wishes', desc:'Life-changing wishes, dreams and personal milestones.', img:'https://images.unsplash.com/photo-1513689125086-6c432170e843?w=400&q=80&auto=format&fit=crop', examples:['Dream birthday','First home','Life bucket list','Special anniversary'] },
  { name:'Memorial', emoji:'🕊', slug:'memorial', desc:'Funeral expenses, burial costs and memorial tributes.', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&auto=format&fit=crop', examples:['Funeral costs','Burial support','Memorial tribute','Obituary funding'] },
  { name:'Other', emoji:'💚', slug:'other', desc:"Doesn't fit a category? Start your campaign and describe your cause.", img:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop', examples:['Unique causes','Personal projects','Creative endeavours','Custom campaigns'] },
]

export default function FundraisingCategoriesPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-navy py-16 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',backgroundSize:'32px 32px'}} />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">17 categories</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-4" style={{letterSpacing:-1}}>Find your cause</h1>
            <p className="text-white/50 text-base max-w-xl mx-auto leading-relaxed">Every Giving supports 17 fundraising categories. Whatever your cause — there is a place for it here.</p>
          </div>
        </section>

        <section className="py-14 bg-gray-50">
          <div className="max-w-6xl mx-auto px-5">
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {CATEGORIES.map((cat, i) => (
                <Link key={i} href={`/campaigns?category=${cat.slug}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden group">
                  {/* Real photo header */}
                  <div className="h-40 relative overflow-hidden">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="font-nunito font-black text-white text-lg">{cat.name}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-gray-500 text-sm leading-relaxed mb-3">{cat.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.examples.map((ex, j) => (
                        <span key={j} className="text-xs bg-gray-50 border border-gray-100 text-gray-500 px-2.5 py-1 rounded-full">{ex}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

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
