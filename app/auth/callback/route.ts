import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/create'
  const origin = url.origin

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      console.error('Auth callback exchange error:', error.message)
    } catch (e) {
      console.error('Auth callback error:', e)
    }
  }

  return NextResponse.redirect(`${origin}/auth/confirm?error=1`)
}
