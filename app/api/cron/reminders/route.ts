import { validateCronAuth, cronSuccess, cronError } from '@/lib/cron-auth'
import { NudgeService } from '@/lib/nudges'

/**
 * POST /api/cron/reminders
 * Triggered every hour by GitHub Actions.
 * Handles: 6h, 24h, 48h nudges and inactivity prompts.
 */
export async function POST(request: Request) {
  const auth = validateCronAuth(request)
  if (!auth.isValid) return cronError(auth.error!, auth.status)

  try {
    console.log('[Cron] Processing fundraiser reminders...')
    await NudgeService.processNudges()
    return cronSuccess('Reminders processed successfully')
  } catch (error: any) {
    return cronError(error.message)
  }
}
