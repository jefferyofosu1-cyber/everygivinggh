'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export function Character({ mood, holding }: { mood: 'thinking'|'happy'|'excited'|'proud'|'pointing', holding?: 'phone'|'card'|'money'|null }) {
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

export function TutorialEmbed() {
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
        <div className="h-1 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${total}%` }} />
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {SCENES.map((s, i) => (
            <button key={i} onClick={() => jump(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${i === scene ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
              style={i === scene ? { backgroundColor: cur.accent, borderColor: cur.accent } : {}}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col md:grid md:grid-cols-5 gap-4 md:gap-6 md:items-center">
          <div className="md:col-span-2 flex flex-col items-center gap-3">
            <div className="w-28 h-36 md:w-44 md:h-60 flex-shrink-0">
              <Character mood={cur.mood} holding={cur.holding} />
            </div>
            <div className={`md:hidden w-full transition-all duration-500 ${show.bubble && playing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100 text-center">
                <p className="text-navy text-xs leading-relaxed font-medium">{cur.bubble}</p>
              </div>
            </div>
          </div>
          <div className={`md:col-span-3 transition-all duration-700 ${show.narration ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
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
