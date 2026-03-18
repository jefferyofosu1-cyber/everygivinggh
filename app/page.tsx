'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
// ─── TUTORIAL CHARACTER ───────────────────────────────────────────────────────

function Character({ mood, holding }: { mood: 'thinking'|'happy'|'excited'|'proud'|'pointing', holding?: 'phone'|'card'|'money'|null }) {
  const skin = '#C68642', shirt = '#1A2B3C'
  const mouths = { thinking:'M 44 60 Q 50 58 56 60', happy:'M 44 58 Q 50 64 56 58', excited:'M 43 57 Q 50 66 57 57', proud:'M 44 58 Q 50 63 56 58', pointing:'M 44 58 Q 50 63 56 58' }
  const brows = { thinking:{l:'M 38 42 Q 43 40 46 42',r:'M 54 41 Q 57 43 62 42'}, happy:{l:'M 38 42 Q 43 39 46 41',r:'M 54 41 Q 57 39 62 42'}, excited:{l:'M 37 40 Q 43 37 46 40',r:'M 54 40 Q 57 37 63 40'}, proud:{l:'M 38 41 Q 43 39 46 41',r:'M 54 40 Q 57 38 62 41'}, pointing:{l:'M 38 41 Q 43 38 46 40',r:'M 54 40 Q 57 38 62 41'} }
  return (
    <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-xl">
      <ellipse cx="50" cy="155" rx="22" ry="4" fill="rgba(0,0,0,0.12)" />
      <rect x="30" y="80" width="40" height="55" rx="8" fill={shirt} />
      <rect x="44" y="82" width="12" height="28" rx="2" fill="rgba(255,255,255,0.08)" />
      <path d={mood==='pointing'?'M 35 85 Q 15 80 8 65':'M 35 85 Q 25 100 30 115'} stroke={shirt} strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx={mood==='pointing'?8:30} cy={mood==='pointing'?65:115} r="6" fill={skin} />
      {mood==='pointing' && <line x1="8" y1="65" x2="-2" y2="55" stroke={skin} strokeWidth="4" strokeLinecap="round" />}
      <path d={holding?'M 65 85 Q 80 80 85 65':'M 65 85 Q 75 100 70 115'} stroke={shirt} strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx={holding?85:70} cy={holding?65:115} r="6" fill={skin} />
      {holding==='phone' && <g transform="translate(82,48)"><rect x="0" y="0" width="18" height="28" rx="3" fill="#1A2B3C" stroke="#02A95C" strokeWidth="1.5"/><rect x="2" y="3" width="14" height="20" rx="1" fill="#0D1F2D"/><rect x="5" y="5" width="8" height="12" rx="0.5" fill="#02A95C" opacity="0.7"/><circle cx="9" cy="24" r="1.5" fill="#02A95C"/></g>}
      {holding==='card' && <g transform="translate(78,50)"><rect x="0" y="0" width="24" height="16" rx="2" fill="#F59E0B"/><rect x="2" y="3" width="8" height="5" rx="1" fill="#D97706"/><line x1="12" y1="5" x2="22" y2="5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="9" x2="20" y2="9" stroke="#D97706" strokeWidth="1" strokeLinecap="round"/><line x1="2" y1="13" x2="22" y2="13" stroke="#D97706" strokeWidth="1" strokeLinecap="round"/></g>}
      {holding==='money' && <g transform="translate(79,50)"><rect x="0" y="2" width="22" height="14" rx="2" fill="#16A34A"/><rect x="2" y="0" width="22" height="14" rx="2" fill="#15803D"/><rect x="4" y="2" width="22" height="14" rx="2" fill="#02A95C"/><text x="15" y="12" fontSize="8" fill="white" fontWeight="bold" textAnchor="middle">₵</text></g>}
      <rect x="36" y="130" width="10" height="22" rx="5" fill={shirt} /><rect x="54" y="130" width="10" height="22" rx="5" fill={shirt} />
      <ellipse cx="41" cy="152" rx="8" ry="4" fill="#0D1F2D" /><ellipse cx="59" cy="152" rx="8" ry="4" fill="#0D1F2D" />
      <circle cx="50" cy="45" r="24" fill={skin} />
      <path d="M 26 40 Q 28 18 50 18 Q 72 18 74 40 Q 70 28 50 28 Q 30 28 26 40 Z" fill="#1A0A00" />
      <circle cx="43" cy="45" r="5" fill="white" /><circle cx="57" cy="45" r="5" fill="white" />
      <circle cx="44" cy="45" r="2.5" fill="#1A0A00" /><circle cx="58" cy="45" r="2.5" fill="#1A0A00" />
      <circle cx="44.8" cy="44" r="1" fill="white" /><circle cx="58.8" cy="44" r="1" fill="white" />
      <path d={brows[mood].l} stroke="#1A0A00" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={brows[mood].r} stroke="#1A0A00" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={mouths[mood]} stroke="#1A0A00" strokeWidth="2" fill={mood==='excited'?'#1A0A00':'none'} strokeLinecap="round" />
      {mood==='excited' && <path d="M 43 57 Q 50 66 57 57 L 55 63 Q 50 60 45 63 Z" fill="white" />}
      <ellipse cx="26" cy="45" rx="4" ry="5" fill={skin} /><ellipse cx="74" cy="45" rx="4" ry="5" fill={skin} />
    </svg>
  )
}

const SCENES = [
  { mood:'thinking' as const, holding:null, bg:'from-slate-50 to-white', accent:'#64748B', label:'The challenge', name:'Ama has a problem', bubble:"My mother needs surgery at Korle Bu... I need ₵15,000. Where do I start?", narration:"Meet Ama from Accra. She needs to raise money urgently for her mother's surgery. Sending MoMo requests to friends isn't working  -  she needs something more." },
  { mood:'happy' as const, holding:'phone' as const, bg:'from-green-50 to-white', accent:'#02A95C', label:'The discovery', name:'She finds Every Giving', bubble:"Every Giving lets me create a verified page  -  people can donate even if they don't know me!", narration:"A friend shares a link to Every Giving. In 5 minutes, Ama fills in her campaign  -  her story, goal, and a photo. Simple guided form, no tech skills needed." },
  { mood:'proud' as const, holding:'card' as const, bg:'from-amber-50 to-white', accent:'#D97706', label:'Verification', name:'Verified in minutes', bubble:"I just uploaded my Ghana Card and took a selfie. The system verified me automatically!", narration:"Ama uploads her Ghana Card and takes a selfie. The system automatically matches her face to her ID and cross-checks the EveryGiving team review. Within 24 hours  -  no waiting." },
  { mood:'pointing' as const, holding:null, bg:'from-blue-50 to-white', accent:'#0066CC', label:'Going live', name:'Campaign goes live', bubble:"My campaign is live with a Verified badge! I'm sharing it everywhere right now.", narration:"The moment verification passes, her campaign goes live with a Verified badge. She shares on WhatsApp and Facebook. Donations come in from people she has never met." },
  { mood:'excited' as const, holding:'money' as const, bg:'from-green-50 to-emerald-50', accent:'#02A95C', label:'Success', name:'₵18,500 raised', bubble:"I raised ₵18,500 in 3 weeks! Every cedi went straight to my MTN MoMo. Zero fees!", narration:"In 3 weeks, Ama raises ₵18,500  -  more than her goal. 100% of every donation arrives in her MTN MoMo wallet the same day. No platform fees. No delays." },
]

function TutorialEmbed() {
  const [scene, setScene] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [show, setShow] = useState({ bubble: false, narration: false })
  const timerRef = useRef<NodeJS.Timeout>()
  const pRef = useRef(0)
  const sRef = useRef(0)
  const TICK = 50, DURATION = 10000

  useEffect(() => {
    if (!playing) return
    setShow({ bubble: false, narration: false })
    const t1 = setTimeout(() => setShow(s => ({ ...s, bubble: true })), 500)
    const t2 = setTimeout(() => setShow(s => ({ ...s, narration: true })), 900)
    const tickAmt = 100 / (DURATION / TICK)
    timerRef.current = setInterval(() => {
      pRef.current += tickAmt
      setProgress(Math.min(pRef.current, 100))
      if (pRef.current >= 100) {
        pRef.current = 0
        clearInterval(timerRef.current)
        if (sRef.current < SCENES.length - 1) {
          sRef.current += 1; setScene(sRef.current); setProgress(0)
        } else {
          setPlaying(false); setCompleted(true)
        }
      }
    }, TICK)
    return () => { clearInterval(timerRef.current); clearTimeout(t1); clearTimeout(t2) }
  }, [playing, scene])

  const play = () => { pRef.current=0; sRef.current=0; setScene(0); setProgress(0); setCompleted(false); setPlaying(true) }
  const jump = (i: number) => { clearInterval(timerRef.current); pRef.current=0; sRef.current=i; setScene(i); setProgress(0); setCompleted(false); setPlaying(true) }

  const cur = SCENES[scene]
  const total = ((scene * 100) + progress) / SCENES.length

  return (
    <div className={`bg-gradient-to-br ${cur.bg} transition-colors duration-700 rounded-2xl border border-gray-100 shadow-sm overflow-hidden`}>
      <div className="p-6 md:p-8">
        {/* Overall progress */}
        <div className="h-1 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${total}%` }} />
        </div>
        {/* Scene tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {SCENES.map((s, i) => (
            <button key={i} onClick={() => jump(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${i === scene ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
              style={i === scene ? { backgroundColor: cur.accent, borderColor: cur.accent } : {}}>
              {s.label}
            </button>
          ))}
        </div>
        {/* Stage  -  single column on mobile, 5-col grid on desktop */}
        <div className="flex flex-col md:grid md:grid-cols-5 gap-4 md:gap-6 md:items-center">

          {/* Character + bubble stacked on mobile */}
          <div className="md:col-span-2 flex flex-col items-center gap-3">
            <div className="w-28 h-36 md:w-44 md:h-60 flex-shrink-0">
              <Character mood={cur.mood} holding={cur.holding} />
            </div>
            {/* Bubble below character  -  mobile only */}
            <div className={`md:hidden w-full transition-all duration-500 ${show.bubble && playing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 text-center">
                <p className="text-navy text-xs leading-relaxed font-medium">{cur.bubble}</p>
              </div>
            </div>
          </div>

          {/* Info col */}
          <div className={`md:col-span-3 transition-all duration-700 ${show.narration ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {/* Bubble beside character  -  desktop only */}
            <div className={`hidden md:block mb-3 transition-all duration-500 ${show.bubble && playing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-lg border border-gray-100 inline-block max-w-xs">
                <p className="text-navy text-xs leading-relaxed font-medium">{cur.bubble}</p>
              </div>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: cur.accent }}>Scene {scene + 1} of {SCENES.length}</div>
            <h3 className="font-nunito font-black text-navy text-lg md:text-2xl tracking-tight mb-2 leading-tight">{cur.name}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">{cur.narration}</p>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: cur.accent }} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {!playing && !completed && (
                <button onClick={play}
                  className="flex items-center gap-2 px-4 py-2.5 text-white font-nunito font-black rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow"
                  style={{ backgroundColor: cur.accent }}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Play Ama's story
                </button>
              )}
              {playing && (
                <>
                  <button onClick={() => { clearInterval(timerRef.current); setPlaying(false) }}
                    className="px-3.5 py-2.5 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-sm">Pause</button>
                  {scene < SCENES.length - 1 && (
                    <button onClick={() => jump(scene + 1)}
                      className="px-4 py-2.5 text-white font-bold rounded-xl text-sm" style={{ backgroundColor: cur.accent }}>Next</button>
                  )}
                </>
              )}
              {!playing && !completed && scene > 0 && (
                <button onClick={() => jump(scene - 1)}
                  className="px-3.5 py-2.5 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-sm">Back</button>
              )}
              {completed && (
                <>
                  <button onClick={play} className="px-3.5 py-2.5 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-sm">Watch again</button>
                  <Link href="/create" className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl text-sm transition-all">Start like Ama</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all',       label: 'All campaigns' },
  { id: 'medical',   label: 'Medical' },
  { id: 'education', label: 'Education' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'faith',     label: 'Faith' },
  { id: 'community', label: 'Community' },
  { id: 'family',    label: 'Family' },
]

const FILTER_CHIPS = [
  { id: 'urgent',   label: 'Urgent' },
  { id: 'funded',   label: 'Fully funded' },
]

const SORT_OPTIONS = [
  { value: 'urgent',  label: 'Most urgent' },
  { value: 'recent',  label: 'Most recent' },
  { value: 'popular', label: 'Most donors' },
  { value: 'pct',     label: 'Closest to goal' },
]

const PAGE_SIZE = 6

// ─── SVG ICONS ────────────────────────────────────────────────────────────────

const IconVerify = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
const IconShield = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
const IconEye = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconHeart = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────



// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatGHS(amount: number) {
  return `₵${amount.toLocaleString()}`
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: '#fef08a', borderRadius: 2, padding: '0 1px' }}>{part}</mark>
      : part
  )
}

// ─── CAMPAIGN CARD ────────────────────────────────────────────────────────────

interface Campaign {
  id: string; slug: string; category: string; title: string;
  organiserName: string; location: string; raisedGHS: number; goalGHS: number;
  donorCount: number; daysLeft: number; isUrgent: boolean; isFunded: boolean;
  coverAbbr: string; coverGradient: string; coverImageUrl?: string;
}

function CampaignCard({ campaign, query, featured = false }: { campaign: Campaign; query: string; featured?: boolean }) {
  const pct = Math.min(100, Math.round(campaign.raisedGHS / campaign.goalGHS * 100))

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      style={{
        display: 'block', background: '#FFFFFF', border: '1px solid #E8E4DC', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', textDecoration: 'none',
        gridColumn: featured ? 'span 2' : 'span 1',
      }}
      className="campaign-card transition-hover"
    >
      {/* Cover image area */}
      <div style={{ height: featured ? 220 : 170, background: campaign.coverGradient, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {campaign.coverImageUrl ? (
          <img src={campaign.coverImageUrl} alt={campaign.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        ) : (
          <span style={{ fontSize: featured ? 48 : 36, fontWeight: 700, color: 'rgba(255,255,255,0.7)', position: 'relative', zIndex: 1 }}>{campaign.coverAbbr}</span>
        )}

        {/* Verification Shield Badge */}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#0A6B4B', display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.02em' }}>
          <IconVerify /> Verified
        </div>

        {/* Urgency/Funded Badges */}
        {campaign.isFunded && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: '#1A1A18', borderRadius: 24, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
            Fully Funded
          </div>
        )}
        {campaign.isUrgent && !campaign.isFunded && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: '#B85C00', borderRadius: 24, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#fff' }}>
            {campaign.daysLeft <= 3 ? (campaign.daysLeft === 0 ? "Ends today" : `Only ${campaign.daysLeft} days left`) : "Urgent needs"}
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 8 }}>
          {campaign.category}
        </div>

        <div style={{ fontSize: featured ? 18 : 15, fontWeight: 600, color: '#1A1A18', lineHeight: 1.4, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
          {highlightText(campaign.title, query)}
        </div>

        <div style={{ fontSize: 13, color: '#8A8A82', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
          {highlightText(campaign.organiserName, query)} &middot; {campaign.location}
        </div>

        {/* Progress System */}
        <div style={{ height: 6, background: '#F0EFEA', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: campaign.isFunded ? '#1A1A18' : '#0A6B4B', borderRadius: 3, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A18' }}>{formatGHS(campaign.raisedGHS)} <span style={{ fontSize: 13, fontWeight: 500, color: '#8A8A82' }}>raised</span></span>
          <span style={{ fontSize: 13, color: '#8A8A82', fontWeight: 500 }}>{pct}%</span>
        </div>

        {/* Action / Donors Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F0EFEA', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: '#4A4A44', fontWeight: 500 }}>
            <span style={{ color: '#1A1A18', fontWeight: 700 }}>{campaign.donorCount}</span> people donated
          </div>
          {!campaign.isFunded && (
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0A6B4B', background: '#E8F5EF', padding: '6px 12px', borderRadius: 20 }}>
              Donate
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function HomePage() {
  const [campaigns, setCampaigns]       = useState<Campaign[]>([])
  const [loading, setLoading]           = useState(true)
  const [query, setQuery]               = useState('')
  const [activeCategory, setCategory]   = useState('all')
  const [activeFilters, setFilters]     = useState(new Set<string>())
  const [sortBy, setSortBy]             = useState('urgent')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'live')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setCampaigns(data.map(c => ({
            id: c.id,
            slug: c.slug || c.id,
            category: c.category || 'other',
            title: c.title,
            organiserName: c.organiser_name || 'Anonymous',
            location: c.location || 'Ghana',
            raisedGHS: c.raised_amount || 0,
            goalGHS: c.goal_amount || 1000,
            donorCount: c.donor_count || 0,
            daysLeft: c.deadline ? Math.max(0, Math.ceil((new Date(c.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 30,
            isUrgent: c.is_urgent || false,
            isFunded: (c.raised_amount || 0) >= (c.goal_amount || 1000),
            coverAbbr: c.title ? c.title.substring(0, 2).toUpperCase() : 'EG',
            coverGradient: 'linear-gradient(135deg,#1B4332,#52B788)',
            coverImageUrl: c.cover_image,
          })))
        }
        setLoading(false)
      })
  }, [])

  // ── Filter + sort ──
  const filtered = useMemo(() => {
    const list = campaigns.filter(c => {
      if (activeCategory !== 'all' && c.category !== activeCategory) return false
      if (activeFilters.has('urgent') && !c.isUrgent) return false
      if (activeFilters.has('funded') && !c.isFunded) return false
      if (query) {
        const q = query.toLowerCase()
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.organiserName.toLowerCase().includes(q) &&
          !c.location.toLowerCase().includes(q)
        ) return false
      }
      return true
    })

    return [...list].sort((a, b) => {
      if (sortBy === 'urgent')  return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0) || a.daysLeft - b.daysLeft
      if (sortBy === 'recent')  return parseInt(b.id) - parseInt(a.id)
      if (sortBy === 'popular') return b.donorCount - a.donorCount
      if (sortBy === 'pct')     return (b.raisedGHS / b.goalGHS) - (a.raisedGHS / a.goalGHS)
      return 0
    })
  }, [campaigns, query, activeCategory, activeFilters, sortBy])

  const visible = filtered.slice(0, visibleCount)

  // ── Handlers ──
  const toggleFilter = useCallback((id: string) => {
    setFilters(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
    setVisibleCount(PAGE_SIZE)
  }, [])

  const clearAll = useCallback(() => {
    setQuery('')
    setCategory('all')
    setFilters(new Set())
    setSortBy('urgent')
    setVisibleCount(PAGE_SIZE)
  }, [])

  const isFeaturedMode = !query && activeCategory === 'all' && activeFilters.size === 0

  return (
    <>
      <Navbar />
      <style dangerouslySetInnerHTML={{ __html: `
        body { background: #FDFAF5; color: #1A1A18; }
        .transition-hover { transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1); }
        .campaign-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.06); }
        .hero-bg { background: linear-gradient(180deg, #F9F8F6 0%, #FDFAF5 100%); }
        .play-button { transition: all 0.3s ease; }
        a:has(.play-button):hover .play-button { transform: scale(1.1); background: rgba(255, 0, 0, 1) !important; }
      `}} />

      {/* ── 1. NEW TEXT HERO SECTION ── */}
      <div className="hero-bg" style={{ padding: '80px 28px 60px', textAlign: 'center', borderBottom: '1px solid #E8E4DC' }}>
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(40px, 7vw, 72px)', color: '#1A1A18', marginBottom: 24, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
            Raise money for what <span style={{ color: '#0A6B4B' }}>matters most</span>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#4A4A44', lineHeight: 1.6, marginBottom: 40, maxWidth: 680, marginInline: 'auto' }}>
            Create a fundraiser in minutes and get support from people who care across Ghana and beyond. 100% verified. No platform fees.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/create" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', background: '#0A6B4B', padding: '16px 32px', borderRadius: 12, textDecoration: 'none', boxShadow: '0 8px 24px rgba(10,107,75,0.25)', transition: 'transform 0.2s', className: 'transition-hover' } as any}>
              Start a fundraiser
            </Link>
            <Link href="#campaigns" onClick={(e) => { e.preventDefault(); document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#1A1A18', background: '#fff', border: '1px solid #E8E4DC', padding: '16px 32px', borderRadius: 12, textDecoration: 'none', transition: 'background 0.2s' }}>
              Donate now
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. INTERACTIVE TUTORIAL SECTION ── */}
      <div style={{ padding: '60px 28px', background: '#FDFAF5' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, color: '#1A1A18', marginBottom: 12 }}>See it in action</h2>
            <p style={{ fontSize: 16, color: '#8A8A82' }}>Follow Ama's journey from problem to solution in 3 weeks</p>
          </div>
          <TutorialEmbed />
        </div>
      </div>

      {/* ── 3. TRUST LAYER ── */}
      <div style={{ padding: '80px 28px', background: '#F9F8F6', borderBottom: '1px solid #E8E4DC' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#1A1A18', marginBottom: 12 }}>Why people trust EveryGiving</h2>
            <p style={{ fontSize: 16, color: '#8A8A82' }}>Built to protect both the people giving and the people receiving.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            <div style={{ background: '#fff', padding: '32px 24px', borderRadius: 16, border: '1px solid #E8E4DC' }}>
              <div style={{ width: 48, height: 48, background: '#E8F5EF', color: '#0A6B4B', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><IconVerify /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>Verified fundraisers</h3>
              <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.6 }}>Every single campaign organizer is identity-checked using the national Ghana Card database.</p>
            </div>
            
            <div style={{ background: '#fff', padding: '32px 24px', borderRadius: 16, border: '1px solid #E8E4DC' }}>
              <div style={{ width: 48, height: 48, background: '#F0F4F8', color: '#185FA5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><IconShield /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>Secure payments</h3>
              <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.6 }}>We use bank-level security via Paystack for instant MoMo, Telecel Cash, and Card processing.</p>
            </div>

            <div style={{ background: '#fff', padding: '32px 24px', borderRadius: 16, border: '1px solid #E8E4DC' }}>
              <div style={{ width: 48, height: 48, background: '#FEF3E2', color: '#B85C00', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><IconEye /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>Transparent fees</h3>
              <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.6 }}>0% platform fee to start. A small, clear transaction fee ensures maximum funds reach the cause.</p>
            </div>

            <div style={{ background: '#fff', padding: '32px 24px', borderRadius: 16, border: '1px solid #E8E4DC' }}>
              <div style={{ width: 48, height: 48, background: '#FCE8E8', color: '#C0392B', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}><IconHeart /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>Real impact stories</h3>
              <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.6 }}>Track milestones and see exactly how your donation changes lives within the community.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. CAMPAIGNS DIRECTORY ── */}
      <div id="campaigns" style={{ padding: '80px 28px', background: '#FDFAF5' }}>
        {/* Category tabs */}
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 24 }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setCategory(cat.id); setVisibleCount(PAGE_SIZE) }}
              style={{ fontSize: 13, fontWeight: 600, color: activeCategory === cat.id ? '#0A6B4B' : '#4A4A44', padding: '10px 16px', borderRadius: 24, background: activeCategory === cat.id ? '#E8F5EF' : '#fff', border: activeCategory === cat.id ? '1px solid #B7DEC9' : '1px solid #E8E4DC', cursor: 'pointer', whiteSpace: 'nowrap' as const, fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {FILTER_CHIPS.map(f => (
              <button key={f.id} onClick={() => toggleFilter(f.id)}
                style={{ fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 20, border: activeFilters.has(f.id) ? '1px solid #1A1A18' : '1px dashed #A0A09A', background: activeFilters.has(f.id) ? '#1A1A18' : 'transparent', color: activeFilters.has(f.id) ? '#fff' : '#4A4A44', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                {activeFilters.has(f.id) ? '✓ ' : '+ '}{f.label}
              </button>
            ))}
          </div>
          <select value={sortBy} onChange={e => { setSortBy(e.target.value); setVisibleCount(PAGE_SIZE) }}
            style={{ fontSize: 13, fontWeight: 500, color: '#4A4A44', padding: '10px 14px', border: '1px solid #E8E4DC', borderRadius: 8, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Sort by: {o.label}</option>)}
          </select>
        </div>

        {/* Campaign Grid */}
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', border: '1px dashed #D4D4D0', borderRadius: 16 }}>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#1A1A18', marginBottom: 8 }}>No campaigns found</h3>
              <p style={{ fontSize: 15, color: '#8A8A82', marginBottom: 24 }}>Expand your search to find causes that need your help right now.</p>
              <button onClick={clearAll} style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', background: '#F9F8F6', padding: '12px 24px', borderRadius: 8, border: '1px solid #E8E4DC', cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {visible.map((campaign, i) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  query={query}
                  featured={i === 0 && isFeaturedMode && typeof window !== 'undefined' && window.innerWidth > 900}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {filtered.length > visibleCount && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                style={{ fontSize: 15, fontWeight: 600, color: '#1A1A18', background: '#fff', border: '1px solid #E8E4DC', padding: '14px 32px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
              >
                Show more campaigns
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  )
}
