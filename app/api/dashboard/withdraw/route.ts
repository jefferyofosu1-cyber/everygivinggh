import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const amount = parseFloat(body.amount)
    const method = body.method

    if (isNaN(amount) || amount < 10) {
      return NextResponse.json({ error: 'Invalid amount. Minimum withdrawal is GH₵10.' }, { status: 400 })
    }

    // Check if they have enough balance by summing available_payout_balance of their approved campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('available_payout_balance')
      .eq('user_id', user.id)
      .eq('status', 'approved')

    const totalAvailable = (campaigns || []).reduce((acc, c) => acc + (Number(c.available_payout_balance) || 0), 0)

    // Check pending payouts
    const { data: pendingPayouts } = await supabase
      .from('payout_requests')
      .select('amount')
      .eq('fundraiser_user_id', user.id)
      .in('status', ['requested', 'approved', 'processing'])

    const pendingTotal = (pendingPayouts || []).reduce((acc, p) => acc + parseFloat(p.amount), 0)
    const available = totalAvailable - pendingTotal

    if (amount > available) {
      return NextResponse.json({ error: `Insufficient unlocked funds. You have GH₵${available.toFixed(2)} available for payout based on your passed milestones.` }, { status: 400 })
    }

    // Fetch profile to get destination info
    const { data: profile } = await supabase
      .from('profiles')
      .select('momo_network, momo_number, bank_name, bank_account')
      .eq('id', user.id)
      .single()

    const destination = method === 'momo' 
      ? { type: 'momo', network: profile?.momo_network, number: profile?.momo_number }
      : { type: 'bank', bank: profile?.bank_name, account: profile?.bank_account }

    if ((method === 'momo' && !destination.number) || (method === 'bank' && !destination.account)) {
      return NextResponse.json({ error: 'Payout details not set.' }, { status: 400 })
    }

    // Insert payout request
    const { data: payout, error: insertErr } = await supabase
      .from('payout_requests')
      .insert({
        fundraiser_user_id: user.id,
        amount,
        destination,
        status: 'requested'
      })
      .select()
      .single()

    if (insertErr || !payout) {
      console.error('Insert payout error:', insertErr)
      return NextResponse.json({ error: 'Failed to create payout request.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, payout })

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unexpected error.'
    console.error('Withdraw route error:', errorMsg)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
