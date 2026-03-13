import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, sanitiseString } from '@/lib/api-security'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('donations')
    .select('*, campaigns(title, user_id, profiles(full_name))')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ donations: data ?? [] })
}

// PATCH — update donation status or donor details
export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'Missing donation id' }, { status: 400 })

    const allowedFields = ['status', 'donor_name', 'donor_email', 'message']
    const updates: Record<string, any> = {}

    for (const key of allowedFields) {
      if (key in body) {
        if (key === 'status') {
          if (!['pending', 'success', 'failed'].includes(body.status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
          }
          updates.status = body.status
        } else {
          updates[key] = sanitiseString(body[key], 500)
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('donations').update(updates).eq('id', id)

    if (error) {
      console.error('Donation update error:', error)
      return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin donation update error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}

// DELETE — remove a donation record
export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Missing donation id' }, { status: 400 })

    const supabase = createAdminClient()
    const { error } = await supabase.from('donations').delete().eq('id', id)

    if (error) {
      console.error('Donation delete error:', error)
      return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin donation delete error:', err)
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 })
  }
}
