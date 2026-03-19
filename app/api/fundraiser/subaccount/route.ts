/**
 * Subaccount Management Endpoint
 * GET - Fetch payout details & subaccount status
 * POST - Create/update payout details and generate Paystack subaccount
 * PATCH - Update existing payout details
 *
 * Path: /api/fundraiser/subaccount
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  createPaystackSubaccount,
  verifyBankAccount,
  getSupportedBanks,
} from '@/lib/paystack-utils'

// Mark route as dynamic since it requires authentication
export const dynamic = 'force-dynamic'

// ============================================================================
// TYPES
// ============================================================================

interface PayoutDetailsRequest {
  bankCode: string
  accountNumber: string
  accountHolder: string
  bankName: string
}

// ============================================================================
// GET: FETCH PAYOUT DETAILS & SUBACCOUNT STATUS
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch payout details
    const { data: payoutDetails, error: payoutError } = await supabase
      .from('payout_details')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (payoutError?.code === 'PGRST116') {
      // No payout details found
      return NextResponse.json({
        success: true,
        payoutDetails: null,
        subaccountCode: null,
      })
    }

    if (payoutError && payoutError.code !== 'PGRST116') {
      console.error('Payout details fetch error:', payoutError)
      return NextResponse.json(
        { error: 'Failed to fetch payout details' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payoutDetails: payoutDetails || null,
      subaccountCode: payoutDetails?.subaccount_code || null,
    })
  } catch (error) {
    console.error('[Subaccount GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subaccount details' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST: CREATE PAYOUT DETAILS & SUBACCOUNT
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: PayoutDetailsRequest = await request.json()

    // Validate request
    if (!body.bankCode || !body.accountNumber || !body.accountHolder) {
      return NextResponse.json(
        { error: 'Bank code, account number, and account holder are required.' },
        { status: 400 }
      )
    }

    if (body.accountNumber.length < 10) {
      return NextResponse.json(
        { error: 'Invalid account number format.' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`[Subaccount] Creating for user: ${user.id}`)

    // ====================================================================
    // 1. VERIFY BANK ACCOUNT
    // ====================================================================

    console.log(`[Subaccount] Verifying account: ${body.accountNumber}`)

    const verifyResponse = await verifyBankAccount(body.accountNumber, body.bankCode)

    if (!verifyResponse.success) {
      return NextResponse.json(
        { error: 'Bank account verification failed. Please check your details.' },
        { status: 400 }
      )
    }

    console.log(`[Subaccount] Account verified: ${verifyResponse.accountName}`)

    // ====================================================================
    // 2. CREATE PAYSTACK SUBACCOUNT
    // ====================================================================

    console.log(`[Subaccount] Creating Paystack subaccount...`)

    const subaccountResponse = await createPaystackSubaccount({
      businessName: body.accountHolder,
      settlementBank: body.bankCode,
      accountNumber: body.accountNumber,
      accountHolder: body.accountHolder,
    })

    if (!subaccountResponse.success) {
      return NextResponse.json(
        { error: 'Failed to create Paystack subaccount. Please try again.' },
        { status: 500 }
      )
    }

    console.log(`[Subaccount] Created: ${subaccountResponse.subaccountCode}`)

    // ====================================================================
    // 3. SAVE PAYOUT DETAILS TO DATABASE
    // ====================================================================

    const { data: payoutDetails, error: payoutError } = await supabase
      .from('payout_details')
      .upsert(
        {
          user_id: user.id,
          bank_code: body.bankCode,
          account_number: body.accountNumber,
          account_holder_name: body.accountHolder,
          bank_name: body.bankName,
          subaccount_code: subaccountResponse.subaccountCode,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (payoutError) {
      console.error('Payout details save error:', payoutError)
      return NextResponse.json(
        { error: 'Failed to save payout details' },
        { status: 500 }
      )
    }

    // ====================================================================
    // 4. UPDATE USER SUBACCOUNT CODE IN AUTH TABLE
    // ====================================================================

    // Store in auth.users for quick reference
    const { error: authError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...(user.user_metadata || {}),
        subaccount_code: subaccountResponse.subaccountCode,
      },
    })

    if (authError) {
      console.warn('Failed to update user metadata:', authError)
      // Continue anyway - payout_details is the source of truth
    }

    console.log(`[Subaccount] Success: ${subaccountResponse.subaccountCode}`)

    return NextResponse.json({
      success: true,
      message: 'Payout details saved and subaccount created successfully.',
      payoutDetails,
      subaccountCode: subaccountResponse.subaccountCode,
    })
  } catch (error) {
    console.error('[Subaccount POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create subaccount. Please try again.' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH: UPDATE PAYOUT DETAILS
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const body: Partial<PayoutDetailsRequest> = await request.json()

    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If bank account is being updated, verify it first
    if (body.accountNumber && body.bankCode) {
      const verifyResponse = await verifyBankAccount(body.accountNumber, body.bankCode)
      if (!verifyResponse.success) {
        return NextResponse.json(
          { error: 'Bank account verification failed.' },
          { status: 400 }
        )
      }
    }

    // Update payout details
    const { data: payoutDetails, error: payoutError } = await supabase
      .from('payout_details')
      .update({
        ...(body.bankCode && { bank_code: body.bankCode }),
        ...(body.accountNumber && { account_number: body.accountNumber }),
        ...(body.accountHolder && { account_holder_name: body.accountHolder }),
        ...(body.bankName && { bank_name: body.bankName }),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (payoutError) {
      console.error('Payout details update error:', payoutError)
      return NextResponse.json(
        { error: 'Failed to update payout details' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Payout details updated successfully.',
      payoutDetails,
    })
  } catch (error) {
    console.error('[Subaccount PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update subaccount details.' },
      { status: 500 }
    )
  }
}

// ============================================================================
// GET: FETCH LIST OF BANKS (for select dropdowns)
// ============================================================================

export async function OPTIONS(request: NextRequest) {
  // Return supported banks for UI population
  try {
    const banks = await getSupportedBanks()

    return NextResponse.json({
      success: true,
      banks: banks.map((bank: any) => ({
        code: bank.code,
        name: bank.name,
      })),
    })
  } catch (error) {
    console.error('[Banks] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banks list.' },
      { status: 500 }
    )
  }
}
