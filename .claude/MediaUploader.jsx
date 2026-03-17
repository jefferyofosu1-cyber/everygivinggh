/**
 * EveryGiving — MediaUploader React Component
 *
 * Handles both photos and videos in a single update form.
 *
 * Photos:
 *   1. User picks a file
 *   2. browser-image-compression reduces it to ≤1.5MB in the browser
 *      (no server involved — this is free and instant)
 *   3. Component asks your API for a presigned S3 URL
 *   4. Component PUTs the compressed file directly to S3
 *   5. Stores the CloudFront public URL in state
 *
 * Videos:
 *   1. User pastes a YouTube or TikTok URL
 *   2. Component sends it to your API to validate and extract embed info
 *   3. Stores the embed URL and thumbnail — no file upload ever happens
 *
 * Usage:
 *   <MediaUploader
 *     campaignId="abc123"
 *     updateId="upd456"
 *     onMediaChange={(media) => console.log(media)}
 *     maxPhotos={5}
 *   />
 *
 * Install peer dependency: npm install browser-image-compression
 */

import { useState, useRef, useCallback } from 'react';
import imageCompression from 'browser-image-compression';

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const API_BASE = '/api/media';

// browser-image-compression options
// Target ≤1.5MB at max 1920px wide — enough for a campaign update photo
const COMPRESSION_OPTIONS = {
  maxSizeMB: 1.5,           // Compress to under 1.5MB
  maxWidthOrHeight: 1920,   // Scale down to max 1920px
  useWebWorker: true,       // Non-blocking — UI stays responsive
  fileType: 'image/webp',   // WebP is ~30% smaller than JPEG at same quality
  initialQuality: 0.85,
  onProgress: (progress) => console.debug(`Compressing: ${progress}%`),
};

const MAX_PHOTOS = 5;


// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function MediaUploader({ campaignId, updateId, onMediaChange, maxPhotos = MAX_PHOTOS }) {
  const [photos, setPhotos] = useState([]);       // { fileKey, publicUrl, preview, status }
  const [video, setVideo] = useState(null);        // { provider, videoId, embedUrl, thumbnailUrl }
  const [videoInput, setVideoInput] = useState('');
  const [videoError, setVideoError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Notify parent whenever media changes
  const notifyChange = useCallback((newPhotos, newVideo) => {
    onMediaChange?.({
      photos: newPhotos.filter(p => p.status === 'done').map(p => ({
        fileKey: p.fileKey,
        publicUrl: p.publicUrl,
      })),
      video: newVideo,
    });
  }, [onMediaChange]);


  // ── PHOTO HANDLING ────────────────────────────────────────────────────────

  async function handleFiles(files) {
    const incoming = Array.from(files).filter(f => f.type.startsWith('image/'));
    const slots = maxPhotos - photos.length;
    const toProcess = incoming.slice(0, slots);

    if (toProcess.length === 0) return;

    // Add placeholder entries immediately so UI shows progress
    const placeholders = toProcess.map(file => ({
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      status: 'compressing',  // compressing → uploading → done → error
      progress: 0,
      file,
      fileKey: null,
      publicUrl: null,
    }));

    const newPhotos = [...photos, ...placeholders];
    setPhotos(newPhotos);

    // Process each file independently
    for (const placeholder of placeholders) {
      await processPhoto(placeholder, newPhotos, toProcess);
    }
  }

  async function processPhoto(placeholder, currentPhotos, allFiles) {
    const updatePhoto = (id, patch) => {
      setPhotos(prev => {
        const updated = prev.map(p => p.id === id ? { ...p, ...patch } : p);
        notifyChange(updated, video);
        return updated;
      });
    };

    try {
      // Step 1: Compress in browser
      updatePhoto(placeholder.id, { status: 'compressing' });
      const compressed = await imageCompression(placeholder.file, COMPRESSION_OPTIONS);

      console.debug(
        `Compressed ${placeholder.file.name}: ` +
        `${(placeholder.file.size / 1024).toFixed(0)}KB → ` +
        `${(compressed.size / 1024).toFixed(0)}KB`
      );

      // Step 2: Get presigned URL from your API
      updatePhoto(placeholder.id, { status: 'uploading', progress: 10 });
      const presignRes = await fetch(`${API_BASE}/photo/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          updateId,
          mimeType: compressed.type || 'image/webp',
          fileSize: compressed.size,
        }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json();
        throw new Error(err.error || 'Failed to get upload URL');
      }

      const { uploadUrl, fileKey, publicUrl } = await presignRes.json();

      // Step 3: PUT file directly to S3 — your server never sees the bytes
      updatePhoto(placeholder.id, { progress: 40 });

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: compressed,
        headers: { 'Content-Type': compressed.type || 'image/webp' },
      });

      if (!uploadRes.ok) {
        throw new Error('Upload to storage failed. Please try again.');
      }

      // Step 4: Done — store the permanent CloudFront URL
      updatePhoto(placeholder.id, {
        status: 'done',
        progress: 100,
        fileKey,
        publicUrl,
      });

    } catch (err) {
      console.error('Photo upload failed:', err);
      updatePhoto(placeholder.id, { status: 'error', error: err.message });
    }
  }

  function removePhoto(id) {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === id);
      // Revoke object URL to free memory
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
      const updated = prev.filter(p => p.id !== id);
      notifyChange(updated, video);
      return updated;
    });

    // Optionally delete from S3 — fire and forget
    const photo = photos.find(p => p.id === id);
    if (photo?.fileKey) {
      fetch(`${API_BASE}/photo/${encodeURIComponent(photo.fileKey)}`, { method: 'DELETE' })
        .catch(err => console.warn('Delete from S3 failed:', err));
    }
  }


  // ── VIDEO HANDLING ────────────────────────────────────────────────────────

  async function handleVideoSubmit() {
    if (!videoInput.trim()) return;
    setVideoError('');

    try {
      const res = await fetch(`${API_BASE}/video/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoInput.trim() }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.error);

      setVideo(data);
      setVideoInput('');
      notifyChange(photos, data);
    } catch (err) {
      setVideoError(err.message);
    }
  }

  function removeVideo() {
    setVideo(null);
    notifyChange(photos, null);
  }


  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'inherit' }}>

      {/* ── PHOTO SECTION ── */}
      <div style={{ marginBottom: 24 }}>
        <label style={styles.label}>Photos</label>
        <p style={styles.hint}>
          Add up to {maxPhotos} photos. They're automatically compressed before uploading
          — even a 15MB phone photo becomes under 1.5MB instantly.
        </p>

        {/* Drop zone */}
        {photos.length < maxPhotos && (
          <div
            style={{
              ...styles.dropzone,
              borderColor: dragOver ? '#0A6B4B' : '#E8E4DC',
              background: dragOver ? '#E8F5EF' : '#FDFAF5',
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
          >
            <div style={styles.dropzoneIcon}>📷</div>
            <div style={styles.dropzoneText}>
              Tap to add photos or drag them here
            </div>
            <div style={styles.dropzoneHint}>
              JPEG, PNG, WEBP, HEIC · Max 20MB each · Auto-compressed
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)}
            />
          </div>
        )}

        {/* Photo grid */}
        {photos.length > 0 && (
          <div style={styles.photoGrid}>
            {photos.map(photo => (
              <div key={photo.id} style={styles.photoItem}>
                <img
                  src={photo.preview}
                  alt=""
                  style={{
                    ...styles.photoThumb,
                    opacity: photo.status === 'done' ? 1 : 0.6,
                  }}
                />

                {/* Status overlay */}
                {photo.status !== 'done' && (
                  <div style={styles.photoOverlay}>
                    {photo.status === 'error' ? (
                      <div style={styles.errorBadge}>Failed</div>
                    ) : (
                      <div style={styles.progressBadge}>
                        {photo.status === 'compressing' ? 'Compressing…' : `Uploading…`}
                      </div>
                    )}
                  </div>
                )}

                {/* Remove button */}
                {(photo.status === 'done' || photo.status === 'error') && (
                  <button
                    style={styles.removeBtn}
                    onClick={() => removePhoto(photo.id)}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── VIDEO SECTION ── */}
      <div>
        <label style={styles.label}>Video (optional)</label>
        <p style={styles.hint}>
          Paste a YouTube or TikTok link. We embed it directly — no file upload needed.
          Record on your phone, upload to YouTube (even as unlisted), paste the link here.
        </p>

        {!video ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="url"
              placeholder="Paste a YouTube or TikTok link…"
              value={videoInput}
              onChange={e => { setVideoInput(e.target.value); setVideoError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleVideoSubmit()}
              style={styles.videoInput}
            />
            <button
              onClick={handleVideoSubmit}
              style={styles.videoBtn}
              disabled={!videoInput.trim()}
            >
              Add
            </button>
          </div>
        ) : (
          <div style={styles.videoPreview}>
            {video.thumbnailUrl && (
              <img
                src={video.thumbnailUrl}
                alt="Video thumbnail"
                style={styles.videoThumb}
                onError={e => { e.target.style.display = 'none'; }}
              />
            )}
            <div style={styles.videoInfo}>
              <div style={styles.videoBadge}>{video.provider === 'youtube' ? '▶ YouTube' : '♪ TikTok'}</div>
              <div style={styles.videoId}>{video.videoId}</div>
            </div>
            <button onClick={removeVideo} style={styles.removeBtn} aria-label="Remove video">×</button>
          </div>
        )}

        {videoError && (
          <p style={styles.errorText}>{videoError}</p>
        )}
      </div>

    </div>
  );
}


// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = {
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#4A4A44',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#8A8A82',
    marginBottom: 12,
    lineHeight: 1.6,
  },
  dropzone: {
    border: '1.5px dashed',
    borderRadius: 12,
    padding: '24px 16px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: 12,
  },
  dropzoneIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  dropzoneText: {
    fontSize: 14,
    fontWeight: 500,
    color: '#4A4A44',
    marginBottom: 4,
  },
  dropzoneHint: {
    fontSize: 11,
    color: '#8A8A82',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: 8,
    marginTop: 8,
  },
  photoItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: 8,
    overflow: 'hidden',
    background: '#F1EFE8',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'opacity 0.2s',
  },
  photoOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: '#fff',
    background: 'rgba(0,0,0,0.5)',
    padding: '3px 7px',
    borderRadius: 10,
  },
  errorBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: '#fff',
    background: '#C0392B',
    padding: '3px 7px',
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    fontSize: 14,
    lineHeight: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1.5px solid #E8E4DC',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'inherit',
    color: '#1A1A18',
    background: '#fff',
    outline: 'none',
  },
  videoBtn: {
    padding: '10px 18px',
    background: '#0A6B4B',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  videoPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    border: '1.5px solid #E8E4DC',
    borderRadius: 10,
    background: '#fff',
    position: 'relative',
  },
  videoThumb: {
    width: 72,
    height: 40,
    objectFit: 'cover',
    borderRadius: 6,
    flexShrink: 0,
  },
  videoInfo: {
    flex: 1,
    minWidth: 0,
  },
  videoBadge: {
    fontSize: 11,
    fontWeight: 600,
    color: '#0A6B4B',
    marginBottom: 2,
  },
  videoId: {
    fontSize: 12,
    color: '#8A8A82',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  errorText: {
    fontSize: 12,
    color: '#C0392B',
    marginTop: 6,
  },
};
