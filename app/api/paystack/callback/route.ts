/**
 * Paystack Callback Handler
 * GET /api/paystack/callback
 *
 * Paystack redirects here after payment. We verify the transaction,
 * update the donation status, then redirect to the success page.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase-admin'
import { verifyPaystackPayment } from '@/lib/paystack-utils'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const campaignId = searchParams.get('campaign') || ''
  const amount = searchParams.get('amount') || ''
  const name = searchParams.get('name') || ''

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://everygiving.org'

  if (!reference) {
    console.error('[Paystack Callback] No reference provided')
    return NextResponse.redirect(`${baseUrl}/donate?error=missing_reference`)
  }

  try {
    // 1. Verify the payment with Paystack
    const verification = await verifyPaystackPayment(reference)

    const supabase = await getAdminClient()

    if (verification.status === 'success') {
      // 2. Update donation status to completed
      const { error: updateError } = await supabase
        .from('donations')
        .update({ status: 'completed' })
        .eq('paystack_reference', reference)

      if (updateError) {
        console.error('[Paystack Callback] Failed to update donation:', updateError)
      }

      // 3. Update campaign raised_amount
      if (campaignId) {
        const amountPesewas = verification.amount || 0
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('raised_amount')
          .eq('id', campaignId)
          .single()

        if (campaign) {
          await supabase
            .from('campaigns')
            .update({ raised_amount: (campaign.raised_amount || 0) + amountPesewas })
            .eq('id', campaignId)
        }
      }

      // 4. Redirect to success page
      const successParams = new URLSearchParams({
        campaign: campaignId,
        amount,
        name,
      })
      return NextResponse.redirect(`${baseUrl}/success?${successParams.toString()}`)
    } else {
      // Payment was not successful
      console.warn('[Paystack Callback] Payment not successful:', verification.status)

      await supabase
        .from('donations')
        .update({ status: 'failed' })
        .eq('paystack_reference', reference)

      return NextResponse.redirect(
        `${baseUrl}/donate?error=payment_failed&campaign=${campaignId}`
      )
    }
  } catch (error: any) {
    console.error('[Paystack Callback] Error:', error.message)
    return NextResponse.redirect(
      `${baseUrl}/donate?error=verification_failed&campaign=${campaignId}`
    )
  }
}
