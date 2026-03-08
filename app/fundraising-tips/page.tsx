'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const TIPS = [
  { n:'01', icon:'📸', title:'Use a real, personal photo', tag:'Most impactful', body:'Campaigns with a clear personal photo raise significantly more. Use a real photo of yourself or the person you\'re raising for. Avoid stock photos — donors can tell immediately.', stat:'68%', statLabel:'more raised with a photo' },
  { n:'02', icon:'✍️', title:'Tell a complete story', tag:'Writing', body:'Explain who you are, what happened, why you need help, and exactly how the money will be used. "I need ₵8,000 for my daughter\'s surgery at Korle Bu" beats "help me please" every time.', stat:'3×', statLabel:'more trust with specific details' },
  { n:'03', icon:'🪪', title:'Verify before you share', tag:'Trust', body:'Donors give significantly more to verified campaigns. Upload your ID and complete verification before sharing. The Verified badge is the single most important trust signal.', stat:'3×', statLabel:'more raised by verified campaigns' },
  { n:'04', icon:'📱', title:'Share on WhatsApp within the first hour', tag:'Sharing', body:'The first 48 hours are critical. Share your link in every WhatsApp group you\'re in — write a personal message, not just a link drop. Early momentum is everything.', stat:'48h', statLabel:'most critical window to share' },
  { n:'05', icon:'🔄', title:'Post updates consistently', tag:'Momentum', body:'Campaigns that post updates raise more. Show donors the money is being used well. Even a short "We\'re 40% there — thank you!" keeps momentum going.', stat:'2×', statLabel:'more raised by campaigns with updates' },
  { n:'06', icon:'🎯', title:'Set a goal you can realistically hit', tag:'Strategy', body:'Campaigns that reach 30% in the first week almost always hit their target. Set a goal you can achieve — you can always raise more. Too high a goal looks like failure.', stat:'30%', statLabel:'in week 1 predicts success' },
  { n:'07', icon:'🙏', title:'Thank every donor — personally', tag:'Relationships', body:'When someone donates, send them a personal WhatsApp thank you. Donors who feel appreciated become your biggest advocates and often share your campaign further.', stat:'5×', statLabel:'more shares from thanked donors' },
  { n:'08', icon:'📣', title:'Ask specifically for shares, not just donations', tag:'Growth', body:'Most people can\'t donate but can share. Explicitly say "even if you can\'t give, please share." One share from the right person can unlock 10 new donors.', stat:'1 share', statLabel:'can reach 50+ new people' },
  { n:'09', icon:'📊', title:'Show evidence and documentation', tag:'Credibility', body:'Upload a photo of the hospital bill, school fees invoice, or doctor\'s letter. Evidence removes doubt. Transparency builds trust that translates directly into more donations.', stat:'73%', statLabel:'donors want to see proof' },
]

// 60-second animation — each tip shown for ~6.5s
const TOTAL_DURATION = 60000
const TIP_DURATION = TOTAL_DURATION / TIPS.length

export default function FundraisingTipsPage() {
  const [playing, setPlaying] = useState(false)
  const [currentTip, setCurrentTip] = useState(0)
  const [progress, setProgress] = useState(0)
  const [tipProgress, setTipProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const pausedAtRef = useRef<number>(0)

  useEffect(() => {
    if (!playing) return
    const start = Date.now() - pausedAtRef.current

    const tick = () => {
      const elapsed = Date.now() - start
      const total = Math.min(elapsed / TOTAL_DURATION, 1)
      const tipIdx = Math.min(Math.floor(elapsed / TIP_DURATION), TIPS.length - 1)
      const tp = ((elapsed % TIP_DURATION) / TIP_DURATION) * 100

      setProgress(total * 100)
      setCurrentTip(tipIdx)
      setTipProgress(tp)

      if (total >= 1) {
        setPlaying(false)
        pausedAtRef.current = 0
        setProgress(100)
        setTipProgress(100)
      }
    }

    intervalRef.current = setInterval(tick, 50)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing])

  const handlePlayPause = () => {
    if (playing) {
      pausedAtRef.current = (progress / 100) * TOTAL_DURATION
      setPlaying(false)
    } else {
      if (progress >= 100) { pausedAtRef.current = 0; setProgress(0); setCurrentTip(0) }
      setPlaying(true)
    }
  }

  const handleReset = () => {
    setPlaying(false)
    pausedAtRef.current = 0
    setProgress(0)
    setTipProgress(0)
    setCurrentTip(0)
  }

  const tip = TIPS[currentTip]

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="bg-navy py-16 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{backgroundImage:'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',backgroundSize:'32px 32px'}} />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">The ultimate guide</div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl tracking-tight mb-4" style={{letterSpacing:-1}}>
              How to raise more,<br /><span className="text-primary">faster</span>
            </h1>
            <p className="text-white/50 text-sm max-w-xl mx-auto leading-relaxed mb-7">
              9 proven tactics from the most successful campaigns on EveryGiving. Watch the 60-second animated guide or read through below.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-white/30">
              <span>3× more raised by verified campaigns</span>
              <span>48h most critical window</span>
              <span>73% with photos hit their goal</span>
            </div>
          </div>
        </section>

        {/* ── 60-SECOND ANIMATED VIDEO ── */}
        <section className="py-14 bg-gray-950">
          <div className="max-w-3xl mx-auto px-5">
            <div className="text-center mb-6">
              <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">60-second guide</div>
              <h2 className="font-nunito font-black text-white text-2xl">Fundraising Tips — Animated</h2>
            </div>

            {/* Video frame */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-white/5 shadow-2xl" style={{aspectRatio:'16/9'}}>
              {/* Background gradient that changes per tip */}
              <div className="absolute inset-0 transition-all duration-700"
                style={{background: `radial-gradient(ellipse at 30% 50%, rgba(2,169,92,0.12) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(26,43,60,0.8) 0%, transparent 50%)`}} />

              {/* Tip counter */}
              <div className="absolute top-5 left-5 flex items-center gap-3 z-10">
                <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center font-nunito font-black text-white text-xs">{currentTip + 1}</div>
                <div className="text-white/40 text-xs">of {TIPS.length}</div>
              </div>

              {/* Time remaining */}
              <div className="absolute top-5 right-5 z-10">
                <div className="bg-white/10 border border-white/10 rounded-full px-3 py-1 text-white/60 text-xs">
                  {Math.ceil((TOTAL_DURATION - (progress / 100) * TOTAL_DURATION) / 1000)}s
                </div>
              </div>

              {/* Main content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center px-10 text-center z-10">
                <div key={currentTip} className="animate-fade-in">
                  <div className="text-6xl md:text-8xl mb-4 transition-all duration-500"
                    style={{filter: playing ? 'none' : 'grayscale(0.5)'}}>
                    {tip.icon}
                  </div>
                  <div className="text-primary text-xs font-bold uppercase tracking-widest mb-2">{tip.tag}</div>
                  <h3 className="font-nunito font-black text-white text-xl md:text-3xl mb-3 leading-tight">{tip.title}</h3>
                  <p className="text-white/50 text-sm md:text-base leading-relaxed max-w-lg">{tip.body}</p>
                  <div className="mt-5 inline-flex items-center gap-3 bg-primary/15 border border-primary/30 rounded-2xl px-6 py-3">
                    <span className="font-nunito font-black text-primary text-2xl">{tip.stat}</span>
                    <span className="text-white/50 text-xs">{tip.statLabel}</span>
                  </div>
                </div>

                {/* Idle state */}
                {!playing && progress === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950/60 backdrop-blur-sm">
                    <div className="text-6xl mb-4">▶️</div>
                    <div className="font-nunito font-black text-white text-xl mb-2">60-Second Fundraising Guide</div>
                    <div className="text-white/40 text-sm">Press play to watch all 9 tips</div>
                  </div>
                )}
              </div>

              {/* Tip progress bar at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
                <div className="h-full bg-primary transition-all" style={{width:`${tipProgress}%`}} />
              </div>
            </div>

            {/* Controls */}
            <div className="mt-5 flex items-center gap-4">
              {/* Play/Pause */}
              <button onClick={handlePlayPause}
                className="w-12 h-12 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center text-white transition-all hover:scale-105 shadow-lg shadow-primary/30 flex-shrink-0">
                {playing ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
                )}
              </button>

              {/* Overall progress bar */}
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer"
                onClick={e => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const pct = (e.clientX - rect.left) / rect.width
                  pausedAtRef.current = pct * TOTAL_DURATION
                  setProgress(pct * 100)
                  setCurrentTip(Math.min(Math.floor(pct * TIPS.length), TIPS.length - 1))
                }}>
                <div className="h-full bg-primary rounded-full transition-all" style={{width:`${progress}%`}} />
              </div>

              {/* Reset */}
              <button onClick={handleReset} className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
              </button>

              <span className="text-white/30 text-xs w-8">{Math.floor(progress / 100 * 60)}s</span>
            </div>

            {/* Tip dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {TIPS.map((_, i) => (
                <button key={i} onClick={() => { pausedAtRef.current = (i / TIPS.length) * TOTAL_DURATION; setCurrentTip(i); setProgress((i/TIPS.length)*100) }}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentTip ? 'bg-primary scale-125' : i < currentTip ? 'bg-primary/40' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Tip cards — static list */}
        <section className="py-14 bg-gray-50">
          <div className="max-w-4xl mx-auto px-5">
            <h2 className="font-nunito font-black text-navy text-2xl text-center mb-8">All 9 tips</h2>
            <div className="flex flex-col gap-4">
              {TIPS.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex gap-5 hover:shadow-md transition-all">
                  <div className="flex-shrink-0 w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center text-2xl">{t.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <div className="font-nunito font-black text-navy text-base">{t.title}</div>
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{t.tag}</span>
                      <span className="ml-auto text-primary font-nunito font-black text-sm">{t.stat} <span className="text-gray-400 font-normal text-xs">{t.statLabel}</span></span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{t.body}</p>
                  </div>
                  <div className="font-nunito font-black text-gray-100 text-3xl flex-shrink-0 hidden md:block self-center">{t.n}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-primary text-center px-5">
          <h2 className="font-nunito font-black text-white text-3xl mb-3">Apply these from day one</h2>
          <p className="text-white/70 text-sm mb-7">Free to start. Verified in minutes. Donations straight to your MoMo.</p>
          <Link href="/create" className="inline-block bg-white text-primary font-nunito font-black px-10 py-4 rounded-full hover:-translate-y-0.5 transition-all shadow-xl text-sm">
            Create your campaign →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
