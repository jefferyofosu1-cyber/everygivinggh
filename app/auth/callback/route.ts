import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/create'

  if (code) {
    // Exchange code via Supabase REST API directly — no @supabase/ssr needed
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=pkce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ auth_code: code }),
      })

      if (res.ok) {
        const { access_token, refresh_token } = await res.json()
        const response = NextResponse.redirect(new URL(next, requestUrl.origin))
        // Set session cookies so the client picks them up
        response.cookies.set('sb-access-token', access_token, { path: '/', httpOnly: false, sameSite: 'lax' })
        response.cookies.set('sb-refresh-token', refresh_token, { path: '/', httpOnly: false, sameSite: 'lax' })
        return response
      }
    } catch (_) {
      // fall through to error redirect
    }
  }

  return NextResponse.redirect(new URL('/auth/confirm?error=1', requestUrl.origin))
}
