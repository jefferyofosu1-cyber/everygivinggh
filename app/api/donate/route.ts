import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const MIN_AMOUNT = 1
const MAX_AMOUNT = 50000
const MAX_TIP    = 500

const VALID_METHODS = ['MTN MoMo', 'Vodafone', 'AirtelTigo', 'Bank'] as const

function str(val: unknown, max: number): string {
  if (typeof val !== 'string') return ''
  return val.trim().slice(0, max)
}

function num(val: unknown, min: number, max: number): number | null {
  const n = parseFloat(String(val))
  if (isNaN(n) || n < min || n > max) return null
  return n
}

export async function POST(req: NextRequest) {
  try {
    const body: Record<string, unknown> = await req.json()

    const campaignId = str(body.campaign_id, 100)
    if (!campaignId) {
      return NextResponse.json({ error: 'Invalid campaign.' }, { status: 400 })
    }

    const amount = num(body.amount, MIN_AMOUNT, MAX_AMOUNT)
    if (amount === null) {
      return NextResponse.json({
        error: `Donation must be between GH₵${MIN_AMOUNT} and GH₵${MAX_AMOUNT.toLocaleString()}.`,
      }, { status: 400 })
    }

    const rawTip    = parseFloat(String(body.tip_amount)) || 0
    const tipAmount = Math.min(Math.max(rawTip, 0), MAX_TIP)

    const method = str(body.payment_method, 20)
    if (!(VALID_METHODS as readonly string[]).includes(method)) {
      return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 })
    }

    const donorName  = str(body.donor_name,  80)  || 'Anonymous'
    const donorEmail = str(body.donor_email, 254)
    const message    = str(body.message,     300)

    if (donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

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

    // Hubtel MoMo prompt will be triggered here once integrated
    return NextResponse.json({ success: true, donationId: donation.id })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    console.error('Donate route error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
