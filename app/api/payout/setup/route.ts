import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createTransferRecipient, verifyBankAccount } from '@/lib/paystack-utils'

/**
 * Payout Setup Endpoint
 * POST /api/payout/setup
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { 
      accountNumber, 
      bankCode, 
      accountName, 
      type = 'ghipss', // mobile_money or ghipss bono.
      campaignId 
    } = body

    if (!accountNumber || !bankCode || !accountName) {
      return NextResponse.json({ error: 'Missing account details' }, { status: 400 })
    }

    // 1. Create Paystack Transfer Recipient bono.
    const recipient = await createTransferRecipient({
      name: accountName,
      accountNumber,
      bankCode,
      type
    })

    const payoutDetails = {
      account_number: accountNumber,
      bank_code: bankCode,
      account_name: accountName,
      recipient_code: recipient.recipientCode,
      type,
      updated_at: new Date().toISOString()
    }

    // 2. Update Profile bono.
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ payout_details: payoutDetails })
      .eq('id', user.id)

    if (profileError) throw profileError

    // 3. Update Campaign status bono.
    if (campaignId) {
      await supabase
        .from('campaigns')
        .update({ payout_method_set: true })
        .eq('id', campaignId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payout method saved successfully bono.' 
    })
  } catch (error: any) {
    console.error('[Payout Setup] Error:', error)
    return NextResponse.json({ error: error.message || 'Setup failed' }, { status: 500 })
  }
}
