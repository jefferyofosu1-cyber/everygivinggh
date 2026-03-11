import { NextRequest } from 'next/server'
import { requireAdmin, apiError, apiSuccess } from '@/lib/api-security'
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '@/lib/sanityClient'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (id) {
    const campaign = await getCampaignById(id)
    if (!campaign) return apiError('Campaign not found', 404)
    return apiSuccess({ campaign })
  }

  const campaigns = await getCampaigns()
  return apiSuccess({ campaigns })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const campaign = await createCampaign(body)
    return apiSuccess({ campaign }, 201)
  } catch (error: any) {
    console.error('createCampaign error', error)
    return apiError('Failed to create campaign', 500)
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { id, ...updates } = body || {}
    if (!id) return apiError('Missing campaign id', 400)

    const campaign = await updateCampaign(id, updates)
    return apiSuccess({ campaign })
  } catch (error: any) {
    console.error('updateCampaign error', error)
    return apiError('Failed to update campaign', 500)
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return apiError('Missing campaign id', 400)

    await deleteCampaign(id)
    return apiSuccess({ ok: true })
  } catch (error: any) {
    console.error('deleteCampaign error', error)
    return apiError('Failed to delete campaign', 500)
  }
}

