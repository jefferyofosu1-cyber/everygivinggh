import { NextRequest, NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
const BASE_URL = 'https://api.brevo.com/v3'
const LIST_IDS = { all: 3, fundraisers: 4, donors: 5 }

async function brevo(endpoint: string, method: string, body: object) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) { const t = await res.text(); throw new Error(`Brevo ${res.status}: ${t}`) }
  return res.status === 204 ? {} : res.json()
}

async function upsertContact({ email, firstName, lastName, phone, listId }: {
  email: string; firstName: string; lastName?: string; phone?: string; listId: number
}) {
  const attributes: Record<string, string> = { FIRSTNAME: firstName, LASTNAME: lastName || '' }
  if (phone) attributes.SMS = phone
  return brevo('/contacts', 'POST', { email, attributes, listIds: [listId], updateEnabled: true })
}

async function sendEmail({ to, subject, htmlContent }: { to: { email: string; name: string }; subject: string; htmlContent: string }) {
  return brevo('/smtp/email', 'POST', {
    sender: { name: 'EveryGiving', email: 'business@everygiving.org' },
    to: [to], subject, htmlContent,
  })
}

function fundraiserWelcomeEmail(name: string, appUrl: string) {
  const tiers = [
    { name: 'Basic', fee: 'Free', range: 'Up to ₵5,000', color: '#64748B', features: 'ID upload · No fee ever' },
    { name: 'Standard', fee: '₵50', range: '₵5,000–₵10,000', color: '#02A95C', features: 'ID + selfie · Can defer fee' },
    { name: 'Premium', fee: '₵100', range: '₵10,000–₵50,000', color: '#F59E0B', features: 'ID + selfie · Can defer fee' },
    { name: 'Gold', fee: '₵200', range: '₵50,000–₵100,000', color: '#EF4444', features: 'ID + selfie · Can defer fee' },
    { name: 'Diamond', fee: '₵500', range: '₵100,000+', color: '#8B5CF6', features: 'ID + selfie · Can defer fee' },
  ]

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="background:#1A2B3C;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center;">
    <div style="font-size:30px;font-weight:900;letter-spacing:-1px;">
      <span style="color:#02A95C;">Every</span><span style="color:#FFFFFF;">Giving</span>
    </div>
    <div style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin-top:6px;">Ghana's verified crowdfunding platform</div>
  </div>

  <!-- Hero -->
  <div style="background:#02A95C;padding:32px 40px;text-align:center;">
    <div style="font-size:40px;margin-bottom:10px;">🎉</div>
    <div style="color:white;font-size:26px;font-weight:900;line-height:1.2;">Welcome, ${name}!</div>
    <div style="color:rgba(255,255,255,0.85);font-size:14px;margin-top:8px;">Thank you for signing up. Your account is ready.</div>
  </div>

  <!-- Body -->
  <div style="background:#FFFFFF;padding:40px;">

    <p style="font-size:15px;color:#475569;line-height:1.75;margin:0 0 28px;">
      You have joined <strong style="color:#1A2B3C;">EveryGiving</strong> — Ghana's first identity-verified crowdfunding platform.
      Before you start, here's everything you need to know about how it works.
    </p>

    <!-- CTA button -->
    <div style="text-align:center;margin:0 0 36px;">
      <a href="${appUrl}/create" style="display:inline-block;background:#02A95C;color:white;font-size:16px;font-weight:900;text-decoration:none;padding:18px 48px;border-radius:9999px;box-shadow:0 8px 24px rgba(2,169,92,0.3);">
        Start your campaign →
      </a>
      <div style="font-size:11px;color:#94A3B8;margin-top:10px;">Takes less than 15 minutes</div>
    </div>

    <div style="height:1px;background:#F1F5F9;margin:0 0 32px;"></div>

    <!-- How it works -->
    <div style="font-size:17px;font-weight:900;color:#1A2B3C;margin-bottom:20px;">How EveryGiving works</div>

    ${[
      ['1', '📝', 'Create your campaign', 'Fill in your campaign title, story, goal amount, and category. Add photos to bring your story to life.'],
      ['2', '🪪', 'Verify your identity', 'Upload a photo of your Ghana Card, passport, or other valid ID. For campaigns above ₵5,000 a selfie is also required. Our team manually reviews every document.'],
      ['3', '⏳', 'Wait for review', 'Our team reviews your campaign and identity documents within 24 hours. You will receive an email with the outcome — approved or rejected with a clear reason.'],
      ['4', '📲', 'Share and raise', 'Once approved your campaign is live. Share the link on WhatsApp, Facebook, and with friends and family to start receiving donations.'],
      ['5', '💰', 'Receive your funds', 'Donations are released in milestones you set. Withdraw directly to your MoMo, bank account, or debit card at any time.'],
    ].map(([n, icon, title, desc]) => `
    <div style="display:flex;gap:16px;margin-bottom:20px;align-items:flex-start;">
      <div style="width:36px;height:36px;background:#1A2B3C;color:white;border-radius:50%;text-align:center;line-height:36px;font-size:13px;font-weight:900;flex-shrink:0;">${n}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:4px;">${icon} ${title}</div>
        <div style="font-size:13px;color:#64748B;line-height:1.6;">${desc}</div>
      </div>
    </div>`).join('')}

    <div style="height:1px;background:#F1F5F9;margin:28px 0;"></div>

    <!-- Verification tiers -->
    <div style="font-size:17px;font-weight:900;color:#1A2B3C;margin-bottom:8px;">Verification tiers</div>
    <p style="font-size:13px;color:#64748B;line-height:1.6;margin:0 0 20px;">
      Your verification tier is automatically suggested based on your fundraising goal. Higher tiers have a one-time verification fee — this can be paid upfront or deducted from your first donations.
    </p>

    <table style="width:100%;border-collapse:collapse;border-radius:14px;overflow:hidden;border:1px solid #E2E8F0;">
      <thead>
        <tr style="background:#F8FAFC;">
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">Tier</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">Goal range</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em;font-weight:700;">Fee</th>
        </tr>
      </thead>
      <tbody>
        ${tiers.map((t, i) => `
        <tr style="background:${i % 2 === 0 ? 'white' : '#FAFAFA'};">
          <td style="padding:10px 14px;font-size:13px;font-weight:700;color:${t.color};">${t.name}</td>
          <td style="padding:10px 14px;font-size:13px;color:#475569;">${t.range}</td>
          <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#1A2B3C;">${t.fee}</td>
        </tr>`).join('')}
      </tbody>
    </table>

    <p style="font-size:12px;color:#94A3B8;margin:12px 0 0;line-height:1.6;">
      * A 2% + ₵0.25 transaction fee applies per donation. This is the only ongoing charge — the platform fee is always 0%.
    </p>

    <div style="height:1px;background:#F1F5F9;margin:28px 0;"></div>

    <p style="font-size:13px;color:#94A3B8;line-height:1.6;text-align:center;">
      Questions? Reply to this email or visit <a href="${appUrl}/help" style="color:#02A95C;text-decoration:none;font-weight:600;">everygiving.org/help</a><br>
      We are here to help you raise what you need.
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#1A2B3C;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;">
    <div style="font-size:20px;font-weight:900;margin-bottom:6px;">
      <span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,0.2);line-height:1.6;">
      Ghana's verified crowdfunding platform · 0% platform fee<br>
      You received this because you signed up at everygiving.org
    </div>
  </div>

</div>
</body>
</html>`
}

function donorWelcomeEmail(name: string, appUrl: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="background:#1A2B3C;padding:32px 40px;text-align:center;">
    <div style="font-size:26px;font-weight:900;"><span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span></div>
    <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">Ghana's verified crowdfunding platform</div>
  </div>
  <div style="padding:40px;">
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1A2B3C;">Thank you, ${name} 💚</h1>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">Your generosity means everything to someone in Ghana today.</p>
    <div style="background:#f0fdf6;border:1.5px solid rgba(2,169,92,0.2);border-radius:16px;padding:20px;margin-bottom:28px;">
      <div style="font-weight:700;color:#1A2B3C;font-size:14px;margin-bottom:8px;">Your donation is safe</div>
      <div style="color:#475569;font-size:13px;line-height:1.6;">Every campaign on EveryGiving is manually reviewed before going live. The fundraiser you gave to has had their identity confirmed by our team.</div>
    </div>
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${appUrl}/campaigns" style="display:inline-block;background:#02A95C;color:white;font-weight:900;font-size:15px;padding:14px 36px;border-radius:100px;text-decoration:none;">Discover more campaigns →</a>
    </div>
  </div>
  <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
    <p style="margin:0;color:#94a3b8;font-size:12px;">EveryGiving · Built in Ghana 🇬🇭 · <a href="${appUrl}" style="color:#02A95C;text-decoration:none;">everygiving.org</a></p>
  </div>
</div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not set')
    return NextResponse.json({ error: 'Email service not configured. Set BREVO_API_KEY in Vercel.' }, { status: 500 })
  }
  try {
    const { type, user } = await req.json()
    if (!user?.email || !user?.firstName) return NextResponse.json({ error: 'Missing email or firstName' }, { status: 400 })
    const appUrl = APP_URL

    if (type === 'fundraiser_signup') {
      try {
        await upsertContact({ email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, listId: LIST_IDS.fundraisers })
        await upsertContact({ email: user.email, firstName: user.firstName, listId: LIST_IDS.all })
      } catch (e: any) { console.error('Brevo contact error:', e.message) }
      await sendEmail({ to: { email: user.email, name: user.firstName }, subject: `Welcome to EveryGiving, ${user.firstName} 🎉`, htmlContent: fundraiserWelcomeEmail(user.firstName, appUrl) })
      return NextResponse.json({ success: true, type: 'fundraiser_signup' })
    }

    if (type === 'donor_signup') {
      try {
        await upsertContact({ email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, listId: LIST_IDS.donors })
        await upsertContact({ email: user.email, firstName: user.firstName, listId: LIST_IDS.all })
      } catch (e: any) { console.error('Brevo donor contact error:', e.message) }
      await sendEmail({ to: { email: user.email, name: user.firstName }, subject: `Thank you for giving, ${user.firstName} 💚`, htmlContent: donorWelcomeEmail(user.firstName, appUrl) })
      return NextResponse.json({ success: true, type: 'donor_signup' })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: any) {
    console.error('CRM route error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
