import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'campaign',
  title: 'Campaign',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(10).max(120),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'story',
      title: 'Story',
      type: 'array',
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Medical', value: 'medical' },
          { title: 'Church & Faith', value: 'church' },
          { title: 'Education', value: 'education' },
          { title: 'Emergency', value: 'emergency' },
          { title: 'Community', value: 'community' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'goalAmount',
      title: 'Goal Amount (GHS)',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'amountRaised',
      title: 'Amount Raised (GHS)',
      type: 'number',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'beneficiaryName',
      title: 'Beneficiary Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'beneficiaryPhone',
      title: 'Beneficiary Phone',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'hospitalName',
      title: 'Hospital Name',
      type: 'string',
    }),
    defineField({
      name: 'verificationLevel',
      title: 'Verification Level',
      type: 'string',
      options: {
        list: [
          { title: 'Basic', value: 'basic' },
          { title: 'Standard', value: 'standard' },
          { title: 'Premium', value: 'premium' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Verified', value: 'verified' },
          { title: 'Active', value: 'active' },
          { title: 'Completed', value: 'completed' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'YouTube/Vimeo URL',
      type: 'url',
      description: 'Enter the full link to the campaign video (e.g., https://www.youtube.com/watch?v=...) bono.',
      validation: (Rule) => Rule.uri({
        scheme: ['http', 'https']
      })
    }),
    defineField({
      name: 'gallery',
      title: 'Image Gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            }
          ]
        }
      ],
      description: 'Add more photos to show the campaign progress. bono.'
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
      title: 'title',
      subtitle: 'beneficiaryName',
      media: 'coverImage',
    },
  },
})

