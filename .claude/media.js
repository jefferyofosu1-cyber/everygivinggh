/**
 * EveryGiving — Media Service
 *
 * Photos: S3 presigned upload → CloudFront CDN delivery
 * Videos: YouTube/TikTok URL validation + embed ID extraction only
 *         (we never host video — YouTube does it for free)
 *
 * The presigned URL pattern means:
 *   1. Frontend asks your backend for an upload URL
 *   2. Backend generates a temporary S3 URL and returns it
 *   3. Frontend uploads the (already compressed) file DIRECTLY to S3
 *   4. Your server never touches the file — no bandwidth cost, no bottleneck
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME,
  CLOUDFRONT_URL,       // e.g. https://d1234abcd.cloudfront.net
} = process.env;

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Allowed image types — HEIC is common on iPhones
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const MAX_IMAGE_BYTES = 20 * 1024 * 1024; // 20MB — matches GoFundMe's limit


// ═══════════════════════════════════════════════════════════════════════════════
// PHOTOS — Presigned upload URL generation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a presigned S3 URL for direct photo upload from the browser.
 * The browser compresses the image first (see React component), then PUTs
 * directly to this URL — your server never receives the file bytes.
 *
 * @param {Object} params
 * @param {string} params.campaignId  - Used to organise files in S3
 * @param {string} params.updateId    - The specific update this photo belongs to
 * @param {string} params.mimeType    - e.g. 'image/jpeg'
 * @param {number} params.fileSize    - In bytes — validated before generating URL
 * @returns {Promise<{uploadUrl: string, fileKey: string, publicUrl: string}>}
 */
async function generatePhotoUploadUrl({ campaignId, updateId, mimeType, fileSize }) {
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    throw new Error(`File type ${mimeType} is not allowed. Use JPEG, PNG, or WEBP.`);
  }

  if (fileSize > MAX_IMAGE_BYTES) {
    throw new Error(`File too large. Maximum size is 20MB. Yours is ${(fileSize / 1024 / 1024).toFixed(1)}MB.`);
  }

  // Unique file key: campaigns/abc123/updates/upd456/photo-uuid.jpg
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
  const uniqueId = crypto.randomUUID();
  const fileKey = `campaigns/${campaignId}/updates/${updateId}/photo-${uniqueId}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
    ContentType: mimeType,
    ContentLength: fileSize,
    // Metadata stored with the file for debugging
    Metadata: {
      'campaign-id': campaignId,
      'update-id': updateId,
      'uploaded-at': new Date().toISOString(),
    },
  });

  // URL expires in 10 minutes — plenty of time for the browser to upload
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 600 });

  // The public URL via CloudFront (fast global delivery)
  const publicUrl = `${CLOUDFRONT_URL}/${fileKey}`;

  return { uploadUrl, fileKey, publicUrl };
}

/**
 * Delete a photo from S3 (e.g. when a campaigner removes an update)
 *
 * @param {string} fileKey - The S3 key returned from generatePhotoUploadUrl
 */
async function deletePhoto(fileKey) {
  await s3.send(new DeleteObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: fileKey,
  }));
}


// ═══════════════════════════════════════════════════════════════════════════════
// VIDEOS — URL validation and embed extraction
// We NEVER host video. YouTube and TikTok do it for free at massive scale.
// We just extract the video ID and store that — never the raw file.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Video URL patterns we support
 * YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
 * TikTok:  tiktok.com/@user/video/ID
 */
const VIDEO_PATTERNS = [
  {
    provider: 'youtube',
    // Matches standard, short, and Shorts URLs
    pattern: /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    thumbnailUrl: (id) => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
    embedUrl: (id) => `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`,
  },
  {
    provider: 'tiktok',
    pattern: /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    thumbnailUrl: (id) => null, // TikTok doesn't expose public thumbnails easily
    embedUrl: (id) => `https://www.tiktok.com/embed/v2/${id}`,
  },
];

/**
 * Parse and validate a video URL submitted by a campaigner.
 * Returns the embed URL and thumbnail — nothing is downloaded or stored.
 *
 * @param {string} url - Raw URL pasted by the campaigner
 * @returns {{provider: string, videoId: string, embedUrl: string, thumbnailUrl: string|null}}
 */
function parseVideoUrl(url) {
  if (!url || typeof url !== 'string') {
    throw new Error('Please paste a YouTube or TikTok video URL.');
  }

  // Normalise — trim whitespace and force lowercase for matching
  const cleanUrl = url.trim();

  for (const { provider, pattern, thumbnailUrl, embedUrl } of VIDEO_PATTERNS) {
    const match = cleanUrl.match(pattern);
    if (match) {
      const videoId = match[1];
      return {
        provider,
        videoId,
        embedUrl: embedUrl(videoId),
        thumbnailUrl: thumbnailUrl(videoId),
        originalUrl: cleanUrl,
      };
    }
  }

  throw new Error(
    'Only YouTube and TikTok links are supported. ' +
    'Go to your video on YouTube, copy the link from the address bar, and paste it here.'
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  generatePhotoUploadUrl,
  deletePhoto,
  parseVideoUrl,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
};
