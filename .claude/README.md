# EveryGiving — Media Upload System

Photos and videos handled completely differently — on purpose.

## The Core Principle

| Media | Approach | Why |
|---|---|---|
| **Photos** | Upload to S3, serve via CloudFront | You control the file, cheap at scale, fast globally |
| **Videos** | YouTube/TikTok link only — embed only | Free hosting, free streaming, free transcoding |

## Photo Upload Flow

```
Browser picks file
      ↓
browser-image-compression (in browser, instant, free)
  15MB HEIC → 1.2MB WebP
      ↓
POST /api/media/photo/presign → your server
  Server generates temporary S3 URL (expires in 10 min)
      ↓
Browser PUTs compressed file DIRECTLY to S3
  Your server never touches the bytes
      ↓
CloudFront serves the file globally at cdn.everygiving.org
```

## Video Flow

```
Campaigner records on phone → uploads to YouTube (free, even as unlisted)
      ↓
Pastes YouTube URL into EveryGiving update form
      ↓
POST /api/media/video/parse → your server
  Server extracts video ID and embed URL (no download, no storage)
      ↓
Campaign page embeds YouTube player with that ID
  YouTube hosts, streams, and transcodes everything for free
```

## Setup

### 1. AWS S3 bucket
- Create a private S3 bucket (block all public access)
- Add this CORS policy to allow browser uploads:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": ["https://everygiving.org"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 2. CloudFront distribution
- Create a CloudFront distribution pointing to your S3 bucket
- Use Origin Access Control (OAC) — not OAI — to keep the bucket private
- Set your domain: cdn.everygiving.org → your CloudFront domain

### 3. Install dependencies

**Backend:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Frontend:**
```bash
npm install browser-image-compression
```

### 4. Environment variables

```env
AWS_REGION=af-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=everygiving-media
CLOUDFRONT_URL=https://cdn.everygiving.org
```

### 5. Mount the routes

```js
// app.js
const mediaRouter = require('./src/routes');
app.use('/api/media', mediaRouter);
```

## Cost estimate (for context)

At 1,000 campaigns with 10 photos each at 1.5MB average:

- S3 storage: ~15GB → ~$0.35/month
- CloudFront data transfer (assume 100,000 page views): ~$1.50/month
- Total: under $2/month at this scale

Video costs: $0 forever — YouTube pays for that.

## Why not host videos yourself?

A single 2-minute phone video is 100–300MB raw.
At 1,000 campaign updates with video, that's 100GB–300GB storage.
Plus transcoding costs (converting to web formats) plus streaming bandwidth.
YouTube does all of this for free and delivers it faster than you ever could.
The only downside is your video lives on YouTube — which for a campaigner
sharing updates, is actually a feature: they can share the YouTube link
directly too.
