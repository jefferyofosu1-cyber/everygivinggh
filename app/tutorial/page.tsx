
'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

function Character({ mood, holding }: { mood: 'thinking'|'happy'|'excited'|'proud'|'pointing', holding?: 'phone'|'card'|'money'|null }) {
  const skin = '#C68642'
  const shirt = '#1A2B3C'
  const mouths = { thinking:'M 44 60 Q 50 58 56 60', happy:'M 44 58 Q 50 64 56 58', excited:'M 43 57 Q 50 66 57 57', proud:'M 44 58 Q 50 63 56 58', pointing:'M 44 58 Q 50 63 56 58' }
  const brows = { thinking:{l:'M 38 42 Q 43 40 46 42',r:'M 54 41 Q 57 43 62 42'}, happy:{l:'M 38 42 Q 43 39 46 41',r:'M 54 41 Q 57 39 62 42'}, excited:{l:'M 37 40 Q 43 37 46 40',r:'M 54 40 Q 57 37 63 40'}, proud:{l:'M 38 41 Q 43 39 46 41',r:'M 54 40 Q 57 38 62 41'}, pointing:{l:'M 38 41 Q 43 38 46 40',r:'M 54 40 Q 57 38 62 41'} }
  return (
    <svg viewBox="0 0 100 160" className="w-full h-full drop-shadow-2xl">
      <ellipse cx="50" cy="155" rx="22" ry="4" fill="rgba(0,0,0,0.12)" />
      <rect x="30" y="80" width="40" height="55" rx="8" fill={shirt} />
      <rect x="44" y="82" width="12" height="28" rx="2" fill="rgba(255,255,255,0.08)" />
      {/* Left arm */}
      <path d={mood==='pointing' ? 'M 35 85 Q 15 80 8 65' : 'M 35 85 Q 25 100 30 115'} stroke={shirt} strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx={mood==='pointing'?8:30} cy={mood==='pointing'?65:115} r="6" fill={skin} />
      {mood==='pointing' && <line x1="8" y1="65" x2="-2" y2="55" stroke={skin} strokeWidth="4" strokeLinecap="round" />}
      {/* Right arm */}
      <path d={holding ? 'M 65 85 Q 80 80 85 65' : 'M 65 85 Q 75 100 70 115'} stroke={shirt} strokeWidth="10" strokeLinecap="round" fill="none" />
      <circle cx={holding?85:70} cy={holding?65:115} r="6" fill={skin} />
      {/* Held items */}
      {holding==='phone' && <g transform="translate(82,48)"><rect x="0" y="0" width="18" height="28" rx="3" fill="#1A2B3C" stroke="#02A95C" strokeWidth="1.5"/><rect x="2" y="3" width="14" height="20" rx="1" fill="#0D1F2D"/><rect x="5" y="5" width="8" height="12" rx="0.5" fill="#02A95C" opacity="0.7"/><circle cx="9" cy="24" r="1.5" fill="#02A95C"/></g>}
      {holding==='card' && <g transform="translate(78,50)"><rect x="0" y="0" width="24" height="16" rx="2" fill="#F59E0B"/><rect x="2" y="3" width="8" height="5" rx="1" fill="#D97706"/><line x1="12" y1="5" x2="22" y2="5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="9" x2="20" y2="9" stroke="#D97706" strokeWidth="1" strokeLinecap="round"/><line x1="2" y1="13" x2="22" y2="13" stroke="#D97706" strokeWidth="1" strokeLinecap="round"/></g>}
      {holding==='money' && <g transform="translate(79,50)"><rect x="0" y="2" width="22" height="14" rx="2" fill="#16A34A"/><rect x="2" y="0" width="22" height="14" rx="2" fill="#15803D"/><rect x="4" y="2" width="22" height="14" rx="2" fill="#02A95C"/><text x="15" y="12" fontSize="8" fill="white" fontWeight="bold" textAnchor="middle">₵</text></g>}
      {/* Legs */}
      <rect x="36" y="130" width="10" height="22" rx="5" fill={shirt} />
      <rect x="54" y="130" width="10" height="22" rx="5" fill={shirt} />
      <ellipse cx="41" cy="152" rx="8" ry="4" fill="#0D1F2D" />
      <ellipse cx="59" cy="152" rx="8" ry="4" fill="#0D1F2D" />
      {/* Head */}
      <circle cx="50" cy="45" r="24" fill={skin} />
      <path d="M 26 40 Q 28 18 50 18 Q 72 18 74 40 Q 70 28 50 28 Q 30 28 26 40 Z" fill="#1A0A00" />
      <circle cx="43" cy="45" r="5" fill="white" /><circle cx="57" cy="45" r="5" fill="white" />
      <circle cx="44" cy="45" r="2.5" fill="#1A0A00" /><circle cx="58" cy="45" r="2.5" fill="#1A0A00" />
      <circle cx="44.8" cy="44" r="1" fill="white" /><circle cx="58.8" cy="44" r="1" fill="white" />
      <path d={brows[mood].l} stroke="#1A0A00" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={brows[mood].r} stroke="#1A0A00" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d={mouths[mood]} stroke="#1A0A00" strokeWidth="2" fill={mood==='excited'?'#1A0A00':'none'} strokeLinecap="round" />
      {mood==='excited' && <path d="M 43 57 Q 50 66 57 57 L 55 63 Q 50 60 45 63 Z" fill="white" />}
      <ellipse cx="26" cy="45" rx="4" ry="5" fill={skin} />
      <ellipse cx="74" cy="45" rx="4" ry="5" fill={skin} />
    </svg>
  )
}

const SCENES = [
  { id:1, mood:'thinking' as const, holding:null, accent:'#64748B',
    label:'The challenge', name:'Ama has a problem',
    bubble:"My mother needs surgery at Korle Bu... I need ₵15,000. Where do I start?",
    narration:'Meet Ama from Accra. She needs to raise money urgently for her mother\'s surgery. Sending MoMo requests to friends isn\'t working — she needs something more.' },
  { id:2, mood:'happy' as const, holding:'phone' as const, accent:'#02A95C',
    label:'The discovery', name:'She finds Every Giving',
    bubble:"Every Giving lets me create a verified page — people can donate even if they don't know me!",
    narration:'A friend shares a link to Every Giving. In 5 minutes, Ama fills in her campaign — her story, her goal, and a photo. Simple guided form, no tech skills needed.' },
  { id:3, mood:'proud' as const, holding:'card' as const, accent:'#D97706',
    label:'Verification', name:'Verified in minutes',
    bubble:"I just uploaded my Ghana Card and took a selfie. The system verified me automatically!",
    narration:'Ama uploads her Ghana Card and takes a selfie. The system automatically matches her face to her ID and cross-checks the NIA database. Under 10 minutes — no waiting.' },
  { id:4, mood:'pointing' as const, holding:null, accent:'#0066CC',
    label:'Going live', name:'Campaign goes live',
    bubble:"My campaign is live with a Verified badge! I\'m sharing it everywhere right now.",
    narration:'The moment verification passes, her campaign goes live with a Verified badge. She shares the link on WhatsApp and Facebook. Donations start coming in from people she has never met.' },
  { id:5, mood:'excited' as const, holding:'money' as const, accent:'#02A95C',
    label:'Success', name:'₵18,500 raised',
    bubble:"I raised ₵18,500 in 3 weeks! Every cedi went straight to my MTN MoMo. Zero fees!",
    narration:'In 3 weeks, Ama raises ₵18,500 — more than her goal. 100% of every donation arrives in her MTN MoMo wallet the same day. No platform fees. No delays.' },
]

export default function TutorialPage() {
  const [scene, setScene] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [show, setShow] = useState({ bubble: false, narration: false })
  const timerRef = useRef<NodeJS.Timeout>()
  const pRef = useRef(0)
  const sRef = useRef(0)
  const TICK = 50
  const DURATION = 10000

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
          sRef.current += 1
          setScene(sRef.current)
          setProgress(0)
        } else {
          setPlaying(false)
          setCompleted(true)
        }
      }
    }, TICK)
    return () => { clearInterval(timerRef.current); clearTimeout(t1); clearTimeout(t2) }
  }, [playing, scene])

  const play = () => { pRef.current = 0; sRef.current = 0; setScene(0); setProgress(0); setCompleted(false); setPlaying(true) }
  const jump = (i: number) => { clearInterval(timerRef.current); pRef.current = 0; sRef.current = i; setScene(i); setProgress(0); setCompleted(false); setPlaying(true) }

  const cur = SCENES[scene]
  const total = ((scene * 100) + progress) / SCENES.length

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div className="bg-navy py-14 px-5 text-center">
          <div className="inline-block bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-3 py-1.5 rounded-full mb-4">1-minute walkthrough</div>
          <h1 className="font-nunito font-black text-white text-3xl md:text-4xl tracking-tight mb-3">Follow Ama's story</h1>
          <p className="text-white/50 text-sm max-w-sm mx-auto">From "where do I start?" to ₵18,500 raised — the complete journey in 60 seconds.</p>
        </div>

        {/* Stage */}
        <div className="transition-colors duration-700 py-12 px-5" style={{ background: 'var(--surface-alt)' }}>
          <div className="max-w-4xl mx-auto">

            {/* Overall progress */}
            <div className="h-1 rounded-full mb-8 overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${total}%` }} />
            </div>

            {/* Scene tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
              {SCENES.map((s, i) => (
                <button key={i} onClick={() => jump(i)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${i === scene ? 'text-white border-transparent' : 'border-[var(--border)] text-[var(--text-muted)]'}`}
                  style={i === scene ? { backgroundColor: cur.accent, borderColor: cur.accent } : { background: 'var(--surface)' }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Main stage */}
            <div className="grid md:grid-cols-5 gap-8 items-center min-h-[400px]">

              {/* Character — takes 2 cols */}
              <div className="md:col-span-2 flex justify-center">
                <div className="relative w-44 h-60 md:w-52 md:h-72">
                  <Character mood={cur.mood} holding={cur.holding} />

                  {/* Speech bubble */}
                  <div className={`absolute -top-2 left-full ml-4 w-52 transition-all duration-500 z-10 ${show.bubble && playing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                    <div className="rounded-2xl rounded-bl-sm p-4 shadow-xl border relative" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                      <div className="absolute -left-2 top-4 w-0 h-0 border-t-[6px] border-t-transparent border-r-[10px] border-r-[var(--surface)] border-b-[6px] border-b-transparent" />
                      <p className="text-navy text-xs leading-relaxed font-medium">{cur.bubble}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info — takes 3 cols */}
              <div className={`md:col-span-3 transition-all duration-700 ${show.narration ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: cur.accent }}>
                  Scene {scene + 1} of {SCENES.length}
                </div>
                <h2 className="font-nunito font-black text-navy text-2xl md:text-3xl tracking-tight mb-3 leading-tight">{cur.name}</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>{cur.narration}</p>

                {/* Scene progress */}
                <div className="h-1.5 rounded-full overflow-hidden mb-6" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: cur.accent }} />
                </div>

                {/* Controls */}
                <div className="flex gap-3 flex-wrap">
                  {!playing && !completed && (
                    <button onClick={play}
                      className="flex items-center gap-2 px-6 py-3 text-white font-nunito font-black rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg"
                      style={{ backgroundColor: cur.accent }}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      Play Ama's story
                    </button>
                  )}
                  {playing && (
                    <>
                      <button onClick={() => { clearInterval(timerRef.current); setPlaying(false) }}
                        className="px-4 py-3 border-2 font-bold rounded-xl text-sm text-[var(--text-muted)] border-[var(--border)]" style={{ background: 'var(--surface)' }}>
                        Pause
                      </button>
                      {scene < SCENES.length - 1 && (
                        <button onClick={() => jump(scene + 1)}
                          className="px-6 py-3 text-white font-bold rounded-xl text-sm transition-all" style={{ backgroundColor: cur.accent }}>
                          Next
                        </button>
                      )}
                    </>
                  )}
                  {!playing && !completed && scene > 0 && (
                    <button onClick={() => jump(scene - 1)}
                      className="px-4 py-3 border-2 font-bold rounded-xl text-sm text-[var(--text-muted)] border-[var(--border)]" style={{ background: 'var(--surface)' }}>
                      Back
                    </button>
                  )}
                  {completed && (
                    <>
                      <button onClick={play}
                        className="px-5 py-3 border-2 font-bold rounded-xl text-sm text-[var(--text-muted)] border-[var(--border)]" style={{ background: 'var(--surface)' }}>
                        Watch again
                      </button>
                      <Link href="/create"
                        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg">
                        Start like Ama
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-navy py-8 px-5">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value:'Under 10 min', label:'To get verified' },
              { value:'0%', label:'Platform fee' },
              { value:'Same day', label:'MoMo payout' },
              { value:'Free', label:'To start a campaign' },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-nunito font-black text-primary text-lg">{s.value}</div>
                <div className="text-xs text-white/40 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <section className="py-16 text-center px-5" style={{ background: 'var(--surface)' }}>
          <h2 className="font-nunito font-black text-navy text-2xl md:text-3xl mb-3 tracking-tight">Ready to start your campaign?</h2>
          <p className="text-sm mb-7 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>Free to create. Verified in minutes. Money straight to your MoMo wallet.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/create" className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-lg text-sm">
              Start a campaign
            </Link>
            <Link href="/campaigns" className="px-7 py-3.5 border-2 border-[var(--border)] hover:border-primary hover:text-primary text-[var(--text-muted)] font-bold rounded-full transition-all text-sm">
              Browse campaigns
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
