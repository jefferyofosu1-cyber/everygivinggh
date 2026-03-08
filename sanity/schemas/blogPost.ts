export default {
  name: 'blogPost', title: 'Blog Post', type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Title', validation: (R: any) => R.required() },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title' }, validation: (R: any) => R.required() },
    { name: 'category', type: 'string', title: 'Category', options: { list: ['Tips','Verification','Sharing','Medical','Faith','Education','Team','Strategy','Community'] } },
    { name: 'excerpt', type: 'text', title: 'Excerpt', rows: 3 },
    { name: 'coverImage', type: 'image', title: 'Cover Image', options: { hotspot: true } },
    { name: 'body', type: 'array', title: 'Body', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] },
    { name: 'publishedAt', type: 'datetime', title: 'Published At', initialValue: () => new Date().toISOString() },
    { name: 'featured', type: 'boolean', title: 'Featured?', initialValue: false },
  ],
  preview: { select: { title: 'title', subtitle: 'category', media: 'coverImage' } },
}
