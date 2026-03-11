import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'donation',
  title: 'Donation',
  type: 'document',
  fields: [
    defineField({
      name: 'donorName',
      title: 'Donor Name',
      type: 'string',
    }),
    defineField({
      name: 'donorEmail',
      title: 'Donor Email',
      type: 'string',
    }),
    defineField({
      name: 'amount',
      title: 'Amount (GHS)',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'campaign',
      title: 'Campaign',
      type: 'reference',
      to: [{ type: 'campaign' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 3,
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
      title: 'donorName',
      subtitle: 'campaign.title',
    },
    prepare(selection) {
      const { title, subtitle } = selection
      return {
        title: title || 'Anonymous',
        subtitle: subtitle ? `Campaign: ${subtitle}` : 'Donation',
      }
    },
  },
})

