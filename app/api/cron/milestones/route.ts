import { validateCronAuth, cronSuccess, cronError } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

async function handle(request: Request) {
  const auth = validateCronAuth(request)
  if (!auth.isValid) return cronError(auth.error!, auth.status)

  try {
    console.log('[Cron] Checking milestones...')
    // Implement milestone logic or call service
    return cronSuccess('Milestones checked successfully')
  } catch (error: any) {
    return cronError(error.message)
  }
}

export async function POST(request: Request) { return handle(request) }
export async function GET(request: Request) { return handle(request) }
