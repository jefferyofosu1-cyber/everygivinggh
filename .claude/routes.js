/**
 * EveryGiving — Media Routes
 * Mount at: app.use('/api/media', mediaRouter)
 *
 * POST /api/media/photo/presign   — Get a presigned S3 upload URL for a photo
 * DELETE /api/media/photo/:key    — Delete a photo from S3
 * POST /api/media/video/parse     — Validate and parse a YouTube/TikTok URL
 */

const express = require('express');
const router = express.Router();
const { generatePhotoUploadUrl, deletePhoto, parseVideoUrl } = require('./media');


// ─── POST /photo/presign ──────────────────────────────────────────────────────
// Called by the React component before uploading.
// Returns a temporary S3 URL the browser uses to PUT the file directly.
//
// Body: { campaignId, updateId, mimeType, fileSize }
// Response: { uploadUrl, fileKey, publicUrl }

router.post('/photo/presign', async (req, res) => {
  const { campaignId, updateId, mimeType, fileSize } = req.body;

  if (!campaignId || !updateId || !mimeType || !fileSize) {
    return res.status(400).json({
      success: false,
      error: 'campaignId, updateId, mimeType, and fileSize are required.',
    });
  }

  try {
    const result = await generatePhotoUploadUrl({ campaignId, updateId, mimeType, fileSize });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});


// ─── DELETE /photo/:key ───────────────────────────────────────────────────────
// Deletes a photo when a campaigner removes it from an update.
// The key is URL-encoded — decode it before passing to S3.
//
// Param: key (URL-encoded S3 key)

router.delete('/photo/:key(*)', async (req, res) => {
  const fileKey = decodeURIComponent(req.params.key);

  // Security: only allow deleting files under campaigns/
  if (!fileKey.startsWith('campaigns/')) {
    return res.status(403).json({ success: false, error: 'Forbidden.' });
  }

  try {
    await deletePhoto(fileKey);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ─── POST /video/parse ────────────────────────────────────────────────────────
// Validates a YouTube or TikTok URL and extracts embed info.
// Nothing is downloaded. We just return the embed URL and thumbnail.
//
// Body: { url }
// Response: { provider, videoId, embedUrl, thumbnailUrl }

router.post('/video/parse', (req, res) => {
  const { url } = req.body;

  try {
    const result = parseVideoUrl(url);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});


module.exports = router;
