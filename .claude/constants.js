/**
 * EveryGiving — Central constants
 *
 * Images: Unsplash source API — free, no API key needed, auto-resized
 * Format: https://source.unsplash.com/WxWxW×H/?keyword,keyword
 *
 * Fees: Updated to 2.5% + ₵0.50 per transaction
 * IMPORTANT: Fee details are NEVER shown to donors in the giving flow.
 * They are only surfaced when a user explicitly visits /fees.
 * Campaigners see fees in their dashboard after funds are received.
 */

// ─── FEE CONSTANTS ────────────────────────────────────────────────────────────

export const FEE_RATE = 0.025;          // 2.5%
export const FEE_FLAT = 0.50;           // ₵0.50
export const PLATFORM_FEE = 0;          // ₵0 always

/**
 * Calculate what a campaigner receives from a single donation
 * Only used on /fees page and campaigner dashboard — never in donor-facing UI
 */
export function calcFee(donationGHS) {
  const d = parseFloat(donationGHS) || 0;
  if (d <= 0) return { donation: 0, fee: 0, received: 0, feeRate: 0 };
  const fee = parseFloat((d * FEE_RATE + FEE_FLAT).toFixed(2));
  const received = parseFloat((d - fee).toFixed(2));
  const feeRate = parseFloat(((fee / d) * 100).toFixed(1));
  return { donation: d, fee, received, feeRate };
}

/**
 * Calculate total fees across a full campaign
 * Only used on /fees page — never in donor-facing UI
 */
export function calcCampaignFees(goalGHS, avgDonationGHS = 100) {
  const goal = parseFloat(goalGHS) || 0;
  const avg = parseFloat(avgDonationGHS) || 100;
  if (goal <= 0) return null;
  const donations = Math.round(goal / avg);
  const totalFees = parseFloat((donations * (avg * FEE_RATE + FEE_FLAT)).toFixed(2));
  const totalReceived = parseFloat((goal - totalFees).toFixed(2));
  const feeRate = parseFloat(((totalFees / goal) * 100).toFixed(1));
  return { goal, avg, donations, totalFees, totalReceived, feeRate };
}


// ─── IMAGE LIBRARY ────────────────────────────────────────────────────────────
// All images from Unsplash source API — free, no attribution required for UI use
// Resolution format: ?w=WIDTH&q=QUALITY&auto=format&fit=crop
// Use &w=1200 for heroes, &w=600 for cards, &w=480 for thumbnails

export const IMAGES = {

  // ── HOMEPAGE ────────────────────────────────────────────────────────────────
  hero: {
    // Warm community gathering — Ghanaian feel
    main: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1200&q=90&auto=format&fit=crop',
    // Person with phone — mobile money context
    mobile: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80&auto=format&fit=crop',
    // Community helping hands
    community: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=85&auto=format&fit=crop',
  },

  // ── CAMPAIGN CATEGORIES ──────────────────────────────────────────────────────
  categories: {
    medical: {
      // Hospital / healthcare — warm, human
      card: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=85&auto=format&fit=crop',
    },
    education: {
      // Students learning / classroom
      card: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&q=85&auto=format&fit=crop',
    },
    emergency: {
      // Helping hands, urgent
      card: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=900&q=85&auto=format&fit=crop',
    },
    faith: {
      // Church / worship space
      card: 'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=900&q=85&auto=format&fit=crop',
    },
    community: {
      // Community gathering / people together
      card: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&q=85&auto=format&fit=crop',
    },
    funeral: {
      // Flowers / memorial
      card: 'https://images.unsplash.com/photo-1477768663691-75d0040e5af0?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1477768663691-75d0040e5af0?w=900&q=85&auto=format&fit=crop',
    },
    family: {
      // Family together
      card: 'https://images.unsplash.com/photo-1520350094754-f0fdcac35c1c?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1520350094754-f0fdcac35c1c?w=900&q=85&auto=format&fit=crop',
    },
    sports: {
      // Football / sports
      card: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=900&q=85&auto=format&fit=crop',
    },
    volunteer: {
      // Volunteers working
      card: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=85&auto=format&fit=crop',
    },
    business: {
      // Market / small business
      card: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85&auto=format&fit=crop',
    },
    wedding: {
      // Wedding celebration
      card: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85&auto=format&fit=crop',
    },
    memorial: {
      // Candles / remembrance
      card: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=900&q=85&auto=format&fit=crop',
    },
    animals: {
      // Animals
      card: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900&q=85&auto=format&fit=crop',
    },
    arts: {
      // Art / creative
      card: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=85&auto=format&fit=crop',
    },
    environment: {
      // Nature / green
      card: 'https://images.unsplash.com/photo-1542601906897-ecea6e4e2ecc?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1542601906897-ecea6e4e2ecc?w=900&q=85&auto=format&fit=crop',
    },
    technology: {
      // Laptop / tech
      card: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=85&auto=format&fit=crop',
    },
    other: {
      // Helping hands
      card: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=480&q=80&auto=format&fit=crop',
      hero: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=900&q=85&auto=format&fit=crop',
    },
  },

  // ── HOW IT WORKS ─────────────────────────────────────────────────────────────
  howItWorks: {
    createCampaign: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop',
    verifyId: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80&auto=format&fit=crop',
    shareAndReceive: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&q=80&auto=format&fit=crop',
  },

  // ── ABOUT PAGE ───────────────────────────────────────────────────────────────
  about: {
    team: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=85&auto=format&fit=crop',
    accra: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=900&q=85&auto=format&fit=crop',
    community: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=900&q=85&auto=format&fit=crop',
  },
};

// ─── FEE DISPLAY RULES ────────────────────────────────────────────────────────
/**
 * WHERE FEES ARE SHOWN — strict rule:
 *
 * SHOW fees:
 *   - /fees page (full calculator and breakdown)
 *   - Campaigner dashboard (after donations received, as deducted amount)
 *   - Campaign creation flow step 6 review (brief note: "small processing fee applies")
 *
 * NEVER show fees:
 *   - Campaign page (donor view)
 *   - Donation flow / checkout
 *   - Browse campaigns
 *   - Homepage
 *   - Any donor-facing notification or receipt
 *   - Category pages
 *
 * If a donor asks "are there fees?", direct them to /fees
 * The donate button text is always "Donate ₵X" — never "Donate ₵X + fee"
 */
export const FEE_DISPLAY_RULES = {
  showOnDonorPages: false,
  showOnCampaignerDashboard: true,
  showOnFeesPage: true,
  showOnCreationReview: true, // brief note only, not full calc
  donorReceiptNote: false,    // receipt shows amount given, not fee deducted
};
