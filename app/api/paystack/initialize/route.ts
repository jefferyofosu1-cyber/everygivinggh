/**
 * Payment Initialization Endpoint
 * POST /api/paystack/initialize
 *
 * Initializes a Paystack payment with:
 * - Automatic fee calculation
 * - Subaccount-based fund splitting
 * - Transaction tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  initializePaystackPayment,
  calculateTransactionFeePesewas,
  generateTransactionReference,
  ghsToPesewas,
} from '@/lib/paystack-utils'

// ============================================================================
// TYPES
// ============================================================================

interface PaymentInitRequest {
  amount: number // Donation amount in GHS
  tip?: number // Optional tip in GHS
  email: string
  campaignId: string
  donorId?: string
  donorName?: string
  message?: string
}

// ============================================================================
// HANDLER
// ============================================================================

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

    // Validate amount (minimum 1 GHS, maximum 10,000 GHS)
    if (body.amount < 1 || body.amount > 10000) {
      return NextResponse.json(
        { error: 'Amount must be between GHS 1.00 and GHS 10,000.00' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // ========================================================================
    // 1. FETCH CAMPAIGN DETAILS
    // ========================================================================

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, user_id, subaccount_code, goal_amount')
      .eq('id', body.campaignId)
      .single()

    if (campaignError || !campaign) {
      console.error('Campaign fetch error:', campaignError)
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 })
    }

    // ========================================================================
    // 2. VERIFY FUNDRAISER HAS SUBACCOUNT
    // ========================================================================

    if (!campaign.subaccount_code) {
      return NextResponse.json(
        {
          error: 'Fundraiser has not set up payout details. Please contact the fundraiser.',
        },
        { status: 400 }
      )
    }

    // ========================================================================
    // 3. CONVERT AMOUNT TO PESEWAS
    // ========================================================================

    const amountPesewas = ghsToPesewas(body.amount)
    const tipPesewas = body.tip ? ghsToPesewas(body.tip) : 0
    const standardFee = calculateTransactionFeePesewas(amountPesewas)
    
    // Paystack total amount = donation + tip
    const paystackTotalPesewas = amountPesewas + tipPesewas
    
    // Total charge to subaccount = standard fee + tip
    // This ensures fundraiser gets: (total) - (standard fee + tip) = donation - standard fee
    const totalTransactionCharge = standardFee + tipPesewas
    
    // Net amount for fundraiser record
    const netAmount = amountPesewas - standardFee

    console.log(`[Payment Init] Tip: ${tipPesewas} pesewas`)
    console.log(`[Payment Init] Paystack Total: ${paystackTotalPesewas} pesewas`)
    console.log(`[Payment Init] Total Charge: ${totalTransactionCharge} pesewas`)
    console.log(`[Payment Init] Net to Fundraiser: ${netAmount} pesewas`)

    // ========================================================================
    // 4. GENERATE TRANSACTION REFERENCE
    // ========================================================================

    const reference = generateTransactionReference()

    // ========================================================================
    // 5. CREATE DONATION RECORD (PENDING)
    // ========================================================================

    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        campaign_id: campaign.id,
        donor_id: body.donorId || null,
        donor_name: body.donorName || 'Anonymous',
        donor_email: body.email,
        amount_paid: amountPesewas,
        donor_tip: tipPesewas,
        transaction_fee: standardFee,
        net_amount: netAmount,
        message: body.message || null,
        reference,
        status: 'pending',
        paystack_reference: null,
      })
      .select('id')
      .single()

    if (donationError) {
      console.error('Donation creation error:', donationError)
      return NextResponse.json(
        { error: 'Failed to initialize donation. Please try again.' },
        { status: 500 }
      )
    }

    // ========================================================================
    // 6. INITIALIZE PAYSTACK PAYMENT WITH SUBACCOUNT
    // ========================================================================

    const paystackResponse = await initializePaystackPayment({
      amount: paystackTotalPesewas, // Total collected from donor
      email: body.email,
      subaccountCode: campaign.subaccount_code,
      reference,
      metadata: {
        donation_id: donation.id,
        campaign_id: campaign.id,
        campaign_title: campaign.title,
        donor_name: body.donorName || 'Anonymous',
        message: body.message,
        donation_amount: amountPesewas,
        donor_tip: tipPesewas,
        transaction_fee: standardFee,
        net_amount: netAmount,
      },
    })

    // ========================================================================
    // 7. UPDATE DONATION WITH PAYSTACK REFERENCE
    // ========================================================================

    await supabase
      .from('donations')
      .update({
        paystack_reference: paystackResponse.reference,
      })
      .eq('id', donation.id)

    // ========================================================================
    // 8. RETURN RESPONSE
    // ========================================================================

    console.log(`[Payment Init] Success: ${reference}`)

    return NextResponse.json({
      success: true,
      donation: {
        id: donation.id,
        reference,
        amount: body.amount,
        tip: body.tip || 0,
        total: body.amount + (body.tip || 0),
        transactionFee: (standardFee / 100).toFixed(2),
        netAmount: (netAmount / 100).toFixed(2),
      },
      payment: {
        accessCode: paystackResponse.accessCode,
        authorizationUrl: paystackResponse.authorizationUrl,
      },
      campaign: {
        title: campaign.title,
      },
    })
  } catch (error) {
    console.error('[Payment Init] Error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize payment. Please try again.' },
      { status: 500 }
    )
  }
}
