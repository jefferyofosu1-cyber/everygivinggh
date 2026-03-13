import { NextRequest, NextResponse } from 'next/server'
import { sanityWriteClient } from '@/lib/sanity'
import { requirePermission, logAdminAudit } from '@/lib/api-security'

// DELETE — remove a media document and its asset (admin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requirePermission('media.manage')
  if (auth.error) return auth.error

  const { id } = params

  // Fetch the document to get the asset reference
  const doc = await sanityWriteClient.fetch(
    `*[_type == "media.image" && _id == $id][0]{ _id, image { asset { _ref } } }`,
    { id },
  )

  if (!doc) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  // Delete the document first
  await sanityWriteClient.delete(id)

  // Delete the underlying asset
  if (doc.image?.asset?._ref) {
    try {
      await sanityWriteClient.delete(doc.image.asset._ref)
    } catch {
      // Asset might be referenced elsewhere — ignore
    }
  }

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'media.delete',
    entityType: 'media.image',
    entityId: id,
  })

  return NextResponse.json({ ok: true })
}

// PATCH — update title, alt, tags (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requirePermission('media.manage')
  if (auth.error) return auth.error

  const { id } = params
  const body = await request.json()

  const patch = sanityWriteClient.patch(id)

  if (body.title !== undefined) patch.set({ title: body.title })
  if (body.alt !== undefined) patch.set({ alt: body.alt })
  if (body.tags !== undefined) patch.set({ tags: body.tags })

  const result = await patch.commit()

  await logAdminAudit({
    actorUserId: auth.user.id,
    action: 'media.update',
    entityType: 'media.image',
    entityId: id,
    afterState: body,
  })

  return NextResponse.json({ ok: true, _id: result._id })
}
