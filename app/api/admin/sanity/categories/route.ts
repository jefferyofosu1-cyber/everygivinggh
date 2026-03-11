import { NextRequest } from 'next/server'
import { requireAdmin, apiError, apiSuccess } from '@/lib/api-security'
import {
  getCategories,
  createCategory,
  updateCategory,
} from '@/lib/sanityClient'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const categories = await getCategories()
  return apiSuccess({ categories })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const category = await createCategory(body)
    return apiSuccess({ category }, 201)
  } catch (error: any) {
    console.error('createCategory error', error)
    return apiError('Failed to create category', 500)
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { id, ...updates } = body || {}
    if (!id) return apiError('Missing category id', 400)

    const category = await updateCategory(id, updates)
    return apiSuccess({ category })
  } catch (error: any) {
    console.error('updateCategory error', error)
    return apiError('Failed to update category', 500)
  }
}

