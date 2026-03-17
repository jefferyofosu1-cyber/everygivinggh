const fs = require('fs');
const path = require('path');
const BASE = `c:/Users/samuel cyrus-aduteye/Documents/Codeslaw/everygivinggh`;

function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }
function write(p, content) { mkdir(path.dirname(p)); fs.writeFileSync(p, content, 'utf8'); console.log(`Written: ${p} (${content.length} bytes)`); }

write(`${BASE}/components/ui/MediaUploader.tsx`, `'use client';
import { useState, useRef, useCallback } from 'react';

type PhotoState = {
  id: string;
  file: File;
  preview: string;
  status: 'compressing' | 'uploading' | 'done' | 'error';
  publicUrl?: string;
  fileKey?: string;
};

type VideoState = {
  url: string;
  provider: 'youtube' | 'tiktok';
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string;
};

type MediaChangePayload = {
  photos: { fileKey: string; publicUrl: string }[];
  video: VideoState | null;
};

interface MediaUploaderProps {
  campaignId: string;
  updateId?: string;
  onMediaChange: (payload: MediaChangePayload) => void;
  maxPhotos?: number;
}

const COMPRESSION_OPTIONS = { maxSizeMB: 1.5, fileType: 'image/webp', maxWidthOrHeight: 1920, useWebWorker: true };

function parseVideoUrl(url: string): Omit<VideoState, 'url'> | null {
  const ytMatch = url.match(/(?:youtube\\.com\\/(?:watch\\?v=|shorts\\/)|youtu\\.be\\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return { provider: 'youtube', videoId: id, embedUrl: \`https://www.youtube.com/embed/\${id}?autoplay=1\`, thumbnailUrl: \`https://img.youtube.com/vi/\${id}/maxresdefault.jpg\` };
  }
  const ttMatch = url.match(/tiktok\\.com\\/@[^/]+\\/video\\/(\\d+)/);
  if (ttMatch) {
    const id = ttMatch[1];
    return { provider: 'tiktok', videoId: id, embedUrl: \`https://www.tiktok.com/embed/v2/\${id}\`, thumbnailUrl: '' };
  }
  return null;
}

export default function MediaUploader({ campaignId, onMediaChange, maxPhotos = 5 }: MediaUploaderProps) {
  const [photos, setPhotos] = useState<PhotoState[]>([]);
  const [video, setVideo] = useState<VideoState | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoError, setVideoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notifyParent = useCallback((updatedPhotos: PhotoState[], updatedVideo: VideoState | null) => {
    onMediaChange({
      photos: updatedPhotos.filter(p => p.status === 'done' && p.fileKey && p.publicUrl).map(p => ({ fileKey: p.fileKey!, publicUrl: p.publicUrl! })),
      video: updatedVideo,
    });
  }, [onMediaChange]);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const slots = maxPhotos - photos.length;
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, slots);
    if (!validFiles.length) return;

    for (const file of validFiles) {
      const id = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(file);

      setPhotos(prev => {
        const next = [...prev, { id, file, preview, status: 'compressing' as const }];
        notifyParent(next, video);
        return next;
      });

      try {
        const imageCompression = (await import('browser-image-compression')).default;
        const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

        setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'uploading' } : p));

        // POST /api/media/photo/presign
        const presignRes = await fetch('/api/media/photo/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId, mimeType: 'image/webp', fileSize: compressed.size }),
        });

        if (!presignRes.ok) throw new Error('Presign failed');
        const { uploadUrl, fileKey, publicUrl } = await presignRes.json();

        await fetch(uploadUrl, { method: 'PUT', body: compressed, headers: { 'Content-Type': 'image/webp' } });

        setPhotos(prev => {
          const next = prev.map(p => p.id === id ? { ...p, status: 'done' as const, publicUrl, fileKey } : p);
          notifyParent(next, video);
          return next;
        });
      } catch {
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, status: 'error' } : p));
      }
    }
  }

  function removePhoto(id: string) {
    setPhotos(prev => {
      const p = prev.find(x => x.id === id);
      if (p) URL.revokeObjectURL(p.preview);
      const next = prev.filter(x => x.id !== id);
      notifyParent(next, video);
      return next;
    });
    // TODO: DELETE /api/media/photo/:fileKey if p.fileKey exists
  }

  async function addVideo() {
    setVideoError('');
    const parsed = parseVideoUrl(videoUrl.trim());
    if (!parsed) { setVideoError('Paste a YouTube or TikTok link'); return; }

    const videoState: VideoState = { url: videoUrl.trim(), ...parsed };

    // POST /api/media/video/parse to get canonical data
    try {
      const res = await fetch('/api/media/video/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        Object.assign(videoState, data);
      }
    } catch {
      // fallback to client-parsed data, still usable
    }

    setVideo(videoState);
    setVideoUrl('');
    notifyParent(photos, videoState);
  }

  function removeVideo() {
    setVideo(null);
    notifyParent(photos, null);
  }

  return (
    <div>
      {/* Photos */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {photos.map((p, i) => (
          <div key={p.id} style={{ position: 'relative', width: 86, height: 86, borderRadius: 8, overflow: 'hidden', background: '#F5F4F0', flexShrink: 0 }}>
            <img src={p.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
            {i === 0 && p.status === 'done' && (
              <div style={{ position: 'absolute', top: 3, left: 3, fontSize: 9, fontWeight: 700, color: '#fff', background: 'rgba(10,107,75,.85)', padding: '2px 5px', borderRadius: 3 }}>Cover</div>
            )}
            {(p.status === 'compressing' || p.status === 'uploading') && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>
                {p.status === 'compressing' ? 'Compressing…' : 'Uploading…'}
              </div>
            )}
            {p.status === 'error' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(192,57,43,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff' }}>Error</div>
            )}
            <button
              style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: '50%', background: 'rgba(0,0,0,.55)', border: 'none', color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => removePhoto(p.id)}
            >×</button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label style={{ width: 86, height: 86, borderRadius: 8, border: '1.5px dashed #E8E4DC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: '#FDFAF5' }}>
            <span style={{ fontSize: 20, marginBottom: 2 }}>📷</span>
            <span style={{ fontSize: 10, color: '#8A8A82' }}>Add photo</span>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
          </label>
        )}
      </div>

      {/* Video */}
      {video ? (
        <div style={{ position: 'relative', borderRadius: 9, overflow: 'hidden', background: '#111', aspectRatio: '16/7' }}>
          {video.thumbnailUrl && <img src={video.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} alt="" />}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>▶</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.9)', fontWeight: 500 }}>{video.provider === 'youtube' ? 'YouTube' : 'TikTok'} video attached</div>
          </div>
          <button style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer' }} onClick={removeVideo}>×</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #E8E4DC', borderRadius: 8, fontSize: 12, fontFamily: "'DM Sans',sans-serif", outline: 'none' }}
            placeholder="Paste YouTube or TikTok URL…"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addVideo()}
          />
          <button style={{ padding: '9px 14px', background: '#0A6B4B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }} onClick={addVideo}>
            Add
          </button>
        </div>
      )}
      {videoError && <div style={{ fontSize: 11, color: '#C0392B', marginTop: 4 }}>{videoError}</div>}
    </div>
  );
}
`);

console.log('\nMediaUploader component written!');
