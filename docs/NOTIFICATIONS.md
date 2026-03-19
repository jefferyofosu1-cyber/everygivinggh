# Notification Automation System

Automated notifications for donors, fundraisers, and the platform.

## Overview

The notification system sends automated emails and SMS for:

- ✅ **Donation Confirmations** - Sent when payment succeeds
- 💬 **Thank You Messages** - Fundraiser personal messages to donors
- 📢 **Campaign Updates** - Bulk notifications to all campaign donors
- 🎯 **Milestone Alerts** - 25%, 50%, 100% goal notifications
- ❌ **Payment Failures** - Alert when payment fails with retry link

## Architecture

```
Paystack Payment → Webhook Handler → Update Donation Status → Send Confirmation Email
                                   → Check Milestones → Send Milestone Alerts (if any)

Fundraiser Action → API Endpoint → Send Email to Donor(s) → Log to Database
```

## Setup

### 1. Configure Environment Variables

```env
# Brevo API (already configured)
BREVO_API_KEY=xkeysib-xxx

# Paystack (already configured)
PAYSTACK_SECRET_KEY=sk_test_xxx

# App URL for retry links
NEXT_PUBLIC_APP_URL=https://everygiving.org
```

### 2. Create Database Tables

Run the migration in Supabase SQL Editor:

```sql
-- From: db/migrations/20260318_notification_tables.sql
```

This creates:
- `milestone_alerts_sent` - Tracks which milestones sent
- `thank_you_messages` - Logs thank you messages
- `campaign_updates` - Logs campaign updates

### 3. Configure Paystack Webhook

In your Paystack Dashboard:

1. Go to Settings → Webhooks
2. Set webhook URL to: `https://everygiving.org/api/webhooks/paystack`
3. Event: `charge.success`
4. Paystack webhook signature is automatically verified

## API Endpoints

### 1. Donation Confirmation (Automatic)

**Trigger:** Paystack webhook on `charge.success`

**Automatic Flow:**
```
Payment Success → Webhook Handler
  ↓
  → Update donation status to "completed"
  ↓
  → Send confirmation email
  ↓
  → Check for milestone alerts
```

**Email includes:**
- Transaction ID
- Amount and fees breakdown
- Campaign link
- Support contact

### 2. Thank You Message

**Endpoint:** `POST /api/notifications/thank-you`

**Request:**
```json
{
  "donation_id": "12345",
  "message": "Your donation means so much! Here's how we'll use it..."
}
```

**Response:**
```json
{ "success": true }
```

**Usage in Component:**
```typescript
import { NotificationClient } from '@/lib/notification-client'

const fundraiser = () => {
  const handleSendThankYou = async () => {
    try {
      await NotificationClient.sendThankYouMessage(donationId, message)
      toast.success('Thank you message sent!')
    } catch (error) {
      toast.error(error.message)
    }
  }
}
```

### 3. Campaign Updates

**Endpoint:** `POST /api/notifications/campaign-update`

**Request:**
```json
{
  "campaign_id": "uuid",
  "title": "Medical surgery completed!",
  "content": "Thank you all for supporting... We wanted to update you on how the funds were used..."
}
```

**Response:**
```json
{
  "success": true,
  "sent": 45,
  "failed": 0
}
```

**Features:**
- Sends to all donors with completed donations
- Tracks how many emails were sent
- Returns failed email addresses

**Usage:**
```typescript
const sendUpdate = async () => {
  const result = await NotificationClient.sendCampaignUpdate(
    campaignId,
    'Update Title',
    'Update content...'
  )
  console.log(`Sent to ${result.sent} donors`)
}
```

### 4. Milestone Alerts

**Trigger:** Automatic on donation completion

**What happens:**
1. Donation marked as completed
2. System calculates campaign percentage (0-100%)
3. If it crosses 25%, 50%, or 100%:
   - Sends email to ALL previous donors
   - Records that milestone was sent (won't send again)

**Email includes:**
- Milestone percentage
- Current raised amount
- Goal amount
- Progress bar visualization

**Manual Trigger (Admin):**

**Endpoint:** `POST /api/admin/notifications/check-milestones`

```json
{
  "campaign_id": "uuid"
}
```

**Usage:**
```typescript
await NotificationClient.checkMilestones(campaignId)
```

### 5. Payment Failure Alert

**Trigger:** Manual when payment fails

**Endpoint:** `POST /api/notifications/payment-failed`

**Request:**
```json
{
  "donation_id": "12345"
}
```

**What happens:**
1. Updates donation status to "failed"
2. Sends email with retry link
3. Email includes donation amount and campaign

**Email includes:**
- Clear error message
- Retry link with pre-filled data
- Common reasons for failure
- Support contact info

**Usage:**
```typescript
await NotificationClient.sendPaymentFailureAlert(donationId)
```

## Email Templates

All emails are professionally designed with:

- ✅ **Branding** - EveryGiving logo and color scheme
- ✅ **Responsive** - Works on mobile and desktop
- ✅ **Professional** - Clear typography and spacing
- ✅ **Accessible** - High contrast, readable fonts

### Template Files

Templates are built inline in `lib/notifications.ts`:

- `sendDonationConfirmation()` - Donation receipt
- `sendThankYouMessage()` - Fundraiser message
- `sendCampaignUpdate()` - Campaign progress
- `sendMilestoneAlert()` - Milestone reached
- `sendPaymentFailureAlert()` - Payment error

## Database Schema

### milestone_alerts_sent
```sql
id: BIGSERIAL PRIMARY KEY
campaign_id: UUID FOREIGN KEY
milestone: INTEGER (25, 50, or 100)
sent_at: TIMESTAMP
UNIQUE(campaign_id, milestone)
```

### thank_you_messages
```sql
id: BIGSERIAL PRIMARY KEY
donation_id: BIGSERIAL FOREIGN KEY
campaign_id: UUID FOREIGN KEY
message: TEXT
sent_at: TIMESTAMP
created_at: TIMESTAMP
```

### campaign_updates
```sql
id: BIGSERIAL PRIMARY KEY
campaign_id: UUID FOREIGN KEY
title: TEXT
content: TEXT
sent_to_donors: INTEGER
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

## Error Handling

All endpoints have robust error handling:

- **Missing params** → 400 Bad Request
- **Unauthorized** → 401 Unauthorized
- **Not found** → 404 Not Found
- **Permission denied** → 403 Forbidden
- **Server error** → 500 Internal Server Error

Webhooks continue processing even if email fails:
```typescript
try {
  await sendEmail()
} catch (error) {
  console.error('Email failed (non-blocking)')
  // Webhook still returns 200 OK
}
```

## Monitoring

Check notification logs in Supabase:

```sql
-- View thank you messages sent
SELECT * FROM thank_you_messages ORDER BY created_at DESC;

-- View campaign updates
SELECT * FROM campaign_updates ORDER BY created_at DESC;

-- View milestone alerts
SELECT * FROM milestone_alerts_sent ORDER BY sent_at DESC;
```

## Rate Limiting

No built-in rate limiting. Consider adding if needed:
- Per-user: 1 update per campaign per day
- Per-campaign: Max 10 updates per week
- Per-donor: Max notifications per day

## Testing

### Test Donation Flow

1. Create test campaign
2. Process test donation
3. Check Paystack webhook delivers
4. Verify email received

### Test Thank You Message

```typescript
await NotificationClient.sendThankYouMessage(donationId, 'Test message')
```

### Test Campaign Update

```typescript
await NotificationClient.sendCampaignUpdate(
  campaignId,
  'Test Update',
  'This is a test update...'
)
```

### Test Milestone

```typescript
// Add donation to manually trigger milestone
await NotificationClient.checkMilestones(campaignId)
```

## Troubleshooting

### Emails not sending

1. Check `BREVO_API_KEY` is set
2. Check donor email is valid
3. Check Brevo quota not exceeded
4. Check server logs for errors

### Milestone not triggering

1. Check campaign has enough donations
2. Manually call `checkMilestones`
3. Verify `milestone_alerts_sent` table

### Webhook not receiving

1. Check Paystack webhook config
2. Test webhook in Paystack dashboard
3. Check server logs
4. Verify signature validation

## Future Enhancements

- [ ] SMS notifications (Brevo includes SMS)
- [ ] Push notifications
- [ ] In-app notification center
- [ ] Notification preferences (donors can opt-out)
- [ ] Email templates in Brevo (vs hardcoded)
- [ ] Scheduled notifications
- [ ] A/B testing for email open rates
