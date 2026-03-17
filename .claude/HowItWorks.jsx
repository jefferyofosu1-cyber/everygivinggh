/**
 * EveryGiving — How It Works Page
 * Route: /how-it-works
 *
 * Sections:
 * 1. Hero — two audiences, one page (campaigner vs donor toggle)
 * 2. Campaigner journey — 5-step process with detail
 * 3. Donor journey — 3-step process
 * 4. Verification explainer — what happens when you submit your Ghana Card
 * 5. Milestone explainer — how the trust mechanism works
 * 6. MoMo payments explainer — all three networks
 * 7. Diaspora giving — for Ghanaians abroad
 * 8. FAQ accordion — most common questions
 * 9. CTA band
 *
 * Usage:
 *   // app/how-it-works/page.js
 *   import HowItWorks from '@/components/HowItWorks';
 *   export default function Page() { return <HowItWorks />; }
 */

'use client';

import { useState } from 'react';

// ─── FAQ DATA ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How long does identity verification take?',
    a: 'Our team reviews Ghana Card submissions within 24 hours — usually much faster. You\'ll receive an SMS notification when your campaign is approved and goes live. If we need anything additional, we\'ll reach out by phone.',
  },
  {
    q: 'What ID documents are accepted?',
    a: 'We accept Ghana Card (primary), Voter ID, NHIS card, Passport, and Driver\'s License. The name on your ID must match the name on your EveryGiving account.',
  },
  {
    q: 'Can I receive donations without a bank account?',
    a: 'Yes — that\'s by design. All payouts go directly to your MoMo wallet (MTN MoMo, Vodafone Cash, or AirtelTigo Money). No bank account is ever required.',
  },
  {
    q: 'What are milestones and why do I have to use them?',
    a: 'Milestones are checkpoints where funds are released to you — for example, "Pay hospital deposit: ₵5,000" or "Fund surgery: ₵12,000". They\'re not a restriction — they\'re the reason donors trust you. Verified data shows campaigns with milestones raise 3× more than those without. You set the milestones yourself.',
  },
  {
    q: 'What happens if I don\'t reach my goal?',
    a: 'EveryGiving uses a flexible funding model — you keep everything you raise, regardless of whether you hit your goal. Donors are informed of this before giving. Funds raised so far can be released as you complete milestones.',
  },
  {
    q: 'Can Ghanaians abroad donate?',
    a: 'Yes — via Zeepay, our diaspora payment partner. Donors in the UK, US, Europe, and beyond can give in GBP, USD, or EUR. The funds arrive on the campaigner\'s GHS MoMo wallet, same day. Look for the "Giving from abroad?" option on any campaign page.',
  },
  {
    q: 'What is the platform fee?',
    a: 'Zero. EveryGiving charges no platform fee. The only cost is 2% + ₵0.25 per donation — a payment processing fee automatically deducted from each donation. On a ₵200 donation, ₵195.75 reaches the campaigner.',
  },
  {
    q: 'Can I edit my campaign after it goes live?',
    a: 'You can edit your story, photos, and updates at any time. Your goal amount cannot be changed after the first donation is received. Milestones can be adjusted before any milestone has been triggered.',
  },
  {
    q: 'How do I post an update to my donors?',
    a: 'From your campaign dashboard, click "Post update". You can write text, attach compressed photos, or link a YouTube or TikTok video. All donors who have given to your campaign receive an SMS and email notification automatically.',
  },
  {
    q: 'What happens if a payment fails?',
    a: 'If a MoMo payment prompt times out or is declined, no money leaves the donor\'s account and nothing is credited to your campaign. The donor is informed and can try again. Failed payments are never partially processed.',
  },
];

// ─── STEP DATA ────────────────────────────────────────────────────────────────

const CAMPAIGNER_STEPS = [
  {
    num: '01',
    title: 'Create your campaign',
    time: '15 min',
    desc: 'Write your story, set your fundraising goal, add a real photo of the person you\'re raising for, and set up milestones. Our guided flow walks you through each step — no technical skills needed.',
    details: ['Name the person and tell their story in your own words', 'Set a realistic goal — under ₵20,000 raises 2.5× faster', 'Add up to 5 photos — compressed automatically in your browser', 'Set 2–4 milestones that map to specific expenses'],
    color: '#E1F5EE', accent: '#0A6B4B',
  },
  {
    num: '02',
    title: 'Verify your identity',
    time: '24 hrs',
    desc: 'Upload your Ghana Card or accepted ID. Our team reviews every submission personally — not an algorithm. Verified campaigns raise 3× more because donors know exactly who they\'re giving to.',
    details: ['Upload front and back of your Ghana Card', 'Our team reviews within 24 hours', 'You\'ll receive an SMS when approved', 'No anonymous campaigns — ever'],
    color: '#E6F1FB', accent: '#185FA5',
  },
  {
    num: '03',
    title: 'Go live and share',
    time: 'Immediately',
    desc: 'Once verified, your campaign goes live instantly. Share your unique link on WhatsApp, Facebook, and with family and friends. Campaigns shared in the first 48 hours raise 4× more than those that aren\'t.',
    details: ['Your campaign gets a unique shareable link', 'Share directly to WhatsApp with one tap', 'Ask 10 close contacts to donate in the first 48 hours', 'Campaigns that reach 30% early succeed 80% of the time'],
    color: '#FAEEDA', accent: '#B85C00',
  },
  {
    num: '04',
    title: 'Post updates',
    time: 'Ongoing',
    desc: 'Keep your donors informed with regular updates — a photo, a medical milestone, a moment of hope. Campaigns that post updates at least twice raise 3× more than silent ones. We prompt you automatically.',
    details: ['Post text, photos, or YouTube/TikTok links', 'Every donor is notified by SMS and email', 'We prompt you at day 3, day 7, and day 14', 'Updates reactivate donors who have gone quiet'],
    color: '#EEEDFE', accent: '#534AB7',
  },
  {
    num: '05',
    title: 'Receive funds via MoMo',
    time: 'Same day',
    desc: 'When you complete a milestone and submit proof, our team releases the funds directly to your MoMo wallet. No bank account needed. No waiting. Funds arrive same day as approval.',
    details: ['Submit proof for each milestone (photo, receipt, or document)', 'Our team reviews and approves within a few hours', 'Funds land directly on your MTN, Vodafone, or AirtelTigo wallet', 'You receive an SMS confirmation for every payout'],
    color: '#EAF3DE', accent: '#27500A',
  },
];

const DONOR_STEPS = [
  {
    num: '01',
    title: 'Find a campaign',
    desc: 'Browse verified campaigns by category — Medical, Education, Emergency, Faith, Community, and more. Every campaign has passed identity verification before appearing here.',
    color: '#E1F5EE', accent: '#0A6B4B',
  },
  {
    num: '02',
    title: 'Choose your amount',
    desc: 'Select any amount — from ₵10 to whatever you can give. Our impact calculator shows exactly what your donation covers: one day of medication, one night in the ward, one month of fees.',
    color: '#E6F1FB', accent: '#185FA5',
  },
  {
    num: '03',
    title: 'Pay by MoMo — instantly',
    desc: 'Choose MTN MoMo, Vodafone Cash, or AirtelTigo. A prompt appears on your phone — approve it, and your donation is confirmed in seconds. No bank account, no card, no login required.',
    color: '#EAF3DE', accent: '#27500A',
  },
];

const MOMO_NETWORKS = [
  { name: 'MTN MoMo', color: '#FFD700', text: '#7A5800', desc: 'Ghana\'s largest network. Dial *170# or use the MoMo app to confirm.' },
  { name: 'Vodafone Cash', color: '#E60000', text: '#fff', desc: 'Dial *110# or use the Vodafone app. Available on all Vodafone lines.' },
  { name: 'AirtelTigo', color: '#E8221B', text: '#fff', desc: 'Dial *500# or use the AirtelTigo app. Instant confirmation.' },
];

// ─── FAQ ITEM ─────────────────────────────────────────────────────────────────

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        ...styles.faqItem,
        borderBottom: index < FAQS.length - 1 ? '1px solid #E8E4DC' : 'none',
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={styles.faqQ}>
        <span style={styles.faqQText}>{faq.q}</span>
        <span style={{ ...styles.faqChevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▾
        </span>
      </div>
      {open && <div style={styles.faqA}>{faq.a}</div>}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const [audience, setAudience] = useState('campaigner');
  const [activeStep, setActiveStep] = useState(0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        @keyframes fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeup .4s ease both}
        .step-card:hover{background:#F5F2EC !important;}
        .step-card.active-step{border-color:#0A6B4B !important;background:#FDFAF5 !important;}
      `}</style>

      {/* NAV */}
      <nav style={styles.nav}>
        <a href="/" style={styles.navLogo}>
          Every<span style={{ color: '#0A6B4B' }}>Giving</span>
        </a>
        <div style={styles.navLinks}>
          <a href="/campaigns" style={styles.navLink}>Browse</a>
          <a href="/how-it-works" style={{ ...styles.navLink, color: '#0A6B4B', fontWeight: 600 }}>How it works</a>
          <a href="/fees" style={styles.navLink}>Fees</a>
          <div style={styles.navDivider} />
          <a href="/auth/login" style={styles.navSignin}>Sign in</a>
          <a href="/create" style={styles.navCta}>Start a campaign</a>
        </div>
      </nav>

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.eyebrow}>Simple by design</div>
          <h1 style={styles.heroTitle}>
            How EveryGiving<br />
            <em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>actually works</em>
          </h1>
          <p style={styles.heroSub}>
            Whether you're raising money or giving it — every step is designed
            around trust, transparency, and getting funds where they need to go.
          </p>

          {/* Audience toggle */}
          <div style={styles.audienceToggle}>
            <button
              style={{
                ...styles.toggleBtn,
                background: audience === 'campaigner' ? '#fff' : 'transparent',
                color: audience === 'campaigner' ? '#1A1A18' : 'rgba(255,255,255,.6)',
                boxShadow: audience === 'campaigner' ? '0 2px 8px rgba(0,0,0,.12)' : 'none',
              }}
              onClick={() => setAudience('campaigner')}
            >
              I want to raise money
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                background: audience === 'donor' ? '#fff' : 'transparent',
                color: audience === 'donor' ? '#1A1A18' : 'rgba(255,255,255,.6)',
                boxShadow: audience === 'donor' ? '0 2px 8px rgba(0,0,0,.12)' : 'none',
              }}
              onClick={() => setAudience('donor')}
            >
              I want to donate
            </button>
          </div>
        </div>
      </div>

      {/* TRUST BAR */}
      <div style={styles.trustBar}>
        <div style={styles.trustBarInner}>
          {[
            { icon: '✓', text: 'Ghana Card verified — every campaign' },
            { icon: '✓', text: 'Milestone-based payouts — funds protected' },
            { icon: '✓', text: 'MTN · Vodafone · AirtelTigo built in' },
            { icon: '✓', text: '₵0 platform fee — always' },
          ].map((t, i) => (
            <div key={i} style={styles.trustItem}>
              <span style={{ color: '#0A6B4B', fontWeight: 700 }}>{t.icon}</span>
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CAMPAIGNER JOURNEY ── */}
      {audience === 'campaigner' && (
        <div style={styles.section} className="fade-in">
          <div style={styles.sectionInner}>
            <div style={styles.sectionEyebrow}>For campaigners</div>
            <h2 style={styles.sectionTitle}>From story to funded — in five steps</h2>
            <p style={styles.sectionSub}>
              Every step is designed to help you raise more. Verified identity,
              compelling story, milestone payouts — each one builds donor trust.
            </p>

            <div style={styles.stepsLayout}>
              {/* Step list — left */}
              <div style={styles.stepList}>
                {CAMPAIGNER_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`step-card${activeStep === i ? ' active-step' : ''}`}
                    style={{
                      ...styles.stepCard,
                      borderColor: activeStep === i ? '#0A6B4B' : '#E8E4DC',
                    }}
                    onClick={() => setActiveStep(i)}
                  >
                    <div style={styles.stepCardTop}>
                      <div style={{
                        ...styles.stepNum,
                        background: step.color,
                        color: step.accent,
                      }}>
                        {step.num}
                      </div>
                      <div style={styles.stepCardMeta}>
                        <div style={styles.stepCardTitle}>{step.title}</div>
                        <div style={styles.stepCardTime}>⏱ {step.time}</div>
                      </div>
                      <div style={{
                        fontSize: 14, color: activeStep === i ? '#0A6B4B' : '#C8C4BC',
                        transition: 'color .15s',
                      }}>▶</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step detail — right */}
              <div style={styles.stepDetail} className="fade-in" key={activeStep}>
                <div style={{
                  ...styles.stepDetailNum,
                  background: CAMPAIGNER_STEPS[activeStep].color,
                  color: CAMPAIGNER_STEPS[activeStep].accent,
                }}>
                  {CAMPAIGNER_STEPS[activeStep].num}
                </div>
                <h3 style={styles.stepDetailTitle}>{CAMPAIGNER_STEPS[activeStep].title}</h3>
                <p style={styles.stepDetailDesc}>{CAMPAIGNER_STEPS[activeStep].desc}</p>
                <div style={styles.stepDetailList}>
                  {CAMPAIGNER_STEPS[activeStep].details.map((d, i) => (
                    <div key={i} style={styles.stepDetailItem}>
                      <div style={{ ...styles.stepDetailDot, background: CAMPAIGNER_STEPS[activeStep].accent }} />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
                {activeStep < CAMPAIGNER_STEPS.length - 1 ? (
                  <button
                    style={{ ...styles.nextBtn, background: CAMPAIGNER_STEPS[activeStep].accent }}
                    onClick={() => setActiveStep(s => s + 1)}
                  >
                    Next: {CAMPAIGNER_STEPS[activeStep + 1].title} →
                  </button>
                ) : (
                  <a href="/create" style={{ ...styles.nextBtn, background: '#0A6B4B', display: 'inline-block', textAlign: 'center' }}>
                    Start your campaign — free →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DONOR JOURNEY ── */}
      {audience === 'donor' && (
        <div style={styles.section} className="fade-in">
          <div style={styles.sectionInner}>
            <div style={styles.sectionEyebrow}>For donors</div>
            <h2 style={styles.sectionTitle}>Give in three steps. Done in two minutes.</h2>
            <p style={styles.sectionSub}>
              No bank account. No card. Just your MoMo phone. Every campaign you
              give to is identity-verified before it goes live.
            </p>
            <div style={styles.donorSteps}>
              {DONOR_STEPS.map((step, i) => (
                <div key={i} style={{ ...styles.donorCard, background: step.color }}>
                  <div style={{ ...styles.donorNum, color: step.accent }}>{step.num}</div>
                  <h3 style={{ ...styles.donorTitle, color: step.accent }}>{step.title}</h3>
                  <p style={{ ...styles.donorDesc, color: step.accent + 'CC' }}>{step.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <a href="/campaigns" style={styles.browseBtn}>Browse verified campaigns →</a>
            </div>
          </div>
        </div>
      )}

      {/* ── VERIFICATION EXPLAINER ── */}
      <div style={styles.verifySection}>
        <div style={styles.sectionInner}>
          <div style={styles.twoCol}>
            <div>
              <div style={{ ...styles.sectionEyebrow, color: '#B7DEC9' }}>Identity verification</div>
              <h2 style={{ ...styles.sectionTitle, color: '#fff' }}>
                The reason donors<br />trust your campaign
              </h2>
              <p style={{ ...styles.sectionSub, color: 'rgba(255,255,255,.55)' }}>
                Every fundraiser on EveryGiving has had their Ghana Card reviewed
                by a real person on our team before their campaign went live.
                This is not optional — it's the foundation everything else is built on.
              </p>
              <div style={styles.verifyStats}>
                <div style={styles.verifyStat}>
                  <div style={styles.verifyStatN}>3×</div>
                  <div style={styles.verifyStatL}>more raised by verified campaigns</div>
                </div>
                <div style={styles.verifyStat}>
                  <div style={styles.verifyStatN}>24hr</div>
                  <div style={styles.verifyStatL}>typical review turnaround</div>
                </div>
                <div style={styles.verifyStat}>
                  <div style={styles.verifyStatN}>100%</div>
                  <div style={styles.verifyStatL}>of live campaigns are verified</div>
                </div>
              </div>
            </div>
            <div>
              {[
                { step: '1', title: 'You submit your Ghana Card', desc: 'Upload a clear photo of the front and back. The name must match your account.' },
                { step: '2', title: 'Our team reviews it personally', desc: 'A real person on our team cross-checks your ID — not an algorithm.' },
                { step: '3', title: 'Your campaign goes live', desc: 'Once approved, your campaign is published and gets the Verified badge.' },
                { step: '4', title: 'Donors see exactly who you are', desc: 'Your verified name is displayed on every campaign page. No anonymity.' },
              ].map((item, i) => (
                <div key={i} style={styles.verifyStep}>
                  <div style={styles.verifyStepNum}>{item.step}</div>
                  <div>
                    <div style={styles.verifyStepTitle}>{item.title}</div>
                    <div style={styles.verifyStepDesc}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MILESTONE EXPLAINER ── */}
      <div style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionEyebrow}>How milestones work</div>
          <h2 style={styles.sectionTitle}>
            The feature that makes<br />donors give more
          </h2>
          <p style={styles.sectionSub}>
            Milestone payouts are the single biggest difference between EveryGiving
            and every other crowdfunding platform in Ghana. Here's how they work.
          </p>

          <div style={styles.milestoneFlow}>
            {[
              {
                icon: '🎯',
                title: 'You set the milestones',
                desc: 'When creating your campaign, you decide when funds are released — e.g. "Pay hospital deposit: ₵5,000" and "Fund surgery: ₵12,000".',
                color: '#E1F5EE', accent: '#0A6B4B',
              },
              {
                icon: '💰',
                title: 'Donations are held safely',
                desc: 'Funds accumulate securely via Paystack. Nothing is released until a milestone is reached and you submit proof.',
                color: '#E6F1FB', accent: '#185FA5',
              },
              {
                icon: '📄',
                title: 'You submit proof',
                desc: 'When a milestone is reached, upload a photo, receipt, or document showing the money will be used as stated.',
                color: '#FAEEDA', accent: '#B85C00',
              },
              {
                icon: '✅',
                title: 'We review and release',
                desc: 'Our team checks your proof and releases the funds to your MoMo wallet same day. Donors are notified automatically.',
                color: '#EAF3DE', accent: '#27500A',
              },
            ].map((item, i) => (
              <div key={i} style={{ ...styles.milestoneCard, background: item.color }}>
                <div style={styles.milestoneIcon}>{item.icon}</div>
                <h4 style={{ ...styles.milestoneTitle, color: item.accent }}>{item.title}</h4>
                <p style={{ ...styles.milestoneDesc, color: item.accent + 'BB' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={styles.milestoneCallout}>
            <div style={styles.calloutIcon}>💡</div>
            <div>
              <div style={styles.calloutTitle}>Why donors give more to milestone campaigns</div>
              <div style={styles.calloutBody}>
                When a donor sees that funds are held until proof is submitted, they know their money can't disappear.
                This removes the single biggest reason people don't donate — fear that the money won't be used as promised.
                Campaigns with milestones raise an average of 3× more than campaigns without them.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOMO EXPLAINER ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #E8E4DC', borderBottom: '1px solid #E8E4DC' }}>
        <div style={styles.sectionInner}>
          <div style={{ padding: '64px 0' }}>
            <div style={styles.sectionEyebrow}>Mobile money</div>
            <h2 style={styles.sectionTitle}>All three networks. Built in from day one.</h2>
            <p style={styles.sectionSub}>
              No bank account needed — for donors or campaigners. If you have a
              Ghanaian SIM card, you can give or receive.
            </p>
            <div style={styles.momoGrid}>
              {MOMO_NETWORKS.map((n, i) => (
                <div key={i} style={{ ...styles.momoCard, background: n.color }}>
                  <div style={{ ...styles.momoName, color: n.text }}>{n.name}</div>
                  <div style={{ ...styles.momoDesc, color: n.text + 'CC' }}>{n.desc}</div>
                </div>
              ))}
            </div>
            <div style={styles.momoNote}>
              <span style={{ fontWeight: 600 }}>Diaspora donors</span> in the UK, US, and Europe
              can give in GBP, USD, or EUR via Zeepay — funds arrive on the
              campaigner's MoMo wallet in GHS, same day.
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.sectionEyebrow}>Common questions</div>
          <h2 style={styles.sectionTitle}>Everything you need to know</h2>
          <div style={styles.faqGrid}>
            <div style={styles.faqList}>
              {FAQS.map((faq, i) => (
                <FaqItem key={i} faq={faq} index={i} />
              ))}
            </div>
            <div style={styles.faqSidebar}>
              <div style={styles.faqSideCard}>
                <div style={styles.faqSideTitle}>Still have questions?</div>
                <p style={styles.faqSideDesc}>
                  Our team is based in Accra and responds within a few hours.
                </p>
                <a href="mailto:support@everygiving.org" style={styles.faqSideBtn}>
                  Contact us →
                </a>
              </div>
              <div style={{ ...styles.faqSideCard, marginTop: 12, background: '#0A6B4B' }}>
                <div style={{ ...styles.faqSideTitle, color: '#fff' }}>Ready to start?</div>
                <p style={{ ...styles.faqSideDesc, color: 'rgba(255,255,255,.65)' }}>
                  Create your campaign in under 15 minutes. Free. Always.
                </p>
                <a href="/create" style={{ ...styles.faqSideBtn, background: '#fff', color: '#0A6B4B' }}>
                  Start a campaign →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={styles.ctaBand}>
        <h2 style={styles.ctaTitle}>Ready to raise with confidence?</h2>
        <p style={styles.ctaSub}>
          Free to create. Verified by our team. Funds released as you hit milestones.
        </p>
        <div style={styles.ctaActions}>
          <a href="/create" style={styles.ctaBtnPrimary}>Start a campaign — free</a>
          <a href="/campaigns" style={styles.ctaBtnSecondary}>Browse campaigns</a>
        </div>
        <div style={styles.ctaFns}>
          {['No credit card needed', '₵0 platform fee', 'Identity verified', 'MoMo same-day'].map((t, i) => (
            <span key={i} style={styles.ctaFn}>✓ {t}</span>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <span style={styles.footerLogo}>
            Every<span style={{ color: '#B7DEC9' }}>Giving</span>
          </span>
          <span style={styles.footerCopy}>© 2026 EveryGiving · Built in Ghana 🇬🇭 · ₵0 platform fee</span>
          <div style={styles.footerLinks}>
            {['Terms', 'Privacy', 'Fees', 'Contact'].map(l => (
              <a key={l} href={`/${l.toLowerCase()}`} style={styles.footerLink}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 32px', height: 60, background: '#fff',
    borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 0, zIndex: 200,
    fontFamily: "'DM Sans', sans-serif",
  },
  navLogo: { fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#1A1A18' },
  navLinks: { display: 'flex', gap: 4, alignItems: 'center' },
  navLink: { fontSize: 13, color: '#8A8A82', padding: '6px 12px', borderRadius: 6 },
  navDivider: { width: 1, height: 16, background: '#E8E4DC', margin: '0 6px' },
  navSignin: { fontSize: 13, fontWeight: 500, color: '#1A1A18', padding: '7px 14px', border: '1px solid #E8E4DC', borderRadius: 8 },
  navCta: { fontSize: 13, fontWeight: 600, color: '#fff', background: '#0A6B4B', padding: '8px 18px', borderRadius: 8, marginLeft: 6 },

  hero: { background: '#1A1A18', padding: '64px 32px 56px' },
  heroInner: { maxWidth: 700, margin: '0 auto', textAlign: 'center' },
  eyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#B7DEC9', marginBottom: 14 },
  heroTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 44, lineHeight: 1.1, color: '#fff', marginBottom: 16 },
  heroSub: { fontSize: 16, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' },
  audienceToggle: {
    display: 'inline-flex', background: 'rgba(255,255,255,.1)', borderRadius: 12,
    padding: 4, gap: 4, marginTop: 8,
  },
  toggleBtn: {
    fontSize: 14, fontWeight: 500, padding: '10px 22px', borderRadius: 9,
    border: 'none', cursor: 'pointer', transition: 'all .2s', fontFamily: "'DM Sans', sans-serif",
  },

  trustBar: { background: '#fff', borderBottom: '1px solid #E8E4DC' },
  trustBarInner: {
    maxWidth: 1100, margin: '0 auto', padding: '0 32px',
    display: 'flex', alignItems: 'center', height: 50, gap: 0, overflowX: 'auto',
  },
  trustItem: {
    fontSize: 12, color: '#4A4A44', whiteSpace: 'nowrap',
    padding: '0 20px', borderRight: '1px solid #E8E4DC',
    display: 'flex', alignItems: 'center', gap: 6, height: '100%',
  },

  section: { padding: '0 32px' },
  sectionInner: { maxWidth: 1100, margin: '0 auto', padding: '72px 0' },
  sectionEyebrow: { fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 10 },
  sectionTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 34, color: '#1A1A18', marginBottom: 12, lineHeight: 1.2 },
  sectionSub: { fontSize: 15, color: '#8A8A82', lineHeight: 1.75, maxWidth: 560, marginBottom: 48 },

  stepsLayout: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 32, alignItems: 'start' },
  stepList: { display: 'flex', flexDirection: 'column', gap: 8 },
  stepCard: {
    background: '#fff', border: '1px solid', borderRadius: 12,
    padding: '14px 16px', cursor: 'pointer', transition: 'all .15s',
  },
  stepCardTop: { display: 'flex', alignItems: 'center', gap: 12 },
  stepNum: {
    width: 36, height: 36, borderRadius: 8, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Serif Display', serif", fontSize: 15, fontWeight: 600, flexShrink: 0,
  },
  stepCardMeta: { flex: 1 },
  stepCardTitle: { fontSize: 13, fontWeight: 600, color: '#1A1A18', marginBottom: 2 },
  stepCardTime: { fontSize: 11, color: '#8A8A82' },

  stepDetail: {
    background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16,
    padding: '32px 28px', position: 'sticky', top: 80,
  },
  stepDetailNum: {
    width: 48, height: 48, borderRadius: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 600,
    marginBottom: 18,
  },
  stepDetailTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1A1A18', marginBottom: 12 },
  stepDetailDesc: { fontSize: 14, color: '#4A4A44', lineHeight: 1.75, marginBottom: 20 },
  stepDetailList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 },
  stepDetailItem: { display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#4A4A44', lineHeight: 1.6 },
  stepDetailDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 5 },
  nextBtn: {
    display: 'block', width: '100%', padding: '12px 0', color: '#fff',
    textAlign: 'center', borderRadius: 10, fontSize: 14, fontWeight: 600,
    border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity .15s',
  },

  donorSteps: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  donorCard: { borderRadius: 16, padding: '32px 24px' },
  donorNum: { fontFamily: "'DM Serif Display', serif", fontSize: 40, lineHeight: 1, marginBottom: 14 },
  donorTitle: { fontSize: 17, fontWeight: 600, marginBottom: 10 },
  donorDesc: { fontSize: 13, lineHeight: 1.7 },
  browseBtn: {
    display: 'inline-block', fontSize: 14, fontWeight: 600, color: '#fff',
    background: '#0A6B4B', padding: '13px 28px', borderRadius: 10,
  },

  verifySection: { background: '#1A1A18', padding: '0 32px' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, padding: '72px 0', alignItems: 'start' },
  verifyStats: { display: 'flex', gap: 24, marginTop: 32, flexWrap: 'wrap' },
  verifyStat: {},
  verifyStatN: { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#B7DEC9', lineHeight: 1 },
  verifyStatL: { fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 3, lineHeight: 1.4 },
  verifyStep: {
    display: 'flex', gap: 14, alignItems: 'flex-start',
    paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 20,
  },
  verifyStepNum: {
    width: 28, height: 28, borderRadius: '50%', background: '#0A6B4B',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  verifyStepTitle: { fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 },
  verifyStepDesc: { fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.65 },

  milestoneFlow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  milestoneCard: { borderRadius: 14, padding: '24px 20px' },
  milestoneIcon: { fontSize: 26, marginBottom: 12 },
  milestoneTitle: { fontSize: 14, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 },
  milestoneDesc: { fontSize: 12, lineHeight: 1.7 },
  milestoneCallout: {
    background: '#1A1A18', borderRadius: 14, padding: '20px 24px',
    display: 'flex', gap: 16, alignItems: 'flex-start',
  },
  calloutIcon: { fontSize: 24, flexShrink: 0 },
  calloutTitle: { fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 6 },
  calloutBody: { fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.7 },

  momoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 },
  momoCard: { borderRadius: 14, padding: '24px 20px' },
  momoName: { fontSize: 16, fontWeight: 700, marginBottom: 8 },
  momoDesc: { fontSize: 13, lineHeight: 1.65 },
  momoNote: {
    background: '#FDFAF5', border: '1px solid #E8E4DC', borderRadius: 10,
    padding: '14px 18px', fontSize: 13, color: '#4A4A44', lineHeight: 1.65,
  },

  faqGrid: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 48, alignItems: 'start' },
  faqList: { background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16, overflow: 'hidden' },
  faqItem: { padding: '18px 20px', cursor: 'pointer', transition: 'background .15s' },
  faqQ: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  faqQText: { fontSize: 14, fontWeight: 500, color: '#1A1A18', lineHeight: 1.5 },
  faqChevron: { fontSize: 16, color: '#8A8A82', flexShrink: 0, transition: 'transform .2s' },
  faqA: { fontSize: 13, color: '#4A4A44', lineHeight: 1.75, marginTop: 10, paddingRight: 24 },
  faqSidebar: {},
  faqSideCard: {
    background: '#FDFAF5', border: '1px solid #E8E4DC',
    borderRadius: 14, padding: '20px', position: 'sticky', top: 80,
  },
  faqSideTitle: { fontSize: 15, fontWeight: 600, color: '#1A1A18', marginBottom: 6 },
  faqSideDesc: { fontSize: 13, color: '#8A8A82', lineHeight: 1.65, marginBottom: 14 },
  faqSideBtn: {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#0A6B4B',
    background: '#E8F5EF', padding: '10px 16px', borderRadius: 8, textAlign: 'center',
  },

  ctaBand: { background: '#0A6B4B', padding: '64px 32px', textAlign: 'center' },
  ctaTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#fff', marginBottom: 12 },
  ctaSub: { fontSize: 15, color: 'rgba(255,255,255,.65)', marginBottom: 28 },
  ctaActions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  ctaBtnPrimary: {
    fontSize: 14, fontWeight: 600, color: '#0A6B4B', background: '#fff',
    padding: '13px 26px', borderRadius: 10,
  },
  ctaBtnSecondary: {
    fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,.75)',
    background: 'transparent', padding: '13px 26px', borderRadius: 10,
    border: '1px solid rgba(255,255,255,.3)',
  },
  ctaFns: { display: 'flex', gap: 20, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' },
  ctaFn: { fontSize: 12, color: 'rgba(255,255,255,.45)' },

  footer: { background: '#1A1A18', borderTop: '1px solid rgba(255,255,255,.06)', padding: '24px 32px' },
  footerInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  footerLogo: { fontFamily: "'DM Serif Display', serif", fontSize: 16, color: '#fff' },
  footerCopy: { fontSize: 12, color: 'rgba(255,255,255,.3)' },
  footerLinks: { display: 'flex', gap: 14 },
  footerLink: { fontSize: 12, color: 'rgba(255,255,255,.3)' },
};
