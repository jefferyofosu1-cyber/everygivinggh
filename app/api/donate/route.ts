import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const MIN_DONATION = 1
const MAX_DONATION = 50000
const MAX_TIP      = 500

function cleanStr(val: unknown, max: number): string {
  if (typeof val !== 'string') return ''
  return val.trim().slice(0, max)
}

function cleanNum(val: unknown, min: number, max: number): number | null {
  const n = parseFloat(String(val))
  if (isNaN(n) || n < min || n > max) return null
  return n
}

export async function POST(req: NextRequest) {
  try {
    const body: Record<string, unknown> = await req.json()

    // Validate campaign ID
    const campaignId = cleanStr(body.campaign_id, 100)
    if (!campaignId) {
      return NextResponse.json({ error: 'Invalid campaign.' }, { status: 400 })
    }

    // Validate amount
    const amount = cleanNum(body.amount, MIN_DONATION, MAX_DONATION)
    if (amount === null) {
      return NextResponse.json({
        error: `Donation must be between GH₵${MIN_DONATION} and GH₵${MAX_DONATION.toLocaleString()}.`,
      }, { status: 400 })
    }

    // Validate tip (clamp silently - no error needed)
    const rawTip   = parseFloat(String(body.tip_amount)) || 0
    const tipAmount = Math.min(Math.max(rawTip, 0), MAX_TIP)

    // Validate payment method
    const VALID_METHODS = ['MTN MoMo', 'Vodafone', 'AirtelTigo', 'Bank']
    const method = cleanStr(body.payment_method, 20)
    if (!VALID_METHODS.includes(method)) {
      return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 })
    }

    // Sanitise optional fields
    const donorName  = cleanStr(body.donor_name,  80)  || 'Anonymous'
    const donorEmail = cleanStr(body.donor_email, 254)
    const message    = cleanStr(body.message,     300)

    if (donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // Verify campaign exists and is approved
    const supabase = await createServerSupabaseClient()
    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('id, status')
      .eq('id', campaignId)
      .single()

    if (campErr || !campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })
    }
    if (campaign.status !== 'approved') {
      return NextResponse.json({ error: 'This campaign is not currently accepting donations.' }, { status: 403 })
    }

    // Insert donation row
    const { data: donation, error: insertErr } = await supabase
      .from('donations')
      .insert({
        campaign_id:    campaignId,
        donor_name:     donorName,
        donor_email:    donorEmail || null,
        amount,
        tip_amount:     tipAmount,
        message:        message || null,
        payment_method: method,
        status:         'pending',
      })
      .select('id')
      .single()

    if (insertErr || !donation) {
      console.error('Donation insert error:', insertErr)
      return NextResponse.json({ error: 'Could not process donation. Please try again.' }, { status: 500 })
    }

    // Hubtel MoMo prompt goes here once integrated
    return NextResponse.json({ success: true, donationId: donation.id })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    console.error('Donate error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
