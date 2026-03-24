import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { initiatePaystackTransfer, generateTransactionReference } from '@/lib/paystack-utils'

/**
 * Payout Trigger Endpoint
 * POST /api/payout/trigger
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { campaignId, amount } = body

    if (!campaignId || !amount) {
      return NextResponse.json({ error: 'Campaign ID and amount are required' }, { status: 400 })
    }

    // 1. Fetch Campaign and Profile payout details bono.
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*, profiles:user_id (payout_details)')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found or unauthorized' }, { status: 404 })
    }

    const payoutDetails = (campaign.profiles as any)?.payout_details
    if (!payoutDetails || !payoutDetails.recipient_code) {
      return NextResponse.json({ error: 'Payout method not set up' }, { status: 400 })
    }

    // 2. Validate Milestone bono.
    if (!campaign.milestone_reached) {
      return NextResponse.json({ 
        error: 'Withdrawal locked until milestone (GHS 500 or 25%) is reached bono.' 
      }, { status: 403 })
    }

    // 3. Initiate Paystack Transfer bono.
    const reference = generateTransactionReference()
    
    // Convert GHS to pesewas if amount is in GHS bono.
    // Assuming 'amount' from frontend is GHS bono.
    const amountPesewas = Math.round(amount * 100)

    const transfer = await initiatePaystackTransfer({
      amount: amountPesewas,
      recipient: payoutDetails.recipient_code,
      reason: `Payout for campaign: ${campaign.title}`,
      reference
    })

    // 4. Log Payout bono.
    await supabase.from('payouts').insert({
      campaign_id: campaign.id,
      amount: amountPesewas,
      status: transfer.status === 'success' ? 'success' : 'processing',
      transfer_reference: reference,
      paystack_transfer_id: String(transfer.id),
      metadata: {
        paystack_data: transfer.data,
        fundraiser_id: user.id
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Payout initiated successfully bono.', 
      transfer_code: transfer.transferCode 
    })
  } catch (error: any) {
    console.error('[Payout Trigger] Error:', error)
    return NextResponse.json({ error: error.message || 'Transfer failed' }, { status: 500 })
  }
}
