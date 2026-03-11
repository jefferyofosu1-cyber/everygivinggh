import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, sanitiseString } from '@/lib/api-security'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id, status, note } = await req.json()

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing campaign id or status' }, { status: 400 })
    }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ status, verified: status === 'approved' })
      .eq('id', id)

    if (updateError) {
      console.error('Campaign update error:', updateError)
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 })
    }

    // Look up fundraiser email to send notification
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('title, user_id, profiles(full_name, email)')
      .eq('id', id)
      .single()

    if (campaign) {
      const profile = campaign.profiles as any
      const fundraiserEmail = profile?.email
      const fundraiserName = profile?.full_name?.split(' ')[0] || 'there'

      if (fundraiserEmail) {
        const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
        const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://everygiving.org'

        if (BREVO_API_KEY) {
          try {
            await fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sender: { name: 'EveryGiving', email: 'business@everygiving.org' },
                to: [{ email: fundraiserEmail, name: fundraiserName }],
                subject: status === 'approved'
                  ? `Your campaign "${campaign.title}" is live!`
                  : `Your campaign "${campaign.title}" — update from EveryGiving`,
                htmlContent: `<p>Your campaign "${sanitiseString(campaign.title)}" has been ${status}.</p>${note ? `<p>Note: ${sanitiseString(note)}</p>` : ''}`,
              }),
            })
          } catch (e) {
            console.error('Status email failed:', e)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin campaign update error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
