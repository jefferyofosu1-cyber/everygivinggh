import { NextRequest, NextResponse } from 'next/server'
import { sanityWriteClient, sanityClient } from '@/lib/sanity'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

// GET — list all page content documents or fetch a specific page (public for frontend)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = searchParams.get('page')

  if (page) {
    const doc = await sanityClient.fetch(
      `*[_type == "pageContent" && slug == $page][0]`,
      { page },
    )
    return NextResponse.json({ content: doc || null })
  }

  const pages = await sanityClient.fetch(
    `*[_type == "pageContent"] | order(slug asc) { _id, slug, title, _updatedAt }`,
  )
  return NextResponse.json({ pages })
}

// POST — create or update page content (admin only)
export async function POST(request: NextRequest) {
  const auth = await requirePermission('content.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const { slug, title, sections } = body

  if (!slug || !title) {
    return NextResponse.json({ error: 'slug and title are required' }, { status: 400 })
  }

  // Check if document exists
  const existing = await sanityWriteClient.fetch(
    `*[_type == "pageContent" && slug == $slug][0]{ _id }`,
    { slug },
  )

  if (existing) {
    // Update
    const doc = await sanityWriteClient.patch(existing._id).set({ title, sections }).commit()
    await logAdminAudit({
      actorUserId: auth.user.id,
      action: 'content.update',
      entityType: 'pageContent',
      entityId: slug,
      afterState: { title },
    })
    return NextResponse.json({ _id: doc._id, slug, updated: true })
  }

  // Create
  const doc = await sanityWriteClient.create({
    _type: 'pageContent',
    slug,
    title,
    sections,
  })

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'content.create',
    entityType: 'pageContent',
    entityId: slug,
    afterState: { title },
  })

  return NextResponse.json({ _id: doc._id, slug, created: true })
}

// DELETE — remove page content (admin only)
export async function DELETE(request: NextRequest) {
  const auth = await requirePermission('content.manage')
  if (auth.error) return auth.error

  const body = await request.json()
  const { slug } = body

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  const existing = await sanityWriteClient.fetch(
    `*[_type == "pageContent" && slug == $slug][0]{ _id }`,
    { slug },
  )

  if (!existing) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  await sanityWriteClient.delete(existing._id)
  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'content.delete',
    entityType: 'pageContent',
    entityId: slug,
  })
  return NextResponse.json({ deleted: true, slug })
}
