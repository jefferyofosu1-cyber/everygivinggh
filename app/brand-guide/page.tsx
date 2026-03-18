'use client'
import { useState } from 'react'
import Link from 'next/link'

// ─── DATA ────────────────────────────────────────────────────────────────────

const PALETTE_PRIMARY = [
  { hex: '#02A95C', name: 'Primary Green',  use: 'CTAs, links, progress, badges' },
  { hex: '#018A4A', name: 'Primary Dark',   use: 'Hover states, deep accents' },
  { hex: '#05C96E', name: 'Primary Mid',    use: 'Gradients, highlights' },
  { hex: '#E6F9F1', name: 'Primary Light',  use: 'Tinted backgrounds, badges', dark: true },
]
const PALETTE_NAVY = [
  { hex: '#1A2B3C', name: 'Navy',       use: 'Headings, hero backgrounds, navbar' },
  { hex: '#243447', name: 'Navy Mid',   use: 'Cards on dark, hover states' },
  { hex: '#2E4057', name: 'Navy Light', use: 'Borders on dark, dividers' },
]
const PALETTE_ACCENT = [
  { hex: '#F59E0B', name: 'Gold',  use: 'Premium tier, warnings, Ghana Card' },
  { hex: '#EF4444', name: 'Red',   use: 'Errors, failed states, urgent' },
  { hex: '#3B82F6', name: 'Blue',  use: 'Info states, links in body copy' },
]
const PALETTE_NEUTRALS = [
  '#F8FAFC','#F1F5F9','#E2E8F0','#CBD5E1','#94A3B8','#64748B','#475569','#334155','#1E293B',
]
const NEUTRAL_LABELS = ['50','100','200','300','400','500','600','700','800']

const TYPE_SCALE = [
  { label: 'Display', size: '52px', weight: '900', sample: 'Campaign', style: { fontSize: 48, fontWeight: 900, letterSpacing: -1.5 } },
  { label: 'H1',      size: '40px', weight: '900', sample: "Ghana's platform", style: { fontSize: 36, fontWeight: 900, letterSpacing: -1 } },
  { label: 'H2',      size: '28px', weight: '900', sample: 'How it works', style: { fontSize: 28, fontWeight: 900, letterSpacing: -0.5 } },
  { label: 'H3',      size: '20px', weight: '800', sample: 'Create your campaign', style: { fontSize: 20, fontWeight: 800 } },
  { label: 'Body L',  size: '16px', weight: '400', sample: 'Donors give with confidence when they see the verified badge.', style: { fontSize: 16, fontWeight: 400 }, body: true },
  { label: 'Body',    size: '14px', weight: '400', sample: 'Every cedi goes directly to the fundraiser. Zero platform fees, always.', style: { fontSize: 14, fontWeight: 400 }, body: true },
  { label: 'Caption', size: '12px', weight: '400', sample: 'Accra · Medical · 3 weeks ago · Ghana Card verified', style: { fontSize: 12, fontWeight: 400 }, body: true },
]

const SPACING = [
  { token: 'sp-1',  px: '4px',  use: 'Icon gaps, tight badges' },
  { token: 'sp-2',  px: '8px',  use: 'Button icon gap, inline' },
  { token: 'sp-3',  px: '12px', use: 'Card padding sm' },
  { token: 'sp-4',  px: '16px', use: 'Standard gap, input padding' },
  { token: 'sp-5',  px: '20px', use: 'Section padding sm' },
  { token: 'sp-6',  px: '24px', use: 'Card padding default' },
  { token: 'sp-8',  px: '32px', use: 'Section gap, form groups' },
  { token: 'sp-10', px: '40px', use: 'Hero padding, large cards' },
  { token: 'sp-12', px: '48px', use: 'Between page sections' },
  { token: 'sp-16', px: '64px', use: 'Major section padding' },
  { token: 'sp-20', px: '80px', use: 'Hero sections' },
  { token: 'sp-24', px: '96px', use: 'Max section padding' },
]

const RADII = [
  { token: 'radius-sm',   px: '6px',    tw: 'rounded-md' },
  { token: 'radius-md',   px: '10px',   tw: 'rounded-xl' },
  { token: 'radius-lg',   px: '16px',   tw: 'rounded-2xl' },
  { token: 'radius-xl',   px: '20px',   tw: 'rounded-[20px]' },
  { token: 'radius-2xl',  px: '28px',   tw: 'rounded-[28px]' },
  { token: 'radius-full', px: '9999px', tw: 'rounded-full' },
]

const PERSONALITY = [
  { word: 'Trusted',  desc: 'Every touchpoint signals credibility. Verification is a feature, not a footnote.' },
  { word: 'Warm',     desc: 'Real people, real stories. The platform feels human — never corporate or distant.' },
  { word: 'Bold',     desc: 'Strong type, clear hierarchy, decisive colour. No timid design choices.' },
  { word: 'Rooted',   desc: 'Built for Ghana. MoMo-native, card-verified, community-first.' },
  { word: 'Clear',    desc: 'Nothing confusing, nothing hidden. Transparency is a design principle.' },
]

const TONE = [
  { left: 'Formal',   right: 'Conversational', pct: 30 },
  { left: 'Serious',  right: 'Playful',         pct: 55 },
  { left: 'Reserved', right: 'Energetic',        pct: 75 },
  { left: 'Complex',  right: 'Simple',           pct: 15 },
  { left: 'Cold',     right: 'Warm',             pct: 80 },
]

const DOS = [
  'Use Nunito Black (900) for all headings',
  'Keep "Every" green, "Giving" dark in wordmark',
  'Use pill-shaped buttons for primary CTAs',
  'Write in plain, direct English — no jargon',
  'Show the 0% fee prominently on every key page',
  'Add hover lift (translateY -2px) to all interactive elements',
]
const DONTS = [
  'Use Inter, Roboto, or system fonts anywhere',
  'Separate the "Every" and "Giving" wordmark',
  'Use purple gradients or generic SaaS colour schemes',
  'Use emojis in UI text or headings',
  'Mention fees without clarifying they are 0%',
  'Use square-cornered buttons for primary actions',
]

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────
function Section({ label, title, desc, children }: { label: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="mb-20">
      <div className="text-xs font-bold tracking-widest uppercase text-primary mb-1" style={{ fontFamily: 'DM Mono, monospace' }}>{label}</div>
      <h2 className="font-nunito font-black text-navy text-2xl md:text-3xl tracking-tight mb-1">{title}</h2>
      {desc && <p className="text-sm text-gray-500 mb-8 max-w-xl leading-relaxed">{desc}</p>}
      {!desc && <div className="mb-8" />}
      {children}
    </section>
  )
}

// ─── COLOUR SWATCH ───────────────────────────────────────────────────────────
function Swatch({ hex, name, use, dark }: { hex: string; name: string; use: string; dark?: boolean }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer group" onClick={copy}>
      <div className="h-24 flex items-end p-3 transition-all group-hover:brightness-95" style={{ backgroundColor: hex }}>
        <span className="text-xs font-mono font-medium" style={{ color: dark ? '#02A95C' : 'rgba(255,255,255,.75)' }}>
          {copied ? 'Copied!' : hex}
        </span>
      </div>
      <div className="bg-white p-3 border-t border-gray-100">
        <div className="font-nunito font-extrabold text-navy text-sm">{name}</div>
        <div className="text-xs text-gray-400 mt-0.5">{use}</div>
      </div>
    </div>
  )
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function BrandGuidePage() {
  return (
    <>
      <main>
        {/* ── COVER ── */}
        <div className="bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.15) 0%, transparent 65%)', transform: 'translate(-50%, -50%)' }} />
          <div className="relative max-w-4xl mx-auto px-6 py-24">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-8 tracking-widest uppercase" style={{ fontFamily: 'DM Mono, monospace' }}>
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              Brand Style Guide · v1.0
            </div>
            <div className="font-nunito font-black text-white mb-5 leading-none tracking-tight" style={{ fontSize: 'clamp(52px, 10vw, 96px)', letterSpacing: -3 }}>
              <span className="text-primary">Every</span>Giving
            </div>
            <p className="text-white/40 text-base mb-10 max-w-md leading-relaxed">Ghana's verified crowdfunding platform — visual identity, design tokens, and usage guidelines.</p>
            <div className="flex flex-wrap gap-6">
              {[
                ['Fonts', 'Nunito + Nunito Sans'],
                ['Primary', '#02A95C'],
                ['Navy', '#1A2B3C'],
                ['Version', '1.0 · 2026'],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-white/25 text-xs mb-0.5" style={{ fontFamily: 'DM Mono, monospace' }}>{k}</div>
                  <div className="text-white/60 text-sm font-medium" style={{ fontFamily: 'DM Mono, monospace' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-20">

          {/* ── 01 PERSONALITY ── */}
          <Section label="01 — Brand Foundation" title="Design Personality" desc="Five keywords that define every design decision. If a component doesn't feel like at least three of these, reconsider it.">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
              {PERSONALITY.map(p => (
                <div key={p.word} className="bg-navy rounded-2xl p-5 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-primary/10 -translate-y-1/2 translate-x-1/2" />
                  <div className="font-nunito font-black text-white text-lg mb-2 relative">{p.word}</div>
                  <div className="w-5 h-0.5 bg-primary mb-2 rounded-full" />
                  <div className="text-white/40 text-xs leading-relaxed relative">{p.desc}</div>
                </div>
              ))}
            </div>

            {/* Tone spectrum */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5" style={{ fontFamily: 'DM Mono, monospace' }}>Brand Voice — Tone Spectrum</div>
              <div className="flex flex-col gap-4">
                {TONE.map(t => (
                  <div key={t.left} className="flex items-center gap-4">
                    <div className="w-24 text-xs font-semibold text-navy text-right flex-shrink-0">{t.left}</div>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-dark to-primary rounded-full" style={{ width: `${t.pct}%` }} />
                    </div>
                    <div className="w-24 text-xs text-gray-400 flex-shrink-0">{t.right}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <div className="h-px bg-gray-200 mb-20" />

          {/* ── 02 COLOURS ── */}
          <Section label="02 — Visual Identity" title="Colour Palette" desc="High-contrast palette anchored in Ghanaian green — growth, trust, natural abundance. Navy builds authority. Click any swatch to copy the hex code.">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {PALETTE_PRIMARY.map(s => <Swatch key={s.hex} {...s} />)}
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PALETTE_NAVY.map(s => <Swatch key={s.hex} {...s} />)}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Accent Colours — Use sparingly</div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PALETTE_ACCENT.map(s => <Swatch key={s.hex} {...s} />)}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Neutral Scale</div>
            <div className="flex gap-1.5">
              {PALETTE_NEUTRALS.map((hex, i) => (
                <div key={hex} className="flex-1 rounded-xl overflow-hidden shadow-sm" style={{ minWidth: 0 }}>
                  <div className="h-10" style={{ backgroundColor: hex }} />
                  <div className="bg-white p-1.5 border-t border-gray-100">
                    <div className="text-gray-400 leading-none" style={{ fontFamily: 'DM Mono, monospace', fontSize: 9 }}>Gray {NEUTRAL_LABELS[i]}</div>
                    <div className="text-gray-600 leading-none mt-0.5" style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, fontWeight: 500 }}>{hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="h-px bg-gray-200 mb-20" />

          {/* ── 03 TYPOGRAPHY ── */}
          <Section label="03 — Typography" title="Type System" desc="Nunito for display personality, Nunito Sans for body readability. DM Mono for technical labels. All free on Google Fonts.">
            {/* Nunito specimen */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-4">
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>Display — Nunito</span>
                <span className="text-xs text-primary" style={{ fontFamily: 'DM Mono, monospace' }}>google.com/fonts · Free</span>
              </div>
              <div className="p-8">
                <div className="font-nunito font-black text-navy mb-4 leading-none" style={{ fontSize: 56, letterSpacing: -2 }}>
                  <span className="text-primary">Every</span>Giving
                </div>
                <div className="font-nunito font-black text-primary mb-5" style={{ fontSize: 28, letterSpacing: -0.5 }}>Raise money the right way</div>
                <div className="flex flex-wrap gap-4">
                  {[['600', 'Semibold'], ['700', 'Bold'], ['800', 'ExtraBold'], ['900', 'Black']].map(([w, l]) => (
                    <span key={w} className="font-nunito text-gray-600" style={{ fontWeight: parseInt(w), fontSize: 15 }}>Weight {w} — {l}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Nunito Sans specimen */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-4">
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-3 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>Body — Nunito Sans</span>
                <span className="text-xs text-primary" style={{ fontFamily: 'DM Mono, monospace' }}>google.com/fonts · Free</span>
              </div>
              <div className="p-8">
                <p className="text-gray-600 leading-relaxed mb-4 max-w-xl" style={{ fontSize: 16, lineHeight: 1.75 }}>
                  Every Giving is Ghana's verified crowdfunding platform. We help real people raise money for medical bills, education, church projects, and community causes — with identity verification built in so donors can give with confidence.
                </p>
                <p className="text-gray-500 italic mb-4" style={{ fontSize: 14, lineHeight: 1.6 }}>
                  "I raised ₵18,500 in three weeks. Strangers donated because they could see I was verified." — Ama, Accra
                </p>
              </div>
            </div>

            {/* Type scale */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 border-b border-gray-100 px-6 py-3">
                <span className="text-xs uppercase tracking-widest text-gray-400" style={{ fontFamily: 'DM Mono, monospace' }}>Type Scale</span>
              </div>
              <div className="divide-y divide-gray-50">
                {TYPE_SCALE.map(t => (
                  <div key={t.label} className="flex items-baseline gap-6 px-6 py-4">
                    <div className="w-20 flex-shrink-0">
                      <div className="font-bold text-navy text-xs" style={{ fontFamily: 'DM Mono, monospace' }}>{t.label}</div>
                      <div className="text-gray-300 text-xs" style={{ fontFamily: 'DM Mono, monospace' }}>{t.size}/{t.weight}</div>
                    </div>
                    <div
                      className="text-navy leading-tight"
                      style={{
                        ...t.style,
                        fontFamily: t.body ? "'Nunito Sans', sans-serif" : "'Nunito', sans-serif",
                        color: t.body ? '#64748B' : '#1A2B3C',
                      }}>
                      {t.sample}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <div className="h-px bg-gray-200 mb-20" />

          {/* ── 04 LOGO ── */}
          <Section label="04 — Identity" title="Logo & Wordmark" desc='The wordmark uses Nunito Black at -1px tracking. "Every" is always Primary Green. "Giving" matches the background. Never separate the two words.'>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { bg: 'white', border: true, label: 'On white — primary use', givingColor: '#1A2B3C' },
                { bg: '#1A2B3C', border: false, label: 'On navy — reversed', givingColor: 'white', labelColor: 'rgba(255,255,255,.3)' },
                { bg: '#02A95C', border: false, label: 'On primary — special use only', givingColor: 'rgba(255,255,255,.7)', labelColor: 'rgba(255,255,255,.5)' },
                { bg: '#F8FAFC', border: true, label: 'Never — no colour split', givingColor: '#E2E8F0', noSplit: true },
              ].map((item, i) => (
                <div key={i} className={`rounded-2xl flex flex-col items-center justify-center gap-3 py-10 px-6 ${item.border ? 'border border-gray-100' : ''}`} style={{ backgroundColor: item.bg }}>
                  {item.noSplit ? (
                    <div className="font-nunito font-black" style={{ fontSize: 36, letterSpacing: -1, color: '#E2E8F0' }}>EveryGiving</div>
                  ) : (
                    <div className="font-nunito font-black" style={{ fontSize: 36, letterSpacing: -1 }}>
                      <span style={{ color: '#02A95C' }}>Every</span>
                      <span style={{ color: item.givingColor }}>Giving</span>
                    </div>
                  )}
                  <div className="text-xs uppercase tracking-widest" style={{ fontFamily: 'DM Mono, monospace', color: item.labelColor || '#94A3B8', fontSize: 10 }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="h-px bg-gray-200 mb-20" />

          {/* ── 05 BUTTONS ── */}
          <Section label="05 — Components" title="Button System" desc="Pill-shaped buttons for all primary actions. Hover always lifts 2px — a signature EveryGiving micro-interaction.">
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              {[
                {
                  rowLabel: 'Primary — main call to action',
                  buttons: [
                    { label: 'Start fundraiser', className: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 text-base px-9 py-4' },
                    { label: 'Start fundraiser', className: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 text-sm px-7 py-3' },
                    { label: 'Start fundraiser', className: 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 text-xs px-5 py-2.5' },
                  ]
                },
                {
                  rowLabel: 'Secondary — browse, cancel, back',
                  buttons: [
                    { label: 'Browse campaigns', className: 'bg-white border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-700 text-base px-9 py-4' },
                    { label: 'Browse campaigns', className: 'bg-white border-2 border-gray-200 hover:border-primary hover:text-primary text-gray-700 text-sm px-7 py-3' },
                  ]
                },
                {
                  rowLabel: 'Dark & Ghost variants',
                  buttons: [
                    { label: 'Sign in', className: 'bg-navy hover:bg-navy/90 text-white text-sm px-7 py-3' },
                    { label: 'Learn more', className: 'bg-primary-light border-2 border-primary/20 hover:bg-primary hover:text-white text-primary text-sm px-7 py-3' },
                    { label: 'Delete', className: 'bg-red-50 border-2 border-red-200 hover:bg-red-500 hover:text-white text-red-600 text-sm px-7 py-3' },
                  ]
                },
              ].map((row, i) => (
                <div key={i} className={`pb-5 mb-5 ${i < 2 ? 'border-b border-gray-50' : ''}`}>
                  <div className="text-xs uppercase tracking-widest text-gray-300 mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>{row.rowLabel}</div>
                  <div className="flex flex-wrap gap-3 items-center">
                    {row.buttons.map((btn, j) => (
                      <button key={j} className={`font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 ${btn.className}`}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div className="h-px bg-gray-200 mb-20" />

          {/* ── 06 SPACING ── */}
          <Section label="06 — Layout" title="Spacing System" desc="4px base grid. All spacing is a multiple of 4. Use token names in code for consistency.">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
              <div className="divide-y divide-gray-50">
                {SPACING.map(s => (
                  <div key={s.token} className="flex items-center gap-5 py-3">
                    <div className="w-40 flex-shrink-0 flex items-baseline gap-3">
                      <span className="text-primary font-medium" style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{s.token}</span>
                      <span className="text-gray-400" style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{s.px}</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-5 bg-primary-light rounded border-l-2 border-primary" style={{ width: s.px, maxWidth: '100%' }} />
                    </div>
                    <div className="text-xs text-gray-400 w-44 flex-shrink-0 hidden md:block">{s.use}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radii */}
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3" style={{ fontFamily: 'DM Mono, monospace' }}>Border Radius Scale</div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {RADII.map(r => (
                <div key={r.token} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col items-center gap-2 shadow-sm">
                  <div className="w-12 h-12 bg-primary-light border-2 border-primary" style={{ borderRadius: r.px }} />
                  <div className="text-xs text-gray-400 text-center" style={{ fontFamily: 'DM Mono, monospace', fontSize: 9 }}>{r.token}</div>
                  <div className="text-primary text-xs font-medium" style={{ fontFamily: 'DM Mono, monospace', fontSize: 10 }}>{r.px}</div>
                </div>
              ))}
            </div>
          </Section>

          <div className="h-px bg-gray-200 mb-20" />

          {/* ── 07 DO / DON'T ── */}
          <Section label="07 — Brand Rules" title="Do's & Don'ts" desc="Non-negotiable rules to keep the brand consistent across every touchpoint.">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-green-600 mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>Do</div>
                <div className="flex flex-col gap-3">
                  {DOS.map((d, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-green-800">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12" /></svg>
                      </div>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4" style={{ fontFamily: 'DM Mono, monospace' }}>Don't</div>
                <div className="flex flex-col gap-3">
                  {DONTS.map((d, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-red-800">
                      <div className="w-5 h-5 bg-red-400 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </div>
                      {d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <div className="h-px bg-gray-200 mb-20" />

          {/* ── 08 TAILWIND CONFIG ── */}
          <Section label="08 — Implementation" title="Tailwind Config" desc="Paste this into your tailwind.config.ts to implement the full design system.">
            <div className="bg-navy rounded-2xl p-6 overflow-x-auto">
              <pre className="text-sm leading-relaxed" style={{ fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,.65)', whiteSpace: 'pre-wrap' }}>{`// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#02A95C',
          dark:    '#018A4A',
          mid:     '#05C96E',
          light:   '#E6F9F1',
        },
        navy: '#1A2B3C',
      },
      fontFamily: {
        nunito:       ['Nunito', 'sans-serif'],
        'nunito-sans': ['Nunito Sans', 'sans-serif'],
      },
      boxShadow: {
        primary: '0 8px 24px rgba(2,169,92,0.30)',
      },
    },
  },
}`}</pre>
            </div>
          </Section>

        </div>

        {/* Footer banner */}
        <div className="bg-navy py-14 px-5 text-center">
          <div className="font-nunito font-black mb-3" style={{ fontSize: 40, letterSpacing: -1 }}>
            <span className="text-primary">Every</span><span className="text-white">Giving</span>
          </div>
          <div className="text-white/30 text-sm">Brand Style Guide v1.0 · 2026 · Built in Ghana</div>
        </div>
      </main>
    </>
  )
}
