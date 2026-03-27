import { NextResponse } from 'next/server'
import { NudgeService } from '@/lib/nudges'

/**
 * GET /api/cron/nudges
 * Trigger the 48-hour fundraiser nudge sequence.
 * In a production environment, this should be protected by a CRON_SECRET header.
 */
export async function GET(request: Request) {
  try {
    console.log('[Cron] Starting fundraiser nudge processing...')
    await NudgeService.processNudges()
    return NextResponse.json({ success: true, message: 'Nudges processed successfully' })
  } catch (error: any) {
    console.error('[Cron] Nudge processing failed:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
