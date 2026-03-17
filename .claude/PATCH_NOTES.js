/**
 * EveryGiving — Update Patch
 * Three changes applied across all public screens
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGE 1: Fee structure updated
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Old: 2% + ₵0.25 per transaction
 * New: 2.5% + ₵0.50 per transaction
 *
 * Files to update:
 *   - constants.js          → FEE_RATE = 0.025, FEE_FLAT = 0.50
 *   - Fees.jsx              → All calculator logic + display text
 *   - Homepage.jsx          → Hero trust bar (₵0 platform fee stays, no tx fee shown)
 *   - HowItWorks.jsx        → No fee numbers shown (donor-safe already)
 *   - About.jsx             → "2% + ₵0.25" text in social enterprise section
 *
 * Example outputs with new fees:
 *   ₵50 donation  → fee = ₵1.75 → campaigner receives ₵48.25
 *   ₵100 donation → fee = ₵3.00 → campaigner receives ₵97.00
 *   ₵200 donation → fee = ₵5.50 → campaigner receives ₵194.50
 *   ₵500 donation → fee = ₵13.00 → campaigner receives ₵487.00
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGE 2: Fee visibility — donors never see transaction fees
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * RULE: Transaction fees (2.5% + ₵0.50) are NEVER shown to donors
 * unless they explicitly navigate to /fees.
 *
 * Pages where fees are SHOWN (campaigner/admin context only):
 *   /fees                   → Full calculator, breakdown, comparison table
 *   /dashboard              → Deducted amount shown after donation confirmed
 *   /create (step 7 only)   → Brief note: "A small processing fee applies"
 *
 * Pages where fees are NEVER shown (donor-facing):
 *   / (homepage)            → Only "₵0 platform fee" messaging shown
 *   /campaigns              → No fee mention anywhere
 *   /campaigns/[slug]       → No fee on donate card, no fee in trust signals
 *   /campaigns/[slug]/donate → No fee in checkout flow
 *   /donate/success         → Receipt shows amount given, not fee deducted
 *   /how-it-works           → No fee numbers (already compliant)
 *   /about                  → Only "₵0 platform fee" and "2.5% + ₵0.50"
 *                             mentioned in context of business model, not donor UX
 *   /fundraising-categories → No fee mention
 *
 * Donor trust signals that ARE shown (fee-neutral messaging):
 *   ✓ Secure
 *   ✓ Verified campaign
 *   ✓ Milestone-protected
 *   ✓ ₵0 platform fee        ← This is fine — it's true and reassuring
 *
 * Donor trust signals that are NEVER shown:
 *   ✗ "2.5% + ₵0.50 per donation"
 *   ✗ "fee deducted from your donation"
 *   ✗ Any fee calculation or breakdown
 *
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CHANGE 3: Real photography replacing emoji placeholders
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * All emoji category placeholders replaced with Unsplash photography.
 * Image format: https://images.unsplash.com/photo-ID?w=WIDTH&q=80&auto=format&fit=crop
 * All images are free for commercial use (Unsplash License).
 *
 * Category images (card size 480px, hero size 900px):
 *
 *   medical:     photo-1576091160550-2173dba999ef  (hospital/healthcare)
 *   education:   photo-1509062522246-3755977927d7  (students/classroom)
 *   emergency:   photo-1532629345422-7515f3d16bb6  (helping hands)
 *   faith:       photo-1519491050282-cf00c82424c4  (church/worship)
 *   community:   photo-1593113598332-cd288d649433  (community gathering)
 *   funeral:     photo-1477768663691-75d0040e5af0  (flowers/memorial)
 *   family:      photo-1520350094754-f0fdcac35c1c  (family together)
 *   sports:      photo-1459865264687-595d652de67e  (football/sport)
 *   volunteer:   photo-1488521787991-ed7bbaae773c  (volunteers)
 *   business:    photo-1556742049-0cfed4f6a45d    (market/business)
 *   wedding:     photo-1519741497674-611481863552  (wedding)
 *   memorial:    photo-1522075469751-3a6694fb2f61  (candles)
 *   animals:     photo-1548199973-03cce0bbc87b    (animals)
 *   arts:        photo-1513364776144-60967b0f800f  (art/creative)
 *   environment: photo-1542601906897-ecea6e4e2ecc  (nature/green)
 *   technology:  photo-1531482615713-2afd69097998  (laptop/tech)
 *   other:       photo-1469571486292-0ba58a3f068b  (helping hands)
 *
 * Homepage images:
 *   hero:        photo-1531123897727-8f129e1688ce  (community gathering)
 *   how-step-1:  photo-1556742049-0cfed4f6a45d    (create)
 *   how-step-2:  photo-1580060839134-75a5edca2e99  (verify/phone)
 *   how-step-3:  photo-1532629345422-7515f3d16bb6  (share/receive)
 *
 * Implementation notes:
 *   - Use loading="lazy" on all non-hero images
 *   - Hero images use loading="eager" for LCP performance
 *   - Always include alt="" or descriptive alt text
 *   - Overlay gradients remain on category cards for text readability
 *   - Image aspect ratios: cards 16:9 at 150px height, heroes variable
 */

export const PATCH_VERSION = '1.1.0';
export const PATCH_DATE = '2026-03-16';
export const PATCH_CHANGES = [
  'Fee rate updated: 2% + ₵0.25 → 2.5% + ₵0.50',
  'Transaction fees hidden from all donor-facing pages',
  'Fees only visible on /fees page and campaigner dashboard',
  'All emoji category images replaced with Unsplash photography',
  'Homepage hero updated with real photography',
  'How It Works steps updated with real photography',
];
