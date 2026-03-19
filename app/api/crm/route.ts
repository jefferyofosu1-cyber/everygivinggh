import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, sanitiseString, sanitiseEmail } from '@/lib/api-security'

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const BASE_URL = 'https://api.brevo.com/v3'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

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
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Brevo error ${res.status}`)
  }
  return res.status === 204 ? {} : res.json()
}

// Add or update contact in Brevo + tag them
async function upsertContact({
  email,
  firstName,
  lastName,
  phone,
  tag,
  listId,
}: {
  email: string
  firstName: string
  lastName?: string
  phone?: string
  tag: string
  listId: number
}) {
  await brevo('/contacts', 'POST', {
    email,
    attributes: {
      FIRSTNAME: firstName,
      LASTNAME: lastName || '',
      SMS: phone || '',
      PLATFORM: 'EveryGiving',
      TAG: tag,
      SIGNUP_DATE: new Date().toISOString().split('T')[0],
    },
    listIds: [listId],
    updateEnabled: true, // upsert — won't fail if contact exists
  })
}

// Send transactional email via Brevo template or inline HTML
async function sendEmail({
  to,
  subject,
  htmlContent,
}: {
  to: { email: string; name: string }
  subject: string
  htmlContent: string
}) {
  await brevo('/smtp/email', 'POST', {
    sender: { name: 'Every Giving', email: 'business@everygiving.org' },
    to: [to],
    subject,
    htmlContent,
  })
}

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────

function fundraiserWelcomeEmail(name: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to EveryGiving</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#F1F5F9;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased}
  .wrapper{max-width:600px;margin:0 auto;padding:32px 16px}
  .header{background:#1A2B3C;border-radius:20px 20px 0 0;padding:36px 40px 28px;text-align:center}
  .hero-band{background:#02A95C;padding:28px 40px;text-align:center}
  .body{background:#FFFFFF;padding:40px}
  .footer{background:#1A2B3C;border-radius:0 0 20px 20px;padding:28px 40px;text-align:center}
  .promise-box{background:#F0FDF6;border:1.5px solid rgba(2,169,92,0.2);border-radius:16px;padding:24px;margin-bottom:28px}
  .stats{width:100%;border:1px solid #E2E8F0;border-radius:14px;border-collapse:collapse;margin-bottom:28px}
  .stat{text-align:center;padding:18px 8px;border-right:1px solid #E2E8F0}
  .proof{background:#F8FAFC;border-radius:14px;padding:20px 24px;margin-bottom:28px}
  .step{display:flex;gap:14px;margin-bottom:16px;align-items:flex-start}
  .cta-btn{display:inline-block;background:#02A95C;color:white;font-size:16px;font-weight:900;text-decoration:none;padding:16px 44px;border-radius:9999px;box-shadow:0 8px 24px rgba(2,169,92,0.35)}
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <div style="font-size:32px;font-weight:900;letter-spacing:-1px;">
      <span style="color:#02A95C;">Every</span><span style="color:#FFFFFF;">Giving</span>
    </div>
    <div style="color:rgba(255,255,255,0.4);font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin-top:6px;">Ghana's verified crowdfunding platform</div>
  </div>

  <div class="hero-band">
    <div style="font-size:36px;margin-bottom:10px;">🎉</div>
    <div style="color:white;font-size:24px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;">
      Welcome, ${name}.<br>You're in the right place.
    </div>
  </div>

  <div class="body">
    <p style="font-size:15px;color:#475569;line-height:1.7;margin-bottom:24px;">
      We're really glad you joined Every Giving. You now have everything you need to raise money the right way in Ghana — with <strong style="color:#1A2B3C;">identity verification, zero platform fees,</strong> and <strong style="color:#1A2B3C;">same-day MoMo payouts.</strong>
    </p>

    <div class="promise-box">
      <div style="font-size:13px;font-weight:800;color:#1A2B3C;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:14px;">What you get — completely free</div>
      ${[
        ['Your own verified campaign page', 'a shareable link donors can trust'],
        ['Ghana Card verification', 'donors give more to verified campaigns'],
        ['MoMo, Vodafone Cash & AirtelTigo', 'donations arrive same day'],
        ['0% platform fee', 'every cedi goes to you, always'],
      ].map(([bold, rest]) => `
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
        <div style="width:20px;height:20px;background:#02A95C;border-radius:50%;flex-shrink:0;margin-top:2px;text-align:center;line-height:20px;">
          <span style="color:white;font-size:11px;font-weight:900;">✓</span>
        </div>
        <div style="font-size:14px;color:#475569;line-height:1.5;"><strong style="color:#1A2B3C;">${bold}</strong> — ${rest}</div>
      </div>`).join('')}
    </div>

    <table class="stats">
      <tr>
        <td class="stat">
          <div style="font-size:22px;font-weight:900;color:#02A95C;line-height:1;">0%</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:3px;">Platform fee</div>
        </td>
        <td class="stat">
          <div style="font-size:22px;font-weight:900;color:#02A95C;line-height:1;">&lt;10 min</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:3px;">To get verified</div>
        </td>
        <td class="stat" style="border-right:none;">
          <div style="font-size:22px;font-weight:900;color:#02A95C;line-height:1;">Same day</div>
          <div style="font-size:11px;color:#94A3B8;margin-top:3px;">MoMo payout</div>
        </td>
      </tr>
    </table>

    <div style="font-size:15px;font-weight:800;color:#1A2B3C;margin-bottom:16px;">Your next 3 steps to go live 🚀</div>

    ${[
      ['1', 'Verify your identity', 'Upload your Ghana Card and take a quick selfie. The system confirms you automatically.', 'Under 10 minutes'],
      ['2', 'Create your campaign', 'Tell your story, set your goal, add a photo. Simple guided form — no tech skills needed.', '5 minutes'],
      ['3', 'Share on WhatsApp', 'Copy your campaign link and send it. We give you a pre-written message ready to go.', 'Instant'],
    ].map(([num, title, desc, time]) => `
    <div class="step">
      <div style="width:28px;height:28px;background:#1A2B3C;color:white;border-radius:50%;text-align:center;line-height:28px;font-size:12px;font-weight:900;flex-shrink:0;">${num}</div>
      <div>
        <div style="font-size:14px;font-weight:700;color:#1A2B3C;margin-bottom:2px;">${title}</div>
        <div style="font-size:13px;color:#64748B;line-height:1.5;">${desc}</div>
        <span style="display:inline-block;font-size:10px;font-weight:700;color:#02A95C;background:#E6F9F1;padding:2px 8px;border-radius:99px;margin-top:4px;">${time}</span>
      </div>
    </div>`).join('')}

    <div style="text-align:center;margin:32px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-id" class="cta-btn">
        Start — verify my identity →
      </a>
    </div>

    <div style="height:1px;background:#F1F5F9;margin:24px 0;"></div>

    <div class="proof">
      <div style="font-size:14px;color:#475569;font-style:italic;line-height:1.6;margin-bottom:10px;">"I raised ₵18,500 in 3 weeks. Strangers donated because they could see my Ghana Card was verified. Every Giving made people trust me."</div>
      <div style="font-size:12px;font-weight:700;color:#1A2B3C;">Ama Mensah</div>
      <div style="font-size:11px;color:#94A3B8;">Accra · Medical campaign · ₵18,500 raised</div>
    </div>

    <div style="height:1px;background:#F1F5F9;margin:24px 0;"></div>

    <p style="font-size:13px;color:#94A3B8;line-height:1.6;text-align:center;">
      Questions? Reply to this email or visit <a href="${process.env.NEXT_PUBLIC_APP_URL}/how-it-works" style="color:#02A95C;text-decoration:none;font-weight:600;">everygiving.org/how-it-works</a><br>
      We're here to help you raise what you need.
    </p>
  </div>

  <div class="footer">
    <div style="font-size:20px;font-weight:900;letter-spacing:-0.5px;margin-bottom:8px;">
      <span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span>
    </div>
    <div style="margin-bottom:14px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/how-it-works" style="font-size:12px;color:rgba(255,255,255,0.35);text-decoration:none;margin:0 8px;">How it works</a>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/campaigns" style="font-size:12px;color:rgba(255,255,255,0.35);text-decoration:none;margin:0 8px;">Browse campaigns</a>
    </div>
    <div style="font-size:11px;color:rgba(255,255,255,0.2);line-height:1.6;">
      Ghana's verified crowdfunding platform · 0% platform fee · Always free<br>
      You received this because you signed up at everygiving.org
    </div>
  </div>
</div>
</body>
</html>`
}

function donorWelcomeEmail(name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

    <div style="background:#1A2B3C;padding:32px 40px;text-align:center;">
      <div style="font-size:24px;font-weight:900;letter-spacing:-0.5px;">
        <span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span>
      </div>
      <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">Ghana's verified crowdfunding platform</div>
    </div>

    <div style="padding:40px;">
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1A2B3C;letter-spacing:-0.5px;">
        Thank you, ${name}
      </h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
        Your generosity makes a real difference. Every campaign on Every Giving is identity-verified — so you can give with confidence.
      </p>

      <div style="background:#f0fdf6;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:28px;">
        <div style="font-weight:700;color:#166534;font-size:14px;margin-bottom:6px;">Your donation is safe</div>
        <div style="color:#16a34a;font-size:13px;line-height:1.6;">Every fundraiser on this platform has verified their identity with their Ghana Card. Your money goes directly to a real person with a confirmed identity.</div>
      </div>

      <div style="text-align:center;margin-bottom:32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/campaigns"
          style="display:inline-block;background:#02A95C;color:white;font-weight:900;font-size:15px;padding:14px 36px;border-radius:100px;text-decoration:none;">
          Discover more campaigns
        </a>
      </div>
    </div>

    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        Every Giving · Built in Ghana 🇬🇭 ·
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#02A95C;text-decoration:none;">everygivinggh.vercel.app</a>
      </p>
    </div>

  </div>
</body>
</html>`
}

// ─── BREVO LIST IDS ──────────────────────────────────────────────────────────
// After creating lists in Brevo dashboard, update these IDs
const LIST_IDS = {
  fundraisers: 2, // "Fundraisers" list
  donors: 3,      // "Donors" list
  all: 1,         // "All Users" master list
}

// ─── MAIN HANDLER ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    if (!BREVO_API_KEY) {
      return NextResponse.json({ error: 'BREVO_API_KEY not set' }, { status: 500 })
    }

    // Require authentication to prevent bot abuse
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const body = await req.json()
    const type = sanitiseString(body.type)
    
    // Support both old (body.email) and new (body.user.email) formats for robustness
    const email = sanitiseEmail(body.user?.email || body.email)
    const firstName = sanitiseString(body.user?.firstName || body.firstName || body.name)
    const lastName = sanitiseString(body.user?.lastName || body.lastName || '')
    const phone = sanitiseString(body.user?.phone || body.phone || '')

    // Verify the email matches the authenticated user to prevent spoofing
    if (auth.user?.email && email !== auth.user.email) {
      return NextResponse.json({ error: 'Unauthorised email subscription' }, { status: 403 })
    }

    if (!email || !firstName) {
      return NextResponse.json({ error: 'Missing email or name' }, { status: 400 })
    }

    if (type === 'fundraiser_signup') {
      // 1. Add to Brevo contacts — tag as Fundraiser
      await upsertContact({
        email,
        firstName,
        lastName,
        phone,
        tag: 'Fundraiser',
        listId: LIST_IDS.fundraisers,
      })
      // Also add to master list
      await upsertContact({
        email,
        firstName,
        tag: 'Fundraiser',
        listId: LIST_IDS.all,
      })
      // 2. Send welcome email
      await sendEmail({
        to: { email, name: firstName },
        subject: `Welcome to Every Giving, ${firstName}`,
        htmlContent: fundraiserWelcomeEmail(firstName),
      })

      return NextResponse.json({ success: true, type: 'fundraiser_signup' })
    }

    if (type === 'donor_signup') {
      await upsertContact({
        email,
        firstName,
        lastName,
        phone,
        tag: 'Donor',
        listId: LIST_IDS.donors,
      })
      await upsertContact({
        email,
        firstName,
        tag: 'Donor',
        listId: LIST_IDS.all,
      })
      await sendEmail({
        to: { email, name: firstName },
        subject: `Thank you for giving, ${firstName}`,
        htmlContent: donorWelcomeEmail(firstName),
      })

      return NextResponse.json({ success: true, type: 'donor_signup' })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: any) {
    console.error('Brevo error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
