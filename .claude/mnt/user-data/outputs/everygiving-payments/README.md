# EveryGiving — Payment Integration Layer

Three payment providers, one unified interface.

## Providers & Their Roles

| Provider | Donor Type | What It Covers |
|---|---|---|
| **Paystack** | Local (smartphone) | MTN MoMo, Vodafone Cash, AirtelTigo, Visa, Mastercard |
| **Hubtel** | Local (feature phone) | USSD checkout — no smartphone or data needed |
| **Zeepay** | Diaspora (abroad) | GBP/USD/EUR → GHS MoMo — Ghanaians sending from UK/US/Europe |

## How Money Flows

```
Donor → [Paystack / Hubtel / Zeepay] → Webhook → Campaign escrow → Milestone payout → Campaigner MoMo
```

All three providers notify your server via webhook when a payment completes.
Your server credits the campaign only after webhook verification.
Payouts to campaigners happen via Paystack Transfer when a milestone is confirmed.

## Setup

### 1. Install dependencies
```bash
npm install axios
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your real API keys
```

### 3. Mount the router in your Express app
```js
// app.js
const paymentsRouter = require('./src/routes');

// Raw body middleware for /webhook (Paystack signature verification needs this)
app.use('/api/payments/webhook', express.raw({ type: '*/*' }));

// JSON for all other routes
app.use(express.json());

// Mount payment routes
app.use('/api/payments', paymentsRouter);
```

### 4. Register your webhook URLs with each provider

| Provider | Where to set it | URL |
|---|---|---|
| Paystack | Dashboard → Settings → API Keys & Webhooks | `https://everygiving.org/api/payments/webhook` |
| Hubtel | `callbackUrl` in each request (already set in code) | Auto-configured |
| Zeepay | `callbackUrl` in each request (already set in code) | Auto-configured |

### 5. Test locally with ngrok
```bash
npx ngrok http 3000
# Copy the HTTPS URL and set WEBHOOK_BASE_URL in .env
```

## API Reference

### POST /api/payments/donate

**Local MoMo (Paystack)**
```json
{
  "donorType": "local_momo",
  "phone": "0241234567",
  "provider": "mtn",
  "amountGHS": 200,
  "email": "kofi@example.com",
  "campaignId": "abc123",
  "donorName": "Kofi Asante"
}
```
Response: `{ "reference": "EG-abc123-1234567890", "status": "pay_offline", "provider": "paystack" }`
Donor receives USSD prompt on their phone. Final result via webhook.

**Local Card (Paystack)**
```json
{
  "donorType": "local_card",
  "amountGHS": 200,
  "email": "kofi@example.com",
  "campaignId": "abc123",
  "donorName": "Kofi Asante"
}
```
Response: `{ "authorizationUrl": "https://checkout.paystack.com/xxx", "reference": "EG-CARD-abc123-..." }`
Redirect donor to authorizationUrl.

**USSD / Feature phone (Hubtel)**
```json
{
  "donorType": "local_ussd",
  "phone": "0241234567",
  "amountGHS": 50,
  "campaignId": "abc123",
  "campaignTitle": "Help Ama get surgery"
}
```
Response: `{ "checkoutUrl": "https://checkout.hubtel.com/xxx", "clientReference": "EG-HUBTEL-..." }`

**Diaspora (Zeepay)**
```json
{
  "donorType": "diaspora",
  "senderCurrency": "GBP",
  "senderAmount": 20,
  "recipientPhone": "0551234567",
  "recipientNetwork": "MTN",
  "campaignId": "abc123",
  "donorName": "Kwame Mensah"
}
```
Response: `{ "paymentUrl": "https://pay.myzeepay.com/xxx", "exchangeRate": 18.5, "estimatedGHS": 370 }`
Redirect diaspora donor to paymentUrl.

### POST /api/payments/payout
Releases milestone funds to campaigner. Protect with admin auth.
```json
{
  "campaignId": "abc123",
  "milestoneId": "ms_001",
  "phone": "0551234567",
  "provider": "mtn",
  "amountGHS": 5000
}
```

### GET /api/payments/verify/:reference
Poll payment status. Useful while waiting for webhook confirmation.

## Obtaining API Access

### Paystack
1. Sign up at paystack.com/gh
2. Complete business verification
3. Get keys from Dashboard → Settings → API Keys

### Hubtel
1. Register as a merchant at hubtel.com
2. Email support@hubtel.com requesting API access
3. They will assign an account agent
4. Keys available at bo.hubtel.com/app/manage-business/programmable-keys

### Zeepay
1. Apply at docs.myzeepay.com
2. Zeepay is wholly Ghanaian-owned — emphasise your Ghana focus in the application
3. They have a dedicated developer portal for fintech integrations
