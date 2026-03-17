/**
 * EveryGiving — Post Update Screen
 * Route: /dashboard/campaigns/[id]/update
 *
 * Full spec implemented per the agreed architecture:
 *
 * TEXT   — contenteditable editor, bold/italic, 10–2000 chars,
 *          context-aware placeholder, auto-save to localStorage
 *
 * PHOTOS — drag-and-drop + click, JPEG/PNG/WEBP/HEIC, browser-image-compression
 *          → WebP max 1.5MB, presigned S3 direct upload, per-photo progress,
 *          up to 5 photos, first photo = cover
 *
 * VIDEO  — YouTube/TikTok URL only (no file upload), regex validation,
 *          thumbnail preview, iframe embed on play, YouTube upload guide inline,
 *          collapsible by default, 1 video per update
 *
 * PREVIEW — right-side panel showing donor view + SMS notification preview
 *
 * PUBLISH — disables while photos uploading, success → donor count toast,
 *           clears localStorage draft, redirects to campaign page
 *
 * API integration points marked with TODO comments throughout.
 */

'use client';
import { useState, useRef, useEffect } from 'react';

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MAX_PHOTOS = 5;
const MAX_CHARS  = 2000;
const MIN_CHARS  = 10;
const SAVE_MS    = 30000;

// ─── MOCK DATA (replace with API) ─────────────────────────────────────────────
const MOCK_CAMPAIGN = {
  id: 'c1',
  title: "Help Ama get life-saving kidney surgery at Korle Bu",
  slug: 'ama-kidney-surgery',
  donorCount: 143,
  daysActive: 12,
  thumb: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&q=80&auto=format&fit=crop',
};

// ─── VIDEO HELPERS ────────────────────────────────────────────────────────────
function parseVideoUrl(raw) {
  if (!raw?.trim()) return null;
  const u = raw.trim();
  let m;
  // youtube.com/watch?v=ID
  m = u.match(/youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/);
  if (m) return { provider:'youtube', id:m[1] };
  // youtu.be/ID
  m = u.match(/youtu\.be\/([\w-]{11})/);
  if (m) return { provider:'youtube', id:m[1] };
  // youtube.com/shorts/ID
  m = u.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (m) return { provider:'youtube', id:m[1] };
  // tiktok.com/@user/video/ID
  m = u.match(/tiktok\.com\/@[\w.]+\/video\/(\d+)/);
  if (m) return { provider:'tiktok', id:m[1] };
  return null;
}
const ytThumb  = id => `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
const ytEmbed  = id => `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
const ttEmbed  = id => `https://www.tiktok.com/embed/v2/${id}`;

// ─── PHOTO HELPERS ────────────────────────────────────────────────────────────
async function compressPhoto(file, onProgress) {
  try {
    const { default: compress } = await import('browser-image-compression');
    return await compress(file, {
      maxSizeMB: 1.5, maxWidthOrHeight: 1920,
      useWebWorker: true, fileType: 'image/webp',
      onProgress,
    });
  } catch { onProgress?.(100); return file; }
}

async function presign(filename, type) {
  // TODO: POST /api/media/photo/presign → { uploadUrl, cdnUrl }
  const res = await fetch('/api/media/photo/presign', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ filename, contentType: type, folder:'updates' }),
  });
  if (!res.ok) throw new Error('presign failed');
  return res.json();
}

async function uploadS3(file, url, onProgress) {
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = e => e.lengthComputable && onProgress(Math.round(e.loaded/e.total*100));
    xhr.onload  = () => xhr.status===200 ? res() : rej(new Error(xhr.status));
    xhr.onerror = () => rej(new Error('network'));
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PostUpdate({ campaign = MOCK_CAMPAIGN }) {
  const DRAFT_KEY = `eg_draft_${campaign.id}`;

  /* State */
  const [text,          setText]          = useState('');
  const [photos,        setPhotos]        = useState([]);
  const [video,         setVideo]         = useState(null);   // null | { provider, id, thumb, embedUrl, rawUrl }
  const [videoUrl,      setVideoUrl]      = useState('');
  const [videoError,    setVideoError]    = useState('');
  const [videoOpen,     setVideoOpen]     = useState(false);
  const [videoPlaying,  setVideoPlaying]  = useState(false);
  const [showGuide,     setShowGuide]     = useState(false);
  const [showPreview,   setShowPreview]   = useState(false);
  const [publishing,    setPublishing]    = useState(false);
  const [published,     setPublished]     = useState(false);
  const [draftBanner,   setDraftBanner]   = useState(false);
  const [dragOver,      setDragOver]      = useState(false);

  const editorRef  = useRef(null);
  const fileRef    = useRef(null);

  /* Restore draft */
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
      if (d?.text) { setText(d.text); if (editorRef.current) editorRef.current.innerText = d.text; setDraftBanner(true); }
      if (d?.video) setVideo(d.video);
    } catch {}
  }, []);

  /* Auto-save */
  useEffect(() => {
    const t = setInterval(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ text, video })); } catch {}
    }, SAVE_MS);
    return () => clearInterval(t);
  }, [text, video]);

  /* Placeholder based on campaign age */
  const placeholder = campaign.daysActive <= 7
    ? "Tell your donors how the campaign is going so far…"
    : "Share a milestone, a thank-you, or a photo update…";

  /* Text */
  function onInput(e) {
    const val = e.target.innerText.slice(0, MAX_CHARS);
    if (e.target.innerText.length > MAX_CHARS) {
      e.target.innerText = val;
      const r = document.createRange(); r.selectNodeContents(e.target); r.collapse(false);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
    setText(val);
  }
  function fmt(cmd) { document.execCommand(cmd, false, null); editorRef.current?.focus(); }

  /* Photos */
  async function addFiles(files) {
    const slots = MAX_PHOTOS - photos.length;
    if (!slots) return;
    const list = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, slots);

    const items = list.map(f => ({
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      file: f, preview: URL.createObjectURL(f),
      status: 'compressing', cp: 0, up: 0, cdnUrl: null,
    }));
    setPhotos(p => [...p, ...items]);

    for (const item of items) {
      try {
        // Compress
        const compressed = await compressPhoto(item.file, pct =>
          setPhotos(p => p.map(x => x.id===item.id ? {...x, cp:pct} : x))
        );
        setPhotos(p => p.map(x => x.id===item.id ? {...x, status:'uploading', cp:100} : x));

        // Upload — PRODUCTION: uncomment presign + uploadS3 lines
        // const { uploadUrl, cdnUrl } = await presign(compressed.name, compressed.type);
        // await uploadS3(compressed, uploadUrl, pct =>
        //   setPhotos(p => p.map(x => x.id===item.id ? {...x, up:pct} : x))
        // );

        // Demo simulation
        for (let i=0; i<=100; i+=25) {
          await new Promise(r => setTimeout(r, 100));
          setPhotos(p => p.map(x => x.id===item.id ? {...x, up:i} : x));
        }

        setPhotos(p => p.map(x => x.id===item.id
          ? {...x, status:'done', up:100, cdnUrl: x.preview /* replace with cdnUrl in production */}
          : x
        ));
      } catch {
        setPhotos(p => p.map(x => x.id===item.id ? {...x, status:'error'} : x));
      }
    }
  }

  function removePhoto(id) {
    setPhotos(p => { const ph = p.find(x=>x.id===id); if(ph?.preview) URL.revokeObjectURL(ph.preview); return p.filter(x=>x.id!==id); });
  }

  /* Video */
  function addVideo() {
    const parsed = parseVideoUrl(videoUrl);
    if (!parsed) { setVideoError('Only YouTube and TikTok links are supported'); return; }
    setVideoError('');
    setVideo({
      provider: parsed.provider, id: parsed.id, rawUrl: videoUrl,
      thumb: parsed.provider==='youtube' ? ytThumb(parsed.id) : null,
      embedUrl: parsed.provider==='youtube' ? ytEmbed(parsed.id) : ttEmbed(parsed.id),
    });
  }

  /* Publish */
  async function publish() {
    if (text.trim().length < MIN_CHARS || publishing || pendingPhotos.length) return;
    setPublishing(true);
    try {
      // TODO: POST /api/campaigns/:id/updates
      // { text, photos: donePhotos.map(p=>p.cdnUrl), video }
      await new Promise(r => setTimeout(r, 1100));
      localStorage.removeItem(DRAFT_KEY);
      setPublished(true);
    } catch { setPublishing(false); }
  }

  const donePhotos    = photos.filter(p => p.status==='done');
  const pendingPhotos = photos.filter(p => p.status==='compressing'||p.status==='uploading');
  const charCount     = text.length;
  const canPublish    = charCount >= MIN_CHARS && !publishing && !pendingPhotos.length;

  /* ── SUCCESS SCREEN ── */
  if (published) return (
    <Page>
      <Nav campaign={campaign} />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'calc(100vh - 56px)'}}>
        <div style={{textAlign:'center',maxWidth:380,padding:32}}>
          <div style={s.successRing}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#0A6B4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'#1A1A18',marginBottom:8}}>Update posted</h2>
          <p style={{fontSize:13,color:'#8A8A82',marginBottom:6,lineHeight:1.7}}>Your update is live on the campaign page.</p>
          <p style={{fontSize:15,fontWeight:700,color:'#0A6B4B',marginBottom:26}}>{campaign.donorCount} donors notified by SMS and email</p>
          <div style={{display:'flex',gap:10,justifyContent:'center'}}>
            <a href={`/campaigns/${campaign.slug}`} style={s.btnGreen}>View campaign</a>
            <a href="/dashboard" style={s.btnGhost}>Dashboard</a>
          </div>
        </div>
      </div>
    </Page>
  );

  /* ── MAIN ── */
  return (
    <Page>
      <Nav campaign={campaign} />

      {/* Draft banner */}
      {draftBanner && (
        <div style={s.draftBanner}>
          <span>📝 Draft recovered from your last session</span>
          <button style={s.draftDiscard} onClick={() => {
            setDraftBanner(false); localStorage.removeItem(DRAFT_KEY);
            setText(''); if (editorRef.current) editorRef.current.innerText='';
          }}>Discard</button>
        </div>
      )}

      <div style={s.layout}>

        {/* ══ FORM COLUMN ══ */}
        <div style={s.formCol}>

          {/* Campaign chip */}
          <div style={s.campaignChip}>
            <img src={campaign.thumb} alt="" style={s.chipImg}/>
            <div>
              <div style={s.chipLabel}>Posting to</div>
              <div style={s.chipTitle}>{campaign.title}</div>
            </div>
          </div>

          {/* ── TEXT ── */}
          <div style={s.card}>
            <div style={s.cardHead}>Update</div>
            <div style={s.fmtBar}>
              <button style={s.fmtBtn} onClick={() => fmt('bold')}><b>B</b></button>
              <button style={s.fmtBtn} onClick={() => fmt('italic')}><i>I</i></button>
            </div>
            <div
              ref={editorRef}
              contentEditable suppressContentEditableWarning
              data-placeholder={placeholder}
              style={s.editor}
              onInput={onInput}
            />
            <div style={s.charRow}>
              <span style={{color: charCount<MIN_CHARS&&charCount>0?'#C0392B':charCount>MAX_CHARS*.9?'#B85C00':'#8A8A82'}}>
                {charCount}
              </span>
              <span style={{color:'#C8C4BC'}}> / {MAX_CHARS}</span>
              {charCount < MIN_CHARS && charCount > 0 &&
                <span style={{color:'#C0392B',marginLeft:8,fontSize:11}}>{MIN_CHARS-charCount} more needed</span>
              }
            </div>
          </div>

          {/* ── PHOTOS ── */}
          <div style={s.card}>
            <div style={s.cardHead}>Photos <span style={s.opt}>optional · up to {MAX_PHOTOS}</span></div>

            {photos.length > 0 && (
              <div style={s.photoRow}>
                {photos.map((ph, i) => (
                  <div key={ph.id} style={{...s.photoItem, borderColor: ph.status==='error'?'#F0B0B0':'#E8E4DC'}}>
                    <div style={s.photoBox}>
                      <img src={ph.preview} alt="" style={s.photoImg}/>
                      {(ph.status==='compressing'||ph.status==='uploading') && (
                        <div style={s.photoOverlay}>
                          <div style={{fontSize:9,fontWeight:600,color: ph.status==='compressing'?'#B85C00':'#185FA5',marginBottom:4}}>
                            {ph.status==='compressing' ? `Compressing ${ph.cp||0}%` : `Uploading ${ph.up||0}%`}
                          </div>
                          <div style={s.progTrack}>
                            <div style={{...s.progFill, width:`${ph.status==='compressing'?ph.cp:ph.up}%`, background: ph.status==='compressing'?'#B85C00':'#185FA5'}}/>
                          </div>
                        </div>
                      )}
                      <div style={{...s.photoSt, color: ph.status==='done'?'#0A6B4B':ph.status==='error'?'#C0392B':'#B85C00', background: ph.status==='done'?'#E8F5EF':ph.status==='error'?'#FCEBEB':'#fff'}}>
                        {ph.status==='done'?'✓':ph.status==='error'?'✕':'…'}
                      </div>
                      {i===0&&ph.status==='done'&&<div style={s.coverTag}>Cover</div>}
                    </div>
                    <div style={s.photoFoot}>
                      {ph.status==='error' && <button style={s.retryBtn} onClick={()=>{removePhoto(ph.id); addFiles([ph.file]);}}>Retry</button>}
                      <button style={s.removeBtn} onClick={()=>removePhoto(ph.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {photos.length < MAX_PHOTOS && (
              <div
                style={{...s.dropZone, ...(dragOver?{background:'#E8F5EF',borderColor:'#0A6B4B'}:{})}}
                onClick={() => fileRef.current?.click()}
                onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                onDragLeave={()=>setDragOver(false)}
                onDrop={e=>{e.preventDefault();setDragOver(false);const f=Array.from(e.dataTransfer.files).filter(x=>x.type.startsWith('image/'));if(f.length)addFiles(f);}}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{color:'#8A8A82',marginBottom:5}}>
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div style={{fontSize:13,fontWeight:500,color:'#4A4A44'}}>
                  {photos.length===0?'Add photos':`Add more (${MAX_PHOTOS-photos.length} left)`}
                </div>
                <div style={{fontSize:11,color:'#8A8A82',marginTop:2}}>JPEG · PNG · WEBP · HEIC — auto-compressed</div>
                <input ref={fileRef} type="file" accept="image/*,.heic,.heif" multiple style={{display:'none'}} onChange={e=>addFiles(e.target.files)}/>
              </div>
            )}

            {pendingPhotos.length > 0 && (
              <div style={s.uploadNote}>⏳ Processing {pendingPhotos.length} photo{pendingPhotos.length>1?'s':''}…</div>
            )}
          </div>

          {/* ── VIDEO ── */}
          <div style={s.card}>
            <button style={s.videoToggle} onClick={()=>setVideoOpen(v=>!v)}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:18}}>{video?'🎬':'▶'}</span>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:'#1A1A18',display:'flex',alignItems:'center',gap:6}}>
                    Video
                    {video && <span style={s.addedBadge}>Added ✓</span>}
                  </div>
                  <div style={{fontSize:11,color:'#8A8A82'}}>
                    {video ? `${video.provider==='youtube'?'YouTube':'TikTok'} video attached` : 'YouTube or TikTok — optional'}
                  </div>
                </div>
              </div>
              <span style={{fontSize:11,color:'#8A8A82'}}>{videoOpen?'▲':'▼'}</span>
            </button>

            {videoOpen && (
              <div style={{marginTop:16}}>
                {!video ? (
                  <>
                    <div style={{display:'flex',gap:8,marginBottom:6}}>
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={e=>{setVideoUrl(e.target.value);setVideoError('');}}
                        onKeyDown={e=>e.key==='Enter'&&addVideo()}
                        placeholder="Paste YouTube or TikTok link"
                        style={{...s.urlInput, borderColor:videoError?'#C0392B':'#E8E4DC'}}
                      />
                      <button style={{...s.addBtn, opacity:videoUrl?1:.5}} onClick={addVideo} disabled={!videoUrl}>Add</button>
                    </div>
                    {videoError && <div style={{fontSize:11,color:'#C0392B',marginBottom:8}}>{videoError}</div>}

                    {/* YouTube guide */}
                    <button style={s.guideBtn} onClick={()=>setShowGuide(v=>!v)}>
                      {showGuide?'▲':'▼'} How to upload to YouTube (3 steps)
                    </button>
                    {showGuide && (
                      <div style={s.guideBox}>
                        {[
                          {n:'1', t:"Open the YouTube app on your phone and tap the + button"},
                          {n:'2', t:'Select your video → tap "Next" → set visibility to "Unlisted" → Upload'},
                          {n:'3', t:'Wait 1–2 minutes, then copy the link from "Share" and paste above'},
                        ].map(step=>(
                          <div key={step.n} style={{display:'flex',gap:9,marginBottom:9}}>
                            <div style={s.guideN}>{step.n}</div>
                            <div style={{fontSize:12,color:'#4A4A44',lineHeight:1.6}}>{step.t}</div>
                          </div>
                        ))}
                        <div style={{fontSize:11,color:'#8A8A82',paddingTop:8,borderTop:'1px solid #E8E4DC',lineHeight:1.6}}>
                          Choose <strong>Unlisted</strong> so only people with the campaign link can see the video — it won't appear on your public YouTube channel.
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Video preview */
                  <div style={s.vidPreview}>
                    <div style={{position:'relative',height:150,background:'#1A1A18',borderRadius:'8px 8px 0 0',overflow:'hidden'}}>
                      {!videoPlaying ? (
                        <>
                          {video.thumb && <img src={video.thumb} alt="" style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>}
                          <button style={s.playBtn} onClick={()=>setVideoPlaying(true)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                          </button>
                          <div style={s.platformBadge}>{video.provider==='youtube'?'YouTube':'TikTok'}</div>
                        </>
                      ) : (
                        <iframe src={video.embedUrl} style={{width:'100%',height:'100%',border:'none'}} allow="autoplay; encrypted-media" allowFullScreen title="preview"/>
                      )}
                    </div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px'}}>
                      <span style={{fontSize:11,color:'#8A8A82',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{video.rawUrl.slice(0,48)}{video.rawUrl.length>48?'…':''}</span>
                      <button style={{fontSize:11,fontWeight:600,color:'#C0392B',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}} onClick={()=>{setVideo(null);setVideoUrl('');setVideoPlaying(false);}}>Remove</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── ACTIONS ── */}
          <div style={s.actionRow}>
            <button style={s.previewBtn} onClick={()=>setShowPreview(true)}>Preview</button>
            <button
              style={{...s.publishBtn, opacity:canPublish?1:.5, cursor:canPublish?'pointer':'default'}}
              onClick={publish}
              disabled={!canPublish}
            >
              {publishing ? 'Publishing…' : pendingPhotos.length ? 'Waiting for photos…' : 'Publish update'}
            </button>
          </div>
          {charCount > 0 && charCount < MIN_CHARS && (
            <p style={{fontSize:11,color:'#C0392B',textAlign:'center',marginTop:-6}}>Write at least {MIN_CHARS} characters to publish</p>
          )}

        </div>

        {/* ══ TIPS COLUMN ══ */}
        <div style={s.tipsCol}>
          <div style={s.tipCard}>
            <div style={s.tipHead}>What makes a great update</div>
            {[
              {icon:'📸', text:"Show, don't just tell — a photo from the hospital or school is worth 10 paragraphs"},
              {icon:'🙏', text:"Thank your donors — it converts them into repeat givers"},
              {icon:'📊', text:"Be specific: 'We raised ₵14,400 of ₵20,000' beats 'almost there'"},
              {icon:'📅', text:"Tell donors what comes next — the next milestone or appointment"},
            ].map((t,i)=>(
              <div key={i} style={s.tipRow}>
                <span style={{fontSize:14,flexShrink:0}}>{t.icon}</span>
                <span style={{fontSize:12,color:'#4A4A44',lineHeight:1.6}}>{t.text}</span>
              </div>
            ))}
          </div>
          <div style={s.tipCard}>
            <div style={s.tipHead}>After you publish</div>
            <p style={{fontSize:12,color:'#4A4A44',lineHeight:1.65,marginBottom:8}}>
              All <strong>{campaign.donorCount} donors</strong> receive an SMS and email with a link back to the campaign.
            </p>
            <p style={{fontSize:12,color:'#4A4A44',lineHeight:1.65}}>
              Campaigns that post 2+ updates raise <strong>3× more</strong> than those that don't.
            </p>
          </div>
        </div>

      </div>

      {/* ── PREVIEW PANEL ── */}
      {showPreview && (
        <div style={s.overlay} onClick={e=>e.target===e.currentTarget&&setShowPreview(false)}>
          <div style={s.previewPanel}>
            <div style={s.previewHead}>
              <span style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'#1A1A18'}}>Preview</span>
              <button style={{fontSize:22,color:'#8A8A82',background:'none',border:'none',cursor:'pointer'}} onClick={()=>setShowPreview(false)}>×</button>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'18px 20px'}}>

              <div style={{fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',color:'#8A8A82',marginBottom:9}}>Donor view</div>
              <div style={{background:'#FDFAF5',border:'1px solid #E8E4DC',borderRadius:12,padding:'13px',marginBottom:22}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                  <div style={{width:26,height:26,borderRadius:'50%',background:'#0A6B4B',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff'}}>KM</div>
                  <div><div style={{fontSize:12,fontWeight:600,color:'#1A1A18'}}>Kwame Mensah</div><div style={{fontSize:10,color:'#8A8A82'}}>Just now</div></div>
                </div>
                <div style={{fontSize:13,color:'#1A1A18',lineHeight:1.7,whiteSpace:'pre-wrap'}}>
                  {text || <span style={{color:'#8A8A82',fontStyle:'italic'}}>Your update text will appear here…</span>}
                </div>
                {donePhotos.length>0 && (
                  <div style={{display:'flex',gap:5,marginTop:10,flexWrap:'wrap'}}>
                    {donePhotos.map((p,i)=><img key={i} src={p.preview} alt="" style={{width:72,height:54,objectFit:'cover',borderRadius:6}}/>)}
                  </div>
                )}
                {video?.thumb && (
                  <div style={{marginTop:10}}>
                    <img src={video.thumb} alt="" style={{width:'100%',height:110,objectFit:'cover',borderRadius:8,display:'block'}}/>
                    <div style={{fontSize:11,color:'#8A8A82',textAlign:'center',marginTop:3}}>{video.provider==='youtube'?'YouTube':'TikTok'} · click to play on campaign page</div>
                  </div>
                )}
              </div>

              <div style={{fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',color:'#8A8A82',marginBottom:9}}>SMS notification donors receive</div>
              <div style={{background:'#F2F3F4',borderRadius:12,padding:'12px'}}>
                <div style={{background:'#fff',borderRadius:10,padding:'10px 12px',fontSize:12,color:'#1A1A18',lineHeight:1.7,boxShadow:'0 1px 4px rgba(0,0,0,.07)'}}>
                  EveryGiving: Kwame posted an update on "{campaign.title.slice(0,38)}…"<br/><br/>
                  "{text.slice(0,100)}{text.length>100?'…':''}"<br/><br/>
                  everygiving.org/c/{campaign.slug}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </Page>
  );
}

/* ── SHARED LAYOUT COMPONENTS ── */
function Page({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{color:inherit;text-decoration:none}
        [contenteditable]:focus{outline:none}
        [contenteditable]:empty::before{content:attr(data-placeholder);color:#C8C4BC;pointer-events:none}
        button:hover{opacity:.88}
        @keyframes fadeup{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
      <div style={{minHeight:'100vh',background:'#F5F4F0'}}>{children}</div>
    </>
  );
}

function Nav({ campaign }) {
  return (
    <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <a href="/dashboard" style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'#1A1A18'}}>Every<span style={{color:'#0A6B4B'}}>Giving</span></a>
        <div style={{width:1,height:14,background:'#E8E4DC'}}/>
        <span style={{fontSize:12,color:'#8A8A82'}}>
          <a href="/dashboard" style={{color:'#8A8A82'}}>Dashboard</a> → <a href="#" style={{color:'#8A8A82'}}>Campaign</a> → <span style={{color:'#1A1A18'}}>Post update</span>
        </span>
      </div>
      <span style={{fontSize:11,color:'#8A8A82'}}>Draft auto-saved</span>
    </nav>
  );
}

/* ── STYLES ── */
const s = {
  draftBanner:{background:'#E6F1FB',borderBottom:'1px solid #BDD4EF',padding:'9px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:13,color:'#185FA5'},
  draftDiscard:{fontSize:12,fontWeight:600,color:'#185FA5',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"},
  layout:{maxWidth:920,margin:'0 auto',padding:'24px 24px 56px',display:'grid',gridTemplateColumns:'1fr 260px',gap:20,alignItems:'start'},
  formCol:{display:'flex',flexDirection:'column',gap:14},
  tipsCol:{display:'flex',flexDirection:'column',gap:12,position:'sticky',top:70},

  campaignChip:{display:'flex',alignItems:'center',gap:11,background:'#fff',border:'1px solid #E8E4DC',borderRadius:11,padding:'11px 13px'},
  chipImg:{width:42,height:42,borderRadius:7,objectFit:'cover',flexShrink:0},
  chipLabel:{fontSize:9,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'#8A8A82',marginBottom:2},
  chipTitle:{fontSize:12,fontWeight:500,color:'#1A1A18',lineHeight:1.4},

  card:{background:'#fff',border:'1px solid #E8E4DC',borderRadius:13,padding:'17px'},
  cardHead:{fontSize:11,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',color:'#4A4A44',marginBottom:11,display:'flex',alignItems:'center',gap:7},
  opt:{fontWeight:400,textTransform:'none',letterSpacing:0,color:'#8A8A82',fontSize:11},

  fmtBar:{display:'flex',gap:4,marginBottom:10},
  fmtBtn:{width:28,height:28,borderRadius:6,border:'1px solid #E8E4DC',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#4A4A44',fontFamily:"'DM Sans',sans-serif"},
  editor:{minHeight:110,fontSize:14,color:'#1A1A18',lineHeight:1.75,padding:'2px 0'},
  charRow:{fontSize:11,textAlign:'right',marginTop:9,paddingTop:9,borderTop:'1px solid #E8E4DC',display:'flex',justifyContent:'flex-end',alignItems:'center'},

  photoRow:{display:'flex',gap:9,flexWrap:'wrap',marginBottom:11},
  photoItem:{width:86,borderRadius:8,overflow:'hidden',border:'1.5px solid',background:'#F5F4F0'},
  photoBox:{position:'relative',width:86,height:76},
  photoImg:{width:'100%',height:'100%',objectFit:'cover',display:'block'},
  photoOverlay:{position:'absolute',inset:0,background:'rgba(255,255,255,.88)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'4px 5px'},
  progTrack:{width:'80%',height:3,background:'#E8E4DC',borderRadius:2},
  progFill:{height:'100%',borderRadius:2,transition:'width .3s'},
  photoSt:{position:'absolute',top:3,right:3,width:17,height:17,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:700},
  coverTag:{position:'absolute',bottom:3,left:3,fontSize:8,fontWeight:700,color:'#fff',background:'#0A6B4B',padding:'1px 5px',borderRadius:3},
  photoFoot:{display:'flex',justifyContent:'space-between',padding:'3px 5px',background:'#F5F4F0'},
  retryBtn:{fontSize:9,fontWeight:600,color:'#185FA5',background:'none',border:'none',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"},
  removeBtn:{fontSize:13,color:'#8A8A82',background:'none',border:'none',cursor:'pointer',lineHeight:1,marginLeft:'auto'},

  dropZone:{border:'1.5px dashed #E8E4DC',borderRadius:9,padding:'18px 14px',textAlign:'center',cursor:'pointer',transition:'all .15s',display:'flex',flexDirection:'column',alignItems:'center',gap:3},
  uploadNote:{fontSize:12,color:'#B85C00',marginTop:8,padding:'7px 9px',background:'#FEF3E2',borderRadius:7},

  videoToggle:{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:"'DM Sans',sans-serif"},
  addedBadge:{fontSize:9,fontWeight:700,color:'#0A6B4B',background:'#E8F5EF',padding:'1px 6px',borderRadius:10},

  urlInput:{flex:1,padding:'9px 11px',border:'1.5px solid',borderRadius:8,fontSize:13,fontFamily:"'DM Sans',sans-serif",color:'#1A1A18',outline:'none'},
  addBtn:{padding:'9px 16px',background:'#0A6B4B',color:'#fff',borderRadius:8,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',whiteSpace:'nowrap',fontFamily:"'DM Sans',sans-serif",transition:'opacity .15s'},

  guideBtn:{fontSize:11,fontWeight:600,color:'#0A6B4B',background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:"'DM Sans',sans-serif",marginTop:4},
  guideBox:{background:'#F5F4F0',borderRadius:8,padding:'12px 13px',marginTop:8},
  guideN:{width:19,height:19,borderRadius:'50%',background:'#0A6B4B',color:'#fff',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},

  vidPreview:{border:'1px solid #E8E4DC',borderRadius:10,overflow:'hidden'},
  playBtn:{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:44,height:44,borderRadius:'50%',background:'rgba(10,107,75,.9)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background .15s'},
  platformBadge:{position:'absolute',top:7,right:7,fontSize:9,fontWeight:700,color:'#fff',background:'rgba(0,0,0,.55)',padding:'2px 6px',borderRadius:8},

  actionRow:{display:'flex',gap:10},
  previewBtn:{flex:1,padding:'11px',background:'#fff',color:'#1A1A18',border:'1px solid #E8E4DC',borderRadius:9,fontSize:13,fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"},
  publishBtn:{flex:2,padding:'11px',background:'#0A6B4B',color:'#fff',border:'none',borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'opacity .15s'},

  tipCard:{background:'#fff',border:'1px solid #E8E4DC',borderRadius:11,padding:'15px'},
  tipHead:{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:10},
  tipRow:{display:'flex',alignItems:'flex-start',gap:8,marginBottom:9},

  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',display:'flex',justifyContent:'flex-end',zIndex:300},
  previewPanel:{width:380,background:'#fff',height:'100vh',display:'flex',flexDirection:'column',boxShadow:'-6px 0 28px rgba(0,0,0,.13)',animation:'fadeup .2s ease both'},
  previewHead:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'15px 18px',borderBottom:'1px solid #E8E4DC',flexShrink:0},

  successRing:{width:54,height:54,borderRadius:'50%',background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'},
  btnGreen:{fontSize:13,fontWeight:600,color:'#fff',background:'#0A6B4B',padding:'10px 20px',borderRadius:8},
  btnGhost:{fontSize:13,fontWeight:500,color:'#4A4A44',background:'#fff',border:'1px solid #E8E4DC',padding:'10px 20px',borderRadius:8},
};
