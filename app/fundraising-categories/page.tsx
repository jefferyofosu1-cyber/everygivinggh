'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Category {
  id: string; label: string; emoji: string; gradient: string;
  color: string; accent: string; count: number; avgGoal: string;
  successRate: string; desc: string; tip: string; examples: string[];
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = [
  { id:'medical', label:'Medical', emoji:'MED', gradient:'linear-gradient(135deg,#1B4332,#52B788)', color:'#E1F5EE', accent:'#0A6B4B', count:3, avgGoal:'₵18,000', successRate:'78%', desc:'Surgery, treatment, medication, hospital bills, and post-operative care.', tip:"Lead with a real photo of the patient. Name, age, and one personal detail in the first sentence. State the exact cost and the deadline — surgery scheduled for [date] is the most powerful urgency signal.", examples:['Kidney surgery at Korle Bu','Cancer treatment abroad','Post-accident physiotherapy','Child with heart condition'] },
  { id:'education', label:'Education', emoji:'EDU', gradient:'linear-gradient(135deg,#5C3317,#A0522D)', color:'#FEF3E2', accent:'#B85C00', count:2, avgGoal:'₵8,500', successRate:'82%', desc:'University fees, school supplies, exam registration, scholarships, and study abroad.', tip:"Donors respond to academic achievement — include the school name, the course, and what the student had to do to earn their place. 'She passed with distinction' is more powerful than 'she needs help with fees.'", examples:['First-year university fees','WASSCE exam registration','Nursing school tuition','School supplies for a class'] },
  { id:'emergency', label:'Emergency', emoji:'EMR', gradient:'linear-gradient(135deg,#922B21,#C0392B)', color:'#FCEBEB', accent:'#A32D2D', count:1, avgGoal:'₵7,000', successRate:'71%', desc:'Fire, flood, accident, sudden job loss, theft, and disaster recovery.', tip:"Urgency is built into emergency campaigns — lean into it honestly. Show the before-and-after: what was there before, what was lost. A photo of the damage raises more than any amount of text.", examples:['House fire recovery','Flood damage repairs','Road accident costs','Sudden job loss'] },
  { id:'faith', label:'Faith', emoji:'RLG', gradient:'linear-gradient(135deg,#2C3E50,#4A6FA5)', color:'#E6F1FB', accent:'#185FA5', count:2, avgGoal:'₵32,000', successRate:'88%', desc:'Church roofs, mosque repairs, religious events, community worship spaces.', tip:"Faith campaigns have the highest success rate on EveryGiving because the community is already gathered. Share the campaign in every WhatsApp group, every Sunday. Congregation campaigns reach 30% in 48 hours more often than any other category.", examples:['Church roof replacement','Mosque renovation','Religious retreat centre','Sound system for worship'] },
  { id:'community', label:'Community', emoji:'COM', gradient:'linear-gradient(135deg,#1A5276,#2E86C1)', color:'#EBF5FB', accent:'#1A5276', count:2, avgGoal:'₵28,000', successRate:'74%', desc:'Boreholes, community centres, market repairs, street lighting, shared infrastructure.', tip:"Community campaigns succeed when they show collective ownership. Even a small contribution from community members themselves — ₵5 each — signals legitimacy. Diaspora donors give heavily to community infrastructure projects.", examples:['Clean water borehole','Community centre roof','Market stall renovation','Solar street lights'] },
  { id:'funeral', label:'Funeral', emoji:'FNL', gradient:'linear-gradient(135deg,#4A235A,#7D3C98)', color:'#EEEDFE', accent:'#534AB7', count:1, avgGoal:'₵6,500', successRate:'85%', desc:'Funeral costs, burial expenses, repatriation, and bereavement support for families.', tip:"Funeral campaigns move fast because the need is immediate and time-bound. Share within hours of launching, not days. Honour the person who passed — their life, their contribution to the community — not just the cost.", examples:['Funeral and burial costs','Body repatriation from abroad','Bereavement family support','Memorial service'] },
  { id:'family', label:'Family', emoji:'FAM', gradient:'linear-gradient(135deg,#117A65,#1ABC9C)', color:'#E8F8F5', accent:'#117A65', count:1, avgGoal:'₵5,000', successRate:'68%', desc:'Supporting families through hardship — poverty, food insecurity, housing, childcare.', tip:"Family campaigns need a specific person at the centre. 'Help the Mensah family' is weak. 'Help Ama Mensah feed her three children after losing her husband' is strong. Specificity creates empathy.", examples:['Single parent support','Housing after eviction','Food assistance for family','Childcare while parent recovers'] },
  { id:'sports', label:'Sports', emoji:'SPT', gradient:'linear-gradient(135deg,#7D6608,#F1C40F)', color:'#FEFDE7', accent:'#7D6608', count:0, avgGoal:'₵12,000', successRate:'61%', desc:'Athletes, youth sports teams, equipment, travel to competitions, training costs.', tip:"Sports campaigns work best when donors feel they are investing in potential, not charity. Show achievements: league table position, tournament wins, what reaching this competition means. Video updates of training sessions convert extremely well.", examples:['National youth team travel','Athletic equipment','Training camp fees','Sports scholarship support'] },
  { id:'volunteer', label:'Volunteer', emoji:'VOL', gradient:'linear-gradient(135deg,#2E4057,#048A81)', color:'#E0F7F5', accent:'#048A81', count:0, avgGoal:'₵9,000', successRate:'64%', desc:'NGO projects, volunteer programmes, social impact initiatives, and community service.', tip:"Volunteer campaigns struggle when they sound vague. Be specific about the output: 'We will build 20 desks for 3 schools in the Northern Region.' Donors want to fund a concrete outcome, not an organisation.", examples:['NGO school building project','Community health screening','Youth mentorship programme','Environmental cleanup'] },
  { id:'business', label:'Business', emoji:'BIZ', gradient:'linear-gradient(135deg,#1B2631,#2C3E50)', color:'#EAECEE', accent:'#2C3E50', count:0, avgGoal:'₵15,000', successRate:'48%', desc:'Small business startup, equipment purchase, market stall, trade expansion.', tip:"Business campaigns face the highest scepticism — be aware of the 'begging' perception. Frame it as investment, not charity. Show your trading history, existing customers, and exactly what the equipment will enable you to produce or sell.", examples:['Market stall equipment','Sewing machine for tailoring','Small farm irrigation','Kiosk startup capital'] },
  { id:'wedding', label:'Wedding', emoji:'WED', gradient:'linear-gradient(135deg,#922B21,#E74C3C)', color:'#FDEDEC', accent:'#922B21', count:0, avgGoal:'₵8,000', successRate:'55%', desc:'Traditional and church wedding costs, bride price, reception, and celebrations.', tip:"Wedding campaigns succeed when the community is directly involved in sharing. Asking family members and friends to each contribute ₵50–₵200 feels natural in Ghanaian culture — it's a digital version of the traditional contribution envelope.", examples:['Traditional wedding support','Church reception costs','Wedding attire','Bride price assistance'] },
  { id:'memorial', label:'Memorial', emoji:'MEM', gradient:'linear-gradient(135deg,#616A6B,#839192)', color:'#F2F3F4', accent:'#5D6D7E', count:0, avgGoal:'₵4,500', successRate:'79%', desc:'One-year memorials, tombstones, memorial plaques, and remembrance events.', tip:"Memorial campaigns are deeply personal. Tell the story of the person being remembered — what they meant to their community, what they built, who they loved. The memorial is not the point; the person is.", examples:['One-year anniversary event','Tombstone inscription','Memorial scholarship fund','Remembrance gathering'] },
  { id:'animals', label:'Animals', emoji:'PET', gradient:'linear-gradient(135deg,#7D3C98,#A569BD)', color:'#F5EEF8', accent:'#7D3C98', count:0, avgGoal:'₵3,500', successRate:'52%', desc:'Veterinary care, animal shelters, rescue operations, and livestock support for farmers.', tip:"Animal campaigns resonate most when tied to a human story — a farmer whose livelihood depends on their livestock, or a child whose pet needs urgent care. Pure animal welfare campaigns are newer to Ghana's giving culture.", examples:['Livestock veterinary care','Animal rescue shelter','Farm animal feed support','Pet emergency surgery'] },
  { id:'arts', label:'Arts & Culture', emoji:'ART', gradient:'linear-gradient(135deg,#6C3483,#9B59B6)', color:'#F4ECF7', accent:'#6C3483', count:0, avgGoal:'₵11,000', successRate:'58%', desc:'Music albums, film production, art exhibitions, cultural events, and creative projects.', tip:"Arts campaigns need to show the work, not just describe it. A 60-second video clip, a sample track, a sketch of the exhibition — donors want proof of the creator's ability before they invest. Crowdfunding an arts project is crowdfunding the artist.", examples:['Music album recording','Short film production','Art exhibition costs','Cultural festival funding'] },
  { id:'environment', label:'Environment', emoji:'ENV', gradient:'linear-gradient(135deg,#1E8449,#27AE60)', color:'#E9F7EF', accent:'#1E8449', count:0, avgGoal:'₵20,000', successRate:'55%', desc:'Tree planting, environmental clean-ups, renewable energy, and climate projects.', tip:"Environmental campaigns win when they show local, visible impact. 'Plant 500 trees in Kumasi by December' outperforms 'fight climate change.' Diaspora donors give heavily to environmental projects — make the international sharing easy.", examples:['Tree planting initiative','Solar energy for rural school','Beach clean-up','Organic farming startup'] },
  { id:'technology', label:'Technology', emoji:'TEC', gradient:'linear-gradient(135deg,#1A237E,#3949AB)', color:'#E8EAF6', accent:'#1A237E', count:0, avgGoal:'₵14,000', successRate:'50%', desc:'Coding bootcamps, laptops for students, tech education, digital skills training.', tip:"Technology campaigns need to overcome the perception that digital skills are a luxury. Frame access to technology as access to economic opportunity — 'this laptop means Kwame can compete for the same jobs as students in Accra.'", examples:['Laptop for university student','Coding bootcamp fees','Tech lab for rural school','Digital skills training'] },
  { id:'other', label:'Other', emoji:'OTH', gradient:'linear-gradient(135deg,#424949,#717D7E)', color:'#F2F3F4', accent:'#424949', count:0, avgGoal:'₵8,000', successRate:'55%', desc:"Any cause that doesn't fit neatly into another category — every need matters.", tip:"If your campaign doesn't fit any other category, choose this one. Write your story clearly and honestly — donors respond to genuine need, not category labels. The most important thing is that your story is specific, personal, and honest.", examples:['Travel for family emergency','Legal fees support','Disability equipment','Unique personal circumstances'] },
]

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function FundraisingCategoriesPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = CATEGORIES.filter(c =>
    !search || c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.desc.toLowerCase().includes(search.toLowerCase())
  )

  const selectedCat = selected ? CATEGORIES.find(c => c.id === selected) ?? null : null
  const avgSuccess = Math.round(CATEGORIES.reduce((a, c) => a + parseFloat(c.successRate), 0) / CATEGORIES.length)
  const liveCats = CATEGORIES.filter(c => c.count > 0).length

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        @keyframes fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .cat-card{cursor:pointer;transition:all .18s;border:1px solid #E8E4DC;background:#fff;border-radius:14px;overflow:hidden}
        .cat-card:hover{transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,0,0,.1)}
        .cat-card.active{box-shadow:0 0 0 3px #0A6B4B,0 12px 32px rgba(10,107,75,.15) !important;transform:translateY(-4px)}
        .cat-browse-btn:hover{background:#D1EDDF !important}
        .spotlight{animation:fadeup .3s ease both}
        input:focus{outline:none}
      ` }} />
      {/* HERO */}
      <div style={{ background:'#1A1A18', padding:'0 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'64px 0', textAlign:'center' as const }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase' as const, color:'#B7DEC9', marginBottom:12 }}>All categories</div>
          <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:44, lineHeight:1.1, color:'#fff', marginBottom:14 }}>
            Every cause<br /><em style={{ color:'#B7DEC9', fontStyle:'italic' }}>deserves to be funded</em>
          </h1>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.5)', lineHeight:1.75, maxWidth:520, margin:'0 auto 36px' }}>
            EveryGiving supports {CATEGORIES.length} categories of fundraising — from medical emergencies to community boreholes. Find your cause or start your own.
          </p>
          <div style={{ display:'flex', gap:40, justifyContent:'center', flexWrap:'wrap' as const }}>
            {([
              [CATEGORIES.length, 'Categories supported'],
              [liveCats, 'With live campaigns'],
              [`${avgSuccess}%`, 'Avg success rate'],
            ] as [number|string, string][]).map(([n, l], i) => (
              <div key={i} style={{ textAlign:'center' as const }}>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, color:'#B7DEC9', lineHeight:1, marginBottom:4 }}>{n}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.4)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'36px 32px 64px' }}>

        {/* SEARCH */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:14, marginBottom:28, flexWrap:'wrap' as const }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:'1.5px solid #E8E4DC', borderRadius:10, padding:'10px 14px', flex:1, maxWidth:360 }}>
            <svg style={{ width:16, height:16, color:'#8A8A82', flexShrink:0 }} viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search categories…" value={search} onChange={e=>setSearch(e.target.value)}
              style={{ flex:1, border:'none', fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'#1A1A18', background:'transparent' }} />
            {search && <button style={{ background:'none', border:'none', fontSize:16, color:'#8A8A82', cursor:'pointer', padding:'0 2px', lineHeight:1 }} onClick={()=>setSearch('')}>×</button>}
          </div>
          <div style={{ fontSize:13, color:'#8A8A82' }}>
            {filtered.length} categor{filtered.length!==1?'ies':'y'}{search?` matching "${search}"`:''}
          </div>
        </div>

        {/* CATEGORY GRID */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16, marginBottom:28 }}>
          {filtered.map(cat => (
            <div key={cat.id} className={`cat-card${selected===cat.id?' active':''}`}
              onClick={()=>setSelected(selected===cat.id?null:cat.id)}>
              <div style={{ height:120, background:cat.gradient, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', fontSize:36 }}>
                {cat.emoji}
                {cat.count > 0 && (
                  <div style={{ position:'absolute', bottom:8, left:8, background:'rgba(10,107,75,.9)', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:600, color:'#fff', display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:'#52B788', animation:'pulse 1.5s infinite', display:'inline-block' }} />
                    {cat.count} live
                  </div>
                )}
              </div>
              <div style={{ padding:'14px 14px 16px' }}>
                <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color:'#1A1A18', marginBottom:5 }}>{cat.label}</div>
                <p style={{ fontSize:12, color:'#8A8A82', lineHeight:1.6, marginBottom:12, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>{cat.desc}</p>
                <div style={{ display:'flex', gap:16, marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#1A1A18', lineHeight:1 }}>{cat.avgGoal}</div>
                    <div style={{ fontSize:10, color:'#8A8A82', marginTop:2 }}>avg goal</div>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, lineHeight:1, color:parseFloat(cat.successRate)>=75?'#0A6B4B':parseFloat(cat.successRate)>=60?'#B85C00':'#8A8A82' }}>{cat.successRate}</div>
                    <div style={{ fontSize:10, color:'#8A8A82', marginTop:2 }}>success rate</div>
                  </div>
                </div>
                <Link href={`/campaigns?category=${cat.id}`} className="cat-browse-btn"
                  style={{ fontSize:12, fontWeight:600, color:'#0A6B4B', background:'#E8F5EF', padding:'7px 12px', borderRadius:7, display:'block', textAlign:'center' as const, transition:'background .15s' }}
                  onClick={e=>e.stopPropagation()}>
                  Browse {cat.label} →
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center' as const, padding:'48px 24px', background:'#fff', border:'1.5px dashed #E8E4DC', borderRadius:14 }}>
              <div style={{ fontSize:36, marginBottom:14 }}>🔍</div>
              <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18', marginBottom:6 }}>No categories match &#34;{search}&#34;</h3>
              <p style={{ fontSize:13, color:'#8A8A82', marginBottom:16 }}>Try a broader search or browse all categories.</p>
              <button style={{ fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'9px 18px', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit' }} onClick={()=>setSearch('')}>Show all categories</button>
            </div>
          )}
        </div>

        {/* SPOTLIGHT */}
        {selectedCat && (
          <div className="spotlight" key={selectedCat.id} style={{ background:'#fff', border:`1.5px solid ${selectedCat.accent}40`, borderRadius:16, padding:'28px 24px', marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:24 }}>
              <div style={{ width:52, height:52, borderRadius:12, background:selectedCat.gradient, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{selectedCat.emoji}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11, fontWeight:600, letterSpacing:'.07em', textTransform:'uppercase' as const, color:selectedCat.accent, marginBottom:4 }}>{selectedCat.label}</div>
                <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18', lineHeight:1.3 }}>Tips for a successful {selectedCat.label.toLowerCase()} campaign</h3>
              </div>
              <button style={{ background:'none', border:'none', fontSize:22, color:'#8A8A82', cursor:'pointer', padding:'0 4px', lineHeight:1, flexShrink:0 }} onClick={()=>setSelected(null)}>×</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 240px', gap:32, alignItems:'start' }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' as const, color:'#8A8A82', marginBottom:8 }}>What works</div>
                <p style={{ fontSize:13, color:'#4A4A44', lineHeight:1.8, marginBottom:20 }}>{selectedCat.tip}</p>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' as const, color:'#8A8A82', marginBottom:8 }}>Example campaigns</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {selectedCat.examples.map((ex, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#4A4A44' }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:selectedCat.accent, flexShrink:0 }} />
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ background:selectedCat.color, borderRadius:12, padding:16 }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, lineHeight:1, marginBottom:4, color:selectedCat.accent }}>{selectedCat.avgGoal}</div>
                  <div style={{ fontSize:12, color:selectedCat.accent+'BB' }}>average campaign goal</div>
                </div>
                <div style={{ background:selectedCat.color, borderRadius:12, padding:16 }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, lineHeight:1, marginBottom:4, color:selectedCat.accent }}>{selectedCat.successRate}</div>
                  <div style={{ fontSize:12, color:selectedCat.accent+'BB' }}>campaign success rate</div>
                </div>
                <Link href={`/create?category=${selectedCat.id}`} style={{ display:'block', padding:'11px 16px', background:selectedCat.accent, color:'#fff', borderRadius:9, fontSize:13, fontWeight:600, textAlign:'center' as const }}>
                  Start a {selectedCat.label.toLowerCase()} campaign →
                </Link>
                <Link href={`/campaigns?category=${selectedCat.id}`} style={{ display:'block', padding:'10px 16px', borderRadius:9, fontSize:13, fontWeight:500, textAlign:'center' as const, border:`1px solid ${selectedCat.accent}40`, color:selectedCat.accent }}>
                  Browse {selectedCat.label} campaigns →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM CTA BAND */}
        <div style={{ background:'#1A1A18', borderRadius:14, padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' as const }}>
          <div>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:'#fff', marginBottom:4 }}>Don&#39;t see your cause?</h3>
            <p style={{ fontSize:13, color:'rgba(255,255,255,.45)', lineHeight:1.6, maxWidth:480 }}>Every need is valid. If your campaign doesn&#39;t fit a category perfectly, choose the closest one and tell your story honestly.</p>
          </div>
          <Link href="/create" style={{ fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'10px 22px', borderRadius:8, whiteSpace:'nowrap' as const }}>Start a campaign — free</Link>
        </div>
      </div>

      {/* GREEN CTA SECTION */}
      <div style={{ background:'#0A6B4B', padding:'64px 32px', textAlign:'center' as const }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase' as const, color:'rgba(255,255,255,.5)', marginBottom:12 }}>Ready to raise?</div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:38, color:'#fff', margin:'10px 0 14px', lineHeight:1.15 }}>
            Whatever your cause —<br /><em style={{ color:'#B7DEC9', fontStyle:'italic' }}>EveryGiving is built for it</em>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,.6)', lineHeight:1.75, marginBottom:28 }}>Identity verified. Milestone-protected. Zero platform fees. Mobile money from day one.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' as const }}>
            <Link href="/create" style={{ fontSize:14, fontWeight:600, color:'#0A6B4B', background:'#fff', padding:'12px 24px', borderRadius:10 }}>Start a campaign — free</Link>
            <Link href="/campaigns" style={{ fontSize:14, fontWeight:500, color:'rgba(255,255,255,.75)', padding:'12px 24px', borderRadius:10, border:'1px solid rgba(255,255,255,.3)' }}>Browse live campaigns</Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background:'#1A1A18', borderTop:'1px solid rgba(255,255,255,.06)', padding:'24px 32px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap' as const, gap:10 }}>
          <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:16, color:'#fff' }}>Every<span style={{ color:'#B7DEC9' }}>Giving</span></span>
          <span style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>{String.fromCharCode(169)} {new Date().getFullYear()} EveryGiving · Built in Ghana</span>
          <div style={{ display:'flex', gap:14 }}>
            {[['Terms','/terms'],['Privacy','/privacy'],['Fees','/fees'],['Contact','/contact']].map(([l,h]) => (
              <Link key={l} href={h} style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
