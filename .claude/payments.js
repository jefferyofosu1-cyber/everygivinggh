/**
 * EveryGiving — Payment Service Layer
 * Handles Paystack (local MoMo + card), Hubtel (USSD), and Zeepay (diaspora)
 *
 * Each provider is isolated in its own section.
 * The unified initiateDonation() function routes to the right provider
 * based on donor type. All providers funnel into the same webhook handler.
 */

const axios = require('axios');
const crypto = require('crypto');

// ─── ENV KEYS (set in .env, never hardcode) ──────────────────────────────────
const {
  PAYSTACK_SECRET_KEY,        // sk_live_xxxx  (from paystack.com/dashboard)
  HUBTEL_CLIENT_ID,           // from bo.hubtel.com/app/manage-business/programmable-keys
  HUBTEL_CLIENT_SECRET,       // from same location
  HUBTEL_ACCOUNT_NUMBER,      // your Hubtel merchant account number
  ZEEPAY_API_KEY,             // from docs.myzeepay.com
  ZEEPAY_API_SECRET,
  WEBHOOK_BASE_URL,           // e.g. https://everygiving.org/api
} = process.env;


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — PAYSTACK (local MoMo + card donations)
// Covers: MTN MoMo GH, Vodafone Cash, AirtelTigo Money, Visa, Mastercard
// Docs: https://paystack.com/docs/payments/payment-channels/
// ═══════════════════════════════════════════════════════════════════════════════

const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Paystack MoMo channel codes for Ghana
 * Pass these as mobile_money.provider in the charge body
 */
const PAYSTACK_MOMO_PROVIDERS = {
  mtn:      'mtn',       // MTN MoMo
  vodafone: 'vod',       // Vodafone Cash
  airteltigo: 'atl',     // AirtelTigo Money
};

/**
 * Initiate a local MoMo donation via Paystack
 * The donor receives a USSD prompt on their phone to approve.
 * Payment completes offline — result arrives via webhook.
 *
 * @param {Object} params
 * @param {string} params.phone        - Donor's MoMo number e.g. '0241234567'
 * @param {string} params.provider     - 'mtn' | 'vodafone' | 'airteltigo'
 * @param {number} params.amountGHS    - Amount in Ghana Cedis e.g. 50
 * @param {string} params.email        - Donor email for receipt
 * @param {string} params.campaignId   - Your internal campaign ID
 * @param {string} params.donorName    - For the transaction description
 * @returns {Promise<{reference: string, status: string}>}
 */
async function paystackChargeMoMo({ phone, provider, amountGHS, email, campaignId, donorName }) {
  const reference = `EG-${campaignId}-${Date.now()}`;
  const amountPesewas = Math.round(amountGHS * 100); // Paystack uses smallest unit

  const { data } = await paystackClient.post('/charge', {
    email,
    amount: amountPesewas,
    currency: 'GHS',
    mobile_money: {
      phone,
      provider: PAYSTACK_MOMO_PROVIDERS[provider],
    },
    reference,
    metadata: {
      campaign_id: campaignId,
      donor_name: donorName,
      platform: 'everygiving',
    },
  });

  if (!data.status) throw new Error(`Paystack charge failed: ${data.message}`);

  // data.data.status will be 'pay_offline' — final result via webhook
  return {
    reference,
    status: data.data.status,   // 'pay_offline' initially
    provider: 'paystack',
  };
}

/**
 * Initiate a card donation via Paystack (redirects to hosted checkout)
 * Used for donors who prefer Visa/Mastercard
 *
 * @param {Object} params
 * @param {number} params.amountGHS
 * @param {string} params.email
 * @param {string} params.campaignId
 * @param {string} params.donorName
 * @returns {Promise<{authorizationUrl: string, reference: string}>}
 */
async function paystackInitializeCard({ amountGHS, email, campaignId, donorName }) {
  const reference = `EG-CARD-${campaignId}-${Date.now()}`;
  const amountPesewas = Math.round(amountGHS * 100);

  const { data } = await paystackClient.post('/transaction/initialize', {
    email,
    amount: amountPesewas,
    currency: 'GHS',
    reference,
    callback_url: `${WEBHOOK_BASE_URL}/paystack/card-callback`,
    metadata: {
      campaign_id: campaignId,
      donor_name: donorName,
      platform: 'everygiving',
    },
  });

  if (!data.status) throw new Error(`Paystack initialize failed: ${data.message}`);

  return {
    authorizationUrl: data.data.authorization_url,
    reference,
    provider: 'paystack',
  };
}

/**
 * Verify a Paystack transaction by reference
 * Call this from your webhook handler to confirm payment before crediting
 *
 * @param {string} reference
 * @returns {Promise<{success: boolean, amountGHS: number, campaignId: string}>}
 */
async function paystackVerify(reference) {
  const { data } = await paystackClient.get(`/transaction/verify/${reference}`);

  if (!data.status || data.data.status !== 'success') {
    return { success: false };
  }

  return {
    success: true,
    amountGHS: data.data.amount / 100,
    campaignId: data.data.metadata?.campaign_id,
    donorName: data.data.metadata?.donor_name,
    channel: data.data.channel,
    reference,
  };
}

/**
 * Payout to a campaigner's MoMo wallet via Paystack Transfer
 * Called when a milestone is completed and verified
 *
 * @param {Object} params
 * @param {string} params.phone         - Campaigner's MoMo number
 * @param {string} params.provider      - 'mtn' | 'vodafone' | 'airteltigo'
 * @param {number} params.amountGHS
 * @param {string} params.campaignId
 * @param {string} params.milestoneId
 * @returns {Promise<{transferCode: string}>}
 */
async function paystackPayoutMoMo({ phone, provider, amountGHS, campaignId, milestoneId }) {
  const amountPesewas = Math.round(amountGHS * 100);

  // Step 1: Create a transfer recipient
  const recipientRes = await paystackClient.post('/transferrecipient', {
    type: 'mobile_money',
    name: `Campaign ${campaignId} Payout`,
    account_number: phone,
    bank_code: PAYSTACK_MOMO_PROVIDERS[provider],
    currency: 'GHS',
  });

  const recipientCode = recipientRes.data.data.recipient_code;

  // Step 2: Initiate the transfer
  const transferRes = await paystackClient.post('/transfer', {
    source: 'balance',
    amount: amountPesewas,
    recipient: recipientCode,
    reason: `EveryGiving milestone payout — Campaign ${campaignId}, Milestone ${milestoneId}`,
  });

  return {
    transferCode: transferRes.data.data.transfer_code,
    provider: 'paystack',
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — HUBTEL (USSD + checkout for feature phone users)
// Covers: donors without smartphones, lower-data environments
// Docs: https://developers.hubtel.com/docs/getting-started-with-payments
// ═══════════════════════════════════════════════════════════════════════════════

const hubtelAuth = Buffer.from(`${HUBTEL_CLIENT_ID}:${HUBTEL_CLIENT_SECRET}`).toString('base64');

const hubtelClient = axios.create({
  baseURL: 'https://api.hubtel.com',
  headers: {
    Authorization: `Basic ${hubtelAuth}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Initiate a Hubtel checkout (hosted page or USSD prompt)
 * Returns a URL the user completes on their phone.
 *
 * @param {Object} params
 * @param {string} params.phone        - Donor phone number
 * @param {number} params.amountGHS
 * @param {string} params.campaignId
 * @param {string} params.campaignTitle - Shown to donor on their phone
 * @returns {Promise<{checkoutUrl: string, clientReference: string}>}
 */
async function hubtelInitiateCheckout({ phone, amountGHS, campaignId, campaignTitle }) {
  const clientReference = `EG-HUBTEL-${campaignId}-${Date.now()}`;

  const { data } = await hubtelClient.post(
    `/v2/merchantaccount/merchants/${HUBTEL_ACCOUNT_NUMBER}/receive/mobilemoney`,
    {
      customerPhoneNumber: phone,
      customerName: 'EveryGiving Donor',
      amount: amountGHS,
      description: `Donation to: ${campaignTitle}`,
      callbackUrl: `${WEBHOOK_BASE_URL}/hubtel/callback`,
      returnUrl: `${WEBHOOK_BASE_URL}/hubtel/return?ref=${clientReference}`,
      merchantAccountNumber: HUBTEL_ACCOUNT_NUMBER,
      clientReference,
    }
  );

  return {
    checkoutUrl: data.data?.checkoutDirectUrl,
    clientReference,
    provider: 'hubtel',
  };
}

/**
 * Verify a Hubtel transaction from webhook callback
 *
 * @param {Object} webhookBody - The body Hubtel POSTs to your callback URL
 * @returns {{success: boolean, amountGHS: number, campaignId: string}}
 */
function hubtelVerifyWebhook(webhookBody) {
  // Hubtel sends ResponseCode '0000' for success
  const success = webhookBody?.Data?.ResponseCode === '0000';

  if (!success) return { success: false };

  const ref = webhookBody.Data.ClientReference || '';
  // Reference format: EG-HUBTEL-{campaignId}-{timestamp}
  const campaignId = ref.split('-')[2] || null;

  return {
    success: true,
    amountGHS: webhookBody.Data?.Amount,
    campaignId,
    reference: ref,
    provider: 'hubtel',
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — ZEEPAY (diaspora donations: GBP/USD/EUR → GHS MoMo)
// Covers: Ghanaians in UK, US, Europe donating to campaigns back home
// Docs: https://docs.myzeepay.com
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate Zeepay request signature
 * Zeepay uses HMAC-SHA256 for request authentication
 */
function zeepaySignature(payload) {
  return crypto
    .createHmac('sha256', ZEEPAY_API_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
}

const zeepayClient = axios.create({
  baseURL: 'https://api.myzeepay.com/v1',
  headers: {
    'X-API-Key': ZEEPAY_API_KEY,
    'Content-Type': 'application/json',
  },
});

/**
 * Initiate a diaspora donation via Zeepay
 * Donor is abroad (GBP/USD/EUR), funds land on campaigner's GHS MoMo wallet
 *
 * @param {Object} params
 * @param {string} params.senderCurrency   - 'GBP' | 'USD' | 'EUR'
 * @param {number} params.senderAmount     - Amount in sender's currency
 * @param {string} params.recipientPhone   - Campaigner's Ghana MoMo number
 * @param {string} params.recipientNetwork - 'MTN' | 'VODAFONE' | 'AIRTELTIGO'
 * @param {string} params.campaignId
 * @param {string} params.donorName
 * @returns {Promise<{reference: string, paymentUrl: string, exchangeRate: number}>}
 */
async function zeepayInitiateDiasporaDonation({
  senderCurrency,
  senderAmount,
  recipientPhone,
  recipientNetwork,
  campaignId,
  donorName,
}) {
  const reference = `EG-ZEEPAY-${campaignId}-${Date.now()}`;

  const payload = {
    reference,
    sender: {
      currency: senderCurrency,
      amount: senderAmount,
      name: donorName,
    },
    recipient: {
      country: 'GH',
      phone: recipientPhone,
      network: recipientNetwork,
      currency: 'GHS',
    },
    purpose: 'DONATION',
    description: `EveryGiving donation — Campaign ${campaignId}`,
    callbackUrl: `${WEBHOOK_BASE_URL}/zeepay/callback`,
    metadata: {
      campaign_id: campaignId,
      platform: 'everygiving',
    },
  };

  const signature = zeepaySignature(payload);

  const { data } = await zeepayClient.post('/remittance/initiate', payload, {
    headers: { 'X-Signature': signature },
  });

  return {
    reference,
    paymentUrl: data.data?.paymentUrl,   // URL where diaspora donor completes payment
    exchangeRate: data.data?.exchangeRate,
    estimatedGHS: data.data?.recipientAmount,
    provider: 'zeepay',
  };
}

/**
 * Verify a Zeepay webhook callback
 *
 * @param {string} receivedSignature  - From X-Signature header
 * @param {Object} body               - Raw webhook body
 * @returns {{valid: boolean, success: boolean, campaignId: string}}
 */
function zeepayVerifyWebhook(receivedSignature, body) {
  const expectedSignature = zeepaySignature(body);
  const valid = crypto.timingSafeEqual(
    Buffer.from(receivedSignature),
    Buffer.from(expectedSignature)
  );

  if (!valid) return { valid: false };

  const success = body?.status === 'COMPLETED';
  const campaignId = body?.metadata?.campaign_id || null;

  return {
    valid: true,
    success,
    campaignId,
    amountGHS: body?.recipientAmount,
    senderAmount: body?.senderAmount,
    senderCurrency: body?.senderCurrency,
    reference: body?.reference,
    provider: 'zeepay',
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — UNIFIED ROUTER
// Single entry point that routes to the right provider based on donor context
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Route map for deciding which provider to use
 *
 * Local smartphone user  → Paystack MoMo
 * Local feature phone    → Hubtel USSD checkout
 * Card preference        → Paystack card
 * Abroad donor           → Zeepay diaspora
 */
const PROVIDER_ROUTE = {
  local_momo:    paystackChargeMoMo,
  local_ussd:    hubtelInitiateCheckout,
  local_card:    paystackInitializeCard,
  diaspora:      zeepayInitiateDiasporaDonation,
};

/**
 * Unified donation initiator — call this from your API route
 *
 * @param {string} donorType  - 'local_momo' | 'local_ussd' | 'local_card' | 'diaspora'
 * @param {Object} params     - Provider-specific params (see individual functions)
 * @returns {Promise<Object>} - Provider response with reference and next step
 */
async function initiateDonation(donorType, params) {
  const handler = PROVIDER_ROUTE[donorType];
  if (!handler) throw new Error(`Unknown donor type: ${donorType}`);

  try {
    return await handler(params);
  } catch (err) {
    // Wrap provider errors with context for your error logger
    throw new Error(`[${donorType}] Payment initiation failed: ${err.message}`);
  }
}


// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — WEBHOOK HANDLER
// Single endpoint that processes callbacks from all three providers
// Mount at: POST /api/payments/webhook
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verify Paystack webhook signature
 * Paystack signs payloads with HMAC-SHA512 using your secret key
 */
function verifyPaystackWebhook(signature, rawBody) {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

/**
 * Unified webhook processor
 * Identifies the provider from headers/body and routes to the right verifier.
 * Returns a standardised result your app can use to credit the campaign.
 *
 * @param {Object} req - Express request object (needs rawBody for sig verification)
 * @returns {{provider: string, success: boolean, campaignId: string, amountGHS: number}}
 */
async function processWebhook(req) {
  const { headers, body } = req;

  // ── Paystack ──────────────────────────────────────────────────────────────
  if (headers['x-paystack-signature']) {
    const valid = verifyPaystackWebhook(headers['x-paystack-signature'], req.rawBody);
    if (!valid) throw new Error('Invalid Paystack webhook signature');

    if (body.event === 'charge.success') {
      const result = await paystackVerify(body.data.reference);
      return { ...result, provider: 'paystack', event: 'charge.success' };
    }

    if (body.event === 'transfer.success') {
      return {
        provider: 'paystack',
        event: 'transfer.success',
        success: true,
        transferCode: body.data.transfer_code,
        amountGHS: body.data.amount / 100,
      };
    }

    return { provider: 'paystack', success: false, event: body.event };
  }

  // ── Hubtel ────────────────────────────────────────────────────────────────
  if (body?.Data?.ClientReference?.startsWith('EG-HUBTEL-')) {
    return hubtelVerifyWebhook(body);
  }

  // ── Zeepay ────────────────────────────────────────────────────────────────
  if (headers['x-zeepay-signature']) {
    return zeepayVerifyWebhook(headers['x-zeepay-signature'], body);
  }

  throw new Error('Unknown webhook source');
}


// ─── EXPORTS ─────────────────────────────────────────────────────────────────
module.exports = {
  // Initiation
  initiateDonation,
  paystackChargeMoMo,
  paystackInitializeCard,
  hubtelInitiateCheckout,
  zeepayInitiateDiasporaDonation,

  // Payouts
  paystackPayoutMoMo,

  // Verification
  paystackVerify,
  hubtelVerifyWebhook,
  zeepayVerifyWebhook,

  // Webhook
  processWebhook,
};
