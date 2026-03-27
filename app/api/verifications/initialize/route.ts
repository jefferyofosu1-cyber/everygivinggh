import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-admin'
import { initializePaystackPayment, generateTransactionReference, ghsToPesewas } from '@/lib/paystack-utils'

export async function POST(req: Request) {
  try {
    const { campaignId, email } = await req.json()

    if (!campaignId || !email) {
      return NextResponse.json({ error: 'Missing campaignId or email' }, { status: 400 })
    }

    const supabase = createClient()
    
    // Fetch campaign to verify tier and goal
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('goal_amount, verification_tier, status')
      .eq('id', campaignId)
      .single()

    if (fetchError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Determine fee based on tier (Standard: 50, Premium: 100)
    let feeGHS = 0
    if (campaign.verification_tier === 'standard') feeGHS = 50
    if (campaign.verification_tier === 'premium') feeGHS = 100

    if (feeGHS === 0) {
      return NextResponse.json({ error: 'No verification fee required for this tier' }, { status: 400 })
    }

    const reference = generateTransactionReference()
    const amountPesewas = ghsToPesewas(feeGHS)

    // Initialize Paystack
    const response = await initializePaystackPayment({
      amount: amountPesewas,
      email,
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/create/success?title=${encodeURIComponent('Payment Success')}&slug=${campaignId}`,
      metadata: {
        type: 'verification',
        campaign_id: campaignId,
        tier: campaign.verification_tier
      }
    })

    if (!response.success) {
      return NextResponse.json({ error: 'Failed to initialize Paystack' }, { status: 500 })
    }

    // Update campaign with the reference
    await supabase
      .from('campaigns')
      .update({ verification_reference: reference })
      .eq('id', campaignId)

    return NextResponse.json({ authorizationUrl: response.authorizationUrl })
  } catch (error: any) {
    console.error('Verification init error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
