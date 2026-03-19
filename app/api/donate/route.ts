import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const MIN_AMOUNT = 1
const MAX_AMOUNT = 50000
const MAX_TIP    = 500

const VALID_METHODS = ['MTN MoMo', 'Vodafone', 'AirtelTigo', 'Bank', 'momo', 'card', 'paystack'] as const

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

    if (!donorEmail) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('id, status, title')
      .eq('id', campaignId)
      .single()

    if (campErr || !campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })
    }
    
    // Accept donations for approved or live campaigns
    const allowedStatuses = ['approved', 'live', 'published']
    if (!allowedStatuses.includes(campaign.status)) {
      return NextResponse.json({ error: 'This campaign is not currently accepting donations.' }, { status: 403 })
    }

    // Standardized financial breakdown in pesewas (BIGINT equivalent)
    // 1. Convert to pesewas
    const amountPesewas = Math.round(amount * 100)
    const tipPesewas = Math.round(tipAmount * 100)
    
    // 2. Calculate platform fee: 2.9% + GHS 0.50
    const platformFeePesewas = Math.round(amountPesewas * 0.029) + 50
    
    // 3. Final calculations
    const amountPaidPesewas = amountPesewas + tipPesewas
    const transactionFeePesewas = platformFeePesewas + tipPesewas
    const netAmountPesewas = amountPaidPesewas - transactionFeePesewas // What fundraiser gets

    const reference = `EVG_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`

    // Insert donation with standardized columns
    const { data: donation, error: insertErr } = await supabase
      .from('donations')
      .insert({
        campaign_id:         campaignId,
        donor_name:          donorName,
        donor_email:         donorEmail,
        amount_paid:         amountPaidPesewas,    // Total (Gross + Tip)
        transaction_fee:     transactionFeePesewas, // Platform takes (Fee + Tip)
        net_amount:          netAmountPesewas,      // Fundraiser gets (Gross - Fee)
        donor_tip:           tipPesewas,            // Tracked separately for analytics
        reference:           reference,
        message:             message || null,
        payment_method:      method,
        status:              'pending',
      })
      .select('id')
      .single()

    if (insertErr || !donation) {
      console.error('Donation insert error:', insertErr)
      return NextResponse.json({ error: 'Could not process donation. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      donationId: donation.id,
      reference,
      amount: amountPesewas,
      tip_amount: tipPesewas,
      total: amountPaidPesewas,
      donor_email: donorEmail,
      donor_name: donorName,
      campaign_title: campaign.title
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error.'
    console.error('Donate route error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
