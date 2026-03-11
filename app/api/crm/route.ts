import { NextRequest, NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const APP_URL       = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
const BASE_URL      = 'https://api.brevo.com/v3'
const LIST_IDS      = { all: 3, fundraisers: 4, donors: 5 }

// ─── Brevo helpers ────────────────────────────────────────────────────────────

async function brevo(endpoint: string, method: string, body: object): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Brevo ${res.status}: ${t}`)
  }
  return res.status === 204 ? {} : res.json()
}

async function upsertContact(params: {
  email: string
  firstName: string
  lastName?: string
  phone?: string
  listId: number
}): Promise<void> {
  const attributes: Record<string, string> = {
    FIRSTNAME: params.firstName,
    LASTNAME:  params.lastName || '',
  }
  if (params.phone) attributes.SMS = params.phone
  await brevo('/contacts', 'POST', {
    email:         params.email,
    attributes,
    listIds:       [params.listId],
    updateEnabled: true,
  })
}

async function sendEmail(params: {
  to: { email: string; name: string }
  subject: string
  htmlContent: string
}): Promise<void> {
  await brevo('/smtp/email', 'POST', {
    sender:      { name: 'EveryGiving', email: 'business@everygiving.org' },
    to:          [params.to],
    subject:     params.subject,
    htmlContent: params.htmlContent,
  })
}

// ─── Email templates ──────────────────────────────────────────────────────────

function fundraiserWelcomeEmail(name: string, appUrl: string): string {
  const tiers = [
    { name: 'Basic',    fee: 'Free',   range: 'Up to GH₵5,000',           color: '#64748B' },
    { name: 'Standard', fee: 'GH₵50',  range: 'GH₵5,000 - GH₵10,000',    color: '#02A95C' },
    { name: 'Premium',  fee: 'GH₵100', range: 'GH₵10,000 - GH₵50,000',   color: '#F59E0B' },
    { name: 'Gold',     fee: 'GH₵200', range: 'GH₵50,000 - GH₵100,000',  color: '#EF4444' },
    { name: 'Diamond',  fee: 'GH₵500', range: 'GH₵100,000+',              color: '#8B5CF6' },
  ]

  const steps = [
    ['1', 'Create your campaign',   'Fill in your title, story, goal, and category.'],
    ['2', 'Verify your identity',   'Upload your Ghana Card or passport. Our team reviews every document personally.'],
    ['3', 'Wait for review',        'Our team reviews your campaign within 24 hours and emails you the result.'],
    ['4', 'Share and raise',        'Once approved, share your link on WhatsApp and social media to start receiving donations.'],
    ['5', 'Receive your funds',     'Withdraw to MoMo or bank at any time. Zero platform fee.'],
  ]

  return `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:32px 16px">
  <div style="background:#1A2B3C;border-radius:20px 20px 0 0;padding:32px 40px;text-align:center">
    <div style="font-size:28px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="color:rgba(255,255,255,.4);font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-top:6px">Ghana's verified crowdfunding platform</div>
  </div>
  <div style="background:#02A95C;padding:32px 40px;text-align:center">
    <div style="font-size:40px;margin-bottom:10px">🎉</div>
    <div style="color:white;font-size:24px;font-weight:900">Welcome, ${name}!</div>
    <div style="color:rgba(255,255,255,.8);font-size:14px;margin-top:8px">Your account is ready. Start your campaign in minutes.</div>
  </div>
  <div style="background:white;padding:40px">
    <p style="font-size:15px;color:#475569;line-height:1.75;margin:0 0 28px">
      You have joined <strong style="color:#1A2B3C">EveryGiving</strong> - Ghana's first identity-verified crowdfunding platform.
    </p>
    <div style="text-align:center;margin:0 0 36px">
      <a href="${appUrl}/create" style="display:inline-block;background:#02A95C;color:white;font-size:15px;font-weight:900;text-decoration:none;padding:16px 44px;border-radius:9999px">
        Start your campaign
      </a>
      <div style="font-size:11px;color:#94A3B8;margin-top:10px">Takes less than 15 minutes</div>
    </div>
    <div style="height:1px;background:#F1F5F9;margin:0 0 28px"></div>
    <div style="font-size:16px;font-weight:900;color:#1A2B3C;margin-bottom:20px">How EveryGiving works</div>
    ${steps.map(([n, title, desc]) => `
    <div style="display:flex;gap:16px;margin-bottom:18px;align-items:flex-start">
      <div style="width:32px;height:32px;background:#1A2B3C;color:white;border-radius:50%;text-align:center;line-height:32px;font-size:12px;font-weight:900;flex-shrink:0">${n}</div>
      <div>
        <div style="font-size:13px;font-weight:700;color:#1A2B3C;margin-bottom:3px">${title}</div>
        <div style="font-size:13px;color:#64748B;line-height:1.6">${desc}</div>
      </div>
    </div>`).join('')}
    <div style="height:1px;background:#F1F5F9;margin:28px 0"></div>
    <div style="font-size:16px;font-weight:900;color:#1A2B3C;margin-bottom:8px">Verification tiers</div>
    <p style="font-size:13px;color:#64748B;line-height:1.6;margin:0 0 16px">
      Your tier is suggested automatically based on your goal. Higher tiers include deeper review and stronger badges.
    </p>
    <table style="width:100%;border-collapse:collapse;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden">
      <thead>
        <tr style="background:#F8FAFC">
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em">Tier</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em">Goal range</th>
          <th style="padding:10px 14px;text-align:left;font-size:11px;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em">Fee</th>
        </tr>
      </thead>
      <tbody>
        ${tiers.map((t, i) => `
        <tr style="background:${i % 2 === 0 ? 'white' : '#FAFAFA'}">
          <td style="padding:10px 14px;font-size:13px;font-weight:700;color:${t.color}">${t.name}</td>
          <td style="padding:10px 14px;font-size:13px;color:#475569">${t.range}</td>
          <td style="padding:10px 14px;font-size:13px;font-weight:700;color:#1A2B3C">${t.fee}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <p style="font-size:12px;color:#94A3B8;margin:12px 0 28px;line-height:1.6">
      A 2% + GH₵0.25 transaction fee applies per donation. Platform fee is always 0%.
    </p>
    <p style="font-size:13px;color:#94A3B8;text-align:center">
      Questions? Reply to this email or visit <a href="${appUrl}/help" style="color:#02A95C;text-decoration:none;font-weight:600">everygiving.org/help</a>
    </p>
  </div>
  <div style="background:#1A2B3C;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center">
    <div style="font-size:20px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="font-size:11px;color:rgba(255,255,255,.2);margin-top:6px">
      Ghana's verified crowdfunding platform · 0% platform fee<br>
      You received this because you signed up at everygiving.org
    </div>
  </div>
</div>
</body></html>`
}

function donorWelcomeEmail(name: string, appUrl: string): string {
  return `<!DOCTYPE html><html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06)">
  <div style="background:#1A2B3C;padding:32px 40px;text-align:center">
    <div style="font-size:26px;font-weight:900"><span style="color:#02A95C">Every</span><span style="color:white">Giving</span></div>
    <div style="color:rgba(255,255,255,.4);font-size:12px;margin-top:4px">Ghana's verified crowdfunding platform</div>
  </div>
  <div style="padding:40px">
    <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1A2B3C">Thank you, ${name} 💚</h1>
    <p style="margin:0 0 24px;color:#64748B;font-size:15px;line-height:1.6">Your generosity means everything to someone in Ghana today.</p>
    <div style="background:#F0FDF6;border:1.5px solid rgba(2,169,92,.2);border-radius:16px;padding:20px;margin-bottom:28px">
      <div style="font-weight:700;color:#1A2B3C;font-size:14px;margin-bottom:8px">Your donation is safe</div>
      <div style="color:#475569;font-size:13px;line-height:1.6">Every campaign on EveryGiving is manually reviewed before going live. The fundraiser you gave to has had their identity confirmed by our team.</div>
    </div>
    <div style="text-align:center;margin-bottom:32px">
      <a href="${appUrl}/campaigns" style="display:inline-block;background:#02A95C;color:white;font-weight:900;font-size:15px;padding:14px 36px;border-radius:100px;text-decoration:none">Discover more campaigns</a>
    </div>
  </div>
  <div style="background:#F8FAFC;padding:20px 40px;text-align:center;border-top:1px solid #F1F5F9">
    <p style="margin:0;color:#94A3B8;font-size:12px">EveryGiving · Built in Ghana 🇬🇭 · <a href="${appUrl}" style="color:#02A95C;text-decoration:none">everygiving.org</a></p>
  </div>
</div>
</body></html>`
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!BREVO_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured.' }, { status: 500 })
  }

  try {
    const body: Record<string, unknown> = await req.json()
    const type = typeof body.type === 'string' ? body.type : ''
    const raw  = body.user && typeof body.user === 'object' ? body.user as Record<string, unknown> : null

    if (!raw || typeof raw.email !== 'string' || typeof raw.firstName !== 'string') {
      return NextResponse.json({ error: 'Missing required fields: email, firstName.' }, { status: 400 })
    }

    const email     = raw.email
    const firstName = raw.firstName
    const lastName  = typeof raw.lastName === 'string' ? raw.lastName : undefined
    const phone     = typeof raw.phone    === 'string' ? raw.phone    : undefined

    if (type === 'fundraiser_signup') {
      try {
        await upsertContact({ email, firstName, lastName, phone, listId: LIST_IDS.fundraisers })
        await upsertContact({ email, firstName, listId: LIST_IDS.all })
      } catch (e) {
        console.error('Brevo upsert error:', e instanceof Error ? e.message : e)
      }
      await sendEmail({
        to:          { email, name: firstName },
        subject:     `Welcome to EveryGiving, ${firstName}!`,
        htmlContent: fundraiserWelcomeEmail(firstName, APP_URL),
      })
      return NextResponse.json({ success: true, type: 'fundraiser_signup' })
    }

    if (type === 'donor_signup') {
      try {
        await upsertContact({ email, firstName, lastName, phone, listId: LIST_IDS.donors })
        await upsertContact({ email, firstName, listId: LIST_IDS.all })
      } catch (e) {
        console.error('Brevo upsert error:', e instanceof Error ? e.message : e)
      }
      await sendEmail({
        to:          { email, name: firstName },
        subject:     `Thank you for giving, ${firstName}!`,
        htmlContent: donorWelcomeEmail(firstName, APP_URL),
      })
      return NextResponse.json({ success: true, type: 'donor_signup' })
    }

    return NextResponse.json({ error: 'Invalid type. Expected fundraiser_signup or donor_signup.' }, { status: 400 })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    console.error('CRM route error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
