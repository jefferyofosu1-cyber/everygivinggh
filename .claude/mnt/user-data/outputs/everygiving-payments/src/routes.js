/**
 * EveryGiving — Payment API Routes
 * Mount these in your main Express app: app.use('/api/payments', paymentsRouter)
 *
 * Routes:
 *   POST /api/payments/donate         — Initiate any donation
 *   POST /api/payments/webhook        — Receive callbacks from all 3 providers
 *   POST /api/payments/payout         — Release milestone funds to campaigner
 *   GET  /api/payments/verify/:ref    — Check a specific payment status
 */

const express = require('express');
const router = express.Router();
const {
  initiateDonation,
  paystackVerify,
  paystackPayoutMoMo,
  processWebhook,
} = require('./payments');

// Import your campaign model (adjust path to match your project)
// const Campaign = require('../models/Campaign');
// const Donation = require('../models/Donation');


// ─── POST /donate ─────────────────────────────────────────────────────────────
// Frontend calls this to kick off any donation.
// Body shape varies by donorType — see the unified router in payments.js
//
// Example body for local MoMo:
// {
//   "donorType": "local_momo",
//   "phone": "0241234567",
//   "provider": "mtn",
//   "amountGHS": 200,
//   "email": "kofi@example.com",
//   "campaignId": "abc123",
//   "donorName": "Kofi Asante"
// }
//
// Example body for diaspora:
// {
//   "donorType": "diaspora",
//   "senderCurrency": "GBP",
//   "senderAmount": 20,
//   "recipientPhone": "0551234567",
//   "recipientNetwork": "MTN",
//   "campaignId": "abc123",
//   "donorName": "Kwame Mensah"
// }

router.post('/donate', async (req, res) => {
  const { donorType, ...params } = req.body;

  if (!donorType) {
    return res.status(400).json({ success: false, error: 'donorType is required' });
  }

  try {
    const result = await initiateDonation(donorType, params);

    // Log pending donation to your DB here
    // await Donation.create({ ...params, reference: result.reference, status: 'pending' });

    // For local MoMo — donor gets a USSD prompt, nothing to redirect
    // For card — redirect donor to result.authorizationUrl
    // For diaspora — redirect donor to result.paymentUrl
    res.json({ success: true, ...result });

  } catch (err) {
    console.error('[/donate]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ─── POST /webhook ────────────────────────────────────────────────────────────
// Receives callbacks from Paystack, Hubtel, and Zeepay.
// Use express.raw() for the raw body (needed for Paystack signature verification).
// In your main app.js:
//   app.use('/api/payments/webhook', express.raw({ type: '*/*' }), paymentsRouter);
//
// For all other routes, use express.json() as normal.

router.post('/webhook', async (req, res) => {
  // Parse body if it came in as a Buffer (raw middleware)
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body;
    req.body = JSON.parse(req.body.toString());
  }

  try {
    const result = await processWebhook(req);

    if (result.success && result.campaignId) {
      // ── Credit the campaign ─────────────────────────────────────────────
      // 1. Find the pending donation by reference
      // 2. Mark it as confirmed
      // 3. Add amountGHS to campaign.raisedAmount
      // 4. Check if current milestone is now fully funded
      // 5. If yes, notify campaigner and trigger payout flow

      console.log(`[WEBHOOK] ✓ ${result.provider} — Campaign ${result.campaignId} — GHS ${result.amountGHS}`);

      // await Donation.updateOne({ reference: result.reference }, { status: 'confirmed' });
      // await Campaign.incrementRaised(result.campaignId, result.amountGHS);
      // await checkMilestoneCompletion(result.campaignId);
    }

    // Always return 200 to acknowledge receipt — even on failures
    // If you return non-200, providers will retry the webhook repeatedly
    res.sendStatus(200);

  } catch (err) {
    console.error('[/webhook]', err.message);
    // Still return 200 — log the error internally but don't trigger retries
    res.sendStatus(200);
  }
});


// ─── POST /payout ─────────────────────────────────────────────────────────────
// Admin-triggered or automatic: release milestone funds to campaigner's MoMo.
// Should be protected — only callable by your backend after milestone verification.
//
// Body:
// {
//   "campaignId": "abc123",
//   "milestoneId": "ms_001",
//   "phone": "0551234567",
//   "provider": "mtn",
//   "amountGHS": 5000
// }

router.post('/payout', async (req, res) => {
  const { campaignId, milestoneId, phone, provider, amountGHS } = req.body;

  // TODO: Add admin auth middleware to protect this route
  // if (!req.isAdmin) return res.status(403).json({ error: 'Forbidden' });

  try {
    const result = await paystackPayoutMoMo({
      phone,
      provider,
      amountGHS,
      campaignId,
      milestoneId,
    });

    // await Milestone.updateOne({ id: milestoneId }, { status: 'released', transferCode: result.transferCode });

    res.json({ success: true, ...result });

  } catch (err) {
    console.error('[/payout]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ─── GET /verify/:reference ───────────────────────────────────────────────────
// Frontend can poll this to check if a payment has confirmed.
// Useful for the post-donation screen while waiting for the webhook.

router.get('/verify/:reference', async (req, res) => {
  const { reference } = req.params;

  try {
    // Route to the right verifier based on reference prefix
    let result;
    if (reference.startsWith('EG-CARD-') || reference.startsWith('EG-')) {
      result = await paystackVerify(reference);
    } else {
      return res.status(400).json({ success: false, error: 'Unknown reference format' });
    }

    res.json({ success: true, ...result });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
