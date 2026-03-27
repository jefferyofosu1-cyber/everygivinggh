import { NextRequest, NextResponse } from 'next/server'

/**
 * Validates the Authorization header for cron job endpoints.
 * Expects: Authorization: Bearer <CRON_SECRET>
 */
export function validateCronAuth(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('[Cron Auth] CRON_SECRET is not configured in environment variables')
    return { isValid: false, error: 'Internal Server Error', status: 500 }
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron Auth] Unauthorized access attempt')
    return { isValid: false, error: 'Unauthorized', status: 401 }
  }

  return { isValid: true }
}

/**
 * Standardized success response for cron jobs.
 */
export function cronSuccess(message: string) {
  return NextResponse.json({ success: true, message })
}

/**
 * Standardized error response for cron jobs.
 */
export function cronError(error: string, status: number = 500) {
  return NextResponse.json({ success: false, error }, { status })
}
