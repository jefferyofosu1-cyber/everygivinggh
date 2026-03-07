import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/create'
  const origin = url.origin

  if (code) {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch (_) {
      // fall through
    }
  }

  return NextResponse.redirect(`${origin}/auth/confirm?error=1`)
}
