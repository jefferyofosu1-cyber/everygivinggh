const fs = require('fs');
const path = require('path');

function mkdir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function write(p, content) {
  mkdir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
  console.log(`Written: ${p} (${content.length} bytes)`);
}

const BASE = `c:/Users/samuel cyrus-aduteye/Documents/Codeslaw/everygivinggh`;

// ─── 1. VERIFY-ID PAGE (GhanaCardUpload) ─────────────────────────────────────
write(`${BASE}/app/verify-id/page.tsx`, `'use client';
import { useState } from 'react';
import Link from 'next/link';

const BASE_CSS = \`
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
  a{text-decoration:none;color:inherit}
  button,input,textarea{font-family:'DM Sans',sans-serif}
  input:focus,textarea:focus{outline:none;border-color:#0A6B4B!important}
  @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
\`;

type VerifyStatus = 'not_submitted' | 'submitted' | 'pending' | 'approved' | 'rejected';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string } | null> = {
  not_submitted: null,
  submitted:  { label: 'Submitted', color: '#185FA5', bg: '#E6F1FB' },
  pending:    { label: 'Under review', color: '#B85C00', bg: '#FEF3E2' },
  approved:   { label: 'Approved', color: '#0A6B4B', bg: '#E8F5EF' },
  rejected:   { label: 'Rejected — resubmit', color: '#C0392B', bg: '#FCEBEB' },
};

function IDUpload({ label, hint, value, onChange, inputId }: {
  label: string; hint: string; value: File | null;
  onChange: (f: File) => void; inputId: string;
}) {
  return (
    <div>
      <div style={{fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>{label}</div>
      <div
        style={{height:130,border:\`1.5px dashed \${value?'#0A6B4B':'#E8E4DC'}\`,borderRadius:10,
          display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
          cursor:'pointer',transition:'all .15s',overflow:'hidden',background:value?'#E8F5EF':'#fff'}}
        onClick={() => (document.getElementById(inputId) as HTMLInputElement)?.click()}
      >
        {value ? (
          <img src={URL.createObjectURL(value)} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:8}} alt=""/>
        ) : (
          <>
            <div style={{fontSize:28,marginBottom:6}}>🪪</div>
            <div style={{fontSize:12,fontWeight:500,color:'#4A4A44',marginBottom:3}}>Tap to upload</div>
            <div style={{fontSize:10,color:'#8A8A82'}}>{hint}</div>
          </>
        )}
        <input id={inputId} type="file" accept="image/*" style={{display:'none'}}
          onChange={e => e.target.files?.[0] && onChange(e.target.files[0])}/>
      </div>
    </div>
  );
}

export default function VerifyIdPage() {
  const [status, setStatus] = useState<VerifyStatus>('not_submitted');
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!front || !back) return;
    setSubmitting(true);
    // TODO: POST /api/verify with front + back files
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    setStatus('submitted');
  }

  const cfg = STATUS_CFG[status];

  return (
    <>
      <style>{BASE_CSS}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link href="/" style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18'}}>Every<span style={{color:'#0A6B4B'}}>Giving</span></Link>
          <div style={{width:1,height:16,background:'#E8E4DC'}}/>
          <span style={{fontSize:12,color:'#8A8A82'}}>Identity verification</span>
        </div>
        <Link href="/dashboard" style={{fontSize:12,color:'#8A8A82'}}>← Dashboard</Link>
      </nav>

      <div style={{maxWidth:900,margin:'0 auto',padding:'28px 24px 64px',display:'grid',gridTemplateColumns:'1fr 260px',gap:24,alignItems:'start'}}>
        <div>
          {cfg && (
            <div style={{padding:'12px 16px',borderRadius:9,marginBottom:16,fontSize:13,lineHeight:1.6,background:cfg.bg,color:cfg.color}}>
              <strong>{cfg.label}</strong>
              {status==='pending' && ' — our team is reviewing your submission. Usually within 24 hours.'}
              {status==='approved' && ' — your identity has been verified. Your campaign can now go live.'}
              {status==='rejected' && ' — please resubmit with a clearer photo. See guidance below.'}
              {status==='submitted' && " — received. You'll get an SMS when we've reviewed it."}
            </div>
          )}

          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:14,padding:'24px 22px'}}>
            <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'#1A1A18',marginBottom:6}}>Verify your identity</h2>
            <p style={{fontSize:13,color:'#8A8A82',lineHeight:1.65,marginBottom:20}}>Upload your Ghana Card (front and back). Our team reviews every submission personally — usually within 24 hours.</p>

            <div style={{marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'}}>Accepted documents</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {['Ghana Card (preferred)','Voter ID','NHIS Card','Passport',"Driver's License"].map((id,i) => (
                  <span key={i} style={{fontSize:11,fontWeight:500,color:'#4A4A44',background:'#F5F4F0',border:'1px solid #E8E4DC',padding:'3px 9px',borderRadius:20}}>{id}</span>
                ))}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
              <IDUpload label="Front of card" hint="Show the photo side clearly" value={front} onChange={setFront} inputId="front-input"/>
              <IDUpload label="Back of card" hint="Show all text clearly" value={back} onChange={setBack} inputId="back-input"/>
            </div>

            <div style={{background:'#F5F4F0',borderRadius:9,padding:14,marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:700,color:'#4A4A44',marginBottom:8}}>Tips for a successful submission</div>
              {['Place your card on a flat, well-lit surface','Make sure all four corners of the card are visible','Text must be readable — no blurry or dark photos','No screenshots of photos — upload the original image'].map((tip,i)=>(
                <div key={i} style={{fontSize:11,color:'#4A4A44',lineHeight:1.6,marginBottom:3,display:'flex',gap:8}}>
                  <span style={{color:'#0A6B4B',fontWeight:700,flexShrink:0}}>·</span>{tip}
                </div>
              ))}
            </div>

            {(status==='not_submitted'||status==='rejected') ? (
              <button
                style={{display:'block',width:'100%',padding:13,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer',opacity:front&&back&&!submitting?1:.45,transition:'opacity .15s'}}
                disabled={!front||!back||submitting}
                onClick={handleSubmit}
              >
                {submitting?'Uploading…':status==='rejected'?'Resubmit verification →':'Submit for verification →'}
              </button>
            ) : status==='approved' ? (
              <Link href="/dashboard" style={{display:'block',padding:13,background:'#185FA5',color:'#fff',borderRadius:9,fontSize:14,fontWeight:700,textAlign:'center'}}>
                Go to dashboard →
              </Link>
            ) : (
              <div style={{fontSize:13,color:'#185FA5',background:'#E6F1FB',padding:12,borderRadius:8,textAlign:'center',lineHeight:1.6}}>
                Your submission is being reviewed. You'll receive an SMS when approved.
              </div>
            )}
          </div>
        </div>

        <div style={{position:'sticky',top:72}}>
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:10}}>Why we verify</div>
            <div style={{marginBottom:8}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,color:'#0A6B4B'}}>3×</div>
              <div style={{fontSize:12,color:'#4A4A44',marginTop:4,lineHeight:1.5}}>more raised by verified campaigns vs unverified ones</div>
            </div>
            <div style={{fontSize:12,color:'#4A4A44',lineHeight:1.65}}>Donors give more when they know the real identity of the person asking. Verification is what makes EveryGiving trustworthy.</div>
          </div>
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:10}}>What we do with your ID</div>
            {['Reviewed by our team only — never sold or shared','Stored securely and encrypted at rest','Used only to verify your identity — nothing else'].map((pt,i)=>(
              <div key={i} style={{fontSize:12,color:'#4A4A44',lineHeight:1.6,marginBottom:6,paddingLeft:12,borderLeft:'2px solid #E8F5EF'}}>{pt}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
`);

// ─── 2. MILESTONE PROOF PAGE ─────────────────────────────────────────────────
write(`${BASE}/app/dashboard/campaigns/[id]/milestones/[mid]/page.tsx`, `'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function MilestoneProofPage({ params }: { params: { id: string; mid: string } }) {
  const [proofFiles, setProofFiles] = useState<File[]>([]);
  const [proofNote, setProofNote] = useState('');
  const [status, setStatus] = useState<'collecting'|'submitted'|'approved'>('collecting');
  const [submitting, setSubmitting] = useState(false);

  // TODO: fetch real milestone from API using params.id and params.mid
  const milestone = { name: 'Surgery fees', amount: 12000, campaign: 'Help Ama get life-saving kidney surgery', raisedGHS: 14400, goalGHS: 20000 };

  async function handleSubmit() {
    if (!proofFiles.length || !proofNote.trim()) return;
    setSubmitting(true);
    // TODO: POST /api/campaigns/:id/milestones/:mid/proof
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setStatus('submitted');
  }

  const pct = Math.round(milestone.raisedGHS / milestone.goalGHS * 100);

  return (
    <>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea{font-family:'DM Sans',sans-serif}
        input:focus,textarea:focus{outline:none;border-color:#0A6B4B!important}
        @keyframes pop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
      \`}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link href="/" style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18'}}>Every<span style={{color:'#0A6B4B'}}>Giving</span></Link>
          <div style={{width:1,height:16,background:'#E8E4DC'}}/>
          <span style={{fontSize:12,color:'#8A8A82'}}>Milestone proof</span>
        </div>
        <Link href="/dashboard" style={{fontSize:12,color:'#8A8A82'}}>← Dashboard</Link>
      </nav>

      <div style={{maxWidth:900,margin:'0 auto',padding:'28px 24px 64px',display:'grid',gridTemplateColumns:'1fr 260px',gap:24,alignItems:'start'}}>
        <div>
          {/* Header */}
          <div style={{display:'flex',gap:14,alignItems:'flex-start',background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:16,marginBottom:14}}>
            <div style={{width:44,height:44,borderRadius:10,background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0}}>🎯</div>
            <div>
              <div style={{fontSize:11,color:'#8A8A82',marginBottom:3}}>{milestone.campaign}</div>
              <div style={{fontSize:16,fontWeight:700,color:'#1A1A18',marginBottom:4}}>{milestone.name}</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:'#0A6B4B'}}>₵{milestone.amount.toLocaleString()}</div>
            </div>
          </div>

          {/* Progress */}
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8}}>Campaign progress</div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:18,fontWeight:700}}>₵{milestone.raisedGHS.toLocaleString()}</span>
              <span style={{fontSize:13,color:'#0A6B4B',fontWeight:600}}>{pct}%</span>
            </div>
            <div style={{height:6,background:'#E8E4DC',borderRadius:3,overflow:'hidden'}}>
              <div style={{height:'100%',background:'#0A6B4B',borderRadius:3,width:\`\${pct}%\`}}/>
            </div>
            <div style={{fontSize:11,color:'#8A8A82',marginTop:4}}>of ₵{milestone.goalGHS.toLocaleString()} goal</div>
          </div>

          {status==='collecting' && (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px',marginBottom:14}}>
              <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:6}}>Submit proof to release funds</h3>
              <p style={{fontSize:13,color:'#8A8A82',lineHeight:1.65,marginBottom:16}}>Upload a photo, receipt, or document showing how ₵{milestone.amount.toLocaleString()} will be or was used.</p>

              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>Proof documents or photos</label>
                <div
                  style={{border:'1.5px dashed #E8E4DC',borderRadius:9,padding:24,textAlign:'center',cursor:'pointer',transition:'all .15s'}}
                  onClick={() => (document.getElementById('proof-input') as HTMLInputElement)?.click()}
                >
                  <div style={{fontSize:24,marginBottom:6}}>📄</div>
                  <div style={{fontSize:13,fontWeight:500,color:'#4A4A44',marginBottom:3}}>Tap to upload proof</div>
                  <div style={{fontSize:11,color:'#8A8A82'}}>Photos · PDFs · Receipts · Hospital letters</div>
                  <input id="proof-input" type="file" accept="image/*,.pdf" multiple style={{display:'none'}}
                    onChange={e => setProofFiles(Array.from(e.target.files || []))}/>
                </div>
                {proofFiles.length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
                    {proofFiles.map((f,i) => (
                      <div key={i} style={{fontSize:11,color:'#0A6B4B',background:'#E8F5EF',padding:'4px 10px',borderRadius:20}}>
                        📎 {f.name.slice(0,20)}{f.name.length>20?'…':''}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{marginBottom:20}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>Explain how the funds will be used</label>
                <textarea
                  style={{width:'100%',padding:'11px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:13,lineHeight:1.7,minHeight:100,resize:'vertical',background:'#fff'}}
                  placeholder="e.g. This payment covers the surgical fees at Korle Bu Teaching Hospital on March 20th. The attached receipt confirms the booking deposit was paid."
                  value={proofNote}
                  onChange={e => setProofNote(e.target.value.slice(0,500))}
                />
                <div style={{fontSize:10,color:'#8A8A82',marginTop:3}}>{proofNote.length}/500</div>
              </div>

              <button
                style={{display:'block',width:'100%',padding:12,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer',transition:'opacity .15s',opacity:proofFiles.length&&proofNote.trim()&&!submitting?1:.45}}
                disabled={!proofFiles.length||!proofNote.trim()||submitting}
                onClick={handleSubmit}
              >
                {submitting?'Submitting…':'Submit proof for review →'}
              </button>
            </div>
          )}

          {status==='submitted' && (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px',textAlign:'center'}}>
              <div style={{width:52,height:52,borderRadius:'50%',background:'#E6F1FB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,margin:'20px auto 14px'}}>⏳</div>
              <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#1A1A18',marginBottom:8}}>Proof submitted</h3>
              <p style={{fontSize:13,color:'#4A4A44',lineHeight:1.7}}>Our team is reviewing your proof. Usually approved within a few hours. Funds will land on your MoMo wallet same day.</p>
            </div>
          )}

          {status==='approved' && (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px',textAlign:'center'}}>
              <div style={{width:52,height:52,borderRadius:'50%',background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,margin:'20px auto 14px',animation:'pop .4s ease both'}}>✓</div>
              <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0A6B4B',marginBottom:8}}>₵{milestone.amount.toLocaleString()} released</h3>
              <p style={{fontSize:13,color:'#4A4A44',lineHeight:1.7}}>Funds have been sent to your MTN MoMo wallet. Check your phone for confirmation.</p>
            </div>
          )}
        </div>

        <div style={{position:'sticky',top:72}}>
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:10}}>How the payout works</div>
            {[
              {n:'1',t:'You submit proof',d:'Photo, receipt, or document showing how funds will be used'},
              {n:'2',t:'Team reviews',d:'Our team checks your proof — usually within a few hours'},
              {n:'3',t:'Funds released',d:'₵'+milestone.amount.toLocaleString()+' lands on your MoMo wallet same day'},
            ].map(step=>(
              <div key={step.n} style={{display:'flex',gap:10,marginBottom:12,alignItems:'flex-start'}}>
                <div style={{width:22,height:22,borderRadius:'50%',background:'#0A6B4B',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{step.n}</div>
                <div><div style={{fontSize:12,fontWeight:600,color:'#1A1A18',marginBottom:2}}>{step.t}</div><div style={{fontSize:11,color:'#8A8A82',lineHeight:1.5}}>{step.d}</div></div>
              </div>
            ))}
          </div>
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:16,marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:10}}>Good proof examples</div>
            {['Hospital payment receipt','Bank transfer confirmation','Supplier invoice','Medical report with cost breakdown','Photo of purchased equipment with receipt'].map((ex,i)=>(
              <div key={i} style={{fontSize:11,color:'#4A4A44',marginBottom:5,display:'flex',gap:6}}><span style={{color:'#0A6B4B'}}>✓</span>{ex}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
`);

// ─── 3. ADMIN VERIFICATION PAGE ──────────────────────────────────────────────
write(`${BASE}/app/admin/verification/page.tsx`, `'use client';
import { useState } from 'react';
import Link from 'next/link';

type VerifyItem = {
  id: string; name: string; phone: string; campaign: string; category: string;
  submitted: string; status: string; rejectReason?: string; front: string; back: string;
};

const MOCK_QUEUE: VerifyItem[] = [
  { id:'v1', name:'Kwame Mensah', phone:'024 123 4567', campaign:'Help Ama get kidney surgery', category:'Medical', submitted:'2 hrs ago', status:'pending', front:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=70', back:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70' },
  { id:'v2', name:'Ama Boateng', phone:'020 987 6543', campaign:'School supplies for Volta children', category:'Education', submitted:'5 hrs ago', status:'pending', front:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=70', back:'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300&q=70' },
  { id:'v3', name:'Pastor Isaac Asare', phone:'027 555 4444', campaign:'New roof for Bethel Assembly', category:'Faith', submitted:'1 day ago', status:'pending', front:'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=300&q=70', back:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&q=70' },
  { id:'v4', name:'Efua Owusu', phone:'026 111 2222', campaign:'Community borehole project', category:'Community', submitted:'2 days ago', status:'approved', front:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=70', back:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70' },
];

const statusStyle = (s: string) => ({
  color: s==='approved'?'#0A6B4B':s==='rejected'?'#C0392B':'#B85C00',
  background: s==='approved'?'#E8F5EF':s==='rejected'?'#FCEBEB':'#FEF3E2',
  fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,flexShrink:0,
});

export default function AdminVerificationPage() {
  const [queue, setQueue] = useState<VerifyItem[]>(MOCK_QUEUE);
  const [selected, setSelected] = useState<string|null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [filter, setFilter] = useState('pending');

  const filtered = queue.filter(q => filter==='all' || q.status===filter);
  const item = queue.find(q => q.id===selected) || null;

  function approve(id: string) {
    // TODO: PATCH /api/admin/verification/:id/approve
    setQueue(prev => prev.map(q => q.id===id ? {...q,status:'approved'} : q));
    setSelected(null);
  }
  function reject(id: string) {
    if (!rejectReason.trim()) return;
    // TODO: PATCH /api/admin/verification/:id/reject { reason }
    setQueue(prev => prev.map(q => q.id===id ? {...q,status:'rejected',rejectReason} : q));
    setSelected(null); setRejectReason(''); setShowReject(false);
  }

  return (
    <>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea{font-family:'DM Sans',sans-serif}
        textarea:focus,input:focus{outline:none;border-color:#0A6B4B!important}
      \`}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link href="/" style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18'}}>Every<span style={{color:'#0A6B4B'}}>Giving</span></Link>
          <div style={{width:1,height:16,background:'#E8E4DC'}}/>
          <span style={{fontSize:12,color:'#8A8A82'}}>Admin · Verification queue</span>
        </div>
        <div style={{display:'flex',gap:12}}>
          <Link href="/admin/payouts" style={{fontSize:12,color:'#8A8A82'}}>Payouts</Link>
          <Link href="/admin" style={{fontSize:12,color:'#8A8A82'}}>Dashboard</Link>
        </div>
      </nav>

      <div style={{maxWidth:1060,margin:'0 auto',padding:'24px 24px 64px',display:'grid',gridTemplateColumns:'340px 1fr',gap:20,alignItems:'start'}}>
        {/* Left — list */}
        <div>
          <div style={{marginBottom:14}}>
            <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#1A1A18',marginBottom:10}}>Verification queue</h2>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {['pending','approved','rejected','all'].map(f=>(
                <button key={f} style={{fontSize:11,fontWeight:500,padding:'4px 10px',borderRadius:20,cursor:'pointer',transition:'all .15s',background:filter===f?'#1A1A18':'transparent',color:filter===f?'#fff':'#8A8A82',border:\`1px solid \${filter===f?'#1A1A18':'#E8E4DC'}\`}} onClick={()=>setFilter(f)}>
                  {f} {f!=='all'&&<span style={{fontSize:10,marginLeft:3}}>{queue.filter(q=>q.status===f).length}</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {filtered.map(q=>(
              <div key={q.id}
                style={{display:'flex',alignItems:'center',gap:10,background:selected===q.id?'#E8F5EF':'#fff',border:\`1.5px solid \${selected===q.id?'#0A6B4B':'#E8E4DC'}\`,borderRadius:11,padding:'11px 12px',cursor:'pointer',transition:'all .15s'}}
                onClick={()=>setSelected(q.id)}
              >
                <div style={{width:34,height:34,borderRadius:'50%',background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#0A6B4B',flexShrink:0}}>{q.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#1A1A18'}}>{q.name}</div>
                  <div style={{fontSize:11,color:'#8A8A82',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q.campaign.slice(0,45)}{q.campaign.length>45?'…':''}</div>
                  <div style={{fontSize:10,color:'#C8C4BC'}}>{q.phone} · {q.submitted}</div>
                </div>
                <div style={statusStyle(q.status) as any}>{q.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — review */}
        <div style={{position:'sticky',top:72}}>
          {item ? (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:14,paddingBottom:14,borderBottom:'1px solid #E8E4DC'}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:'#1A1A18',marginBottom:3}}>{item.name}</div>
                  <div style={{fontSize:11,color:'#8A8A82',lineHeight:1.5}}>{item.phone} · {item.category} campaign · Submitted {item.submitted}</div>
                </div>
                <div style={statusStyle(item.status) as any}>{item.status}</div>
              </div>

              <div style={{background:'#F5F4F0',borderRadius:8,padding:'10px 12px',marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:4}}>Campaign</div>
                <div style={{fontSize:13,fontWeight:600,color:'#1A1A18'}}>{item.campaign}</div>
              </div>

              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>ID document</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div><div style={{fontSize:10,color:'#8A8A82',marginBottom:4}}>Front</div><img src={item.front} style={{width:'100%',height:110,objectFit:'cover',borderRadius:7}} alt="Front"/></div>
                  <div><div style={{fontSize:10,color:'#8A8A82',marginBottom:4}}>Back</div><img src={item.back} style={{width:'100%',height:110,objectFit:'cover',borderRadius:7}} alt="Back"/></div>
                </div>
              </div>

              {item.status==='pending' && !showReject && (
                <div style={{display:'flex',gap:8}}>
                  <button style={{flex:2,padding:11,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={()=>approve(item.id)}>Approve ✓</button>
                  <button style={{flex:1,padding:11,background:'transparent',color:'#C0392B',border:'1px solid #C0392B',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer'}} onClick={()=>setShowReject(true)}>Reject</button>
                </div>
              )}
              {showReject && (
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#4A4A44',display:'block',marginBottom:6}}>Reason for rejection (sent to campaigner)</label>
                  <textarea style={{width:'100%',padding:'10px 12px',border:'1.5px solid #C0392B',borderRadius:8,fontSize:13,minHeight:80,resize:'vertical',marginBottom:8}} placeholder="e.g. Photo is too blurry — please retake with better lighting" value={rejectReason} onChange={e=>setRejectReason(e.target.value)}/>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{flex:1,padding:10,background:'#C0392B',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',opacity:rejectReason.trim()?1:.45}} disabled={!rejectReason.trim()} onClick={()=>reject(item.id)}>Send rejection</button>
                    <button style={{padding:'10px 14px',background:'transparent',border:'1px solid #E8E4DC',borderRadius:8,fontSize:12,cursor:'pointer'}} onClick={()=>setShowReject(false)}>Cancel</button>
                  </div>
                </div>
              )}
              {item.status==='approved' && <div style={{fontSize:13,color:'#0A6B4B',background:'#E8F5EF',padding:'10px 12px',borderRadius:8,textAlign:'center'}}>✓ Approved — campaign is live</div>}
              {item.status==='rejected' && <div style={{fontSize:13,color:'#C0392B',background:'#FCEBEB',padding:'10px 12px',borderRadius:8}}>Rejected: {item.rejectReason}</div>}
            </div>
          ) : (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:40,textAlign:'center',color:'#8A8A82',fontSize:13}}>Select a submission to review</div>
          )}
        </div>
      </div>
    </>
  );
}
`);

// ─── 4. ADMIN PAYOUTS PAGE ────────────────────────────────────────────────────
write(`${BASE}/app/admin/payouts/page.tsx`, `'use client';
import { useState } from 'react';
import Link from 'next/link';

type ProofItem = {
  id: string; campaign: string; organiser: string; milestone: string; amount: number;
  network: string; momoNumber: string; submitted: string; status: string;
  proof: string; note: string; rejectNote?: string;
};

const MOCK_PROOFS: ProofItem[] = [
  { id:'p1', campaign:'Help Ama get kidney surgery', organiser:'Kwame Mensah', milestone:'Surgery fees', amount:12000, network:'MTN MoMo', momoNumber:'024 123 4567', submitted:'1 hr ago', status:'pending', proof:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&q=70', note:'This covers the surgical fees at Korle Bu. Receipt attached.' },
  { id:'p2', campaign:'School supplies Volta Region', organiser:'Ama Boateng', milestone:'Buy supplies', amount:4500, network:'Vodafone Cash', momoNumber:'020 987 6543', submitted:'3 hrs ago', status:'pending', proof:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=70', note:'Supplies purchased from Accra Central market. Receipts attached.' },
  { id:'p3', campaign:'Community borehole project', organiser:'Efua Owusu', milestone:'Drilling deposit', amount:8000, network:'AirtelTigo', momoNumber:'026 111 2222', submitted:'2 days ago', status:'approved', proof:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&q=70', note:'Deposit paid to DrillersCo Ghana.' },
];

const statusStyle = (s: string) => ({
  color: s==='approved'?'#0A6B4B':s==='rejected'?'#C0392B':'#B85C00',
  background: s==='approved'?'#E8F5EF':s==='rejected'?'#FCEBEB':'#FEF3E2',
  fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,flexShrink:0,
});

export default function AdminPayoutsPage() {
  const [proofs, setProofs] = useState<ProofItem[]>(MOCK_PROOFS);
  const [selected, setSelected] = useState<string|null>(null);
  const [filter, setFilter] = useState('pending');
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [paying, setPaying] = useState(false);

  const filtered = proofs.filter(p => filter==='all'||p.status===filter);
  const item = proofs.find(p => p.id===selected) || null;

  async function approvePayout(id: string) {
    setPaying(true);
    // TODO: POST /api/admin/payouts/:id/approve
    await new Promise(r => setTimeout(r, 1000));
    setPaying(false);
    setProofs(prev => prev.map(p => p.id===id ? {...p,status:'approved'} : p));
    setSelected(null);
  }
  function rejectProof(id: string) {
    // TODO: POST /api/admin/payouts/:id/reject { reason }
    setProofs(prev => prev.map(p => p.id===id ? {...p,status:'rejected',rejectNote} : p));
    setSelected(null); setRejectNote(''); setShowReject(false);
  }

  return (
    <>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea{font-family:'DM Sans',sans-serif}
        textarea:focus{outline:none;border-color:#0A6B4B!important}
      \`}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link href="/" style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18'}}>Every<span style={{color:'#0A6B4B'}}>Giving</span></Link>
          <div style={{width:1,height:16,background:'#E8E4DC'}}/>
          <span style={{fontSize:12,color:'#8A8A82'}}>Admin · Milestone payouts</span>
        </div>
        <div style={{display:'flex',gap:12}}>
          <Link href="/admin/verification" style={{fontSize:12,color:'#8A8A82'}}>Verifications</Link>
          <Link href="/admin" style={{fontSize:12,color:'#8A8A82'}}>Dashboard</Link>
        </div>
      </nav>

      <div style={{maxWidth:1060,margin:'0 auto',padding:'24px 24px 64px',display:'grid',gridTemplateColumns:'340px 1fr',gap:20,alignItems:'start'}}>
        <div>
          <div style={{marginBottom:14}}>
            <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#1A1A18',marginBottom:10}}>Milestone payouts</h2>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {['pending','approved','rejected','all'].map(f=>(
                <button key={f} style={{fontSize:11,fontWeight:500,padding:'4px 10px',borderRadius:20,cursor:'pointer',transition:'all .15s',background:filter===f?'#1A1A18':'transparent',color:filter===f?'#fff':'#8A8A82',border:\`1px solid \${filter===f?'#1A1A18':'#E8E4DC'}\`}} onClick={()=>setFilter(f)}>
                  {f} {f!=='all'&&<span style={{fontSize:10,marginLeft:3}}>{proofs.filter(p=>p.status===f).length}</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {filtered.map(p=>(
              <div key={p.id}
                style={{display:'flex',alignItems:'center',gap:10,background:selected===p.id?'#E8F5EF':'#fff',border:\`1.5px solid \${selected===p.id?'#0A6B4B':'#E8E4DC'}\`,borderRadius:11,padding:'11px 12px',cursor:'pointer',transition:'all .15s'}}
                onClick={()=>{setSelected(p.id);setShowReject(false);}}
              >
                <div style={{width:34,height:34,borderRadius:'50%',background:'#E6F1FB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#185FA5',flexShrink:0}}>₵</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#1A1A18'}}>{p.milestone} — ₵{p.amount.toLocaleString()}</div>
                  <div style={{fontSize:11,color:'#8A8A82',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.campaign.slice(0,40)}{p.campaign.length>40?'…':''}</div>
                  <div style={{fontSize:10,color:'#C8C4BC'}}>{p.organiser} · {p.submitted}</div>
                </div>
                <div style={statusStyle(p.status) as any}>{p.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{position:'sticky',top:72}}>
          {item ? (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:14,paddingBottom:14,borderBottom:'1px solid #E8E4DC'}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:'#1A1A18',marginBottom:3}}>₵{item.amount.toLocaleString()} · {item.milestone}</div>
                  <div style={{fontSize:11,color:'#8A8A82',lineHeight:1.5}}>{item.campaign} · {item.organiser}</div>
                </div>
                <div style={statusStyle(item.status) as any}>{item.status}</div>
              </div>

              <div style={{background:'#F5F4F0',borderRadius:9,padding:12,marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>Payout destination</div>
                {[['Network',item.network],['MoMo number',item.momoNumber],['Amount',\`₵\${item.amount.toLocaleString()}\`]].map(([l,v],i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}>
                    <span style={{color:'#8A8A82'}}>{l}</span>
                    <span style={{fontWeight:600,color:'#1A1A18'}}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>Submitted proof</div>
                <img src={item.proof} style={{width:'100%',height:140,objectFit:'cover',borderRadius:8,display:'block',marginBottom:8}} alt="Proof"/>
                <div style={{fontSize:12,color:'#4A4A44',lineHeight:1.65,background:'#FDFAF5',padding:'10px 12px',borderRadius:7,border:'1px solid #E8E4DC'}}>{item.note}</div>
              </div>

              {item.status==='pending' && !showReject && (
                <div style={{display:'flex',gap:8}}>
                  <button style={{flex:2,padding:11,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',opacity:paying?.6:1}} disabled={paying} onClick={()=>approvePayout(item.id)}>
                    {paying?'Sending to MoMo…':'Approve & pay →'}
                  </button>
                  <button style={{flex:1,padding:11,background:'transparent',color:'#C0392B',border:'1px solid #C0392B',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer'}} onClick={()=>setShowReject(true)}>Reject</button>
                </div>
              )}
              {showReject && (
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#4A4A44',display:'block',marginBottom:6}}>Reason (sent to campaigner)</label>
                  <textarea style={{width:'100%',padding:10,border:'1.5px solid #C0392B',borderRadius:8,fontSize:12,minHeight:70,resize:'vertical',marginBottom:8}} placeholder="e.g. Please provide a clearer receipt with the supplier's name" value={rejectNote} onChange={e=>setRejectNote(e.target.value)}/>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{flex:1,padding:10,background:'#C0392B',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={()=>rejectProof(item.id)}>Send rejection</button>
                    <button style={{padding:'10px 14px',background:'transparent',border:'1px solid #E8E4DC',borderRadius:8,fontSize:11,cursor:'pointer'}} onClick={()=>setShowReject(false)}>Cancel</button>
                  </div>
                </div>
              )}
              {item.status==='approved' && <div style={{fontSize:13,color:'#0A6B4B',background:'#E8F5EF',padding:10,borderRadius:8,textAlign:'center'}}>✓ Paid — ₵{item.amount.toLocaleString()} sent to {item.network}</div>}
            </div>
          ) : (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:40,textAlign:'center',color:'#8A8A82',fontSize:13}}>Select a proof submission to review</div>
          )}
        </div>
      </div>
    </>
  );
}
`);

// ─── 5. CAMPAIGN EDITOR PAGE ─────────────────────────────────────────────────
write(`${BASE}/app/dashboard/campaigns/[id]/edit/page.tsx`, `'use client';
import { useState } from 'react';
import Link from 'next/link';

type Milestone = { id: string; name: string; amount: number; status: 'released'|'collecting'|'pending' };
type Campaign = {
  title: string; story: string; goalAmount: number; raisedAmount: number;
  firstDonationReceived: boolean; milestones: Milestone[];
  category: string; coverImg: string;
};

const MOCK: Campaign = {
  title: 'Help Ama get life-saving kidney surgery at Korle Bu',
  story: 'My mother Ama is 54 years old. She has woken up at 4am every day for thirty years to sell at Makola Market so her children could go to school. Last month she collapsed and was diagnosed with kidney disease and needs surgery within 90 days to survive.',
  goalAmount: 20000, raisedAmount: 14400, firstDonationReceived: true,
  milestones: [
    {id:'m1',name:'Hospital deposit',amount:5000,status:'released'},
    {id:'m2',name:'Surgery fees',amount:12000,status:'collecting'},
    {id:'m3',name:'Post-op care',amount:3000,status:'pending'},
  ],
  category: 'Medical',
  coverImg: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=480&q=80',
};

export default function CampaignEditorPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<Campaign>({...MOCK, milestones:[...MOCK.milestones]});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'story'|'photo'|'milestones'>('story');

  function update(k: keyof Campaign, v: any) { setForm(f=>({...f,[k]:v})); setDirty(true); setSaved(false); }
  function updateMs(id: string, k: keyof Milestone, v: any) {
    setForm(f=>({...f,milestones:f.milestones.map(m=>m.id===id?{...m,[k]:v}:m)}));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    // TODO: PATCH /api/campaigns/:id
    await new Promise(r=>setTimeout(r,700));
    setSaving(false); setSaved(true); setDirty(false);
  }

  return (
    <>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea{font-family:'DM Sans',sans-serif}
        input:focus,textarea:focus{outline:none;border-color:#0A6B4B!important}
      \`}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link href="/" style={{fontFamily:"'DM Serif Display',serif",fontSize:17,color:'#1A1A18'}}>Every<span style={{color:'#0A6B4B'}}>Giving</span></Link>
          <div style={{width:1,height:14,background:'#E8E4DC'}}/>
          <span style={{fontSize:12,color:'#8A8A82'}}>Edit campaign</span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {saved && <span style={{fontSize:11,color:'#0A6B4B',fontWeight:500}}>✓ Saved</span>}
          {dirty && <span style={{fontSize:11,color:'#B85C00'}}>Unsaved changes</span>}
          <Link href="/dashboard" style={{fontSize:12,color:'#8A8A82'}}>Cancel</Link>
          <button style={{fontSize:13,fontWeight:600,color:'#fff',background:'#0A6B4B',border:'none',padding:'7px 16px',borderRadius:8,cursor:'pointer',opacity:dirty&&!saving?1:.5}} disabled={!dirty||saving} onClick={handleSave}>
            {saving?'Saving…':'Save changes'}
          </button>
        </div>
      </nav>

      <div style={{maxWidth:860,margin:'0 auto',padding:'24px 24px 80px'}}>
        <div style={{display:'flex',gap:4,marginBottom:20,background:'#fff',border:'1px solid #E8E4DC',borderRadius:10,padding:4}}>
          {(['story','photo','milestones'] as const).map(t=>(
            <button key={t} style={{flex:1,padding:9,borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:tab===t?600:400,background:tab===t?'#1A1A18':'transparent',color:tab===t?'#fff':'#8A8A82',textTransform:'capitalize',transition:'all .15s'}} onClick={()=>setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab==='story' && (
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:22}}>
            <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:16}}>Story</h3>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>Campaign title</label>
              <input style={{width:'100%',padding:'10px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:14,color:'#1A1A18'}} value={form.title} onChange={e=>update('title',e.target.value)} maxLength={100}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>Your story</label>
              <textarea style={{width:'100%',padding:'11px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:13,lineHeight:1.75,minHeight:200,resize:'vertical'}} value={form.story} onChange={e=>update('story',e.target.value)}/>
            </div>
            {form.firstDonationReceived && (
              <div style={{fontSize:12,color:'#B85C00',background:'#FEF3E2',padding:'10px 12px',borderRadius:8,marginTop:12}}>
                ⚠ Goal amount cannot be changed after the first donation is received (₵{form.raisedAmount.toLocaleString()} raised so far).
              </div>
            )}
          </div>
        )}

        {tab==='photo' && (
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:22}}>
            <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:16}}>Cover photo</h3>
            <div style={{position:'relative',height:240,borderRadius:10,overflow:'hidden',marginBottom:16}}>
              <img src={form.coverImg} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt="Cover"/>
              <button style={{position:'absolute',bottom:10,right:10,fontSize:12,fontWeight:600,color:'#fff',background:'rgba(0,0,0,.55)',border:'none',padding:'7px 14px',borderRadius:7,cursor:'pointer'}}>Change photo</button>
            </div>
            <div style={{fontSize:12,color:'#8A8A82',lineHeight:1.65}}>Adding a new photo does not re-send notifications to donors. They'll see it when they next visit your campaign page.</div>
          </div>
        )}

        {tab==='milestones' && (
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:22}}>
            <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:6}}>Milestones</h3>
            <p style={{fontSize:12,color:'#8A8A82',marginBottom:16,lineHeight:1.6}}>You can edit milestones that haven't been triggered yet. Released and collecting milestones are locked.</p>
            {form.milestones.map((ms,i)=>{
              const locked = ms.status==='released'||ms.status==='collecting';
              const dotBg = ms.status==='released'?'#0A6B4B':ms.status==='collecting'?'#B85C00':'#E8E4DC';
              const dotColor = ms.status!=='pending'?'#fff':'#8A8A82';
              const pillColor = ms.status==='released'?'#0A6B4B':ms.status==='collecting'?'#B85C00':'#8A8A82';
              const pillBg = ms.status==='released'?'#E8F5EF':ms.status==='collecting'?'#FEF3E2':'#F2F3F4';
              return (
                <div key={ms.id} style={{display:'flex',gap:10,alignItems:'center',marginBottom:10,padding:12,background:locked?'#F5F4F0':'#fff',border:'1px solid #E8E4DC',borderRadius:9}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:dotBg,color:dotColor,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <input style={{flex:2,padding:'8px 10px',border:'1.5px solid #E8E4DC',borderRadius:7,fontSize:13,color:'#1A1A18',background:locked?'#F5F4F0':'#fff'}} value={ms.name} onChange={e=>updateMs(ms.id,'name',e.target.value as any)} disabled={locked}/>
                  <div style={{display:'flex',alignItems:'center',border:'1.5px solid #E8E4DC',borderRadius:7,background:locked?'#F5F4F0':'#fff',overflow:'hidden',flex:1}}>
                    <span style={{fontSize:13,fontWeight:600,color:'#8A8A82',padding:'8px',borderRight:'1px solid #E8E4DC'}}>₵</span>
                    <input style={{flex:1,border:'none',padding:8,fontSize:13,background:'transparent',color:'#1A1A18'}} type="number" value={ms.amount} onChange={e=>updateMs(ms.id,'amount',Number(e.target.value))} disabled={locked}/>
                  </div>
                  <div style={{fontSize:10,fontWeight:700,color:pillColor,background:pillBg,padding:'3px 8px',borderRadius:20,flexShrink:0}}>{ms.status}</div>
                </div>
              );
            })}
            <div style={{fontSize:12,color:'#8A8A82',marginTop:8,lineHeight:1.6}}>Locked milestones (released or collecting) cannot be edited. Contact support if you need to make changes.</div>
          </div>
        )}
      </div>
    </>
  );
}
`);

console.log('\nAll 5 Screens.jsx pages written successfully!');
