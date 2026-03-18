'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const SAVE_MS = 30000;
const DRAFT_KEY = (id: string) => `update-draft-${id}`;

type PhotoState = { id: string; file: File; preview: string; status: 'compressing'|'uploading'|'done'|'error'; publicUrl?: string; fileKey?: string };
type VideoState = { url: string; provider: 'youtube'|'tiktok'; videoId: string; embedUrl: string; thumbnailUrl: string };

// ─── YouTube/TikTok URL parser ────────────────────────────────────────────────
function parseVideoUrl(url: string): { provider: 'youtube'|'tiktok'; videoId: string; embedUrl: string; thumbnailUrl: string } | null {
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return { provider:'youtube', videoId:id, embedUrl:`https://www.youtube.com/embed/${id}?autoplay=1`, thumbnailUrl:`https://img.youtube.com/vi/${id}/maxresdefault.jpg` };
  }
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) {
    const id = ttMatch[1];
    return { provider:'tiktok', videoId:id, embedUrl:`https://www.tiktok.com/embed/v2/${id}`, thumbnailUrl:'' };
  }
  return null;
}

// ─── mock campaign ─────────────────────────────────────────────────────────────
const MOCK_CAMPAIGN = {
  id: 'ama-kidney-surgery',
  title: 'Help Ama get life-saving kidney surgery at Korle Bu',
  organiser: 'Kwame Mensah',
  donorCount: 87,
  daysActive: 14,
};

export default function PostUpdatePage({ params }: { params: { id: string } }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [photos, setPhotos] = useState<PhotoState[]>([]);
  const [video, setVideo] = useState<VideoState | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoOpen, setVideoOpen] = useState(false);
  const [youtubeGuideOpen, setYoutubeGuideOpen] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const draftRestored = useRef(false);

  const campaign = MOCK_CAMPAIGN;

  // ─── draft restore ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (draftRestored.current) return;
    draftRestored.current = true;
    try {
      const saved = localStorage.getItem(DRAFT_KEY(params.id));
      if (saved) {
        const { html } = JSON.parse(saved);
        if (html && editorRef.current) { editorRef.current.innerHTML = html; setHasDraft(true); }
      }
    } catch {}
  }, [params.id]);

  // ─── auto-save ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => {
      if (!editorRef.current) return;
      const html = editorRef.current.innerHTML;
      if (html && html !== '<br>') {
        localStorage.setItem(DRAFT_KEY(params.id), JSON.stringify({ html, savedAt: Date.now() }));
      }
    }, SAVE_MS);
    return () => clearInterval(t);
  }, [params.id]);

  function discardDraft() {
    localStorage.removeItem(DRAFT_KEY(params.id));
    if (editorRef.current) editorRef.current.innerHTML = '';
    setHasDraft(false);
  }

  function formatCmd(cmd: string) {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
  }

  // ─── photo upload ───────────────────────────────────────────────────────────
  async function handlePhotos(files: FileList | null) {
    if (!files) return;
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    for (const file of validFiles) {
      const id = Math.random().toString(36).slice(2);
      const preview = URL.createObjectURL(file);
      setPhotos(prev => [...prev, { id, file, preview, status:'compressing' }]);
      try {
        // Dynamic import to avoid SSR issues
        const imageCompression = (await import('browser-image-compression')).default;
        const compressed = await imageCompression(file, { maxSizeMB:1.5, fileType:'image/webp', maxWidthOrHeight:1920, useWebWorker:true });
        setPhotos(prev => prev.map(p => p.id===id ? {...p, status:'uploading'} : p));
        // TODO: POST /api/media/photo/presign then PUT to S3
        await new Promise(r => setTimeout(r, 600));
        const publicUrl = preview; // dev placeholder
        setPhotos(prev => prev.map(p => p.id===id ? {...p, status:'done', publicUrl, fileKey:'dev-key-'+id} : p));
      } catch {
        setPhotos(prev => prev.map(p => p.id===id ? {...p, status:'error'} : p));
      }
    }
  }

  function removePhoto(id: string) {
    setPhotos(prev => { const p = prev.find(x=>x.id===id); if (p) URL.revokeObjectURL(p.preview); return prev.filter(x=>x.id!==id); });
  }

  // ─── video parse ────────────────────────────────────────────────────────────
  function addVideo() {
    setVideoError('');
    const parsed = parseVideoUrl(videoUrl.trim());
    if (!parsed) { setVideoError('Paste a YouTube or TikTok link'); return; }
    setVideo({ url: videoUrl.trim(), ...parsed });
    setVideoUrl('');
    setVideoOpen(false);
  }

  // ─── publish ────────────────────────────────────────────────────────────────
  async function handlePublish() {
    const html = editorRef.current?.innerHTML || '';
    if (!html || html === '<br>') return;
    setPublishing(true);
    // TODO: POST /api/campaigns/:id/updates { html, photos, video }
    await new Promise(r => setTimeout(r, 900));
    localStorage.removeItem(DRAFT_KEY(params.id));
    setPublishing(false);
    setPublished(true);
  }

  const hasContent = () => !!editorRef.current?.textContent?.trim();

  const placeholder = campaign.daysActive <= 7 ? "Share how the first few days are going — donors love hearing early updates!" : "Tell your donors what's happened since you last updated them...";

  // ─── success screen ─────────────────────────────────────────────────────────
  if (published) {
    return (
      <>
        <style dangerouslySetInnerHTML={{__html:`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}a{text-decoration:none;color:inherit}@keyframes pop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}`}}/>
        <div style={{maxWidth:480,margin:'0 auto',padding:'80px 24px',textAlign:'center'}}>
          <div style={{width:72,height:72,borderRadius:'50%',background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,margin:'0 auto 24px',animation:'pop .5s ease both'}}>✓</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:'#1A1A18',marginBottom:8}}>Update posted</div>
          <div style={{fontSize:14,color:'#4A4A44',lineHeight:1.7,marginBottom:28}}>{campaign.donorCount} donors will receive your update by SMS.</div>
          <div style={{display:'flex',gap:8,justifyContent:'center'}}>
            <Link href={`/campaign/${params.id}`} style={{flex:1,maxWidth:200,display:'block',padding:'12px 20px',background:'#0A6B4B',color:'#fff',borderRadius:10,fontSize:13,fontWeight:600,textAlign:'center'}}>View campaign →</Link>
            <Link href="/dashboard" style={{flex:1,maxWidth:160,display:'block',padding:'12px 20px',border:'1px solid #E8E4DC',borderRadius:10,fontSize:13,color:'#4A4A44',background:'#fff',textAlign:'center'}}>Dashboard</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}a{text-decoration:none;color:inherit}button,input,textarea{font-family:'DM Sans',sans-serif}[contenteditable]:empty::before{content:attr(data-placeholder);color:#C8C4BC;pointer-events:none}[contenteditable]:focus{outline:none}input:focus{outline:none;border-color:#0A6B4B}`}}/>


      {/* Draft restore banner */}
      {hasDraft && (
        <div style={{background:'#E6F1FB',borderBottom:'1px solid #C0D8F0',padding:'10px 24px',display:'flex',gap:10,alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:12,color:'#185FA5'}}>Draft restored from your last session</span>
          <button style={{fontSize:11,color:'#C0392B',background:'transparent',border:'none',cursor:'pointer',fontWeight:500}} onClick={discardDraft}>Discard</button>
        </div>
      )}

      <div style={{maxWidth:860,margin:'0 auto',padding:'20px 24px 80px',display:'grid',gridTemplateColumns:'1fr 240px',gap:20,alignItems:'start'}}>
        <div>
          {/* Campaign context */}
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:10,padding:'12px 14px',marginBottom:14,display:'flex',gap:10,alignItems:'center'}}>
            <div style={{width:36,height:36,borderRadius:8,background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>📢</div>
            <div>
              <div style={{fontSize:12,fontWeight:600,color:'#1A1A18',lineHeight:1.4}}>{campaign.title}</div>
              <div style={{fontSize:11,color:'#8A8A82'}}>by {campaign.organiser} · {campaign.donorCount} donors will be notified</div>
            </div>
          </div>

          {/* Editor */}
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'16px'}}>
            {/* Toolbar */}
            <div style={{display:'flex',gap:4,marginBottom:10,paddingBottom:10,borderBottom:'1px solid #E8E4DC'}}>
              {[['B','bold'],['I','italic']].map(([l,c])=>(
                <button key={c} style={{width:28,height:28,borderRadius:5,border:'1px solid #E8E4DC',background:'#fff',cursor:'pointer',fontSize:l==='B'?14:13,fontWeight:l==='B'?700:400,fontStyle:l==='I'?'italic':'normal',color:'#4A4A44',display:'flex',alignItems:'center',justifyContent:'center'}} onMouseDown={e=>{e.preventDefault();formatCmd(c);}}>
                  {l}
                </button>
              ))}
            </div>

            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder={placeholder}
              style={{minHeight:160,fontSize:14,lineHeight:1.85,color:'#1A1A18',paddingTop:4}}
            />

            {/* Photos */}
            <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid #E8E4DC'}}>
              <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                {photos.map((p,i)=>(
                  <div key={p.id} style={{position:'relative',width:86,height:86,borderRadius:8,overflow:'hidden',flexShrink:0,background:'#F5F4F0'}}>
                    <img src={p.preview} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>
                    {i===0 && p.status==='done' && <div style={{position:'absolute',top:3,left:3,fontSize:9,fontWeight:700,color:'#fff',background:'rgba(10,107,75,.85)',padding:'2px 5px',borderRadius:3}}>Cover</div>}
                    {p.status==='compressing' && <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff'}}>Compressing…</div>}
                    {p.status==='uploading' && <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff'}}>Uploading…</div>}
                    {p.status==='error' && <div style={{position:'absolute',inset:0,background:'rgba(192,57,43,.5)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#fff'}}>Error</div>}
                    <button style={{position:'absolute',top:2,right:2,width:16,height:16,borderRadius:'50%',background:'rgba(0,0,0,.55)',border:'none',color:'#fff',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>removePhoto(p.id)}>×</button>
                  </div>
                ))}

                {photos.length < 5 && (
                  <label style={{width:86,height:86,borderRadius:8,border:'1.5px dashed #E8E4DC',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:'#FDFAF5'}}>
                    <span style={{fontSize:20,marginBottom:2}}>📷</span>
                    <span style={{fontSize:10,color:'#8A8A82'}}>Add photo</span>
                    <input type="file" accept="image/*" multiple style={{display:'none'}} onChange={e=>handlePhotos(e.target.files)}/>
                  </label>
                )}
              </div>
            </div>

            {/* Video section */}
            <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid #E8E4DC'}}>
              {video ? (
                <div style={{position:'relative',borderRadius:9,overflow:'hidden',background:'#000',aspectRatio:'16/7'}}>
                  {video.thumbnailUrl && <img src={video.thumbnailUrl} style={{width:'100%',height:'100%',objectFit:'cover',opacity:.8}} alt="Video thumb"/>}
                  <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,.9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>▶</div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,.9)',fontWeight:500}}>{video.provider==='youtube'?'YouTube':'TikTok'} video attached</div>
                  </div>
                  <button style={{position:'absolute',top:6,right:6,width:22,height:22,borderRadius:'50%',background:'rgba(0,0,0,.6)',border:'none',color:'#fff',fontSize:12,cursor:'pointer'}} onClick={()=>setVideo(null)}>×</button>
                </div>
              ) : (
                <>
                  <button style={{fontSize:12,color:'#4A4A44',background:'transparent',border:'none',padding:'2px 0',cursor:'pointer',display:'flex',alignItems:'center',gap:5}} onClick={()=>setVideoOpen(o=>!o)}>
                    🎬 <span>{videoOpen?'Cancel':'Add a video link'}</span>
                  </button>
                  {videoOpen && (
                    <div style={{marginTop:10}}>
                      <div style={{display:'flex',gap:6}}>
                        <input style={{flex:1,padding:'9px 12px',border:'1.5px solid #E8E4DC',borderRadius:8,fontSize:12,background:'#fff'}} placeholder="Paste YouTube or TikTok URL…" value={videoUrl} onChange={e=>setVideoUrl(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addVideo()}/>
                        <button style={{padding:'9px 14px',background:'#0A6B4B',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={addVideo}>Add</button>
                      </div>
                      {videoError && <div style={{fontSize:11,color:'#C0392B',marginTop:4}}>{videoError}</div>}
                      <button style={{fontSize:11,color:'#185FA5',background:'transparent',border:'none',padding:'4px 0',cursor:'pointer',marginTop:6}} onClick={()=>setYoutubeGuideOpen(o=>!o)}>
                        {youtubeGuideOpen?'Hide':'How to upload to YouTube first ↓'}
                      </button>
                      {youtubeGuideOpen && (
                        <div style={{background:'#F5F4F0',borderRadius:8,padding:'10px 12px',marginTop:6}}>
                          {['1. Open the YouTube app → tap + → Upload a video','2. Choose your video, set visibility to Public or Unlisted','3. Copy the link from YouTube and paste it here'].map((s,i)=>(
                            <div key={i} style={{fontSize:11,color:'#4A4A44',lineHeight:1.6,marginBottom:4}}>{s}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Publish button */}
          <button
            style={{display:'block',width:'100%',padding:14,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',marginTop:14,opacity:publishing?0.6:1,transition:'opacity .15s'}}
            disabled={publishing}
            onClick={handlePublish}
          >
            {publishing ? 'Posting update…' : `Post update — notify ${campaign.donorCount} donors →`}
          </button>
          <div style={{fontSize:11,color:'#8A8A82',textAlign:'center',marginTop:7}}>Donors will receive an SMS update on their phone</div>
        </div>

        {/* Right sidebar */}
        <div style={{position:'sticky',top:72}}>
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:10}}>Writing tips</div>
            {[
              "Write like you're texting a friend — warm and specific",
              'Mention names, places, and moments that happened',
              'Even a small update keeps donors engaged',
              "Share what's coming next",
            ].map((tip,i)=>(
              <div key={i} style={{fontSize:11,color:'#4A4A44',lineHeight:1.6,marginBottom:6,display:'flex',gap:8}}>
                <span style={{color:'#0A6B4B',fontWeight:700,flexShrink:0}}>·</span>{tip}
              </div>
            ))}
          </div>
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:16}}>
            <div style={{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:8}}>SMS preview</div>
            <div style={{background:'#F5F4F0',borderRadius:9,padding:'10px 12px',fontSize:11,color:'#4A4A44',lineHeight:1.65}}>
              EveryGiving: {campaign.organiser} posted an update on "{campaign.title.slice(0,30)}…". Tap to read: everygiving.gh/c/...
            </div>
          </div>
        </div>
      </div>

      {/* Preview overlay */}
      {showPreview && (
        <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.5)',display:'flex',justifyContent:'flex-end'}} onClick={()=>setShowPreview(false)}>
          <div style={{width:380,height:'100%',background:'#FDFAF5',overflowY:'auto',boxShadow:'-4px 0 20px rgba(0,0,0,.12)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'14px 16px',borderBottom:'1px solid #E8E4DC',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:13,fontWeight:700}}>Donor view preview</div>
              <button style={{background:'transparent',border:'none',cursor:'pointer',fontSize:18,color:'#8A8A82'}} onClick={()=>setShowPreview(false)}>×</button>
            </div>
            <div style={{padding:16}}>
              <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'}}>Update from {campaign.organiser}</div>
              <div style={{fontSize:14,lineHeight:1.8,color:'#1A1A18',marginBottom:12}} dangerouslySetInnerHTML={{__html: editorRef.current?.innerHTML || '<span style="color:#C8C4BC">Start writing to preview...</span>'}}/>
              {photos.filter(p=>p.status==='done').length > 0 && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
                  {photos.filter(p=>p.status==='done').map(p=>(
                    <img key={p.id} src={p.preview} style={{width:'100%',height:80,objectFit:'cover',borderRadius:7}} alt=""/>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
