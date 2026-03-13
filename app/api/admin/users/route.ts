import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, sanitiseString, sanitiseEmail } from '@/lib/api-security'
import { getAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const supabase = await getAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*, campaigns(id, title, status)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: data ?? [] })
}

// PATCH — edit profile fields or toggle admin
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

    const updates: Record<string, any> = {}

    if ('full_name' in body) updates.full_name = sanitiseString(body.full_name, 200)
    if ('phone' in body) updates.phone = sanitiseString(body.phone, 30)
    if ('email' in body) {
      if (body.email) {
        const clean = sanitiseEmail(body.email)
        if (!clean) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        updates.email = clean
      } else {
        updates.email = null
      }
    }
    if ('is_admin' in body) updates.is_admin = Boolean(body.is_admin)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = await getAdminClient()
    const { error } = await supabase.from('profiles').update(updates).eq('id', id)

    if (error) {
      console.error('User update error:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin user update error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}

// DELETE — remove a user profile (does not delete auth user, only the profile row)
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing user id' }, { status: 400 })

    const supabase = await getAdminClient()

    // Delete user's donations first, then campaigns, then profile
    const { data: campaigns } = await supabase.from('campaigns').select('id').eq('user_id', id)
    if (campaigns && campaigns.length > 0) {
      const campaignIds = campaigns.map(c => c.id)
      await supabase.from('donations').delete().in('campaign_id', campaignIds)
      await supabase.from('campaigns').delete().eq('user_id', id)
    }

    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      console.error('User delete error:', error)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin user delete error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
