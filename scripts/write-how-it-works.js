const fs = require('fs');
const path = require('path');

const content = `'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── DATA ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: 'How long does identity verification take?', a: "Our team reviews Ghana Card submissions within 24 hours — usually much faster. You'll receive an SMS notification when your campaign is approved and goes live. If we need anything additional, we'll reach out by phone." },
  { q: 'What ID documents are accepted?', a: "We accept Ghana Card (primary), Voter ID, NHIS card, Passport, and Driver's License. The name on your ID must match the name on your EveryGiving account." },
  { q: 'Can I receive donations without a bank account?', a: "Yes — that's by design. All payouts go directly to your MoMo wallet (MTN MoMo, Vodafone Cash, or AirtelTigo Money). No bank account is ever required." },
  { q: 'What are milestones and why do I have to use them?', a: 'Milestones are checkpoints where funds are released — e.g. "Pay hospital deposit: ₵5,000". They are not a restriction — they are the reason donors trust you. Campaigns with milestones raise 3× more. You set the milestones yourself.' },
  { q: "What happens if I don't reach my goal?", a: "EveryGiving uses flexible funding — you keep everything you raise, regardless of whether you hit your goal. Donors are informed of this before giving." },
  { q: 'Can Ghanaians abroad donate?', a: 'Yes — via Zeepay, our diaspora payment partner. Donors in the UK, US, and Europe can give in GBP, USD, or EUR. The funds arrive to the campaigner in GHS via MoMo, same day.' },
  { q: 'What is the platform fee?', a: 'Zero. EveryGiving charges no platform fee. The only cost is 2.5% + ₵0.50 per donation — automatically deducted from each donation. On a ₵200 donation, ₵194.50 reaches the campaigner.' },
  { q: 'Can I edit my campaign after it goes live?', a: 'You can edit your story, photos, and updates at any time. Your goal amount cannot be changed after the first donation is received. Milestones can be adjusted before any milestone has been triggered.' },
  { q: "How do I post an update to my donors?", a: 'From your campaign dashboard, click "Post update". You can write text, attach photos, or link a YouTube or TikTok video. All donors receive an SMS and email notification automatically.' },
  { q: 'What happens if a payment fails?', a: "If a MoMo prompt times out or is declined, no money leaves the donor's account and nothing is credited to your campaign. Failed payments are never partially processed." },
]

const CAMPAIGNER_STEPS = [
  { num: '01', title: 'Create your campaign', time: '15 min', desc: "Write your story, set your fundraising goal, add a real photo, and set up milestones. Our guided flow walks you through each step — no technical skills needed.", details: ["Name the person and tell their story in your own words", "Set a realistic goal — under ₵20,000 raises 2.5× faster", "Add up to 5 photos — compressed automatically in your browser", "Set 2–4 milestones that map to specific expenses"], color: '#E1F5EE', accent: '#0A6B4B' },
  { num: '02', title: 'Verify your identity', time: '24 hrs', desc: "Upload your Ghana Card or accepted ID. Our team reviews every submission personally. Verified campaigns raise 3× more because donors know exactly who they are giving to.", details: ["Upload front and back of your Ghana Card", "Our team reviews within 24 hours", "You'll receive an SMS when approved", "No anonymous campaigns — ever"], color: '#E6F1FB', accent: '#185FA5' },
  { num: '03', title: 'Go live and share', time: 'Immediately', desc: "Once verified, your campaign goes live instantly. Share your unique link on WhatsApp, Facebook, and with family and friends. Campaigns shared in the first 48 hours raise 4× more.", details: ["Your campaign gets a unique shareable link", "Share directly to WhatsApp with one tap", "Ask 10 close contacts to donate in the first 48 hours", "Campaigns that reach 30% early succeed 80% of the time"], color: '#FAEEDA', accent: '#B85C00' },
  { num: '04', title: 'Post updates', time: 'Ongoing', desc: "Keep your donors informed with regular updates — a photo, a medical milestone, a moment of hope. Campaigns that post updates at least twice raise 3× more. We prompt you automatically.", details: ["Post text, photos, or YouTube/TikTok links", "Every donor is notified by SMS and email", "We prompt you at day 3, day 7, and day 14", "Updates reactivate donors who have gone quiet"], color: '#EEEDFE', accent: '#534AB7' },
  { num: '05', title: 'Receive funds via MoMo', time: 'Same day', desc: "When you complete a milestone and submit proof, our team releases the funds directly to your MoMo wallet. No bank account needed. Funds arrive same day as approval.", details: ["Submit proof for each milestone (photo, receipt, or document)", "Our team reviews and approves within a few hours", "Funds land directly on your MTN, Vodafone, or AirtelTigo wallet", "You receive an SMS confirmation for every payout"], color: '#EAF3DE', accent: '#27500A' },
]

const DONOR_STEPS = [
  { num: '01', title: 'Find a campaign', desc: "Browse verified campaigns by category — Medical, Education, Emergency, Faith, Community, and more. Every campaign has passed identity verification before appearing here.", color: '#E1F5EE', accent: '#0A6B4B' },
  { num: '02', title: 'Choose your amount', desc: "Select any amount — from ₵10 to whatever you can give. Our impact calculator shows exactly what your donation covers.", color: '#E6F1FB', accent: '#185FA5' },
  { num: '03', title: 'Pay by MoMo — instantly', desc: "Choose MTN MoMo, Vodafone Cash, or AirtelTigo. A prompt appears on your phone — approve it and your donation is confirmed in seconds. No bank account, no card, no login required.", color: '#EAF3DE', accent: '#27500A' },
]

const MOMO_NETWORKS = [
  { name: 'MTN MoMo', color: '#FFD700', text: '#7A5800', desc: "Ghana's largest network. Dial *170# or use the MoMo app to confirm." },
  { name: 'Vodafone Cash', color: '#E60000', text: '#fff', desc: 'Dial *110# or use the Vodafone app. Available on all Vodafone lines.' },
  { name: 'AirtelTigo', color: '#E8221B', text: '#fff', desc: 'Dial *500# or use the AirtelTigo app. Instant confirmation.' },
]

// ─── FAQ ITEM ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a, isLast }: { q: string; a: string; isLast: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid #E8E4DC', padding: '18px 20px', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: '#1A1A18', lineHeight: 1.5 }}>{q}</span>
        <span style={{ fontSize: 16, color: '#8A8A82', flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>
      {open && <div style={{ fontSize: 13, color: '#4A4A44', lineHeight: 1.75, marginTop: 10, paddingRight: 24 }}>{a}</div>}
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function HowItWorksPage() {
  const [audience, setAudience] = useState<'campaigner' | 'donor'>('campaigner')
  const [activeStep, setActiveStep] = useState(0)

  return (
    <>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeup .35s ease both}
        .step-card{transition:border-color .15s,background .15s}
        .step-card:hover{background:#F5F2EC !important}
      \`}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: '#fff', borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 0, zIndex: 200 }}>
        <Link href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 20, color: '#1A1A18' }}>
          Every<span style={{ color: '#0A6B4B' }}>Giving</span>
        </Link>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {([['/', 'Home'], ['/campaigns', 'Browse'], ['/how-it-works', 'How it works'], ['/fees', 'Fees']] as [string, string][]).map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize: 13, fontWeight: href === '/how-it-works' ? 600 : 500, color: href === '/how-it-works' ? '#0A6B4B' : '#4A4A44', padding: '7px 12px', borderRadius: 6 }}>{label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/auth/login" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A18', padding: '7px 14px', border: '1px solid #E8E4DC', borderRadius: 8 }}>Sign in</Link>
          <Link href="/create" style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '8px 18px', borderRadius: 8 }}>Start a campaign</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: '#1A1A18', padding: '64px 32px 56px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#B7DEC9', marginBottom: 14 }}>Simple by design</div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 44, lineHeight: 1.1, color: '#fff', marginBottom: 16 }}>
            How EveryGiving<br /><em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>actually works</em>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px' }}>
            Whether you are raising money or giving it — every step is designed around trust,
            transparency, and getting funds where they need to go.
          </p>
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,.1)', borderRadius: 12, padding: 4, gap: 4 }}>
            {(['campaigner', 'donor'] as const).map(mode => (
              <button key={mode} onClick={() => { setAudience(mode); setActiveStep(0) }}
                style={{ fontSize: 14, fontWeight: 500, padding: '10px 22px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s', background: audience === mode ? '#fff' : 'transparent', color: audience === mode ? '#1A1A18' : 'rgba(255,255,255,.6)', boxShadow: audience === mode ? '0 2px 8px rgba(0,0,0,.12)' : 'none' }}>
                {mode === 'campaigner' ? 'I want to raise money' : 'I want to donate'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TRUST BAR */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8E4DC', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', height: 48 }}>
          {['Ghana Card verified — every campaign', 'Milestone-based payouts — funds protected', 'MTN · Vodafone · AirtelTigo built in', '₵0 platform fee — always'].map((t, i, arr) => (
            <div key={i} style={{ fontSize: 12, color: '#4A4A44', whiteSpace: 'nowrap', padding: '0 24px', borderRight: i < arr.length - 1 ? '1px solid #E8E4DC' : 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#0A6B4B', fontWeight: 700 }}>✓</span>{t}
            </div>
          ))}
        </div>
      </div>

      {/* CAMPAIGNER JOURNEY */}
      {audience === 'campaigner' && (
        <div className="fade-in" style={{ padding: '0 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 10 }}>For campaigners</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 34, color: '#1A1A18', marginBottom: 12 }}>From story to funded — in five steps</h2>
            <p style={{ fontSize: 15, color: '#8A8A82', lineHeight: 1.75, maxWidth: 560, marginBottom: 48 }}>Every step is designed to help you raise more. Verified identity, compelling story, milestone payouts — each one builds donor trust.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 32, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {CAMPAIGNER_STEPS.map((step, i) => (
                  <div key={i} className="step-card" onClick={() => setActiveStep(i)}
                    style={{ background: '#fff', border: \`1.5px solid \${activeStep === i ? '#0A6B4B' : '#E8E4DC'}\`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: step.color, color: step.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Serif Display',serif", fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{step.num}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A18', marginBottom: 2 }}>{step.title}</div>
                        <div style={{ fontSize: 11, color: '#8A8A82' }}>⏱ {step.time}</div>
                      </div>
                      <div style={{ fontSize: 14, color: activeStep === i ? '#0A6B4B' : '#C8C4BC' }}>▶</div>
                    </div>
                  </div>
                ))}
              </div>
              <div key={activeStep} className="fade-in" style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16, padding: '32px 28px', position: 'sticky', top: 72 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: CAMPAIGNER_STEPS[activeStep].color, color: CAMPAIGNER_STEPS[activeStep].accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Serif Display',serif", fontSize: 20, marginBottom: 18 }}>{CAMPAIGNER_STEPS[activeStep].num}</div>
                <h3 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: '#1A1A18', marginBottom: 12 }}>{CAMPAIGNER_STEPS[activeStep].title}</h3>
                <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.75, marginBottom: 20 }}>{CAMPAIGNER_STEPS[activeStep].desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {CAMPAIGNER_STEPS[activeStep].details.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#4A4A44', lineHeight: 1.6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: CAMPAIGNER_STEPS[activeStep].accent, flexShrink: 0, marginTop: 5 }} />{d}
                    </div>
                  ))}
                </div>
                {activeStep < CAMPAIGNER_STEPS.length - 1 ? (
                  <button onClick={() => setActiveStep(s => s + 1)} style={{ display: 'block', width: '100%', padding: '12px 0', color: '#fff', background: CAMPAIGNER_STEPS[activeStep].accent, textAlign: 'center', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Next: {CAMPAIGNER_STEPS[activeStep + 1].title} →
                  </button>
                ) : (
                  <Link href="/create" style={{ display: 'block', padding: '12px 0', color: '#fff', background: '#0A6B4B', textAlign: 'center', borderRadius: 10, fontSize: 14, fontWeight: 600 }}>
                    Start your campaign — free →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DONOR JOURNEY */}
      {audience === 'donor' && (
        <div className="fade-in" style={{ padding: '0 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 10 }}>For donors</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 34, color: '#1A1A18', marginBottom: 12 }}>Give in three steps. Done in two minutes.</h2>
            <p style={{ fontSize: 15, color: '#8A8A82', lineHeight: 1.75, maxWidth: 560, marginBottom: 48 }}>No bank account. No card. Just your MoMo phone. Every campaign you give to is identity-verified before it goes live.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
              {DONOR_STEPS.map((step, i) => (
                <div key={i} style={{ background: step.color, borderRadius: 16, padding: '32px 24px' }}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 40, color: step.accent, lineHeight: 1, marginBottom: 14 }}>{step.num}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: step.accent, marginBottom: 10 }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: step.accent + 'CC', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/campaigns" style={{ display: 'inline-block', fontSize: 14, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '13px 28px', borderRadius: 10 }}>Browse verified campaigns →</Link>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION EXPLAINER */}
      <div style={{ background: '#1A1A18', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#B7DEC9', marginBottom: 10 }}>Identity verification</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 34, color: '#fff', marginBottom: 12 }}>The reason donors<br />trust your campaign</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, marginBottom: 32 }}>Every fundraiser on EveryGiving has had their Ghana Card reviewed by a real person on our team before their campaign went live. This is not optional — it is the foundation everything else is built on.</p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[['3×', 'more raised by verified campaigns'], ['24hr', 'typical review turnaround'], ['100%', 'of live campaigns are verified']].map(([n, l], i) => (
                <div key={i}>
                  <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: '#B7DEC9', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 3, lineHeight: 1.4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {[
              { step: '1', title: 'You submit your Ghana Card', desc: 'Upload a clear photo of the front and back. The name must match your account.' },
              { step: '2', title: 'Our team reviews it personally', desc: 'A real person on our team cross-checks your ID — not an algorithm.' },
              { step: '3', title: 'Your campaign goes live', desc: 'Once approved, your campaign is published and gets the Verified badge.' },
              { step: '4', title: 'Donors see exactly who you are', desc: 'Your verified name is displayed on every campaign page. No anonymity.' },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: 20, borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.08)' : 'none', marginBottom: i < arr.length - 1 ? 20 : 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0A6B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{item.step}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.65 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MILESTONE EXPLAINER */}
      <div style={{ padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 10 }}>How milestones work</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 34, color: '#1A1A18', marginBottom: 12 }}>The feature that makes<br />donors give more</h2>
          <p style={{ fontSize: 15, color: '#8A8A82', lineHeight: 1.75, maxWidth: 560, marginBottom: 48 }}>Milestone payouts are the single biggest difference between EveryGiving and every other crowdfunding platform in Ghana.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { icon: '🎯', title: 'You set the milestones', desc: 'When creating your campaign, you decide when funds are released — e.g. "Pay hospital deposit: ₵5,000" and "Fund surgery: ₵12,000".', color: '#E1F5EE', accent: '#0A6B4B' },
              { icon: '💰', title: 'Donations are held safely', desc: 'Funds accumulate securely via Paystack. Nothing is released until a milestone is reached and you submit proof.', color: '#E6F1FB', accent: '#185FA5' },
              { icon: '📄', title: 'You submit proof', desc: 'When a milestone is reached, upload a photo, receipt, or document showing the money will be used as stated.', color: '#FAEEDA', accent: '#B85C00' },
              { icon: '✅', title: 'We review and release', desc: 'Our team checks your proof and releases the funds to your MoMo wallet same day. Donors are notified automatically.', color: '#EAF3DE', accent: '#27500A' },
            ].map((item, i) => (
              <div key={i} style={{ background: item.color, borderRadius: 14, padding: '24px 20px' }}>
                <div style={{ fontSize: 26, marginBottom: 12 }}>{item.icon}</div>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: item.accent, marginBottom: 8, lineHeight: 1.3 }}>{item.title}</h4>
                <p style={{ fontSize: 12, color: item.accent + 'BB', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ background: '#1A1A18', borderRadius: 14, padding: '20px 24px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>💡</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Why donors give more to milestone campaigns</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.7 }}>When a donor sees that funds are held until proof is submitted, they know their money cannot disappear. Campaigns with milestones raise an average of 3× more than campaigns without them.</div>
            </div>
          </div>
        </div>
      </div>

      {/* MOMO EXPLAINER */}
      <div style={{ background: '#fff', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 10 }}>Mobile money</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 34, color: '#1A1A18', marginBottom: 12 }}>All three networks. Built in from day one.</h2>
          <p style={{ fontSize: 15, color: '#8A8A82', lineHeight: 1.75, maxWidth: 560, marginBottom: 40 }}>No bank account needed — for donors or campaigners. If you have a Ghanaian SIM card, you can give or receive.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {MOMO_NETWORKS.map((n, i) => (
              <div key={i} style={{ background: n.color, borderRadius: 14, padding: '24px 20px' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: n.text, marginBottom: 8 }}>{n.name}</div>
                <div style={{ fontSize: 13, color: n.text + 'CC', lineHeight: 1.65 }}>{n.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#FDFAF5', border: '1px solid #E8E4DC', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#4A4A44', lineHeight: 1.65 }}>
            <strong>Diaspora donors</strong> in the UK, US, and Europe can give in GBP, USD, or EUR via Zeepay — funds arrive on the campaigner&#39;s MoMo wallet in GHS, same day.
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 0' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 10 }}>Common questions</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 34, color: '#1A1A18', marginBottom: 40 }}>Everything you need to know</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' }}>
            <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16, overflow: 'hidden' }}>
              {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} isLast={i === FAQS.length - 1} />)}
            </div>
            <div>
              <div style={{ background: '#FDFAF5', border: '1px solid #E8E4DC', borderRadius: 14, padding: 20, position: 'sticky', top: 80, marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A18', marginBottom: 6 }}>Still have questions?</div>
                <p style={{ fontSize: 13, color: '#8A8A82', lineHeight: 1.65, marginBottom: 14 }}>Our team is based in Accra and responds within a few hours.</p>
                <Link href="mailto:support@everygiving.org" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0A6B4B', background: '#E8F5EF', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>Contact us →</Link>
              </div>
              <div style={{ background: '#0A6B4B', borderRadius: 14, padding: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Ready to start?</div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.65, marginBottom: 14 }}>Create your campaign in under 15 minutes. Free. Always.</p>
                <Link href="/create" style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0A6B4B', background: '#fff', padding: '10px 16px', borderRadius: 8, textAlign: 'center' }}>Start a campaign →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#0A6B4B', padding: '64px 32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 36, color: '#fff', marginBottom: 12 }}>Ready to raise with confidence?</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', marginBottom: 28 }}>Free to create. Verified by our team. Funds released as you hit milestones.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <Link href="/create" style={{ fontSize: 14, fontWeight: 600, color: '#0A6B4B', background: '#fff', padding: '13px 26px', borderRadius: 10 }}>Start a campaign — free</Link>
          <Link href="/campaigns" style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,.75)', background: 'transparent', padding: '13px 26px', borderRadius: 10, border: '1px solid rgba(255,255,255,.3)' }}>Browse campaigns</Link>
        </div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['No credit card needed', '₵0 platform fee', 'Identity verified', 'MoMo same-day'].map((t, i) => <span key={i} style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>✓ {t}</span>)}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#1A1A18', borderTop: '1px solid rgba(255,255,255,.06)', padding: '24px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 16, color: '#fff' }}>Every<span style={{ color: '#B7DEC9' }}>Giving</span></span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{String.fromCharCode(169)} {new Date().getFullYear()} EveryGiving · Built in Ghana</span>
          <div style={{ display: 'flex', gap: 14 }}>
            {[['Terms', '/terms'], ['Privacy', '/privacy'], ['Fees', '/fees'], ['Contact', '/contact']].map(([l, h]) => <Link key={l} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>{l}</Link>)}
          </div>
        </div>
      </footer>
    </>
  )
}
`;

const outPath = path.join(__dirname, '..', 'app', 'how-it-works', 'page.tsx');
fs.writeFileSync(outPath, content, 'utf8');
console.log('Written', fs.statSync(outPath).size, 'bytes to', outPath);
