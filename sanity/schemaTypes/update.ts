import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'campaignUpdate',
  title: 'Campaign Update',
  type: 'document',
  fields: [
    defineField({
      name: 'campaign',
      title: 'Campaign',
      type: 'reference',
      to: [{ type: 'campaign' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updateTitle',
      title: 'Update Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(5),
    }),
    defineField({
      name: 'updateBody',
      title: 'Update Body',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'updateTitle',
      subtitle: 'campaign.title',
      media: 'images.0',
    },
  },
})

