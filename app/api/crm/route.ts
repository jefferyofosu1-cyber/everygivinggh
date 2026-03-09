import { NextRequest, NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'
const BASE_URL = 'https://api.brevo.com/v3'

const LIST_IDS = { all: 3, fundraisers: 4, donors: 5 }

async function brevo(endpoint: string, method: string, body: object) {
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
    const text = await res.text()
    throw new Error(`Brevo ${res.status}: ${text}`)
  }
  return res.status === 204 ? {} : res.json()
}

async function upsertContact({ email, firstName, lastName, phone, tag, listId }: {
  email: string; firstName: string; lastName?: string; phone?: string; tag: string; listId: number
}) {
  // Only use Brevo's built-in default attributes (FIRSTNAME, LASTNAME, SMS)
  // Custom attributes (PLATFORM, TAG etc) require manual creation in Brevo first
  const attributes: Record<string, string> = {
    FIRSTNAME: firstName,
    LASTNAME: lastName || '',
  }
  if (phone) attributes.SMS = phone

  return brevo('/contacts', 'POST', {
    email,
    attributes,
    listIds: [listId],
    updateEnabled: true,
  })
}

async function sendEmail({ to, subject, htmlContent }: { to: { email: string; name: string }; subject: string; htmlContent: string }) {
  return brevo('/smtp/email', 'POST', {
    sender: { name: 'EveryGiving', email: 'business@everygiving.org' },
    to: [to],
    subject,
    htmlContent,
  })
}

function fundraiserWelcomeEmail(name: string, appUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to EveryGiving</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <div style="background:#1A2B3C;border-radius:20px 20px 0 0;padding:36px 40px;text-align:center;">
    <div style="font-size:30px;font-weight:900;letter-spacing:-1px;">
      <span style="color:#02A95C;">Every</span><span style="color:#FFFFFF;">Giving</span>
    </div>
    <div style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin-top:6px;">Ghana's verified crowdfunding platform</div>
  </div>

  <div style="background:#02A95C;padding:28px 40px;text-align:center;">
    <div style="font-size:36px;margin-bottom:10px;">🎉</div>
    <div style="color:white;font-size:24px;font-weight:900;line-height:1.2;">
      Welcome, ${name}!
    </div>
    <div style="color:rgba(255,255,255,0.8);font-size:14px;margin-top:6px;">Your account is ready. Let's get your campaign live.</div>
  </div>

  <div style="background:#FFFFFF;padding:40px;">
    <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:28px;">
      You've joined <strong style="color:#1A2B3C;">EveryGiving</strong> — Ghana's first verified crowdfunding platform. Every fundraiser here has their identity confirmed before going live, so donors know exactly who they're giving to.
    </p>

    <div style="background:#F0FDF6;border:1.5px solid rgba(2,169,92,0.2);border-radius:16px;padding:24px;margin-bottom:28px;">
      <div style="font-size:12px;font-weight:800;color:#1A2B3C;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:14px;">What you get — free</div>
      ${[
        ['Identity-verified campaign page', 'Donors trust you from the first click'],
        ['0% platform fee', 'Every cedi donated goes to you'],
        ['Milestone-based payouts', 'Funds released as you hit your goals'],
        ['Withdraw via MoMo, bank, or card', 'Your money, your way'],
      ].map(([b, r]) => `
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
        <div style="width:20px;height:20px;background:#02A95C;border-radius:50%;flex-shrink:0;margin-top:2px;display:flex;align-items:center;justify-content:center;">
          <span style="color:white;font-size:11px;font-weight:900;">✓</span>
        </div>
        <div style="font-size:14px;color:#475569;line-height:1.5;"><strong style="color:#1A2B3C;">${b}</strong> — ${r}</div>
      </div>`).join('')}
    </div>

    <div style="font-size:15px;font-weight:800;color:#1A2B3C;margin-bottom:16px;">Your next steps to go live 🚀</div>
    ${[
      ['1', 'Complete your campaign', 'Fill in your story, goal, and upload your ID. Takes under 15 minutes.'],
      ['2', 'Wait for review', 'Our team reviews your identity documents within 24 hours.'],
      ['3', 'Share on WhatsApp', 'Once approved, share your link and start receiving donations.'],
    ].map(([n, t, d]) => `
    <div style="display:flex;gap:14px;margin-bottom:14px;align-items:flex-start;">
      <div style="width:28px;height:28px;background:#1A2B3C;color:white;border-radius:50%;text-align:center;line-height:28px;font-size:12px;font-weight:900;flex-shrink:0;">${n}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:2px;">${t}</div>
        <div style="font-size:13px;color:#64748B;line-height:1.5;">${d}</div>
      </div>
    </div>`).join('')}

    <div style="text-align:center;margin:32px 0;">
      <a href="${appUrl}/create" style="display:inline-block;background:#02A95C;color:white;font-size:15px;font-weight:900;text-decoration:none;padding:16px 44px;border-radius:9999px;">
        Start your campaign →
      </a>
    </div>

    <div style="height:1px;background:#F1F5F9;margin:24px 0;"></div>
    <p style="font-size:13px;color:#94A3B8;line-height:1.6;text-align:center;">
      Questions? Reply to this email — we are here to help.<br>
      <a href="${appUrl}/help" style="color:#02A95C;text-decoration:none;font-weight:600;">Visit our Help Centre</a>
    </p>
  </div>

  <div style="background:#1A2B3C;border-radius:0 0 20px 20px;padding:24px 40px;text-align:center;">
    <div style="font-size:20px;font-weight:900;margin-bottom:8px;">
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
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

    <div style="background:#1A2B3C;padding:32px 40px;text-align:center;">
      <div style="font-size:26px;font-weight:900;">
        <span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span>
      </div>
      <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">Ghana's verified crowdfunding platform</div>
    </div>

    <div style="padding:40px;">
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1A2B3C;">
        Thank you, ${name} 💚
      </h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
        Your generosity means everything to someone in Ghana today.
      </p>

      <div style="background:#f0fdf6;border:1.5px solid rgba(2,169,92,0.2);border-radius:16px;padding:20px;margin-bottom:28px;">
        <div style="font-weight:700;color:#1A2B3C;font-size:14px;margin-bottom:8px;">Why your donation is safe</div>
        <div style="color:#475569;font-size:13px;line-height:1.6;">Every campaign on EveryGiving is reviewed by our team before going live. The fundraiser you gave to has had their identity confirmed — you gave to a real person.</div>
      </div>

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${appUrl}/campaigns" style="display:inline-block;background:#02A95C;color:white;font-weight:900;font-size:15px;padding:14px 36px;border-radius:100px;text-decoration:none;">
          Discover more campaigns →
        </a>
      </div>
    </div>

    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        EveryGiving · Built in Ghana 🇬🇭 ·
        <a href="${appUrl}" style="color:#02A95C;text-decoration:none;">everygiving.org</a>
      </p>
    </div>

  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not set in environment variables')
    return NextResponse.json({ error: 'Email service not configured. Set BREVO_API_KEY in Vercel environment variables.' }, { status: 500 })
  }

  try {
    const { type, user } = await req.json()

    if (!user?.email || !user?.firstName) {
      return NextResponse.json({ error: 'Missing email or firstName' }, { status: 400 })
    }

    const appUrl = APP_URL

    if (type === 'fundraiser_signup') {
      // Add to Brevo contacts
      try {
        await upsertContact({ email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, tag: 'Fundraiser', listId: LIST_IDS.fundraisers })
        await upsertContact({ email: user.email, firstName: user.firstName, tag: 'Fundraiser', listId: LIST_IDS.all })
      } catch (e: any) {
        console.error('Brevo contact upsert failed:', e.message)
        // Don't fail — still send the email
      }

      await sendEmail({
        to: { email: user.email, name: user.firstName },
        subject: `Welcome to EveryGiving, ${user.firstName} 🎉`,
        htmlContent: fundraiserWelcomeEmail(user.firstName, appUrl),
      })

      return NextResponse.json({ success: true, type: 'fundraiser_signup' })
    }

    if (type === 'donor_signup') {
      try {
        await upsertContact({ email: user.email, firstName: user.firstName, lastName: user.lastName, phone: user.phone, tag: 'Donor', listId: LIST_IDS.donors })
        await upsertContact({ email: user.email, firstName: user.firstName, tag: 'Donor', listId: LIST_IDS.all })
      } catch (e: any) {
        console.error('Brevo donor contact upsert failed:', e.message)
      }

      await sendEmail({
        to: { email: user.email, name: user.firstName },
        subject: `Thank you for giving, ${user.firstName} 💚`,
        htmlContent: donorWelcomeEmail(user.firstName, appUrl),
      })

      return NextResponse.json({ success: true, type: 'donor_signup' })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  } catch (err: any) {
    console.error('CRM route error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
