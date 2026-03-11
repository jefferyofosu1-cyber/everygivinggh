import { NextRequest } from 'next/server'
import { requireAdmin, apiError, apiSuccess } from '@/lib/api-security'
import { getDonations, createDonation } from '@/lib/sanityClient'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const donations = await getDonations()
  return apiSuccess({ donations })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const donation = await createDonation(body)
    return apiSuccess({ donation }, 201)
  } catch (error: any) {
    console.error('createDonation error', error)
    return apiError('Failed to create donation', 500)
  }
}

