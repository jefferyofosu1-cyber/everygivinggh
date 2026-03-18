import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAdminClient } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const secret = process.env.PAYSTACK_SECRET_KEY
    if (!secret || secret.includes('REPLACE')) {
      console.warn('Paystack secret key is missing or invalid')
      // For local testing without a secret, do not fail completely, but this should be strict in prod.
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
      }
    }

    if (secret && !secret.includes('REPLACE')) {
      const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
      }
    }

    const event = JSON.parse(rawBody)

    if (event.event === 'charge.success') {
      const data = event.data
      const donationId = data.reference // we use donation ID as reference

      const supabase = await getAdminClient()

      // Fetch the donation
      const { data: donation, error: donationErr } = await supabase
        .from('donations')
        .select('id, amount, status, campaign_id')
        .eq('id', donationId)
        .single()

      if (donationErr || !donation) {
        console.error('Donation not found:', donationId)
        return NextResponse.json({ ok: true }) // Return 200 so Paystack doesn't retry
      }

      if (donation.status === 'success') {
        return NextResponse.json({ ok: true }) // Already processed
      }

      // Calculate net amount (2.5% + GHS 0.50)
      const fee = parseFloat((donation.amount * 0.025 + 0.50).toFixed(2))
      const netAmount = parseFloat((donation.amount - fee).toFixed(2))

      // Update donation status
      await supabase
        .from('donations')
        .update({ status: 'success', payment_reference: String(data.id) })
        .eq('id', donation.id)

      // Fetch campaign to increment its raised_amount securely via Admin
      // Note: Ideally use an RPC for atomic increment, but this works for prototype
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, raised_amount')
        .eq('id', donation.campaign_id)
        .single()

      if (campaign) {
        const newRaised = (campaign.raised_amount || 0) + netAmount
        await supabase
          .from('campaigns')
          .update({ raised_amount: newRaised })
          .eq('id', campaign.id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Paystack webhook error:', error)
    return NextResponse.json({ ok: true }) // Return 200 anyway to prevent retries
  }
}
