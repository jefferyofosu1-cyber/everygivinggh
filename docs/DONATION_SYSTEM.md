# Automated Donation Processing & Fund Distribution System
## EveryGiving Fintech Infrastructure

**Status**: Production Ready  
**Last Updated**: March 19, 2026  
**Version**: 1.0.0

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Fee Structure](#fee-structure)
4. [Payment Flow](#payment-flow)
5. [Fund Distribution](#fund-distribution)
6. [Database Schema](#database-schema)
7. [API Reference](#api-reference)
8. [Security](#security)
9. [Edge Cases & Handling](#edge-cases--handling)
10. [Monitoring & Debugging](#monitoring--debugging)
11. [Testing](#testing)

---

## System Overview

### 🎯 Objective

Create a zero-manual donation processing system where:
- Donations are processed in real-time via Paystack
- Transaction fees (2.9% + GHS 0.50) are deducted automatically
- Funds are split and sent directly to fundraiser subaccounts
- Campaign balances update instantly
- All operations are tracked in a transaction ledger

### ✨ Key Features

✅ **Instant Payment Processing**
- Integration with Paystack payment gateway
- Support for Cards, Mobile Money, Bank Transfers
- Real-time transaction verification

✅ **Automatic Fee Deduction**
- Consistent fee model: 2.9% + GHS 0.50 (flat)
- Proper amount conversion (GHS ↔ Pesewas)
- Accurate rounding to 2 decimal places

✅ **Subaccount-Based Fund Splitting**
- Each fundraiser has a unique Paystack subaccount
- Auto-created when fundraiser adds payout details
- Funds route directly to fundraiser account

✅ **Real-Time Campaign Updates**
- Campaign balances update via database trigger
- Donor count tracked automatically
- Progress displayed in real-time

✅ **Transaction Ledger**
- Complete audit trail of all movements
- Fee tracking separate from net amounts
- Reverse ability for refunds

✅ **Comprehensive Notifications**
- Donation confirmation emails
- Milestone alerts (25%, 50%, 100%)
- Campaign update broadcasts

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                          │
│            Donation Form → Fee Calculation Display              │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│        /api/paystack/initialize (Payment Init)                  │
│  • Convert GHS to Pesewas                                       │
│  • Calculate transaction fee                                    │
│  • Create pending donation record                               │
│  • Initialize Paystack payment with subaccount                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ⬇ (Redirect User)
                     
┌─────────────────────────────────────────────────────────────────┐
│              Paystack Checkout (Third Party)                    │
│    User enters payment details & completes transaction          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ⬇ (Paystack Webhook POST)
                     
┌────────────────────▼────────────────────────────────────────────┐
│     /api/webhooks/paystack (Payment Confirmation)               │
│  • Verify webhook signature (HMAC-SHA512)                       │
│  • Check for duplicate processing                               │
│  • Update donation status → completed                           │
│  • Create transaction ledger entries                            │
│  • Update campaign totals (via trigger)                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────────┐
│         Database Triggers & Notifications                       │
│  • Campaign totals update automatically                         │
│  • Send donation confirmation email                             │
│  • Check & send milestone alerts                                │
│  • Create transaction ledger entries                            │
└─────────────────────────────────────────────────────────────────┘
```

### Database Flow

```
donations (pending)
    ↓
[Payment at Paystack]
    ↓
donations (completed) → [Trigger: update campaign]
    ↓
transaction_ledger (fee, net_amount)
    ↓
[Notifications Sent]
    ↓
fund_distributions (record for batch processing)
```

---

## Fee Structure

### Fee Calculation Formula

```
transaction_fee_ghs = (amount_ghs × 0.029) + 0.50

Example:
- Donation: GHS 100.00
- Fee: (100 × 0.029) + 0.50 = GHS 3.40
- Net to Fundraiser: GHS 96.60
```

### Conversion Rules

```
GHS to Pesewas: amount_ghs × 100
Pesewas to GHS: amount_pesewas ÷ 100

Always round to 2 decimal places using Math.round()

Examples:
- GHS 100.00 = 10,000 pesewas
- GHS 3.99 = 399 pesewas
- 399 pesewas = GHS 3.99
```

### Fee Breakdown Transparency

For donor of GHS 100:
```
Donation Amount:     GHS 100.00
Transaction Fee:     GHS 3.40 (2.9% + GHS 0.50)
───────────────────────────────
Funds to Fundraiser: GHS 96.60
```

---

## Payment Flow

### Step 1: Donation Form Submission

**Endpoint**: `POST /api/paystack/initialize`

**Request**:
```json
{
  "amount": 100.00,           // GHS
  "email": "donor@example.com",
  "campaignId": "UUID",
  "donorName": "John Doe",
  "donorId": "UUID"           // Optional, for registered users
}
```

**Validation**:
- Amount: 1 ≤ amount ≤ 10,000
- Email: Valid format
- Campaign ID: Exists in database
- Email uniqueness: Not required

**Processing**:

```typescript
1. Convert amount to pesewas: 100 × 100 = 10,000
2. Calculate fee: (10,000 × 0.029) + 50 = 340 pesewas (GHS 3.40)
3. Calculate net: 10,000 - 340 = 9,660 pesewas
4. Generate reference: EVG_1710828000_ABC123
5. Create pending donation record
6. Initialize Paystack payment with subaccount
```

**Response**:
```json
{
  "success": true,
  "donation": {
    "id": "UUID",
    "reference": "EVG_1710828000_ABC123",
    "amount": 100.00,
    "transactionFee": "3.40",
    "netAmount": "96.60"
  },
  "payment": {
    "accessCode": "ACCESS_CODE",
    "authorizationUrl": "https://checkout.paystack.com/ACCESS_CODE"
  },
  "campaign": {
    "title": "Help Build a School"
  }
}
```

### Step 2: Paystack Checkout

User is redirected to Paystack's hosted checkout page where they:
1. Enter payment details (card, mobile money, etc.)
2. Complete payment
3. Are redirected back to success page

### Step 3: Webhook Processing

When Paystack sends webhook event:

**Webhook Format**:
```json
{
  "event": "charge.success",
  "data": {
    "reference": "EVG_1710828000_ABC123",
    "amount": 10000,
    "paid_at": "2026-03-19T12:00:00.000Z",
    "metadata": {
      "donation_id": "UUID",
      "campaign_id": "UUID",
      "campaign_title": "Help Build a School",
      "transaction_fee": 340,
      "net_amount": 9660
    }
  }
}
```

**Processing Steps**:

```typescript
1. Verify HMAC-SHA512 signature
2. Check for duplicate (prevent reprocessing)
3. Update donation.status = 'completed'
4. Create transaction_ledger entries:
   - Fee entry: 340 pesewas to EveryGiving
   - Net entry: 9,660 pesewas to Fundraiser
5. Database trigger updates campaign.total_raised
6. Send donation confirmation email
7. Check & send milestone alerts
8. Log webhook attempt (success)
```

---

## Fund Distribution

### Automatic Subaccount Creation

**Endpoint**: `POST /api/fundraiser/subaccount`

When fundraiser adds payout details:

```json
{
  "bankCode": "030",
  "accountNumber": "1234567890",
  "accountHolder": "John Doe",
  "bankName": "Zenith Bank Ghana"
}
```

**Process**:
1. Verify bank account with Paystack
2. Create Paystack subaccount
3. Store subaccount_code in database
4. Link to fundraiser profile

**Subaccount Code Format**: `SUB_xxxxxxxxxxxxx`

### Fund Distribution Model

```
┌─ Donation Completed
└─ Paystack Receives Amount: 10,000 pesewas
   ├─ EveryGiving Fee: 340 pesewas (2.9% + 0.50)
   └─ Fundraiser Receives: 9,660 pesewas (instantly)
```

**Key Points**:
- `bearer: "account"` forces Paystack fees to come from EveryGiving's account
- Fundraiser receives net amount (after fee) directly to their subaccount
- No manual payout needed - automatic direct transfer

### Fund Distribution Tracking

**Endpoint**: `GET /api/fundraiser/fund-distribution`

Returns:
```json
{
  "success": true,
  "summary": {
    "totalGHSRaised": "5000.00",
    "totalGHSNet": "4830.00",
    "totalGHSFees": "170.00",
    "totalDonations": 50,
    "totalDonors": 48
  },
  "campaigns": [
    {
      "id": "UUID",
      "title": "Help Build a School",
      "goalAmount": 500000,
      "totalRaised": 150000,
      "totalDonors": 50,
      "progressPercent": 30
    }
  ]
}
```

---

## Database Schema

### Donations Table

```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL,        -- Foreign key to campaigns
  donor_id UUID,                    -- Foreign key to users (nullable)
  donor_name VARCHAR(150),
  donor_email VARCHAR(150),
  amount_paid BIGINT,               -- In pesewas
  transaction_fee BIGINT,           -- In pesewas
  net_amount BIGINT,                -- amount_paid - transaction_fee
  reference VARCHAR(255) UNIQUE,    -- EVG_timestamp_random
  status VARCHAR(50),               -- pending, completed, failed
  payment_method VARCHAR(50),       -- card, mobile_money, bank_transfer
  paystack_reference VARCHAR(255),  -- Paystack transaction reference
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Transaction Ledger

```sql
CREATE TABLE transaction_ledger (
  id UUID PRIMARY KEY,
  donation_id UUID NOT NULL,        -- Link to donation
  fundraiser_id UUID NOT NULL,      -- Fundraiser receiving funds
  campaign_id UUID NOT NULL,
  type VARCHAR(50),                 -- fee, net_amount, refund
  amount BIGINT,                    -- In pesewas
  description VARCHAR(255),
  status VARCHAR(50),               -- pending, processed, reversed
  created_at TIMESTAMP
);
```

### Campaigns Table Additions

```sql
ALTER TABLE campaigns ADD COLUMN:
  - subaccount_code VARCHAR(100)    -- Paystack subaccount
  - total_raised BIGINT             -- Updated by trigger
  - total_donor_count INT           -- Updated by trigger
  - goal_amount BIGINT              -- Campaign goal (existing)
```

### Payout Details

```sql
CREATE TABLE payout_details (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE,              -- Fundraiser
  subaccount_code VARCHAR(100),
  bank_name VARCHAR(100),
  account_number VARCHAR(20),
  account_holder_name VARCHAR(150),
  bank_code VARCHAR(10),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## API Reference

### 1. Initialize Payment

**Endpoint**: `POST /api/paystack/initialize`

**Auth**: None (public endpoint)

**Request Body**:
```typescript
{
  amount: number           // GHS (1-10,000)
  email: string           // Donor email
  campaignId: string      // UUID
  donorName?: string
  donorId?: string        // Optional for registered users
}
```

**Responses**:

**200 Success**:
```json
{
  "success": true,
  "donation": {
    "id": "donation-UUID",
    "reference": "EVG_...",
    "amount": 100,
    "transactionFee": "3.40",
    "netAmount": "96.60"
  },
  "payment": {
    "accessCode": "...",
    "authorizationUrl": "https://checkout.paystack.com/..."
  }
}
```

**400 Bad Request**:
- Invalid amount (< 1 or > 10,000)
- Missing email or campaign ID
- Campaign not found
- Fundraiser has no subaccount

**500 Server Error**:
- Database error
- Paystack API error
- Payment initialization failed

---

### 2. Create Subaccount

**Endpoint**: `POST /api/fundraiser/subaccount`

**Auth**: Required (authenticated fundraiser)

**Request Body**:
```typescript
{
  bankCode: string           // E.g., "030" for Zenith
  accountNumber: string      // 10-digit account number
  accountHolder: string      // Account owner name
  bankName: string           // E.g., "Zenith Bank Ghana"
}
```

**Responses**:

**200 Success**:
```json
{
  "success": true,
  "message": "Payout details saved...",
  "payoutDetails": {
    "id": "UUID",
    "user_id": "UUID",
    "subaccount_code": "SUB_xxxxx",
    "bank_code": "030",
    "account_number": "1234567890",
    "account_holder_name": "John Doe",
    "bank_name": "Zenith Bank Ghana",
    "created_at": "2026-03-19T..."
  },
  "subaccountCode": "SUB_xxxxx"
}
```

**400 Bad Request**:
- Bank account verification failed
- Invalid account number format

**401 Unauthorized**:
- User not authenticated

---

### 3. Fetch Fund Distribution Status

**Endpoint**: `GET /api/fundraiser/fund-distribution`

**Auth**: Required (authenticated fundraiser)

**Query Parameters**: None

**Response** (200):
```json
{
  "success": true,
  "summary": {
    "totalGHSRaised": "5000.00",
    "totalGHSNet": "4830.00",
    "totalGHSFees": "170.00",
    "totalDonations": 50,
    "totalDonors": 48,
    "campaignCount": 3
  },
  "campaigns": [
    {
      "id": "UUID",
      "title": "Help Build a School",
      "goalAmount": 500000,
      "totalRaised": 150000,
      "totalDonors": 25,
      "subaccountCode": "SUB_xxxxx",
      "progressPercent": 30
    }
  ],
  "recentDistributions": [
    {
      "id": "UUID",
      "campaignId": "UUID",
      "amount": "9660.00",
      "donations": 5,
      "status": "completed",
      "distributedAt": "2026-03-19T..."
    }
  ]
}
```

---

### 4. Webhook Handler

**Endpoint**: `POST /api/webhooks/paystack`

**Auth**: Signature verification only

**Paystack Sends**:
```json
{
  "event": "charge.success",
  "data": {
    "reference": "EVG_...",
    "amount": 10000,
    "metadata": {
      "donation_id": "UUID",
      "campaign_id": "UUID",
      "transaction_fee": 340,
      "net_amount": 9660
    }
  }
}
```

**Processing**:
1. Verify signature
2. Check for duplicates
3. Update donation status
4. Create ledger entries
5. Send notifications

**Response**: Always `{"success": true}` with 200 status

---

## Security

### Signature Verification

```typescript
// Paystack webhook signature verification
const signature = req.headers.get('x-paystack-signature')
const hash = crypto
  .createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(body)
  .digest('hex')

if (hash !== signature) {
  // Invalid signature - reject
}
```

### Duplicate Prevention (Idempotency)

```typescript
// Check if reference already processed
const { data: existingLog } = await supabase
  .from('paystack_webhook_log')
  .select('id')
  .eq('reference', reference)
  .eq('status', 'success')
  .single()

if (existingLog) {
  // Already processed - return success (don't reprocess)
  return { success: true }
}
```

### Reference Validation

Each donation gets unique reference:
```
Format: EVG_<timestamp>_<6-byte-hex>
Example: EVG_1710828000_abc123def456

- EVG prefix identifies EveryGiving transactions
- Timestamp prevents collisions
- Random hex adds uniqueness
```

### Environment Variables Required

```bash
PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
NEXT_PUBLIC_BASE_URL=https://everygiving.org
```

### Amount Validation

```typescript
// Prevent common issues
- Minimum: 1 GHS (100 pesewas)
- Maximum: 10,000 GHS (1,000,000 pesewas)
- Only 2 decimal places allowed
- Must be positive
```

---

## Edge Cases & Handling

### Small Amounts (Rounding)

**Problem**: GHS 1.00 with 2.9% fee = GHS 1.029

**Solution**:
```javascript
fee = Math.round((amount * 0.029) * 100) / 100
// (100 * 0.029) = 2.9 → Math.round(2.9) = 3 pesewas
```

### Duplicate Webhook Calls

**Scenario**: Paystack sends webhook twice (network retry)

**Solution**:
1. Create `paystack_webhook_log` table
2. Check reference before processing
3. Return 200 OK to prevent Paystack retries

### Failed Payments

**Scenario**: Payment fails at Paystack

**States**:
```
1. Donation created as "pending"
2. Payment fails at Paystack
3. No webhook sent
4. Donation stays "pending" indefinitely
```

**Solution**:
- Add cron job to expire pending donations after 24 hours
- Set donation status to "failed"
- Send payment failure notification with retry link

### Missing Subaccount

**Scenario**: Donor tries to donate but fundraiser has no subaccount

**Solution**:
```typescript
if (!campaign.subaccount_code) {
  return {
    error: "Fundraiser has not set up payout details.",
    status: 400
  }
}
```

### Transaction Timeout

**Scenario**: Paystack initialization takes > 10 seconds

**Solution**:
- Frontend shows loading state
- Set 30-second timeout on fetch
- Retry if network error
- Webhook will eventually process the payment

### Insufficient Balance

**Scenario**: Fundraiser's bank account has insufficient balance for fund transfer

**Solution**:
- Paystack maintains subaccount balance
- Funds held in subaccount until withdrawn
- Fundraiser manually initiates withdrawal
- Or set up automatic monthly transfers

---

## Monitoring & Debugging

### Logging

Each step of payment flow is logged:

```
[Payment Init] Amount: GHS 100 (10000 pesewas)
[Payment Init] Fee: 340 pesewas
[Payment Init] Success: EVG_1710828000_abc123

[Webhook] Processing: EVG_1710828000_abc123
[Webhook] Campaign: campaign-UUID | Fundraiser: user-UUID
[Webhook] Donation status updated to completed
[Webhook] Transaction ledger created
[Webhook] Confirmation email sent ✓
[Webhook] ✓ Completed in 245ms
```

### Debugging Queries

**Check pending donations**:
```sql
SELECT * FROM donations WHERE status = 'pending';
```

**Check failed donations**:
```sql
SELECT * FROM donations WHERE status = 'failed';
```

**Check transaction ledger**:
```sql
SELECT * FROM transaction_ledger 
WHERE fundraiser_id = 'user-UUID' 
ORDER BY created_at DESC;
```

**Check webhook logs**:
```sql
SELECT * FROM paystack_webhook_log 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

**Check campaign totals**:
```sql
SELECT 
  id, 
  title, 
  goal_amount, 
  total_raised, 
  total_donor_count 
FROM campaigns 
WHERE user_id = 'fundraiser-UUID';
```

---

## Testing

### Test Scenarios

#### 1. Successful Donation (Card)

```bash
# 1. Submit form with valid card details
curl -X POST http://localhost:3000/api/paystack/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "email": "test@example.com",
    "campaignId": "campaign-uuid",
    "donorName": "Test Donor"
  }'

# 2. Verify response contains authorization URL
# 3. Go to Paystack checkout and use test card:
#    Number: 4111 1111 1111 1111
#    Exp: Any future date
#    CVC: 123

# 4. Verify donation record created as "pending"
# 5. Verify webhook eventually marks as "completed"
# 6. Verify email sent
```

#### 2. Subaccount Creation

```bash
# 1. As authenticated fundraiser, create subaccount
curl -X POST http://localhost:3000/api/fundraiser/subaccount \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "bankCode": "030",
    "accountNumber": "0123456789",
    "accountHolder": "John Doe",
    "bankName": "Zenith Bank Ghana"
  }'

# 2. Verify subaccount_code returned
# 3. Verify stored in payout_details table
# 4. Use this subaccount for subsequent donations
```

#### 3. Fee Calculation

```typescript
// Test various amounts
const testAmounts = [
  { amount: 1, expectedFee: 0.53 },
  { amount: 10, expectedFee: 0.79 },
  { amount: 50, expectedFee: 1.95 },
  { amount: 100, expectedFee: 3.40 },
  { amount: 1000, expectedFee: 29.50 },
  { amount: 10000, expectedFee: 290.50 },
]

for (const test of testAmounts) {
  const fee = calculateTransactionFeeGHS(test.amount)
  assert(fee === test.expectedFee)
}
```

#### 4. Webhook Processing

```bash
# Simulate webhook locally
curl -X POST http://localhost:3000/api/webhooks/paystack \
  -H "x-paystack-signature: <valid-signature>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "EVG_1710828000_abc123",
      "amount": 10000,
      "metadata": {
        "donation_id": "donation-uuid",
        "campaign_id": "campaign-uuid"
      }
    }
  }'

# Verify response is { "success": true }
# Verify donation status changed to "completed"
# Verify ledger entries created
# Verify email notification sent
```

---

## Deployment Checklist

- [ ] Database migrations run in production
- [ ] Paystack API keys configured
- [ ] Webhook URL registered in Paystack dashboard
- [ ] BREVO email API key configured
- [ ] Environment variables set
- [ ] SSL certificate active
- [ ] Error logging setup
- [ ] Monitor Paystack dashboard for transactions
- [ ] Test with real test account first
- [ ] Run smoke tests on all endpoints

---

## Troubleshooting

### Payment Not Completing

1. Check paystack_webhook_log for errors
2. Verify webhook signature
3. Check Paystack dashboard for transaction
4. Review payment initialization logs

### Fund Not Reaching Fundraiser

1. Check transaction_ledger for net_amount entry
2. Verify subaccount code in donations.campaigns
3. Check Paystack subaccount balance
4. Verify bank account is active

### Email Not Sending

1. Check BREVO_API_KEY is set
2. Review notifications.ts error logs
3. Verify email address is valid
4. Check spam folder

### Campaign Total Not Updating

1. Verify donation status is "completed"
2. Check database trigger execution
3. Review campaign.total_raised calculation
4. Run manual update if needed

---

## Future Enhancements

- [ ] Batch settlement transfers
- [ ] Real-time WebSocket updates
- [ ] Dispute resolution system
- [ ] Refund processing
- [ ] Tax reporting
- [ ] Currency conversion (multi-currency)
- [ ] Payment plan support (installments)
- [ ] Smart contract-based escrow
