# EveryGiving — Sanity Studio Setup
## You've already signed up with GitHub. Here are the exact steps.

---

## STEP 1: Get your Project ID
1. Go to **https://sanity.io/manage**
2. You'll see your project listed — click it
3. Copy the **Project ID** (looks like: `abc12def`)
4. Note your dataset name — it's probably `production`

---

## STEP 2: Add env vars to Vercel
In **Vercel → your project → Settings → Environment Variables**, add:

```
NEXT_PUBLIC_SANITY_PROJECT_ID = abc12def      ← your actual ID from step 1
NEXT_PUBLIC_SANITY_DATASET    = production
SANITY_API_TOKEN              = (generate below)
ADMIN_EMAIL                   = jefferyofosu1@gmail.com
```

To generate `SANITY_API_TOKEN`:
- Sanity Manage → your project → API → Tokens → Add API token
- Name: "EveryGiving Server" · Permission: **Editor** → Save → Copy token

---

## STEP 3: Install packages (run locally in your project)
```bash
npm install next-sanity @sanity/image-url @portabletext/react
```

---

## STEP 4: Add these files to your GitHub repo

### `sanity.config.ts` (in project root)
```ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'everygiving',
  title: 'EveryGiving CMS',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
```

### `sanity/schemas/index.ts`
```ts
import blogPost from './blogPost'
import fundraisingTip from './fundraisingTip'
import homepageContent from './homepageContent'

export const schemaTypes = [blogPost, fundraisingTip, homepageContent]
```

### `sanity/schemas/blogPost.ts`
```ts
export default {
  name: 'blogPost',
  title: 'Blog Post',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Title', validation: (R: any) => R.required() },
    { name: 'slug', type: 'slug', title: 'Slug', options: { source: 'title' }, validation: (R: any) => R.required() },
    { name: 'category', type: 'string', title: 'Category', options: { list: ['Tips','Verification','Sharing','Medical','Faith','Education','Team','Strategy','Community'] } },
    { name: 'excerpt', type: 'text', title: 'Excerpt (short description)', rows: 3 },
    { name: 'coverImage', type: 'image', title: 'Cover Image', options: { hotspot: true } },
    { name: 'body', type: 'array', title: 'Article body', of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }] },
    { name: 'publishedAt', type: 'datetime', title: 'Published At', initialValue: () => new Date().toISOString() },
    { name: 'featured', type: 'boolean', title: 'Featured post?', initialValue: false },
  ],
  preview: { select: { title: 'title', subtitle: 'category', media: 'coverImage' } },
}
```

### `sanity/schemas/fundraisingTip.ts`
```ts
export default {
  name: 'fundraisingTip',
  title: 'Fundraising Tip',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Tip title' },
    { name: 'tag', type: 'string', title: 'Tag (e.g. Trust, Sharing)' },
    { name: 'icon', type: 'string', title: 'Emoji icon (e.g. 📸)' },
    { name: 'body', type: 'text', title: 'Tip body', rows: 4 },
    { name: 'stat', type: 'string', title: 'Key stat (e.g. 3×)' },
    { name: 'statLabel', type: 'string', title: 'Stat label (e.g. more raised)' },
    { name: 'order', type: 'number', title: 'Display order' },
  ],
}
```

### `sanity/schemas/homepageContent.ts`
```ts
export default {
  name: 'homepageContent',
  title: 'Homepage Content',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'heroTitle', type: 'string', title: 'Hero main title' },
    { name: 'heroSubtitle', type: 'text', title: 'Hero subtitle', rows: 2 },
    { name: 'heroCta', type: 'string', title: 'Hero CTA button text' },
    { name: 'statsRaised', type: 'string', title: 'Total raised stat (e.g. ₵2.4M+)' },
    { name: 'statsCampaigns', type: 'string', title: 'Campaigns stat (e.g. 1,200+)' },
    { name: 'statsDonors', type: 'string', title: 'Donors stat (e.g. 8,900+)' },
  ],
}
```

### `app/studio/[[...tool]]/page.tsx`
```tsx
import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export const dynamic = 'force-static'
export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

### `lib/sanity.client.ts`
```ts
import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-03-01',
  useCdn: true,
})

export async function getBlogPosts() {
  return sanityClient.fetch(`
    *[_type == "blogPost"] | order(publishedAt desc) {
      title, slug, excerpt, category, publishedAt, featured,
      "coverUrl": coverImage.asset->url
    }
  `)
}

export async function getBlogPost(slug: string) {
  return sanityClient.fetch(`
    *[_type == "blogPost" && slug.current == $slug][0] {
      title, excerpt, category, publishedAt, body,
      "coverUrl": coverImage.asset->url
    }
  `, { slug })
}
```

---

## STEP 5: Add CORS in Sanity dashboard
- Go to **sanity.io/manage** → your project → **API** → **CORS Origins** → Add:
  - `https://everygiving.org`
  - `https://everygiving.org/studio`  
  - `http://localhost:3000`
- Check **Allow credentials** for all three

---

## STEP 6: Push to GitHub → Vercel redeploys
After adding all the files, push to GitHub. Vercel will automatically rebuild.

---

## STEP 7: Access your Studio
Visit: **https://everygiving.org/studio**

Log in with your GitHub account (the same one linked to Sanity).

You can now:
- Write and publish **blog posts** without touching code
- Edit **fundraising tips**
- Update **homepage stats** (₵2.4M raised, etc.)

---

## What stays in Supabase (don't move this)
- Campaigns, donations, users, auth, MoMo payments
- Admin approval/review system
- ID document uploads

## What goes in Sanity (move this)
- Blog posts
- Fundraising tips
- Homepage hero text
- Static page content (About, Help FAQ)
