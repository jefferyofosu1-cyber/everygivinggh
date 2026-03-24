/**
 * Payment Initialization Endpoint
 * POST /api/paystack/initialize
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import {
  initializePaystackPayment,
  calculateTransactionFeePesewas,
  generateTransactionReference,
  ghsToPesewas,
} from '@/lib/paystack-utils'

interface PaymentInitRequest {
  amount: number // Donation amount in GHS
  tip?: number // Optional tip in GHS
  email: string
  campaignId: string
  donorId?: string
  donorName?: string
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentInitRequest = await request.json()

    // Validate request
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be greater than 0.' },
        { status: 400 }
      )
    }

    if (!body.email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    if (!body.campaignId) {
      return NextResponse.json({ error: 'Campaign ID is required.' }, { status: 400 })
    }

    const supabase = await getAdminClient()

    console.log('[Payment Init] Searching for campaign:', body.campaignId)

    // 1. Fetch Campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', body.campaignId)
      .single()

    if (campaignError || !campaign) {
      console.error('[Payment Init] Campaign fetch error:', {
        id: body.campaignId,
        error: campaignError?.message,
        details: campaignError?.details,
        hint: campaignError?.hint
      })
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })
    }

    // 2. Calculation logic
    const amountPesewas = ghsToPesewas(body.amount)
    const tipPesewas = body.tip ? ghsToPesewas(body.tip) : 0
    const standardFee = calculateTransactionFeePesewas(amountPesewas)
    const paystackTotalPesewas = amountPesewas + tipPesewas
    
    const reference = generateTransactionReference()

    // 3. Create donation
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        campaign_id: campaign.id,
        donor_id: body.donorId || null,
        donor_name: body.donorName || 'Anonymous',
        donor_email: body.email,
        amount_paid: amountPesewas,
        tip_amount: tipPesewas,
        paystack_fee: standardFee,
        net_received: amountPesewas - standardFee,
        message: body.message || null,
        reference,
        status: 'pending',
      })
      .select('id')
      .single()

    if (donationError) {
      console.error('Donation error:', donationError)
      return NextResponse.json({ error: 'Failed to create donation.' }, { status: 500 })
    }

    // 4. Initialize Paystack
    const paystackResponse = await initializePaystackPayment({
      amount: amountPesewas,
      tip: tipPesewas,
      email: body.email,
      subaccountCode: campaign.subaccount_code,
      reference,
      metadata: {
        donation_id: donation.id,
        campaign_id: campaign.id,
        campaign_title: campaign.title,
        donor_name: body.donorName || 'Anonymous',
      },
    })

    // 5. Update reference
    await supabase
      .from('donations')
      .update({ paystack_reference: paystackResponse.reference })
      .eq('id', donation.id)

    return NextResponse.json({
      success: true,
      donation: { id: donation.id, reference },
      payment: {
        accessCode: paystackResponse.accessCode,
        authorizationUrl: paystackResponse.authorizationUrl,
      },
    })
  } catch (error: any) {
    console.error('[Payment Init] Error:', error)
    return NextResponse.json({ error: error.message || 'Initialization failed' }, { status: 500 })
  }
}
