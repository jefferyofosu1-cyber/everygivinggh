/**
 * EveryGiving — Fees Page with Interactive Calculator
 * Route: /fees
 *
 * Sections:
 * 1. Hero — headline and trust signal
 * 2. Interactive fee calculator — live math as you type
 * 3. Fee breakdown table — transparent line items
 * 4. Comparison table — EveryGiving vs competitors
 * 5. Example scenarios — real campaign examples
 * 6. FAQ accordion — fee-specific questions
 * 7. CTA band
 *
 * Fee formula:
 *   Per donation: 2% of donation + ₵0.25 flat fee
 *   Platform fee: ₵0 always
 *   Payout fee: ₵0 always
 *
 * Usage:
 *   // app/fees/page.js
 *   import Fees from '@/components/Fees';
 *   export default function Page() { return <Fees />; }
 */

'use client';

import { useState, useCallback } from 'react';

// ─── FEE LOGIC ────────────────────────────────────────────────────────────────

const TRANSACTION_RATE = 0.02;     // 2%
const TRANSACTION_FLAT = 0.25;     // ₵0.25

function calcFees(donationGHS) {
  const d = parseFloat(donationGHS) || 0;
  if (d <= 0) return { donation: 0, fee: 0, received: 0, feeRate: 0 };
  const fee = parseFloat((d * TRANSACTION_RATE + TRANSACTION_FLAT).toFixed(2));
  const received = parseFloat((d - fee).toFixed(2));
  const feeRate = parseFloat(((fee / d) * 100).toFixed(1));
  return { donation: d, fee, received, feeRate };
}

function calcCampaign(goalGHS, avgDonationGHS) {
  const goal = parseFloat(goalGHS) || 0;
  const avg = parseFloat(avgDonationGHS) || 50;
  if (goal <= 0) return null;
  const donations = Math.round(goal / avg);
  const totalFees = parseFloat((donations * (avg * TRANSACTION_RATE + TRANSACTION_FLAT)).toFixed(2));
  const totalReceived = parseFloat((goal - totalFees).toFixed(2));
  const feeRate = parseFloat(((totalFees / goal) * 100).toFixed(1));
  return { goal, avg, donations, totalFees, totalReceived, feeRate };
}

function fmt(n) {
  return n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── EXAMPLE SCENARIOS ───────────────────────────────────────────────────────

const SCENARIOS = [
  {
    title: 'Medical emergency',
    goal: 18000,
    avg: 200,
    category: 'Medical',
    color: '#E1F5EE',
    accent: '#0A6B4B',
    desc: 'Typical kidney surgery campaign — 90 donors at ₵200 average',
  },
  {
    title: 'University fees',
    goal: 10500,
    avg: 100,
    category: 'Education',
    color: '#E6F1FB',
    accent: '#185FA5',
    desc: 'First-year tuition — 105 donors at ₵100 average',
  },
  {
    title: 'Community borehole',
    goal: 35000,
    avg: 150,
    category: 'Community',
    color: '#FAEEDA',
    accent: '#B85C00',
    desc: 'Clean water project — 233 donors at ₵150 average',
  },
];

const COMPETITORS = [
  { name: 'EveryGiving', platformFee: '₵0', txFee: '2% + ₵0.25', payoutFee: '₵0', momo: '✓', verified: '✓', milestones: '✓', highlight: true },
  { name: 'GoFundMe', platformFee: '₵0*', txFee: '2.9% + $0.30', payoutFee: 'Varies', momo: '✕', verified: '✕', milestones: '✕', highlight: false },
  { name: 'M-Changa', platformFee: '4–6%', txFee: 'Included', payoutFee: 'Varies', momo: '✓', verified: 'Partial', milestones: '✕', highlight: false },
];

const FEE_FAQS = [
  { q: 'Why is there a ₵0.25 flat fee per donation?', a: 'The ₵0.25 flat fee covers the fixed cost of processing a MoMo transaction — a cost every payment processor charges regardless of amount. It ensures very small donations (e.g. ₵5) are still economically viable to process.' },
  { q: 'When exactly is the fee deducted?', a: 'The fee is deducted automatically at the moment a donation is confirmed — before it reaches your campaign balance. You never receive a bill. What you see in your campaign balance is always the amount you\'ll receive.' },
  { q: 'Is the fee the same for diaspora donations in GBP or USD?', a: 'Zeepay (our diaspora payment partner) applies their own FX conversion and small transfer fee on the sender\'s side. The 2% + ₵0.25 EveryGiving fee then applies to the converted GHS amount received.' },
  { q: 'What if a donor wants to cover the fee for me?', a: 'We\'re building a "cover the fee" toggle — where donors can optionally add the processing fee to their donation so you receive 100% of what they intended. This feature is coming soon.' },
  { q: 'Are there any other hidden fees?', a: 'No. No monthly subscription. No payout fee. No campaign creation fee. No fee for posting updates or photos. The only fee that ever applies is 2% + ₵0.25 per donation received.' },
  { q: 'What happens to uncompleted donations?', a: 'If a MoMo prompt times out or is declined, no fee is charged — the transaction never completes so there is nothing to deduct from.' },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function FaqItem({ faq, isLast }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ ...sty.faqItem, borderBottom: isLast ? 'none' : '1px solid #E8E4DC' }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={sty.faqQ}>
        <span style={sty.faqQText}>{faq.q}</span>
        <span style={{ ...sty.faqChev, transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </div>
      {open && <p style={sty.faqA}>{faq.a}</p>}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function Fees() {
  // Single donation calculator
  const [donationAmt, setDonationAmt] = useState('200');
  const singleResult = calcFees(donationAmt);

  // Campaign calculator
  const [campaignGoal, setCampaignGoal] = useState('18000');
  const [avgDonation, setAvgDonation] = useState('200');
  const campaignResult = calcCampaign(campaignGoal, avgDonation);

  const presets = [50, 100, 200, 500, 1000];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        input:focus{outline:none;border-color:#0A6B4B !important}
        .preset-btn:hover{background:#E8F5EF !important;border-color:#0A6B4B !important;color:#0A6B4B !important}
        .preset-btn.active{background:#0A6B4B !important;color:#fff !important;border-color:#0A6B4B !important}
        .comp-row:hover td{background:#FDFAF5}
        @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .calc-result{animation:fadeup .2s ease both}
        .scenario-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.08)}
      `}</style>

      {/* NAV */}
      <nav style={sty.nav}>
        <a href="/" style={sty.navLogo}>Every<span style={{ color: '#0A6B4B' }}>Giving</span></a>
        <div style={sty.navR}>
          <a href="/campaigns" style={sty.navLink}>Browse</a>
          <a href="/how-it-works" style={sty.navLink}>How it works</a>
          <a href="/fees" style={{ ...sty.navLink, color: '#0A6B4B', fontWeight: 600 }}>Fees</a>
          <div style={sty.navDiv} />
          <a href="/auth/login" style={sty.navSignin}>Sign in</a>
          <a href="/create" style={sty.navCta}>Start a campaign</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={sty.hero}>
        <div style={sty.heroInner}>
          <div style={sty.eyebrow}>Transparent pricing</div>
          <h1 style={sty.heroTitle}>
            Simple, honest fees.<br />
            <em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>No surprises. Ever.</em>
          </h1>
          <p style={sty.heroSub}>
            One fee. Automatically deducted per donation. No platform fee.
            No monthly bills. No payout fees. Nothing hidden — ever.
          </p>
          <div style={sty.heroFeeDisplay}>
            <div style={sty.heroFeeItem}>
              <div style={sty.heroFeeN}>₵0</div>
              <div style={sty.heroFeeL}>Platform fee</div>
            </div>
            <div style={sty.heroFeePlus}>+</div>
            <div style={sty.heroFeeItem}>
              <div style={sty.heroFeeN}>2%</div>
              <div style={sty.heroFeeL}>of each donation</div>
            </div>
            <div style={sty.heroFeePlus}>+</div>
            <div style={sty.heroFeeItem}>
              <div style={sty.heroFeeN}>₵0.25</div>
              <div style={sty.heroFeeL}>flat per donation</div>
            </div>
            <div style={sty.heroFeePlus}>=</div>
            <div style={{ ...sty.heroFeeItem, background: 'rgba(183,222,201,.15)', borderRadius: 12, padding: '12px 20px' }}>
              <div style={{ ...sty.heroFeeN, color: '#B7DEC9' }}>That's it</div>
              <div style={sty.heroFeeL}>Nothing else</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE CALCULATOR ── */}
      <div style={{ padding: '0 32px' }}>
        <div style={sty.sectionInner}>
          <div style={{ padding: '72px 0' }}>
            <div style={sty.sectionEyebrow}>Fee calculator</div>
            <h2 style={sty.sectionTitle}>Calculate exactly what you'll receive</h2>
            <p style={sty.sectionSub}>
              Enter a donation amount or your campaign goal and see the exact fee
              breakdown — no estimates, no guesswork.
            </p>

            <div style={sty.calcGrid}>

              {/* ── SINGLE DONATION CALC ── */}
              <div style={sty.calcCard}>
                <div style={sty.calcCardTitle}>Single donation</div>
                <div style={sty.calcCardSub}>How much reaches you from one donation?</div>

                <div style={sty.presetRow}>
                  {presets.map(p => (
                    <button
                      key={p}
                      className={`preset-btn${donationAmt === String(p) ? ' active' : ''}`}
                      style={sty.presetBtn}
                      onClick={() => setDonationAmt(String(p))}
                    >
                      ₵{p}
                    </button>
                  ))}
                </div>

                <div style={sty.inputWrap}>
                  <span style={sty.inputPrefix}>₵</span>
                  <input
                    type="number"
                    value={donationAmt}
                    onChange={e => setDonationAmt(e.target.value)}
                    placeholder="Enter donation amount"
                    style={sty.input}
                    min="1"
                  />
                </div>

                {singleResult.donation > 0 && (
                  <div className="calc-result" key={donationAmt}>
                    <div style={sty.resultRows}>
                      <div style={sty.resultRow}>
                        <span style={sty.resultLabel}>Donor gives</span>
                        <span style={sty.resultVal}>₵{fmt(singleResult.donation)}</span>
                      </div>
                      <div style={{ ...sty.resultRow, borderTop: '1px solid #E8E4DC', paddingTop: 10 }}>
                        <span style={sty.resultLabel}>Processing fee (2%)</span>
                        <span style={{ ...sty.resultVal, color: '#C0392B' }}>− ₵{fmt(singleResult.donation * TRANSACTION_RATE)}</span>
                      </div>
                      <div style={sty.resultRow}>
                        <span style={sty.resultLabel}>Flat fee</span>
                        <span style={{ ...sty.resultVal, color: '#C0392B' }}>− ₵{fmt(TRANSACTION_FLAT)}</span>
                      </div>
                      <div style={sty.resultRow}>
                        <span style={sty.resultLabel}>Total fee</span>
                        <span style={{ ...sty.resultVal, color: '#C0392B' }}>− ₵{fmt(singleResult.fee)}</span>
                      </div>
                      <div style={{ ...sty.resultRow, borderTop: '2px solid #E8E4DC', paddingTop: 12, marginTop: 4 }}>
                        <span style={{ ...sty.resultLabel, fontWeight: 600, color: '#1A1A18', fontSize: 15 }}>You receive</span>
                        <span style={{ ...sty.resultVal, fontWeight: 700, color: '#0A6B4B', fontSize: 20 }}>₵{fmt(singleResult.received)}</span>
                      </div>
                    </div>

                    {/* Visual breakdown bar */}
                    <div style={sty.barWrap}>
                      <div style={{ ...sty.barReceived, width: `${100 - singleResult.feeRate}%` }}>
                        <span style={sty.barLabel}>{(100 - singleResult.feeRate).toFixed(1)}% received</span>
                      </div>
                      <div style={{ ...sty.barFee, width: `${singleResult.feeRate}%` }}>
                        <span style={sty.barFeeLabel}>{singleResult.feeRate}%</span>
                      </div>
                    </div>
                    <div style={sty.barLegend}>
                      <span style={sty.legendGreen}>■ You receive</span>
                      <span style={sty.legendRed}>■ Processing fee</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── CAMPAIGN CALC ── */}
              <div style={sty.calcCard}>
                <div style={sty.calcCardTitle}>Full campaign</div>
                <div style={sty.calcCardSub}>How much reaches you across your entire campaign?</div>

                <label style={sty.fieldLabel}>Campaign goal (GHS)</label>
                <div style={{ ...sty.inputWrap, marginBottom: 16 }}>
                  <span style={sty.inputPrefix}>₵</span>
                  <input
                    type="number"
                    value={campaignGoal}
                    onChange={e => setCampaignGoal(e.target.value)}
                    placeholder="e.g. 18000"
                    style={sty.input}
                    min="1"
                  />
                </div>

                <label style={sty.fieldLabel}>Average donation size (GHS)</label>
                <div style={sty.inputWrap}>
                  <span style={sty.inputPrefix}>₵</span>
                  <input
                    type="number"
                    value={avgDonation}
                    onChange={e => setAvgDonation(e.target.value)}
                    placeholder="e.g. 200"
                    style={sty.input}
                    min="1"
                  />
                </div>

                {campaignResult && (
                  <div className="calc-result" key={`${campaignGoal}-${avgDonation}`}>
                    <div style={sty.resultRows}>
                      <div style={sty.resultRow}>
                        <span style={sty.resultLabel}>Campaign goal</span>
                        <span style={sty.resultVal}>₵{fmt(campaignResult.goal)}</span>
                      </div>
                      <div style={sty.resultRow}>
                        <span style={sty.resultLabel}>Estimated donations</span>
                        <span style={sty.resultVal}>~{campaignResult.donations} donors</span>
                      </div>
                      <div style={{ ...sty.resultRow, borderTop: '1px solid #E8E4DC', paddingTop: 10 }}>
                        <span style={sty.resultLabel}>Total processing fees</span>
                        <span style={{ ...sty.resultVal, color: '#C0392B' }}>− ₵{fmt(campaignResult.totalFees)}</span>
                      </div>
                      <div style={{ ...sty.resultRow, borderTop: '2px solid #E8E4DC', paddingTop: 12, marginTop: 4 }}>
                        <span style={{ ...sty.resultLabel, fontWeight: 600, color: '#1A1A18', fontSize: 15 }}>You receive</span>
                        <span style={{ ...sty.resultVal, fontWeight: 700, color: '#0A6B4B', fontSize: 20 }}>₵{fmt(campaignResult.totalReceived)}</span>
                      </div>
                    </div>

                    <div style={sty.barWrap}>
                      <div style={{ ...sty.barReceived, width: `${100 - campaignResult.feeRate}%` }}>
                        <span style={sty.barLabel}>{(100 - campaignResult.feeRate).toFixed(1)}% received</span>
                      </div>
                      <div style={{ ...sty.barFee, width: `${campaignResult.feeRate}%` }}>
                        <span style={sty.barFeeLabel}>{campaignResult.feeRate}%</span>
                      </div>
                    </div>
                    <div style={sty.barLegend}>
                      <span style={sty.legendGreen}>■ You receive</span>
                      <span style={sty.legendRed}>■ Processing fees</span>
                    </div>

                    <div style={sty.calcNote}>
                      Based on ₵{avgDonation} average donation. Actual fees depend on each donation amount.
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── FEE BREAKDOWN TABLE ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC', padding: '0 32px' }}>
        <div style={{ ...sty.sectionInner, padding: '72px 0' }}>
          <div style={sty.sectionEyebrow}>Full breakdown</div>
          <h2 style={sty.sectionTitle}>Every fee. Documented.</h2>
          <p style={sty.sectionSub}>
            We publish every fee publicly. There are no fees that aren't on this page.
          </p>
          <table style={sty.feeTable}>
            <thead>
              <tr>
                <th style={sty.th}>Fee type</th>
                <th style={sty.th}>Amount</th>
                <th style={sty.th}>When charged</th>
                <th style={sty.th}>Who pays</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Platform fee', amount: '₵0.00', when: 'Never', who: 'Nobody', green: false },
                { type: 'Campaign creation', amount: '₵0.00', when: 'Never', who: 'Nobody', green: false },
                { type: 'Processing fee', amount: '2% of donation', when: 'Per donation received', who: 'Deducted from donation', green: false },
                { type: 'Flat processing fee', amount: '₵0.25', when: 'Per donation received', who: 'Deducted from donation', green: false },
                { type: 'MoMo payout fee', amount: '₵0.00', when: 'Never', who: 'Nobody', green: false },
                { type: 'Monthly subscription', amount: '₵0.00', when: 'Never', who: 'Nobody', green: false },
                { type: 'Photo / video upload', amount: '₵0.00', when: 'Never', who: 'Nobody', green: false },
                { type: 'Campaign update fee', amount: '₵0.00', when: 'Never', who: 'Nobody', green: false },
              ].map((row, i) => (
                <tr key={i} className="comp-row" style={{ background: i % 2 === 0 ? '#FDFAF5' : '#fff' }}>
                  <td style={sty.td}>{row.type}</td>
                  <td style={{ ...sty.td, fontWeight: 600, color: row.amount === '₵0.00' ? '#0A6B4B' : '#1A1A18' }}>{row.amount}</td>
                  <td style={{ ...sty.td, color: '#8A8A82' }}>{row.when}</td>
                  <td style={{ ...sty.td, color: '#8A8A82' }}>{row.who}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── COMPARISON TABLE ── */}
      <div style={{ padding: '0 32px' }}>
        <div style={{ ...sty.sectionInner, padding: '72px 0' }}>
          <div style={sty.sectionEyebrow}>How we compare</div>
          <h2 style={sty.sectionTitle}>EveryGiving vs other platforms</h2>
          <p style={sty.sectionSub}>
            Not all crowdfunding platforms are built the same — especially for Ghana.
          </p>
          <table style={sty.compTable}>
            <thead>
              <tr>
                <th style={sty.compTh}>Platform</th>
                <th style={sty.compTh}>Platform fee</th>
                <th style={sty.compTh}>Transaction fee</th>
                <th style={sty.compTh}>Payout fee</th>
                <th style={sty.compTh}>MoMo support</th>
                <th style={sty.compTh}>ID verified</th>
                <th style={sty.compTh}>Milestones</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITORS.map((c, i) => (
                <tr key={i} style={{ background: c.highlight ? '#E8F5EF' : i % 2 === 0 ? '#FDFAF5' : '#fff' }}>
                  <td style={{ ...sty.compTd, fontWeight: 700, color: c.highlight ? '#0A6B4B' : '#1A1A18' }}>
                    {c.name} {c.highlight && <span style={{ fontSize: 10, background: '#0A6B4B', color: '#fff', padding: '2px 6px', borderRadius: 10, marginLeft: 4 }}>You are here</span>}
                  </td>
                  <td style={{ ...sty.compTd, color: c.platformFee === '₵0' ? '#0A6B4B' : '#1A1A18', fontWeight: c.platformFee === '₵0' ? 600 : 400 }}>{c.platformFee}</td>
                  <td style={sty.compTd}>{c.txFee}</td>
                  <td style={{ ...sty.compTd, color: c.payoutFee === '₵0' ? '#0A6B4B' : '#1A1A18', fontWeight: c.payoutFee === '₵0' ? 600 : 400 }}>{c.payoutFee}</td>
                  <td style={{ ...sty.compTd, color: c.momo === '✓' ? '#0A6B4B' : '#C0392B', fontWeight: 600 }}>{c.momo}</td>
                  <td style={{ ...sty.compTd, color: c.verified === '✓' ? '#0A6B4B' : c.verified === 'Partial' ? '#B85C00' : '#C0392B', fontWeight: 600 }}>{c.verified}</td>
                  <td style={{ ...sty.compTd, color: c.milestones === '✓' ? '#0A6B4B' : '#C0392B', fontWeight: 600 }}>{c.milestones}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 11, color: '#8A8A82', marginTop: 10 }}>
            * GoFundMe does not charge a platform fee in some markets but charges a higher transaction fee and does not support MoMo or Ghana Card verification.
          </p>
        </div>
      </div>

      {/* ── SCENARIOS ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC', padding: '0 32px' }}>
        <div style={{ ...sty.sectionInner, padding: '72px 0' }}>
          <div style={sty.sectionEyebrow}>Real examples</div>
          <h2 style={sty.sectionTitle}>What it looks like in practice</h2>
          <p style={sty.sectionSub}>Three real campaign types, with the exact fee numbers.</p>
          <div style={sty.scenarioGrid}>
            {SCENARIOS.map((sc, i) => {
              const result = calcCampaign(sc.goal, sc.avg);
              return (
                <div key={i} className="scenario-card" style={{ ...sty.scenarioCard, background: sc.color, transition: 'all .2s' }}>
                  <div style={{ ...sty.scCategory, color: sc.accent }}>{sc.category}</div>
                  <div style={{ ...sty.scTitle, color: sc.accent }}>{sc.title}</div>
                  <div style={{ ...sty.scDesc, color: sc.accent + '99' }}>{sc.desc}</div>
                  <div style={sty.scDivider} />
                  <div style={sty.scRow}>
                    <span style={{ ...sty.scLabel, color: sc.accent + 'BB' }}>Goal</span>
                    <span style={{ ...sty.scVal, color: sc.accent }}>₵{fmt(sc.goal)}</span>
                  </div>
                  <div style={sty.scRow}>
                    <span style={{ ...sty.scLabel, color: sc.accent + 'BB' }}>Total fees</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#C0392B' }}>₵{result && fmt(result.totalFees)}</span>
                  </div>
                  <div style={{ ...sty.scRow, marginTop: 4, paddingTop: 10, borderTop: `1px solid ${sc.accent}22` }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: sc.accent }}>You receive</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: sc.accent }}>₵{result && fmt(result.totalReceived)}</span>
                  </div>
                  <div style={{ ...sty.scBar, marginTop: 12 }}>
                    <div style={{ height: '100%', width: `${result ? 100 - result.feeRate : 100}%`, background: sc.accent, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color: sc.accent + 'AA', marginTop: 4 }}>
                    {result && (100 - result.feeRate).toFixed(1)}% reaches you
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ padding: '0 32px' }}>
        <div style={{ ...sty.sectionInner, padding: '72px 0' }}>
          <div style={sty.sectionEyebrow}>Fee questions</div>
          <h2 style={sty.sectionTitle}>Common questions about fees</h2>
          <div style={sty.faqGrid}>
            <div style={sty.faqList}>
              {FEE_FAQS.map((faq, i) => (
                <FaqItem key={i} faq={faq} isLast={i === FEE_FAQS.length - 1} />
              ))}
            </div>
            <div>
              <div style={sty.faqSide}>
                <div style={sty.faqSideTitle}>Still unsure?</div>
                <p style={sty.faqSideDesc}>Our team is happy to walk you through the exact fees for your campaign before you start.</p>
                <a href="mailto:support@everygiving.org" style={sty.faqSideBtn}>Contact us →</a>
              </div>
              <div style={{ ...sty.faqSide, marginTop: 12, background: '#0A6B4B', border: 'none' }}>
                <div style={{ ...sty.faqSideTitle, color: '#fff' }}>Ready to start?</div>
                <p style={{ ...sty.faqSideDesc, color: 'rgba(255,255,255,.6)' }}>Create your campaign free. No upfront cost. No monthly charges.</p>
                <a href="/create" style={{ ...sty.faqSideBtn, background: '#fff', color: '#0A6B4B' }}>Start a campaign →</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={sty.ctaBand}>
        <h2 style={sty.ctaTitle}>No surprises. Just results.</h2>
        <p style={sty.ctaSub}>Free to create. Identity verified. Milestone-protected. Zero platform fee — always.</p>
        <div style={sty.ctaActions}>
          <a href="/create" style={sty.ctaBtnP}>Start a campaign — free</a>
          <a href="/campaigns" style={sty.ctaBtnS}>Browse campaigns</a>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={sty.footer}>
        <div style={sty.footerInner}>
          <span style={sty.footerLogo}>Every<span style={{ color: '#B7DEC9' }}>Giving</span></span>
          <span style={sty.footerCopy}>© 2026 EveryGiving · Built in Ghana 🇬🇭 · ₵0 platform fee</span>
          <div style={sty.footerLinks}>
            {['Terms', 'Privacy', 'Contact'].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} style={sty.footerLink}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const sty = {
  nav: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:60, background:'#fff', borderBottom:'1px solid #E8E4DC', position:'sticky', top:0, zIndex:200, fontFamily:"'DM Sans',sans-serif" },
  navLogo: { fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18' },
  navR: { display:'flex', gap:4, alignItems:'center' },
  navLink: { fontSize:13, color:'#8A8A82', padding:'6px 12px', borderRadius:6 },
  navDiv: { width:1, height:16, background:'#E8E4DC', margin:'0 6px' },
  navSignin: { fontSize:13, fontWeight:500, color:'#1A1A18', padding:'7px 14px', border:'1px solid #E8E4DC', borderRadius:8 },
  navCta: { fontSize:13, fontWeight:600, color:'#fff', background:'#0A6B4B', padding:'8px 18px', borderRadius:8, marginLeft:6 },

  hero: { background:'#1A1A18', padding:'0 32px' },
  heroInner: { maxWidth:1100, margin:'0 auto', padding:'72px 0', textAlign:'center' },
  eyebrow: { fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'#B7DEC9', marginBottom:12 },
  heroTitle: { fontFamily:"'DM Serif Display',serif", fontSize:44, lineHeight:1.1, color:'#fff', marginBottom:16 },
  heroSub: { fontSize:15, color:'rgba(255,255,255,.5)', lineHeight:1.75, maxWidth:520, margin:'0 auto 40px' },
  heroFeeDisplay: { display:'flex', alignItems:'center', justifyContent:'center', gap:16, flexWrap:'wrap' },
  heroFeeItem: { textAlign:'center', padding:'12px 16px' },
  heroFeeN: { fontFamily:"'DM Serif Display',serif", fontSize:32, color:'#fff', lineHeight:1, marginBottom:6 },
  heroFeeL: { fontSize:12, color:'rgba(255,255,255,.45)' },
  heroFeePlus: { fontSize:24, color:'rgba(255,255,255,.2)', fontWeight:300 },

  sectionInner: { maxWidth:1100, margin:'0 auto' },
  sectionEyebrow: { fontSize:11, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:10 },
  sectionTitle: { fontFamily:"'DM Serif Display',serif", fontSize:34, color:'#1A1A18', marginBottom:12, lineHeight:1.2 },
  sectionSub: { fontSize:15, color:'#8A8A82', lineHeight:1.75, maxWidth:560, marginBottom:48 },

  calcGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 },
  calcCard: { background:'#fff', border:'1px solid #E8E4DC', borderRadius:16, padding:'28px 24px' },
  calcCardTitle: { fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#1A1A18', marginBottom:4 },
  calcCardSub: { fontSize:13, color:'#8A8A82', marginBottom:20, lineHeight:1.5 },
  presetRow: { display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' },
  presetBtn: { fontSize:13, fontWeight:500, padding:'7px 14px', border:'1px solid #E8E4DC', borderRadius:8, background:'#fff', color:'#4A4A44', cursor:'pointer', transition:'all .15s', fontFamily:"'DM Sans',sans-serif" },
  inputWrap: { position:'relative', marginBottom:20 },
  inputPrefix: { position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15, fontWeight:500, color:'#8A8A82' },
  input: { width:'100%', padding:'12px 12px 12px 26px', border:'1.5px solid #E8E4DC', borderRadius:10, fontSize:16, fontWeight:500, color:'#1A1A18', fontFamily:"'DM Sans',sans-serif", background:'#fff' },
  fieldLabel: { display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:6 },
  resultRows: { background:'#FDFAF5', borderRadius:10, padding:'16px', marginBottom:14 },
  resultRow: { display:'flex', justifyContent:'space-between', alignItems:'baseline', paddingBottom:8, marginBottom:8 },
  resultLabel: { fontSize:13, color:'#8A8A82' },
  resultVal: { fontSize:14, fontWeight:600, color:'#1A1A18' },
  barWrap: { height:28, display:'flex', borderRadius:6, overflow:'hidden', marginBottom:6 },
  barReceived: { background:'#0A6B4B', display:'flex', alignItems:'center', justifyContent:'flex-start', paddingLeft:10, transition:'width .4s ease' },
  barLabel: { fontSize:11, fontWeight:600, color:'#fff', whiteSpace:'nowrap' },
  barFee: { background:'#E8E4DC', display:'flex', alignItems:'center', justifyContent:'center', transition:'width .4s ease' },
  barFeeLabel: { fontSize:10, fontWeight:600, color:'#8A8A82', whiteSpace:'nowrap' },
  barLegend: { display:'flex', gap:14, fontSize:11 },
  legendGreen: { color:'#0A6B4B', fontWeight:600 },
  legendRed: { color:'#8A8A82', fontWeight:600 },
  calcNote: { fontSize:11, color:'#8A8A82', marginTop:10, lineHeight:1.5 },

  feeTable: { width:'100%', borderCollapse:'collapse', borderRadius:12, overflow:'hidden', border:'1px solid #E8E4DC', fontSize:13 },
  th: { background:'#1A1A18', color:'#fff', padding:'12px 16px', textAlign:'left', fontWeight:600, fontSize:12 },
  td: { padding:'12px 16px', color:'#1A1A18', borderBottom:'1px solid #E8E4DC' },

  compTable: { width:'100%', borderCollapse:'collapse', border:'1px solid #E8E4DC', borderRadius:12, overflow:'hidden', fontSize:13 },
  compTh: { background:'#1A1A18', color:'rgba(255,255,255,.7)', padding:'10px 14px', textAlign:'left', fontWeight:600, fontSize:11 },
  compTd: { padding:'11px 14px', color:'#1A1A18', fontSize:13 },

  scenarioGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 },
  scenarioCard: { borderRadius:16, padding:'24px 20px' },
  scCategory: { fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', marginBottom:6 },
  scTitle: { fontFamily:"'DM Serif Display',serif", fontSize:18, lineHeight:1.3, marginBottom:6 },
  scDesc: { fontSize:12, lineHeight:1.6, marginBottom:16 },
  scDivider: { height:1, background:'rgba(0,0,0,.08)', marginBottom:12 },
  scRow: { display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6 },
  scLabel: { fontSize:12 },
  scVal: { fontSize:14, fontWeight:600 },
  scBar: { height:6, background:'rgba(0,0,0,.08)', borderRadius:3, overflow:'hidden' },

  faqGrid: { display:'grid', gridTemplateColumns:'1fr 260px', gap:36, alignItems:'start' },
  faqList: { background:'#fff', border:'1px solid #E8E4DC', borderRadius:14, overflow:'hidden' },
  faqItem: { padding:'15px 18px', cursor:'pointer', transition:'background .15s' },
  faqQ: { display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 },
  faqQText: { fontSize:13, fontWeight:500, color:'#1A1A18', lineHeight:1.4 },
  faqChev: { fontSize:14, color:'#8A8A82', flexShrink:0, display:'inline-block', transition:'transform .2s' },
  faqA: { fontSize:12, color:'#4A4A44', lineHeight:1.75, marginTop:8, paddingRight:20 },
  faqSide: { background:'#FDFAF5', border:'1px solid #E8E4DC', borderRadius:12, padding:'18px' },
  faqSideTitle: { fontSize:14, fontWeight:600, color:'#1A1A18', marginBottom:5 },
  faqSideDesc: { fontSize:12, color:'#8A8A82', marginBottom:12, lineHeight:1.6 },
  faqSideBtn: { display:'block', fontSize:12, fontWeight:600, color:'#0A6B4B', background:'#E8F5EF', padding:'9px 14px', borderRadius:7, textAlign:'center' },

  ctaBand: { background:'#0A6B4B', padding:'64px 32px', textAlign:'center' },
  ctaTitle: { fontFamily:"'DM Serif Display',serif", fontSize:36, color:'#fff', marginBottom:12 },
  ctaSub: { fontSize:15, color:'rgba(255,255,255,.65)', marginBottom:28 },
  ctaActions: { display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' },
  ctaBtnP: { fontSize:14, fontWeight:600, color:'#0A6B4B', background:'#fff', padding:'13px 26px', borderRadius:10 },
  ctaBtnS: { fontSize:14, fontWeight:500, color:'rgba(255,255,255,.75)', background:'transparent', padding:'13px 26px', borderRadius:10, border:'1px solid rgba(255,255,255,.3)' },

  footer: { background:'#1A1A18', borderTop:'1px solid rgba(255,255,255,.06)', padding:'24px 32px' },
  footerInner: { maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 },
  footerLogo: { fontFamily:"'DM Serif Display',serif", fontSize:16, color:'#fff' },
  footerCopy: { fontSize:12, color:'rgba(255,255,255,.3)' },
  footerLinks: { display:'flex', gap:14 },
  footerLink: { fontSize:12, color:'rgba(255,255,255,.3)' },
};
