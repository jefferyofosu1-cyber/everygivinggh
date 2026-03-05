import { NextRequest, NextResponse } from 'next/server'

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
    sender: { name: 'Every Giving', email: 'hello@everygivinggh.com' },
    to: [to],
    subject,
    htmlContent,
  })
}

// ─── EMAIL TEMPLATES ─────────────────────────────────────────────────────────

function fundraiserWelcomeEmail(name: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background:#1A2B3C;padding:32px 40px;text-align:center;">
      <div style="font-size:24px;font-weight:900;letter-spacing:-0.5px;">
        <span style="color:#02A95C;">Every</span><span style="color:white;">Giving</span>
      </div>
      <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">Ghana's verified crowdfunding platform</div>
    </div>

    <!-- Body -->
    <div style="padding:40px;">
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;color:#1A2B3C;letter-spacing:-0.5px;">
        Welcome, ${name}
      </h1>
      <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
        Your account is ready. Here is everything you need to launch your first campaign and start raising money.
      </p>

      <!-- Steps -->
      <div style="background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:28px;">
        <div style="font-weight:700;color:#1A2B3C;font-size:13px;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.5px;">Your next 3 steps</div>
        ${[
          ['01', 'Create your campaign', 'Tell your story, set your goal, upload a photo.'],
          ['02', 'Verify your identity', 'Ghana Card + selfie. Automatic. Under 10 minutes.'],
          ['03', 'Share on WhatsApp', 'Send your campaign link to friends and family first.'],
        ].map(([n, title, desc]) => `
        <div style="display:flex;gap:14px;margin-bottom:14px;align-items:flex-start;">
          <div style="width:28px;height:28px;background:#02A95C;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-weight:900;font-size:11px;color:white;text-align:center;line-height:28px;">${n}</div>
          <div>
            <div style="font-weight:700;color:#1A2B3C;font-size:14px;">${title}</div>
            <div style="color:#64748b;font-size:13px;margin-top:2px;">${desc}</div>
          </div>
        </div>`).join('')}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/create"
          style="display:inline-block;background:#02A95C;color:white;font-weight:900;font-size:15px;padding:14px 36px;border-radius:100px;text-decoration:none;letter-spacing:-0.2px;">
          Create your campaign
        </a>
      </div>

      <!-- Trust signals -->
      <div style="border-top:1px solid #f1f5f9;padding-top:20px;display:flex;gap:20px;flex-wrap:wrap;">
        ${[
          ['0%', 'Platform fee'],
          ['Under 10 min', 'To get verified'],
          ['Same day', 'MoMo payout'],
        ].map(([val, label]) => `
        <div style="text-align:center;flex:1;min-width:80px;">
          <div style="font-weight:900;color:#02A95C;font-size:18px;">${val}</div>
          <div style="color:#94a3b8;font-size:11px;margin-top:2px;">${label}</div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">
        Every Giving · Built in Ghana 🇬🇭 ·
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#02A95C;text-decoration:none;">everygivinggh.vercel.app</a>
      </p>
      <p style="margin:6px 0 0;color:#cbd5e1;font-size:11px;">
        You received this because you signed up on Every Giving.
      </p>
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

    const { type, user } = await req.json()
    // user = { email, firstName, lastName?, phone? }

    if (!user?.email || !user?.firstName) {
      return NextResponse.json({ error: 'Missing email or firstName' }, { status: 400 })
    }

    if (type === 'fundraiser_signup') {
      // 1. Add to Brevo contacts — tag as Fundraiser
      await upsertContact({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        tag: 'Fundraiser',
        listId: LIST_IDS.fundraisers,
      })
      // Also add to master list
      await upsertContact({
        email: user.email,
        firstName: user.firstName,
        tag: 'Fundraiser',
        listId: LIST_IDS.all,
      })
      // 2. Send welcome email
      await sendEmail({
        to: { email: user.email, name: user.firstName },
        subject: `Welcome to Every Giving, ${user.firstName}`,
        htmlContent: fundraiserWelcomeEmail(user.firstName),
      })

      return NextResponse.json({ success: true, type: 'fundraiser_signup' })
    }

    if (type === 'donor_signup') {
      await upsertContact({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        tag: 'Donor',
        listId: LIST_IDS.donors,
      })
      await upsertContact({
        email: user.email,
        firstName: user.firstName,
        tag: 'Donor',
        listId: LIST_IDS.all,
      })
      await sendEmail({
        to: { email: user.email, name: user.firstName },
        subject: `Thank you for giving, ${user.firstName}`,
        htmlContent: donorWelcomeEmail(user.firstName),
      })

      return NextResponse.json({ success: true, type: 'donor_signup' })
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  } catch (err: any) {
    console.error('Brevo error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
