'use client'

import { useState } from 'react'
import Link from 'next/link'

const BASE = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
a{color:inherit;text-decoration:none}
input:focus{outline:none;border-color:#0A6B4B!important}
.faq-item{cursor:pointer;transition:background .12s}
.faq-item:hover{background:#FAFAF7}
.scenario-card{transition:all .18s}
.scenario-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.08)}
`

// ── FEE CONSTANTS (corrected: 2.5% + ₵0.50) ──────────────────────────────────
const RATE = 0.025
const FLAT = 0.50

function calcFee(d: number) {
  if (d <= 0) return { fee: 0, received: 0, pct: 0 }
  const fee = parseFloat((d * RATE + FLAT).toFixed(2))
  return { fee, received: parseFloat((d - fee).toFixed(2)), pct: parseFloat(((fee / d) * 100).toFixed(1)) }
}

function calcCampaign(goal: number, avg: number) {
  if (goal <= 0 || avg <= 0) return null
  const donations = Math.round(goal / avg)
  const totalFees = parseFloat((donations * (avg * RATE + FLAT)).toFixed(2))
  return { goal, avg, donations, totalFees, totalReceived: parseFloat((goal - totalFees).toFixed(2)), feeRate: parseFloat(((totalFees / goal) * 100).toFixed(1)) }
}

function fmt(n: number) { return n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const SCENARIOS = [
  { title: 'Medical emergency',  goal: 18000, avg: 200, color: '#E1F5EE', accent: '#0A6B4B', desc: 'Kidney surgery — 90 donors at ₵200 avg' },
  { title: 'University fees',    goal: 10500, avg: 100, color: '#E6F1FB', accent: '#185FA5', desc: 'First-year tuition — 105 donors at ₵100 avg' },
  { title: 'Community borehole', goal: 35000, avg: 150, color: '#FAEEDA', accent: '#B85C00', desc: 'Clean water project — 233 donors at ₵150 avg' },
]

const COMPETITORS = [
  { name: 'EveryGiving', platformFee: '₵0', txFee: '2.5% + ₵0.50', payoutFee: '₵0', momo: '✓', verified: '✓', milestones: '✓', highlight: true },
  { name: 'GoFundMe',    platformFee: '₵0*', txFee: '2.9% + $0.30', payoutFee: 'Varies', momo: '✕', verified: '✕', milestones: '✕', highlight: false },
  { name: 'M-Changa',   platformFee: '4–6%', txFee: 'Included',     payoutFee: 'Varies', momo: '✓', verified: 'Partial', milestones: '✕', highlight: false },
]

const FAQS = [
  { q: 'Why is there a ₵0.50 flat fee per donation?', a: 'The ₵0.50 flat fee covers the fixed cost of processing a MoMo transaction — a cost every payment processor charges regardless of amount. It ensures very small donations are still economically viable to process.' },
  { q: 'When exactly is the fee deducted?', a: "The fee is deducted automatically at the moment a donation is confirmed. You never receive a bill. What you see in your campaign balance is always the amount you'll receive." },
  { q: 'Is the fee the same for diaspora donations in GBP or USD?', a: 'Zeepay (our diaspora payment partner) applies their own FX conversion and small transfer fee on the sender\'s side. The 2.5% + ₵0.50 EveryGiving fee then applies to the converted GHS amount received.' },
  { q: "What if a donor wants to cover the fee for me?", a: "We're building a \"cover the fee\" toggle — where donors can optionally add the processing fee so you receive 100% of what they intended. Coming soon." },
  { q: 'Are there any other hidden fees?', a: 'No. No monthly subscription. No payout fee. No campaign creation fee. No fee for posting updates or photos. The only fee is 2.5% + ₵0.50 per donation received.' },
  { q: 'What happens to uncompleted donations?', a: 'If a MoMo prompt times out or is declined, no fee is charged — the transaction never completes so there is nothing to deduct.' },
]

function FaqItem({ q, a, isLast }: { q: string; a: string; isLast: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item" style={{ borderBottom: isLast ? 'none' : '1px solid #E8E4DC', padding: '18px 0', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', lineHeight: 1.5 }}>{q}</span>
        <span style={{ fontSize: 18, color: '#0A6B4B', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>▾</span>
      </div>
      {open && <p style={{ fontSize: 13, color: '#4A4A44', lineHeight: 1.75, marginTop: 10 }}>{a}</p>}
    </div>
  )
}

export default function FeesPage() {
  const [donation, setDonation] = useState('200')
  const [campaignGoal, setCampaignGoal] = useState('18000')
  const [avgDonation, setAvgDonation] = useState('200')

  const donationNum = parseFloat(donation) || 0
  const { fee, received, pct } = calcFee(donationNum)
  const campaignResult = calcCampaign(parseFloat(campaignGoal) || 0, parseFloat(avgDonation) || 50)
  const presets = [50, 100, 200, 500, 1000]

  return (
    <>
      <style>{BASE}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: 58, background: '#FFFFFF', borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 19, color: '#1A1A18', textDecoration: 'none' }}>
          Every<em style={{ color: '#0A6B4B', fontStyle: 'normal' }}>Giving</em>
        </Link>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {([['/', 'Home'], ['/campaigns', 'Browse'], ['/how-it-works', 'How it works'], ['/fees', 'Fees']] as [string, string][]).map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize: 13, fontWeight: href === '/fees' ? 600 : 500, color: href === '/fees' ? '#0A6B4B' : '#4A4A44', padding: '7px 11px', borderRadius: 6, textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/auth/login" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A18', padding: '7px 13px', border: '1px solid #E8E4DC', borderRadius: 8, textDecoration: 'none' }}>Sign in</Link>
          <Link href="/create" style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>Start a campaign</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: '#1A1A18', padding: '72px 32px 64px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(183,222,201,0.12)', border: '1px solid rgba(183,222,201,0.2)', borderRadius: 20, padding: '5px 14px', marginBottom: 24 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#B7DEC9' }}>Transparent fees</span>
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 48, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            One simple fee.<br /><em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>No surprises.</em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.5)', lineHeight: 1.75 }}>
            We deduct <strong style={{ color: '#fff' }}>2.5% + ₵0.50</strong> from each donation automatically — so you never receive a bill. Zero platform fee. Zero payout fee. Always.
          </p>
        </div>
      </div>

      {/* FEE SUMMARY BAND */}
      <div style={{ background: '#0A6B4B', padding: '0 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 32 }}>
          {[
            { n: '₵0',     label: 'Platform fee',  sub: 'We never take a % of your raised amount' },
            { n: '2.5%+₵0.50', label: 'Per donation', sub: 'The only fee — deducted when a donation is made' },
            { n: '₵0',     label: 'Payout fee',    sub: 'Milestone payouts go straight to your MoMo' },
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 36, color: '#fff', lineHeight: 1, marginBottom: 8 }}>{item.n}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#B7DEC9', marginBottom: 5 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SINGLE DONATION CALCULATOR */}
      <div style={{ padding: '72px 32px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 12 }}>Live calculator</div>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: '#1A1A18', marginBottom: 8 }}>Per-donation calculator</h2>
        <p style={{ fontSize: 14, color: '#4A4A44', marginBottom: 36, lineHeight: 1.7 }}>See exactly what the campaigner receives from any donation amount.</p>

        <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16, padding: 32 }}>
          {/* Input */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#4A4A44', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Donation amount (₵)</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E8E4DC', borderRadius: 10, overflow: 'hidden', flex: 1, minWidth: 200 }}>
                <span style={{ padding: '12px 14px', fontSize: 16, fontWeight: 700, color: '#0A6B4B', background: '#F5F8F6', borderRight: '1px solid #E8E4DC' }}>₵</span>
                <input type="number" value={donation} onChange={e => setDonation(e.target.value)} min="1"
                  style={{ flex: 1, padding: '12px 14px', fontSize: 18, fontWeight: 600, border: 'none', fontFamily: 'inherit', color: '#1A1A18', background: '#fff' }} />
              </div>
              {presets.map(p => (
                <button key={p} onClick={() => setDonation(String(p))}
                  style={{ fontSize: 13, fontWeight: 600, padding: '11px 16px', borderRadius: 8, border: parseFloat(donation) === p ? '1.5px solid #0A6B4B' : '1.5px solid #E8E4DC', background: parseFloat(donation) === p ? '#E8F5EF' : '#fff', color: parseFloat(donation) === p ? '#0A6B4B' : '#4A4A44', cursor: 'pointer', fontFamily: 'inherit' }}>
                  ₵{p}
                </button>
              ))}
            </div>
          </div>

          {donationNum > 0 && (
            <div>
              {/* Bar chart */}
              <div style={{ height: 16, borderRadius: 8, background: '#E8E4DC', overflow: 'hidden', marginBottom: 20, display: 'flex' }}>
                <div style={{ height: '100%', width: `${100 - pct}%`, background: '#0A6B4B', borderRadius: '8px 0 0 8px', transition: 'width 0.4s ease' }} />
                <div style={{ height: '100%', flex: 1, background: '#B85C00', borderRadius: '0 8px 8px 0', transition: 'width 0.4s ease' }} />
              </div>

              {/* Numbers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#E8F5EF', border: '1px solid #B7DEC9', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#0A6B4B', marginBottom: 4 }}>₵{fmt(received)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#0A6B4B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campaigner receives</div>
                </div>
                <div style={{ background: '#FEF3E2', border: '1px solid #F5C882', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#B85C00', marginBottom: 4 }}>₵{fmt(fee)}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#B85C00', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transaction fee</div>
                </div>
                <div style={{ background: '#FDFAF5', border: '1px solid #E8E4DC', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1A1A18', marginBottom: 4 }}>{pct}%</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#8A8A82', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee percentage</div>
                </div>
              </div>

              {/* Formula */}
              <div style={{ background: '#1A1A18', borderRadius: 10, padding: '14px 20px', fontFamily: 'monospace', fontSize: 13, color: '#B7DEC9' }}>
                ₵{fmt(donationNum)} × 2.5% + ₵0.50 = ₵{fmt(fee)} fee → ₵{fmt(received)} to campaigner
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CAMPAIGN CALCULATOR */}
      <div style={{ background: '#fff', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC', padding: '72px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 12 }}>Campaign planner</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: '#1A1A18', marginBottom: 8 }}>How much will you actually raise?</h2>
          <p style={{ fontSize: 14, color: '#4A4A44', marginBottom: 36, lineHeight: 1.7 }}>Set your goal and average donation to see the real numbers before you launch.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            {[
              { label: 'Campaign goal (₵)', value: campaignGoal, setter: setCampaignGoal, placeholder: '18000' },
              { label: 'Average donation (₵)', value: avgDonation, setter: setAvgDonation, placeholder: '200' },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#4A4A44', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>{label}</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #E8E4DC', borderRadius: 10, overflow: 'hidden' }}>
                  <span style={{ padding: '12px 14px', fontSize: 16, fontWeight: 700, color: '#0A6B4B', background: '#F5F8F6', borderRight: '1px solid #E8E4DC' }}>₵</span>
                  <input type="number" value={value} placeholder={placeholder} onChange={e => setter(e.target.value)} min="1"
                    style={{ flex: 1, padding: '12px 14px', fontSize: 16, fontWeight: 600, border: 'none', fontFamily: 'inherit', color: '#1A1A18', background: '#fff' }} />
                </div>
              </div>
            ))}
          </div>

          {campaignResult && (
            <div style={{ background: '#FDFAF5', border: '1px solid #E8E4DC', borderRadius: 14, padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                {[
                  { label: 'You\'ll receive', value: `₵${fmt(campaignResult.totalReceived)}`, accent: '#0A6B4B', bg: '#E8F5EF' },
                  { label: 'Total fees',     value: `₵${fmt(campaignResult.totalFees)}`,     accent: '#B85C00', bg: '#FEF3E2' },
                  { label: 'Est. donations', value: `${campaignResult.donations}`,            accent: '#185FA5', bg: '#E6F1FB' },
                  { label: 'Effective rate', value: `${campaignResult.feeRate}%`,             accent: '#534AB7', bg: '#EEEDFE' },
                ].map((item, i) => (
                  <div key={i} style={{ background: item.bg, borderRadius: 10, padding: '16px 18px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: item.accent, marginBottom: 4 }}>{item.value}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: item.accent + 'AA', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FEE BREAKDOWN TABLE */}
      <div style={{ padding: '72px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 12 }}>Complete breakdown</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: '#1A1A18', marginBottom: 36 }}>Every fee, listed</h2>
          <div style={{ background: '#fff', border: '1px solid #E8E4DC', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { item: 'Campaign creation',       our: '₵0',          note: 'Free to start — always' },
              { item: 'Identity verification',   our: '₵0',          note: 'Included — Ghana Card review by our team' },
              { item: 'MoMo transaction fee',    our: '2.5% + ₵0.50', note: 'Deducted per donation — the only charge' },
              { item: 'Platform / success fee',  our: '₵0',          note: 'We never take a % of total raised' },
              { item: 'MoMo milestone payout',   our: '₵0',          note: 'Free — direct to your wallet' },
              { item: 'Posting updates',         our: '₵0',          note: 'Free — post as many updates as you want' },
              { item: 'Diaspora donations (FX)', our: 'Zeepay rate',  note: 'Zeepay converts & sends — their FX applies' },
              { item: 'Monthly subscription',    our: '₵0',          note: 'Never — no subscription model' },
            ].map((row, i, arr) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', alignItems: 'center', padding: '16px 24px', borderBottom: i < arr.length - 1 ? '1px solid #E8E4DC' : 'none', background: i % 2 === 0 ? '#fff' : '#FDFAF5' }}>
                <div style={{ fontSize: 14, color: '#1A1A18', fontWeight: 500 }}>{row.item}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: row.our === '₵0' ? '#0A6B4B' : '#1A1A18', textAlign: 'center' }}>{row.our}</div>
                <div style={{ fontSize: 12, color: '#8A8A82', textAlign: 'right' }}>{row.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* COMPARISON */}
      <div style={{ background: '#1A1A18', padding: '72px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#B7DEC9', marginBottom: 12 }}>How we compare</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: '#fff', marginBottom: 36 }}>EveryGiving vs alternatives</h2>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 1fr', background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px' }}>
              {['Platform', 'Platform fee', 'Tx fee', 'Payout fee', 'MoMo', 'Verified', 'Milestones'].map(h => (
                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {COMPETITORS.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr 1fr', padding: '14px 20px', borderBottom: i < COMPETITORS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', background: c.highlight ? 'rgba(10,107,75,0.08)' : 'transparent' }}>
                <div style={{ fontSize: 14, fontWeight: c.highlight ? 700 : 500, color: c.highlight ? '#B7DEC9' : 'rgba(255,255,255,.55)' }}>{c.name}</div>
                {[c.platformFee, c.txFee, c.payoutFee].map((v, j) => (
                  <div key={j} style={{ fontSize: 13, color: c.highlight ? '#fff' : 'rgba(255,255,255,.45)' }}>{v}</div>
                ))}
                {[c.momo, c.verified, c.milestones].map((v, j) => (
                  <div key={j} style={{ fontSize: 13, color: v === '✓' ? '#B7DEC9' : v === '✕' ? '#C0392B' : 'rgba(255,255,255,.4)' }}>{v}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SCENARIOS */}
      <div style={{ padding: '72px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 12 }}>Real examples</div>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: '#1A1A18', marginBottom: 36 }}>What the numbers look like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {SCENARIOS.map((sc, i) => {
              const res = calcCampaign(sc.goal, sc.avg)
              if (!res) return null
              return (
                <div key={i} className="scenario-card" style={{ background: sc.color, border: `1px solid ${sc.accent}22`, borderRadius: 14, padding: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: sc.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>{sc.title}</div>
                  <div style={{ fontSize: 12, color: sc.accent + 'AA', marginBottom: 20, lineHeight: 1.6 }}>{sc.desc}</div>
                  <div style={{ borderTop: `1px solid ${sc.accent}22`, paddingTop: 16 }}>
                    {[
                      ['Goal',          `₵${res.goal.toLocaleString()}`],
                      ['You receive',   `₵${fmt(res.totalReceived)}`],
                      ['Total fees',    `₵${fmt(res.totalFees)}`],
                      ['Effective rate', `${res.feeRate}%`],
                    ].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, color: sc.accent + '99' }}>{l}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: sc.accent }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ background: '#fff', borderTop: '1px solid #E8E4DC', padding: '72px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 12 }}>FAQ</div>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 32, color: '#1A1A18', marginBottom: 16 }}>Fee questions answered</h2>
            <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.75 }}>
              If you have a question not covered here, email us at{' '}
              <a href="mailto:support@everygiving.org" style={{ color: '#0A6B4B', fontWeight: 600 }}>support@everygiving.org</a>
            </p>
            <div style={{ marginTop: 32, background: '#E8F5EF', border: '1px solid #B7DEC9', borderRadius: 12, padding: '20px 22px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0A6B4B', marginBottom: 6 }}>The bottom line</div>
              <div style={{ fontSize: 13, color: '#2D7A5B', lineHeight: 1.7 }}>
                2.5% + ₵0.50 per donation. That's it. No platform fee. No payout fee. No surprises.
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #E8E4DC' }}>
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} isLast={i === FAQS.length - 1} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#0A6B4B', padding: '72px 32px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 38, color: '#fff', lineHeight: 1.2, marginBottom: 14 }}>
          Free to start.<br />You only contribute when donations come in.
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', marginBottom: 32 }}>Create your campaign · Verify in 24hrs · Raise with confidence</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <Link href="/create" style={{ fontSize: 14, fontWeight: 700, color: '#0A6B4B', background: '#fff', padding: '14px 28px', borderRadius: 10, textDecoration: 'none' }}>
            Start a campaign →
          </Link>
          <Link href="/campaigns" style={{ fontSize: 14, fontWeight: 600, color: '#fff', padding: '14px 28px', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: 10, textDecoration: 'none' }}>
            Browse campaigns
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#111110', padding: '40px 32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 19, color: '#fff' }}>
            Every<em style={{ color: '#B7DEC9', fontStyle: 'normal' }}>Giving</em>
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.2)' }}>© {new Date().getFullYear()} EveryGiving Ltd</span>
          <div style={{ display: 'flex', gap: 20 }}>
            {['/privacy', '/terms', '/contact'].map(href => (
              <Link key={href} href={href} style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>{href.slice(1).charAt(0).toUpperCase() + href.slice(2)}</Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
