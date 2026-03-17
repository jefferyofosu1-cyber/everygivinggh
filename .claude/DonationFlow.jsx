/**
 * EveryGiving — Donation Flow
 * Route: /campaigns/[slug]/donate
 *
 * Steps:
 *   1. Amount selection — presets, custom, impact line, diaspora toggle
 *   2. Payment — MoMo network + number (local) OR Zeepay (diaspora)
 *   3. Processing — waiting for MoMo prompt approval
 *   4. Confirmation — thank you, receipt, WhatsApp share prompt
 *
 * Rules (from spec):
 *   - NO fees shown at any point in this flow
 *   - Donor never sees "2.5% + ₵0.50"
 *   - Trust signals: verified, milestone-protected, secure
 *   - Diaspora path: currency selector (GBP/USD/EUR) → Zeepay
 *   - MoMo prompt: real-time polling for webhook confirmation
 *   - Warm glow moment: confirmation screen is emotionally designed
 *
 * Backend integration:
 *   POST /api/donations/initiate  → { donationId, provider, redirectUrl? }
 *   GET  /api/donations/{id}/status → { status: 'pending'|'confirmed'|'failed' }
 *   POST /api/donations/{id}/cancel
 *
 * Usage:
 *   // app/campaigns/[slug]/donate/page.js
 *   import DonationFlow from '@/components/DonationFlow';
 */

'use client';

import { useState, useEffect, useRef } from 'react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGN = {
  id: 'c1',
  slug: 'ama-kidney-surgery',
  title: 'Help Ama get life-saving kidney surgery at Korle Bu',
  organiser: 'Kwame Mensah',
  image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=480&q=80&auto=format&fit=crop',
  raisedGHS: 14400,
  goalGHS: 20000,
  donorCount: 143,
  daysLeft: 12,
  verified: true,
  category: 'Medical',
};

// ─── IMPACT LINES — what each amount achieves ────────────────────────────────

const IMPACT = {
  20:   'covers Ama\'s transport to the hospital for one appointment',
  50:   'covers one day of post-operative medication for Ama',
  100:  'covers two days of nursing care after surgery',
  200:  'covers one night of post-operative care in the ward',
  500:  'covers the anaesthetist\'s fee for the procedure',
  1000: 'covers 18% of the total surgery cost — a massive step forward',
};

function getImpact(amount) {
  const keys = Object.keys(IMPACT).map(Number).sort((a, b) => a - b);
  const closest = keys.reduce((prev, curr) =>
    Math.abs(curr - amount) < Math.abs(prev - amount) ? curr : prev
  );
  return amount > 0
    ? `₵${amount.toLocaleString()} ${IMPACT[closest] || 'brings Ama closer to surgery'}`
    : null;
}

// ─── MOMO NETWORKS ────────────────────────────────────────────────────────────

const NETWORKS = [
  { id: 'mtn', label: 'MTN MoMo', color: '#FFD700', textColor: '#7A5800', prefix: '024, 025, 053, 054, 055, 059' },
  { id: 'vodafone', label: 'Vodafone Cash', color: '#E60000', textColor: '#fff', prefix: '020, 050' },
  { id: 'airteltigo', label: 'AirtelTigo', color: '#CC0000', textColor: '#fff', prefix: '026, 027, 056, 057' },
];

const DIASPORA_CURRENCIES = [
  { code: 'GBP', symbol: '£', flag: '🇬🇧', rate: 18.5, label: 'British Pounds' },
  { code: 'USD', symbol: '$', flag: '🇺🇸', rate: 14.2, label: 'US Dollars' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', rate: 15.8, label: 'Euros' },
];

// ─── STEP COMPONENTS ─────────────────────────────────────────────────────────

function CampaignSummary({ campaign, compact = false }) {
  const pct = Math.round((campaign.raisedGHS / campaign.goalGHS) * 100);
  return (
    <div style={{ ...st.campaignSummary, padding: compact ? '12px 14px' : '16px' }}>
      <img src={campaign.image} alt="" style={st.summaryImg} />
      <div style={st.summaryInfo}>
        <div style={st.summaryCategory}>{campaign.category}</div>
        <div style={{ ...st.summaryTitle, fontSize: compact ? 13 : 14 }}>{campaign.title}</div>
        {!compact && (
          <>
            <div style={st.summaryMeta}>
              {campaign.verified && <span style={st.verifiedChip}>✓ Verified</span>}
              <span style={st.summaryOrg}>by {campaign.organiser}</span>
            </div>
            <div style={st.summaryProgress}>
              <div style={st.summaryBar}>
                <div style={{ ...st.summaryFill, width: `${pct}%` }} />
              </div>
              <div style={st.summaryStats}>
                <span>₵{campaign.raisedGHS.toLocaleString()} raised</span>
                <span>{pct}% of ₵{campaign.goalGHS.toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── STEP 1 — AMOUNT ─────────────────────────────────────────────────────────

function StepAmount({ campaign, onNext }) {
  const [amount, setAmount] = useState(200);
  const [custom, setCustom] = useState('');
  const [isDiaspora, setIsDiaspora] = useState(false);
  const [currency, setCurrency] = useState(DIASPORA_CURRENCIES[0]);
  const PRESETS = [50, 100, 200, 500, 1000];

  const effectiveAmount = custom ? parseFloat(custom) || 0 : amount;
  const impact = getImpact(effectiveAmount);
  const ghsEquivalent = isDiaspora && custom
    ? (parseFloat(custom) * currency.rate).toFixed(2)
    : null;

  function selectPreset(val) {
    setAmount(val);
    setCustom('');
  }

  function handleCustom(val) {
    setCustom(val);
    setAmount(0);
  }

  return (
    <div style={st.stepWrap}>
      <div style={st.stepHeader}>
        <h2 style={st.stepTitle}>Choose an amount</h2>
        <p style={st.stepSub}>Every gift, no matter the size, makes a real difference.</p>
      </div>

      {/* Diaspora toggle */}
      <div style={st.diasporaToggle}>
        <button
          style={{ ...st.diasporaBtn, background: !isDiaspora ? '#1A1A18' : 'transparent', color: !isDiaspora ? '#fff' : '#8A8A82' }}
          onClick={() => setIsDiaspora(false)}
        >
          Giving from Ghana
        </button>
        <button
          style={{ ...st.diasporaBtn, background: isDiaspora ? '#1A1A18' : 'transparent', color: isDiaspora ? '#fff' : '#8A8A82' }}
          onClick={() => setIsDiaspora(true)}
        >
          Giving from abroad 🌍
        </button>
      </div>

      {/* Diaspora currency selector */}
      {isDiaspora && (
        <div style={st.currencyRow}>
          {DIASPORA_CURRENCIES.map(c => (
            <button
              key={c.code}
              style={{ ...st.currencyBtn, borderColor: currency.code === c.code ? '#0A6B4B' : '#E8E4DC', background: currency.code === c.code ? '#E8F5EF' : '#fff' }}
              onClick={() => setCurrency(c)}
            >
              <span>{c.flag}</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{c.code}</span>
            </button>
          ))}
        </div>
      )}

      {/* Preset amounts */}
      {!isDiaspora && (
        <div style={st.presets}>
          {PRESETS.map(p => (
            <button
              key={p}
              style={{
                ...st.presetBtn,
                borderColor: amount === p && !custom ? '#0A6B4B' : '#E8E4DC',
                background: amount === p && !custom ? '#E8F5EF' : '#fff',
                color: amount === p && !custom ? '#0A6B4B' : '#4A4A44',
              }}
              onClick={() => selectPreset(p)}
            >
              ₵{p.toLocaleString()}
            </button>
          ))}
        </div>
      )}

      {/* Custom amount */}
      <div style={st.customWrap}>
        <span style={st.customPrefix}>{isDiaspora ? currency.symbol : '₵'}</span>
        <input
          type="number"
          placeholder={isDiaspora ? `Enter amount in ${currency.code}` : 'Enter your own amount'}
          value={custom}
          onChange={e => handleCustom(e.target.value)}
          style={st.customInput}
          min="1"
        />
      </div>

      {/* GHS equivalent for diaspora */}
      {isDiaspora && ghsEquivalent && parseFloat(ghsEquivalent) > 0 && (
        <div style={st.ghsEquiv}>
          ≈ ₵{parseFloat(ghsEquivalent).toLocaleString('en-GH', { minimumFractionDigits: 2 })} GHS
          <span style={{ color: '#8A8A82', fontWeight: 400 }}> · Rate: 1 {currency.code} = ₵{currency.rate}</span>
        </div>
      )}

      {/* Impact line */}
      {impact && effectiveAmount > 0 && (
        <div style={st.impactLine}>
          <div style={st.impactDot} />
          <span>{impact}</span>
        </div>
      )}

      {/* CTA */}
      <button
        style={{ ...st.ctaBtn, opacity: effectiveAmount > 0 ? 1 : 0.45 }}
        disabled={effectiveAmount <= 0}
        onClick={() => onNext({ amount: effectiveAmount, isDiaspora, currency: isDiaspora ? currency : null })}
      >
        Continue →
      </button>

      {/* Trust signals — NO FEES mentioned */}
      <div style={st.trustRow}>
        <span style={st.trustItem}>🔒 Secure</span>
        <span style={st.trustItem}>✓ Verified campaign</span>
        <span style={st.trustItem}>🎯 Milestone-protected</span>
      </div>
    </div>
  );
}

// ─── STEP 2 — PAYMENT ────────────────────────────────────────────────────────

function StepPayment({ donation, campaign, onNext, onBack }) {
  const [network, setNetwork] = useState(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [diasporaPhone, setDiasporaPhone] = useState('');
  const [diasporaName, setDiasporaName] = useState('');

  function validatePhone(val) {
    const clean = val.replace(/\s/g, '');
    if (!clean) return 'Please enter your MoMo number';
    if (!/^0[0-9]{9}$/.test(clean)) return 'Enter a valid 10-digit Ghana number (starting with 0)';
    return '';
  }

  function handleSubmit() {
    if (!donation.isDiaspora) {
      if (!network) return;
      const err = validatePhone(phone);
      if (err) { setPhoneError(err); return; }
    }
    onNext({ network, phone: phone.replace(/\s/g, ''), diasporaPhone, diasporaName });
  }

  if (donation.isDiaspora) {
    return (
      <div style={st.stepWrap}>
        <button style={st.backBtn} onClick={onBack}>← Change amount</button>
        <div style={st.stepHeader}>
          <h2 style={st.stepTitle}>Pay via Zeepay</h2>
          <p style={st.stepSub}>
            Your {donation.currency.code} payment converts to GHS and lands on the campaigner's MoMo wallet — same day.
          </p>
        </div>

        <div style={st.amountSummary}>
          <span style={st.amountBig}>{donation.currency.symbol}{donation.amount}</span>
          <span style={st.amountSub}>{donation.currency.code} → ≈ ₵{(donation.amount * donation.currency.rate).toFixed(2)} GHS</span>
        </div>

        <div style={st.field}>
          <label style={st.fieldLabel}>Your full name</label>
          <input
            style={st.fieldInput}
            type="text"
            placeholder="As it appears on your ID"
            value={diasporaName}
            onChange={e => setDiasporaName(e.target.value)}
          />
        </div>

        <div style={st.field}>
          <label style={st.fieldLabel}>Your phone number (for payment confirmation)</label>
          <input
            style={st.fieldInput}
            type="tel"
            placeholder={`Your ${donation.currency.code === 'GBP' ? 'UK' : donation.currency.code === 'USD' ? 'US' : 'international'} number`}
            value={diasporaPhone}
            onChange={e => setDiasporaPhone(e.target.value)}
          />
        </div>

        <div style={st.zeepayNote}>
          <div style={st.zeepayNoteIcon}>ℹ</div>
          <div style={st.zeepayNoteText}>
            You'll be redirected to Zeepay to complete your payment securely. Funds arrive on the campaigner's wallet same day.
          </div>
        </div>

        <button
          style={{ ...st.ctaBtn, opacity: diasporaName && diasporaPhone ? 1 : 0.45 }}
          disabled={!diasporaName || !diasporaPhone}
          onClick={handleSubmit}
        >
          Continue to Zeepay →
        </button>

        <div style={st.trustRow}>
          <span style={st.trustItem}>🔒 Zeepay licensed</span>
          <span style={st.trustItem}>✓ Same-day GHS</span>
        </div>
      </div>
    );
  }

  return (
    <div style={st.stepWrap}>
      <button style={st.backBtn} onClick={onBack}>← Change amount</button>
      <div style={st.stepHeader}>
        <h2 style={st.stepTitle}>Pay by MoMo</h2>
        <p style={st.stepSub}>You'll receive a prompt on your phone to approve the payment.</p>
      </div>

      <div style={st.amountSummary}>
        <span style={st.amountBig}>₵{donation.amount.toLocaleString()}</span>
        <span style={st.amountSub}>to {campaign.organiser}</span>
      </div>

      {/* Network selection */}
      <div style={st.fieldLabel}>Select your MoMo network</div>
      <div style={st.networkGrid}>
        {NETWORKS.map(n => (
          <button
            key={n.id}
            style={{
              ...st.networkBtn,
              borderColor: network?.id === n.id ? '#0A6B4B' : '#E8E4DC',
              boxShadow: network?.id === n.id ? '0 0 0 2px rgba(10,107,75,.15)' : 'none',
            }}
            onClick={() => setNetwork(n)}
          >
            <div style={{ ...st.networkDot, background: n.color }} />
            <span style={st.networkLabel}>{n.label}</span>
            {network?.id === n.id && <span style={st.networkCheck}>✓</span>}
          </button>
        ))}
      </div>

      {/* Phone number */}
      {network && (
        <div style={st.field}>
          <label style={st.fieldLabel}>Your {network.label} number</label>
          <div style={{ ...st.phoneWrap, borderColor: phoneError ? '#C0392B' : '#E8E4DC' }}>
            <span style={st.phonePrefix}>+233</span>
            <input
              style={st.phoneInput}
              type="tel"
              placeholder="024 123 4567"
              value={phone}
              onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
            />
          </div>
          {phoneError && <div style={st.fieldError}>{phoneError}</div>}
          <div style={st.fieldHint}>We'll send a payment prompt to this number</div>
        </div>
      )}

      <button
        style={{ ...st.ctaBtn, opacity: network && phone ? 1 : 0.45 }}
        disabled={!network || !phone}
        onClick={handleSubmit}
      >
        Send MoMo prompt →
      </button>

      <div style={st.trustRow}>
        <span style={st.trustItem}>🔒 Secure</span>
        <span style={st.trustItem}>No card needed</span>
        <span style={st.trustItem}>Instant confirmation</span>
      </div>
    </div>
  );
}

// ─── STEP 3 — PROCESSING ─────────────────────────────────────────────────────

function StepProcessing({ donation, payment, onConfirmed, onFailed, onCancel }) {
  const [status, setStatus] = useState('waiting'); // waiting | confirmed | failed | timeout
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    // Elapsed timer
    intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    // Simulate MoMo polling — in production: GET /api/donations/{id}/status every 3s
    pollRef.current = setTimeout(() => {
      setStatus('confirmed');
      clearInterval(intervalRef.current);
      setTimeout(onConfirmed, 800);
    }, 4000);

    // Timeout at 90 seconds
    const timeout = setTimeout(() => {
      setStatus('timeout');
      clearInterval(intervalRef.current);
    }, 90000);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(pollRef.current);
      clearTimeout(timeout);
    };
  }, []);

  const network = payment.network;
  const timeLeft = Math.max(0, 90 - elapsed);

  return (
    <div style={st.stepWrap}>
      <div style={{ textAlign: 'center', padding: '16px 0' }}>

        {status === 'waiting' && (
          <>
            <div style={st.momoNetworkBadge(network?.color)}>
              <span style={{ fontWeight: 700, color: network?.textColor }}>{network?.label}</span>
            </div>

            <div style={st.processingSpinner}>
              <div style={st.spinnerRing} />
              <div style={st.spinnerRingInner} />
            </div>

            <h2 style={st.processingTitle}>Check your phone</h2>
            <p style={st.processingSub}>
              A payment prompt has been sent to <strong>{payment.phone}</strong>.<br />
              Open your {network?.label} app or dial to approve the payment.
            </p>

            <div style={st.processingAmount}>
              ₵{donation.amount.toLocaleString()}
            </div>

            <div style={st.timeoutRow}>
              <div style={st.timeoutBar}>
                <div style={{ ...st.timeoutFill, width: `${(timeLeft / 90) * 100}%` }} />
              </div>
              <div style={st.timeoutLabel}>{timeLeft}s remaining</div>
            </div>

            <button style={st.cancelBtn} onClick={onCancel}>
              Cancel payment
            </button>
          </>
        )}

        {status === 'confirmed' && (
          <>
            <div style={st.confirmedIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#0A6B4B" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{ ...st.processingTitle, color: '#0A6B4B' }}>Payment confirmed!</h2>
          </>
        )}

        {(status === 'timeout' || status === 'failed') && (
          <>
            <div style={{ ...st.confirmedIcon, background: '#FCEBEB' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h2 style={{ ...st.processingTitle, color: '#C0392B' }}>
              {status === 'timeout' ? 'Prompt timed out' : 'Payment declined'}
            </h2>
            <p style={st.processingSub}>
              {status === 'timeout'
                ? 'The payment prompt expired. No money was taken from your account.'
                : 'The payment was declined. Please check your balance and try again.'}
            </p>
            <button style={st.ctaBtn} onClick={onFailed}>Try again</button>
          </>
        )}

      </div>
    </div>
  );
}

// ─── STEP 4 — CONFIRMATION ───────────────────────────────────────────────────

function StepConfirmation({ donation, payment, campaign }) {
  const pct = Math.round(((campaign.raisedGHS + donation.amount) / campaign.goalGHS) * 100);
  const whatsappText = encodeURIComponent(
    `I just donated ₵${donation.amount} to help Ama get kidney surgery at Korle Bu. Every donation counts — here's the campaign: https://everygiving.org/campaigns/${campaign.slug}`
  );

  return (
    <div style={st.confirmWrap}>
      {/* Hero */}
      <div style={st.confirmHero}>
        <img src={campaign.image} alt="" style={st.confirmHeroImg} />
        <div style={st.confirmHeroOverlay} />
        <div style={st.confirmHeroContent}>
          <div style={st.confirmCheck}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={st.confirmTitle}>Thank you</h1>
          <p style={st.confirmAmount}>₵{donation.amount.toLocaleString()} donated</p>
        </div>
      </div>

      <div style={st.confirmBody}>

        {/* Warm glow message */}
        <div style={st.warmGlow}>
          <p style={st.warmGlowText}>
            Your donation brings Ama one step closer to surgery. {campaign.donorCount + 1} people
            — including you — have chosen to help a stranger in need. That matters.
          </p>
        </div>

        {/* New progress */}
        <div style={st.newProgress}>
          <div style={st.newProgressHeader}>
            <span style={st.newProgressRaised}>
              ₵{(campaign.raisedGHS + donation.amount).toLocaleString()} raised
            </span>
            <span style={st.newProgressPct}>{Math.min(pct, 100)}%</span>
          </div>
          <div style={st.newProgressBar}>
            <div style={{ ...st.newProgressFill, width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div style={st.newProgressSub}>of ₵{campaign.goalGHS.toLocaleString()} goal</div>
        </div>

        {/* Receipt */}
        <div style={st.receipt}>
          <div style={st.receiptTitle}>Donation receipt</div>
          {[
            { label: 'Amount', value: `₵${donation.amount.toLocaleString()}` },
            { label: 'To', value: campaign.title.slice(0, 40) + '…' },
            { label: 'Organiser', value: campaign.organiser },
            { label: payment.isDiaspora ? 'Method' : 'Paid via', value: payment.isDiaspora ? `Zeepay (${donation.currency?.code})` : payment.network?.label },
            { label: 'Status', value: 'Confirmed', green: true },
          ].map((row, i) => (
            <div key={i} style={st.receiptRow}>
              <span style={st.receiptLabel}>{row.label}</span>
              <span style={{ ...st.receiptValue, color: row.green ? '#0A6B4B' : '#1A1A18', fontWeight: row.green ? 600 : 500 }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Share CTA */}
        <div style={st.shareSection}>
          <div style={st.shareTitle}>Help Ama reach her goal</div>
          <p style={st.shareSub}>
            Sharing this campaign is as powerful as donating again. One WhatsApp message
            to 10 people could raise another ₵5,000 today.
          </p>
          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            style={st.whatsappBtn}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share on WhatsApp
          </a>
          <a href={`/campaigns/${campaign.slug}`} style={st.viewCampaignLink}>
            View campaign page →
          </a>
        </div>

        {/* Milestone note */}
        <div style={st.milestoneNote}>
          <div style={st.milestoneNoteIcon}>🎯</div>
          <div style={st.milestoneNoteText}>
            Your donation is held securely until {campaign.organiser} completes
            the next milestone and submits proof. You'll be notified of every update.
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── MAIN FLOW ────────────────────────────────────────────────────────────────

export default function DonationFlow({ campaign = MOCK_CAMPAIGN }) {
  const [step, setStep] = useState(1); // 1=amount, 2=payment, 3=processing, 4=confirmation
  const [donation, setDonation] = useState(null);
  const [payment, setPayment] = useState(null);

  const totalSteps = 4;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        input:focus{outline:none}
        button{font-family:'DM Sans',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes spinBack{to{transform:rotate(-360deg)}}
        @keyframes fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
        .step-anim{animation:fadeup .25s ease both}
      `}</style>

      {/* NAV */}
      <nav style={st.nav}>
        <a href={`/campaigns/${campaign.slug}`} style={st.navBack}>← Back to campaign</a>
        <div style={st.navLogo}>Every<span style={{ color: '#0A6B4B' }}>Giving</span></div>
        <div style={{ width: 100 }} />
      </nav>

      <div style={st.page}>

        {/* LEFT — FORM */}
        <div style={st.left}>

          {/* Progress indicator — only steps 1–3 */}
          {step < 4 && (
            <div style={st.progress}>
              {['Amount', 'Payment', 'Confirm'].map((label, i) => (
                <div key={i} style={st.progressStep}>
                  <div style={{
                    ...st.progressDot,
                    background: i + 1 < step ? '#0A6B4B' : i + 1 === step ? '#1A1A18' : '#E8E4DC',
                    color: i + 1 <= step ? '#fff' : '#8A8A82',
                  }}>
                    {i + 1 < step ? '✓' : i + 1}
                  </div>
                  <span style={{ ...st.progressLabel, color: i + 1 === step ? '#1A1A18' : '#8A8A82', fontWeight: i + 1 === step ? 600 : 400 }}>
                    {label}
                  </span>
                  {i < 2 && <div style={{ ...st.progressLine, background: i + 1 < step ? '#0A6B4B' : '#E8E4DC' }} />}
                </div>
              ))}
            </div>
          )}

          {/* Step content */}
          <div className="step-anim" key={step}>
            {step === 1 && (
              <StepAmount
                campaign={campaign}
                onNext={data => { setDonation(data); setStep(2); }}
              />
            )}
            {step === 2 && (
              <StepPayment
                donation={donation}
                campaign={campaign}
                onNext={data => { setPayment(data); setStep(3); }}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <StepProcessing
                donation={donation}
                payment={payment}
                onConfirmed={() => setStep(4)}
                onFailed={() => setStep(2)}
                onCancel={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <StepConfirmation
                donation={donation}
                payment={payment}
                campaign={campaign}
              />
            )}
          </div>
        </div>

        {/* RIGHT — CAMPAIGN SUMMARY (hidden on confirmation) */}
        {step < 4 && (
          <div style={st.right}>
            <CampaignSummary campaign={campaign} />

            <div style={st.sideFeatures}>
              {[
                { icon: '✓', title: 'Identity verified', desc: 'Kwame Mensah\'s identity has been reviewed by our team' },
                { icon: '🎯', title: 'Milestone-protected', desc: 'Funds release only when proof is submitted and approved' },
                { icon: '₵0', title: 'No platform fee', desc: 'Every cent you give goes to the campaign' },
              ].map((f, i) => (
                <div key={i} style={st.sideFeature}>
                  <div style={st.sideFeatureIcon}>{f.icon}</div>
                  <div>
                    <div style={st.sideFeatureTitle}>{f.title}</div>
                    <div style={st.sideFeatureDesc}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={st.sidePowered}>
              Payments powered by <strong>Paystack</strong> and <strong>Zeepay</strong>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const st = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: 56, background: '#fff',
    borderBottom: '1px solid #E8E4DC', position: 'sticky', top: 0, zIndex: 100,
  },
  navBack: { fontSize: 13, color: '#8A8A82', minWidth: 100 },
  navLogo: { fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#1A1A18', textAlign: 'center' },

  page: {
    maxWidth: 920, margin: '0 auto', padding: '32px 24px 64px',
    display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start',
  },
  left: {},
  right: { position: 'sticky', top: 80 },

  // Progress
  progress: {
    display: 'flex', alignItems: 'center', marginBottom: 24,
  },
  progressStep: { display: 'flex', alignItems: 'center', gap: 6 },
  progressDot: {
    width: 24, height: 24, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0, transition: 'all .2s',
  },
  progressLabel: { fontSize: 12, transition: 'all .2s' },
  progressLine: { width: 32, height: 2, borderRadius: 1, margin: '0 6px', transition: 'background .2s' },

  // Step wrapper
  stepWrap: {
    background: '#fff', border: '1px solid #E8E4DC',
    borderRadius: 16, padding: '24px 22px',
  },
  stepHeader: { marginBottom: 20 },
  stepTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#1A1A18', marginBottom: 6 },
  stepSub: { fontSize: 13, color: '#8A8A82', lineHeight: 1.6 },

  backBtn: {
    background: 'none', border: 'none', fontSize: 12, color: '#8A8A82',
    cursor: 'pointer', marginBottom: 16, padding: 0,
    fontFamily: "'DM Sans', sans-serif",
  },

  // Diaspora toggle
  diasporaToggle: {
    display: 'flex', background: '#F5F4F0', borderRadius: 10,
    padding: 3, gap: 3, marginBottom: 18,
  },
  diasporaBtn: {
    flex: 1, fontSize: 12, fontWeight: 500, padding: '8px 10px',
    borderRadius: 8, border: 'none', cursor: 'pointer',
    transition: 'all .2s', fontFamily: "'DM Sans', sans-serif",
  },

  // Currency
  currencyRow: { display: 'flex', gap: 8, marginBottom: 16 },
  currencyBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 5, padding: '9px 8px', border: '1.5px solid', borderRadius: 9,
    cursor: 'pointer', background: '#fff', transition: 'all .15s',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Presets
  presets: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 },
  presetBtn: {
    padding: '11px 8px', border: '1.5px solid', borderRadius: 9,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
  },

  // Custom input
  customWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    border: '1.5px solid #E8E4DC', borderRadius: 10,
    padding: '10px 14px', background: '#FDFAF5', marginBottom: 14,
  },
  customPrefix: { fontSize: 18, fontWeight: 600, color: '#8A8A82', flexShrink: 0 },
  customInput: {
    flex: 1, border: 'none', background: 'transparent', fontSize: 18,
    fontWeight: 600, color: '#1A1A18', fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },

  // GHS equiv
  ghsEquiv: {
    fontSize: 13, fontWeight: 600, color: '#0A6B4B',
    background: '#E8F5EF', padding: '7px 12px',
    borderRadius: 8, marginBottom: 12,
  },

  // Impact
  impactLine: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    background: '#E8F5EF', borderRadius: 9, padding: '10px 13px',
    marginBottom: 18, fontSize: 13, color: '#0A6B4B', fontWeight: 500, lineHeight: 1.55,
  },
  impactDot: {
    width: 7, height: 7, borderRadius: '50%', background: '#0A6B4B',
    flexShrink: 0, marginTop: 4,
  },

  // CTA
  ctaBtn: {
    display: 'block', width: '100%', padding: '14px',
    background: '#0A6B4B', color: '#fff', borderRadius: 10,
    fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
    marginBottom: 14, transition: 'all .15s',
    fontFamily: "'DM Sans', sans-serif",
  },

  // Trust
  trustRow: { display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  trustItem: { fontSize: 11, color: '#8A8A82' },

  // Amount summary
  amountSummary: {
    display: 'flex', alignItems: 'baseline', gap: 10,
    margin: '0 0 20px', padding: '14px 0',
    borderBottom: '1px solid #E8E4DC',
  },
  amountBig: { fontFamily: "'DM Serif Display', serif", fontSize: 36, color: '#1A1A18' },
  amountSub: { fontSize: 14, color: '#8A8A82' },

  // Network
  networkGrid: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 },
  networkBtn: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
    border: '1.5px solid', borderRadius: 10, background: '#fff',
    cursor: 'pointer', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif",
  },
  networkDot: { width: 14, height: 14, borderRadius: '50%', flexShrink: 0 },
  networkLabel: { flex: 1, fontSize: 14, fontWeight: 500, color: '#1A1A18', textAlign: 'left' },
  networkCheck: { fontSize: 14, color: '#0A6B4B', fontWeight: 700 },

  // Fields
  field: { marginBottom: 16 },
  fieldLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4A4A44', marginBottom: 6 },
  fieldInput: {
    width: '100%', padding: '11px 13px', border: '1.5px solid #E8E4DC',
    borderRadius: 9, fontSize: 14, color: '#1A1A18', background: '#fff',
    fontFamily: "'DM Sans', sans-serif",
  },
  fieldError: { fontSize: 11, color: '#C0392B', marginTop: 4 },
  fieldHint: { fontSize: 11, color: '#8A8A82', marginTop: 4 },

  // Phone
  phoneWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    border: '1.5px solid', borderRadius: 9, padding: '0 13px',
    background: '#fff', overflow: 'hidden',
  },
  phonePrefix: { fontSize: 13, color: '#8A8A82', flexShrink: 0, padding: '11px 0' },
  phoneInput: {
    flex: 1, border: 'none', padding: '11px 0', fontSize: 14,
    color: '#1A1A18', background: 'transparent', fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },

  // Zeepay note
  zeepayNote: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    background: '#E6F1FB', borderRadius: 9, padding: '11px 13px', marginBottom: 18,
  },
  zeepayNoteIcon: { fontSize: 14, color: '#185FA5', flexShrink: 0, fontWeight: 700, marginTop: 1 },
  zeepayNoteText: { fontSize: 12, color: '#185FA5', lineHeight: 1.6 },

  // Processing
  momoNetworkBadge: color => ({
    display: 'inline-block', background: color || '#E8E4DC',
    padding: '6px 16px', borderRadius: 20, marginBottom: 24,
  }),
  processingSpinner: {
    width: 64, height: 64, position: 'relative', margin: '0 auto 20px',
  },
  spinnerRing: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '3px solid #E8E4DC', borderTopColor: '#0A6B4B',
    animation: 'spin 1s linear infinite',
  },
  spinnerRingInner: {
    position: 'absolute', inset: 10, borderRadius: '50%',
    border: '2px solid #E8E4DC', borderBottomColor: '#B7DEC9',
    animation: 'spinBack 1.5s linear infinite',
  },
  processingTitle: {
    fontFamily: "'DM Serif Display', serif", fontSize: 22,
    color: '#1A1A18', marginBottom: 10,
  },
  processingSub: { fontSize: 14, color: '#4A4A44', lineHeight: 1.7, marginBottom: 20 },
  processingAmount: {
    fontFamily: "'DM Serif Display', serif", fontSize: 36,
    color: '#0A6B4B', marginBottom: 20,
  },
  timeoutRow: { marginBottom: 20 },
  timeoutBar: { height: 4, background: '#E8E4DC', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  timeoutFill: { height: '100%', background: '#0A6B4B', borderRadius: 2, transition: 'width 1s linear' },
  timeoutLabel: { fontSize: 11, color: '#8A8A82', textAlign: 'right' },
  cancelBtn: {
    background: 'none', border: 'none', fontSize: 12, color: '#C0392B',
    cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
  },
  confirmedIcon: {
    width: 60, height: 60, borderRadius: '50%', background: '#E8F5EF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', animation: 'pop .4s ease both',
  },

  // Confirmation
  confirmWrap: { background: '#fff', border: '1px solid #E8E4DC', borderRadius: 16, overflow: 'hidden' },
  confirmHero: { position: 'relative', height: 200 },
  confirmHeroImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  confirmHeroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,107,75,.85), rgba(10,107,75,.3))' },
  confirmHeroContent: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  confirmCheck: {
    width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.2)',
    border: '2px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', marginBottom: 10, animation: 'pop .4s ease both',
  },
  confirmTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#fff', marginBottom: 4 },
  confirmAmount: { fontSize: 16, color: 'rgba(255,255,255,.8)', fontWeight: 600 },

  confirmBody: { padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 },

  warmGlow: { background: '#E8F5EF', borderRadius: 10, padding: '14px 16px' },
  warmGlowText: { fontSize: 14, color: '#0A6B4B', lineHeight: 1.75, fontStyle: 'italic' },

  newProgress: { },
  newProgressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  newProgressRaised: { fontSize: 18, fontWeight: 700, color: '#1A1A18' },
  newProgressPct: { fontSize: 14, fontWeight: 600, color: '#0A6B4B' },
  newProgressBar: { height: 8, background: '#E8E4DC', borderRadius: 4, overflow: 'hidden', marginBottom: 4 },
  newProgressFill: { height: '100%', background: '#0A6B4B', borderRadius: 4, transition: 'width 1s ease' },
  newProgressSub: { fontSize: 12, color: '#8A8A82' },

  receipt: {
    background: '#FDFAF5', border: '1px solid #E8E4DC',
    borderRadius: 10, padding: '14px 16px',
  },
  receiptTitle: { fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#8A8A82', marginBottom: 10 },
  receiptRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid #E8E4DC' },
  receiptLabel: { fontSize: 12, color: '#8A8A82' },
  receiptValue: { fontSize: 13, maxWidth: '60%', textAlign: 'right', lineHeight: 1.4 },

  shareSection: { },
  shareTitle: { fontSize: 15, fontWeight: 700, color: '#1A1A18', marginBottom: 6 },
  shareSub: { fontSize: 13, color: '#4A4A44', lineHeight: 1.65, marginBottom: 14 },
  whatsappBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: '#25D366', color: '#fff', borderRadius: 10,
    padding: '12px', fontSize: 14, fontWeight: 600, marginBottom: 10,
  },
  viewCampaignLink: {
    display: 'block', textAlign: 'center', fontSize: 13,
    fontWeight: 500, color: '#0A6B4B',
  },

  milestoneNote: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    background: '#F5F4F0', borderRadius: 9, padding: '12px 14px',
  },
  milestoneNoteIcon: { fontSize: 16, flexShrink: 0 },
  milestoneNoteText: { fontSize: 12, color: '#4A4A44', lineHeight: 1.65 },

  // Campaign summary (right panel)
  campaignSummary: {
    background: '#fff', border: '1px solid #E8E4DC',
    borderRadius: 12, display: 'flex', gap: 12,
    alignItems: 'flex-start', marginBottom: 12,
  },
  summaryImg: { width: 64, height: 64, borderRadius: 8, objectFit: 'cover', flexShrink: 0 },
  summaryInfo: { flex: 1, minWidth: 0 },
  summaryCategory: { fontSize: 9, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 3 },
  summaryTitle: { fontWeight: 600, color: '#1A1A18', lineHeight: 1.35, marginBottom: 6 },
  summaryMeta: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  verifiedChip: {
    fontSize: 10, fontWeight: 700, color: '#0A6B4B',
    background: '#E8F5EF', padding: '2px 6px', borderRadius: 10,
  },
  summaryOrg: { fontSize: 11, color: '#8A8A82' },
  summaryProgress: { },
  summaryBar: { height: 4, background: '#E8E4DC', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  summaryFill: { height: '100%', background: '#0A6B4B', borderRadius: 2 },
  summaryStats: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8A8A82' },

  sideFeatures: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 },
  sideFeature: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    background: '#fff', border: '1px solid #E8E4DC',
    borderRadius: 10, padding: '11px 12px',
  },
  sideFeatureIcon: {
    width: 28, height: 28, borderRadius: '50%', background: '#E8F5EF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#0A6B4B', flexShrink: 0,
  },
  sideFeatureTitle: { fontSize: 12, fontWeight: 600, color: '#1A1A18', marginBottom: 2 },
  sideFeatureDesc: { fontSize: 11, color: '#8A8A82', lineHeight: 1.5 },

  sidePowered: { fontSize: 11, color: '#8A8A82', textAlign: 'center' },
};
