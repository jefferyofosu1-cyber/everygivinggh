/**
 * EveryGiving — Remaining 5 Screens
 *
 * GhanaCardUpload   → /verify
 * MilestoneProof    → /dashboard/campaigns/[id]/milestones/[mid]
 * AdminVerifyQueue  → /admin/verify
 * AdminPayouts      → /admin/payouts
 * CampaignEditor    → /dashboard/campaigns/[id]/edit
 */

'use client';
import { useState, useRef } from 'react';

// ─── SHARED ───────────────────────────────────────────────────────────────────

const BASE = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
  a{text-decoration:none;color:inherit}
  button,input,textarea,select{font-family:'DM Sans',sans-serif}
  input:focus,textarea:focus,select:focus{outline:none;border-color:#0A6B4B!important}
  @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
`;

function Nav({ title, back, backLabel = '← Dashboard' }) {
  return (
    <nav style={n.nav}>
      <div style={n.navLeft}>
        <a href="/" style={n.logo}>Every<span style={{color:'#0A6B4B'}}>Giving</span></a>
        <div style={n.div}/>
        <span style={n.section}>{title}</span>
      </div>
      <a href={back||'/dashboard'} style={n.back}>{backLabel}</a>
    </nav>
  );
}

const n = {
  nav:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100},
  navLeft:{display:'flex',alignItems:'center',gap:10},
  logo:{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18'},
  div:{width:1,height:16,background:'#E8E4DC'},
  section:{fontSize:12,color:'#8A8A82'},
  back:{fontSize:12,color:'#8A8A82'},
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. GHANA CARD UPLOAD
// ═══════════════════════════════════════════════════════════════════════════════

export function GhanaCardUpload() {
  const [status, setStatus] = useState('not_submitted'); // not_submitted | submitted | pending | approved | rejected
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const statuses = {
    not_submitted: null,
    submitted: { label:'Submitted', color:'#185FA5', bg:'#E6F1FB' },
    pending:   { label:'Under review', color:'#B85C00', bg:'#FEF3E2' },
    approved:  { label:'Approved', color:'#0A6B4B', bg:'#E8F5EF' },
    rejected:  { label:'Rejected — resubmit', color:'#C0392B', bg:'#FCEBEB' },
  };

  async function handleSubmit() {
    if (!front || !back) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitting(false);
    setStatus('submitted');
  }

  return (
    <>
      <style>{BASE}</style>
      <Nav title="Identity verification" />
      <div style={g.page}>
        <div style={g.left}>

          {/* Status banner */}
          {status !== 'not_submitted' && (
            <div style={{...g.statusBanner, background: statuses[status]?.bg, color: statuses[status]?.color}}>
              <strong>{statuses[status]?.label}</strong>
              {status==='pending' && ' — our team is reviewing your submission. Usually within 24 hours.'}
              {status==='approved' && ' — your identity has been verified. Your campaign can now go live.'}
              {status==='rejected' && ' — please resubmit with a clearer photo. See guidance below.'}
              {status==='submitted' && ' — received. You\'ll get an SMS when we\'ve reviewed it.'}
            </div>
          )}

          <div style={g.card}>
            <h2 style={g.title}>Verify your identity</h2>
            <p style={g.sub}>Upload your Ghana Card (front and back). Our team reviews every submission personally — usually within 24 hours.</p>

            {/* Accepted IDs */}
            <div style={g.acceptedIds}>
              <div style={g.acceptedLabel}>Accepted documents</div>
              <div style={g.idList}>
                {['Ghana Card (preferred)','Voter ID','NHIS Card','Passport','Driver\'s License'].map((id,i) => (
                  <span key={i} style={g.idChip}>{id}</span>
                ))}
              </div>
            </div>

            {/* Upload zones */}
            <div style={g.uploadGrid}>
              <IDUpload
                label="Front of card"
                hint="Show the photo side clearly"
                value={front}
                onChange={setFront}
                inputId="front-input"
              />
              <IDUpload
                label="Back of card"
                hint="Show all text clearly"
                value={back}
                onChange={setBack}
                inputId="back-input"
              />
            </div>

            {/* Photo tips */}
            <div style={g.tipsBox}>
              <div style={g.tipsTitle}>Tips for a successful submission</div>
              {[
                'Place your card on a flat, well-lit surface',
                'Make sure all four corners of the card are visible',
                'Text must be readable — no blurry or dark photos',
                'No screenshots of photos — upload the original image',
              ].map((tip,i) => (
                <div key={i} style={g.tip}><span style={g.tipDot}>·</span>{tip}</div>
              ))}
            </div>

            {status === 'not_submitted' || status === 'rejected' ? (
              <button
                style={{...g.submitBtn, opacity: front&&back&&!submitting?1:.45}}
                disabled={!front||!back||submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Uploading…' : status==='rejected'?'Resubmit verification →':'Submit for verification →'}
              </button>
            ) : status === 'approved' ? (
              <a href="/dashboard" style={{...g.submitBtn, display:'block', textAlign:'center', background:'#185FA5'}}>
                Go to dashboard →
              </a>
            ) : (
              <div style={g.pendingNote}>
                Your submission is being reviewed. You'll receive an SMS when approved.
              </div>
            )}
          </div>
        </div>

        <div style={g.right}>
          <div style={g.sideCard}>
            <div style={g.sideTitle}>Why we verify</div>
            <div style={g.sideStat}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,color:'#0A6B4B'}}>3×</div>
              <div style={{fontSize:12,color:'#4A4A44',marginTop:4,lineHeight:1.5}}>more raised by verified campaigns vs unverified ones</div>
            </div>
            <div style={g.sideBody}>Donors give more when they know the real identity of the person asking. Verification is what makes EveryGiving trustworthy.</div>
          </div>
          <div style={g.sideCard}>
            <div style={g.sideTitle}>What we do with your ID</div>
            {['Reviewed by our team only — never sold or shared','Stored securely and encrypted at rest','Used only to verify your identity — nothing else'].map((pt,i)=>(
              <div key={i} style={{fontSize:12,color:'#4A4A44',lineHeight:1.6,marginBottom:6,paddingLeft:12,borderLeft:'2px solid #E8F5EF'}}>{pt}</div>
            ))}
          </div>
          {/* Simulate status for demo */}
          <div style={{...g.sideCard,background:'#F5F4F0'}}>
            <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>Preview states</div>
            {['not_submitted','pending','approved','rejected'].map(s=>(
              <button key={s} style={{display:'block',width:'100%',textAlign:'left',fontSize:11,padding:'5px 8px',marginBottom:3,background:status===s?'#E8F5EF':'transparent',border:`1px solid ${status===s?'#0A6B4B':'#E8E4DC'}`,borderRadius:6,cursor:'pointer',color:status===s?'#0A6B4B':'#4A4A44'}} onClick={()=>setStatus(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function IDUpload({ label, hint, value, onChange, inputId }) {
  return (
    <div>
      <div style={{fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>{label}</div>
      <div
        style={{...g.idZone, borderColor: value?'#0A6B4B':'#E8E4DC', background: value?'#E8F5EF':'#fff'}}
        onClick={() => document.getElementById(inputId).click()}
      >
        {value ? (
          <img src={URL.createObjectURL(value)} style={{width:'100%',height:'100%',objectFit:'cover',display:'block',borderRadius:8}} alt=""/>
        ) : (
          <>
            <div style={{fontSize:28,marginBottom:6}}>🪪</div>
            <div style={{fontSize:12,fontWeight:500,color:'#4A4A44',marginBottom:3}}>Tap to upload</div>
            <div style={{fontSize:10,color:'#8A8A82'}}>{hint}</div>
          </>
        )}
        <input id={inputId} type="file" accept="image/*" style={{display:'none'}} onChange={e=>onChange(e.target.files[0])}/>
      </div>
    </div>
  );
}

const g = {
  page:{maxWidth:900,margin:'0 auto',padding:'28px 24px 64px',display:'grid',gridTemplateColumns:'1fr 260px',gap:24,alignItems:'start'},
  left:{},right:{position:'sticky',top:72},
  statusBanner:{padding:'12px 16px',borderRadius:9,marginBottom:16,fontSize:13,lineHeight:1.6},
  card:{background:'#fff',border:'1px solid #E8E4DC',borderRadius:14,padding:'24px 22px'},
  title:{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'#1A1A18',marginBottom:6},
  sub:{fontSize:13,color:'#8A8A82',lineHeight:1.65,marginBottom:20},
  acceptedIds:{marginBottom:20},
  acceptedLabel:{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'},
  idList:{display:'flex',flexWrap:'wrap',gap:6},
  idChip:{fontSize:11,fontWeight:500,color:'#4A4A44',background:'#F5F4F0',border:'1px solid #E8E4DC',padding:'3px 9px',borderRadius:20},
  uploadGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20},
  idZone:{height:130,border:'1.5px dashed',borderRadius:10,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .15s',overflow:'hidden'},
  tipsBox:{background:'#F5F4F0',borderRadius:9,padding:'14px',marginBottom:20},
  tipsTitle:{fontSize:11,fontWeight:700,color:'#4A4A44',marginBottom:8},
  tip:{fontSize:11,color:'#4A4A44',lineHeight:1.6,marginBottom:3,display:'flex',gap:8},
  tipDot:{color:'#0A6B4B',fontWeight:700,flexShrink:0},
  submitBtn:{display:'block',width:'100%',padding:'13px',background:'#0A6B4B',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer',textDecoration:'none',textAlign:'center',transition:'opacity .15s'},
  pendingNote:{fontSize:13,color:'#185FA5',background:'#E6F1FB',padding:'12px',borderRadius:8,textAlign:'center',lineHeight:1.6},
  sideCard:{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'16px',marginBottom:10},
  sideTitle:{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:10},
  sideStat:{marginBottom:8},
  sideBody:{fontSize:12,color:'#4A4A44',lineHeight:1.65},
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. MILESTONE PROOF SUBMISSION
// ═══════════════════════════════════════════════════════════════════════════════

export function MilestoneProof() {
  const [proofFiles, setProofFiles] = useState([]);
  const [proofNote, setProofNote] = useState('');
  const [status, setStatus] = useState('collecting'); // collecting | submitted | approved | rejected
  const [submitting, setSubmitting] = useState(false);

  const milestone = { name:'Surgery fees', amount:12000, campaign:'Help Ama get life-saving kidney surgery', raisedGHS:14400, goalGHS:20000 };

  async function handleSubmit() {
    if (!proofFiles.length || !proofNote.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setStatus('submitted');
  }

  return (
    <>
      <style>{BASE}</style>
      <Nav title="Milestone proof" backLabel="← Dashboard" />
      <div style={m.page}>
        <div style={m.left}>

          {/* Milestone header */}
          <div style={m.msHeader}>
            <div style={m.msIcon}>🎯</div>
            <div>
              <div style={m.msCampaign}>{milestone.campaign}</div>
              <div style={m.msName}>{milestone.name}</div>
              <div style={m.msAmount}>₵{milestone.amount.toLocaleString()}</div>
            </div>
          </div>

          {/* Progress */}
          <div style={m.card}>
            <div style={m.cardLabel}>Campaign progress</div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:18,fontWeight:700}}>₵{milestone.raisedGHS.toLocaleString()}</span>
              <span style={{fontSize:13,color:'#0A6B4B',fontWeight:600}}>{Math.round(milestone.raisedGHS/milestone.goalGHS*100)}%</span>
            </div>
            <div style={m.bar}><div style={{...m.barFill,width:`${milestone.raisedGHS/milestone.goalGHS*100}%`}}/></div>
            <div style={{fontSize:11,color:'#8A8A82',marginTop:4}}>of ₵{milestone.goalGHS.toLocaleString()} goal</div>
          </div>

          {status==='collecting' && (
            <div style={m.card}>
              <h3 style={m.cardTitle}>Submit proof to release funds</h3>
              <p style={m.cardSub}>Upload a photo, receipt, or document showing how ₵{milestone.amount.toLocaleString()} will be or was used.</p>

              {/* Proof upload */}
              <div style={{marginBottom:16}}>
                <label style={m.fieldLabel}>Proof documents or photos</label>
                <div style={{...m.dropZone}} onClick={() => document.getElementById('proof-input').click()}>
                  <div style={{fontSize:24,marginBottom:6}}>📄</div>
                  <div style={{fontSize:13,fontWeight:500,color:'#4A4A44',marginBottom:3}}>Tap to upload proof</div>
                  <div style={{fontSize:11,color:'#8A8A82'}}>Photos · PDFs · Receipts · Hospital letters</div>
                  <input id="proof-input" type="file" accept="image/*,.pdf" multiple style={{display:'none'}} onChange={e=>{setProofFiles(Array.from(e.target.files));}}/>
                </div>
                {proofFiles.length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
                    {proofFiles.map((f,i) => (
                      <div key={i} style={{fontSize:11,color:'#0A6B4B',background:'#E8F5EF',padding:'4px 10px',borderRadius:20,display:'flex',gap:4,alignItems:'center'}}>
                        📎 {f.name.slice(0,20)}{f.name.length>20?'…':''}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Note */}
              <div style={{marginBottom:20}}>
                <label style={m.fieldLabel}>Explain how the funds will be used</label>
                <textarea
                  style={{width:'100%',padding:'11px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:13,lineHeight:1.7,minHeight:100,resize:'vertical',background:'#fff'}}
                  placeholder="e.g. This payment covers the surgical fees at Korle Bu Teaching Hospital on March 20th. The attached receipt confirms the booking deposit was paid."
                  value={proofNote}
                  onChange={e=>setProofNote(e.target.value)}
                />
                <div style={{fontSize:10,color:'#8A8A82',marginTop:3}}>{proofNote.length}/500</div>
              </div>

              <button
                style={{...m.submitBtn, opacity:proofFiles.length&&proofNote.trim()&&!submitting?1:.45}}
                disabled={!proofFiles.length||!proofNote.trim()||submitting}
                onClick={handleSubmit}
              >
                {submitting?'Submitting…':'Submit proof for review →'}
              </button>
            </div>
          )}

          {status==='submitted' && (
            <div style={m.card}>
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={m.statusIcon('#E6F1FB')}>⏳</div>
                <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#1A1A18',marginBottom:8}}>Proof submitted</h3>
                <p style={{fontSize:13,color:'#4A4A44',lineHeight:1.7}}>Our team is reviewing your proof. Usually approved within a few hours. Funds will land on your MoMo wallet same day.</p>
              </div>
            </div>
          )}

          {status==='approved' && (
            <div style={m.card}>
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <div style={{...m.statusIcon('#E8F5EF'),animation:'pop .4s ease both'}}>✓</div>
                <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#0A6B4B',marginBottom:8}}>₵{milestone.amount.toLocaleString()} released</h3>
                <p style={{fontSize:13,color:'#4A4A44',lineHeight:1.7}}>Funds have been sent to your MTN MoMo wallet. Check your phone for confirmation.</p>
              </div>
            </div>
          )}

          {/* State demo */}
          <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
            {['collecting','submitted','approved'].map(s=>(
              <button key={s} style={{fontSize:10,padding:'4px 10px',background:status===s?'#0A6B4B':'#F5F4F0',color:status===s?'#fff':'#4A4A44',border:`1px solid ${status===s?'#0A6B4B':'#E8E4DC'}`,borderRadius:20,cursor:'pointer'}} onClick={()=>setStatus(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div style={m.right}>
          <div style={m.sideCard}>
            <div style={m.sideTitle}>How the payout works</div>
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
          <div style={m.sideCard}>
            <div style={m.sideTitle}>Good proof examples</div>
            {['Hospital payment receipt','Bank transfer confirmation','Supplier invoice','Medical report with cost breakdown','Photo of purchased equipment with receipt'].map((ex,i)=>(
              <div key={i} style={{fontSize:11,color:'#4A4A44',marginBottom:5,display:'flex',gap:6,alignItems:'flex-start'}}><span style={{color:'#0A6B4B'}}>✓</span>{ex}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const m = {
  page:{maxWidth:900,margin:'0 auto',padding:'28px 24px 64px',display:'grid',gridTemplateColumns:'1fr 260px',gap:24,alignItems:'start'},
  left:{},right:{position:'sticky',top:72},
  msHeader:{display:'flex',gap:14,alignItems:'flex-start',background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'16px',marginBottom:14},
  msIcon:{width:44,height:44,borderRadius:10,background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0},
  msCampaign:{fontSize:11,color:'#8A8A82',marginBottom:3},
  msName:{fontSize:16,fontWeight:700,color:'#1A1A18',marginBottom:4},
  msAmount:{fontFamily:"'DM Serif Display',serif",fontSize:26,color:'#0A6B4B'},
  card:{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px',marginBottom:14},
  cardLabel:{fontSize:11,fontWeight:600,color:'#8A8A82',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:8},
  cardTitle:{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:6},
  cardSub:{fontSize:13,color:'#8A8A82',lineHeight:1.65,marginBottom:16},
  bar:{height:6,background:'#E8E4DC',borderRadius:3,overflow:'hidden'},
  barFill:{height:'100%',background:'#0A6B4B',borderRadius:3},
  fieldLabel:{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6},
  dropZone:{border:'1.5px dashed #E8E4DC',borderRadius:9,padding:'24px',textAlign:'center',cursor:'pointer',transition:'all .15s'},
  submitBtn:{display:'block',width:'100%',padding:'12px',background:'#0A6B4B',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer',transition:'opacity .15s'},
  statusIcon:(bg)=>({width:52,height:52,borderRadius:'50%',background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,margin:'0 auto 14px'}),
  sideCard:{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'16px',marginBottom:10},
  sideTitle:{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:10},
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. ADMIN VERIFICATION QUEUE
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_QUEUE = [
  { id:'v1', name:'Kwame Mensah', phone:'024 123 4567', campaign:'Help Ama get kidney surgery', category:'Medical', submitted:'2 hrs ago', status:'pending', front:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=70&auto=format&fit=crop', back:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70&auto=format&fit=crop' },
  { id:'v2', name:'Ama Boateng', phone:'020 987 6543', campaign:'School supplies for Volta children', category:'Education', submitted:'5 hrs ago', status:'pending', front:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=70&auto=format&fit=crop', back:'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300&q=70&auto=format&fit=crop' },
  { id:'v3', name:'Pastor Isaac Asare', phone:'027 555 4444', campaign:'New roof for Bethel Assembly', category:'Faith', submitted:'1 day ago', status:'pending', front:'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=300&q=70&auto=format&fit=crop', back:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&q=70&auto=format&fit=crop' },
  { id:'v4', name:'Efua Owusu', phone:'026 111 2222', campaign:'Community borehole project', category:'Community', submitted:'2 days ago', status:'approved', front:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=70&auto=format&fit=crop', back:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70&auto=format&fit=crop' },
];

export function AdminVerifyQueue() {
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [filter, setFilter] = useState('pending');

  const filtered = queue.filter(q => filter==='all' || q.status===filter);
  const item = queue.find(q=>q.id===selected);

  function approve(id) {
    setQueue(prev => prev.map(q => q.id===id ? {...q,status:'approved'} : q));
    setSelected(null);
  }
  function reject(id) {
    if (!rejectReason.trim()) return;
    setQueue(prev => prev.map(q => q.id===id ? {...q,status:'rejected',rejectReason} : q));
    setSelected(null);
    setRejectReason('');
    setShowReject(false);
  }

  return (
    <>
      <style>{BASE}</style>
      <nav style={{...n.nav}}>
        <div style={n.navLeft}>
          <a href="/" style={n.logo}>Every<em style={{color:'#0A6B4B',fontStyle:'normal'}}>Giving</em></a>
          <div style={n.div}/>
          <span style={n.section}>Admin · Verification queue</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <a href="/admin/payouts" style={{fontSize:12,color:'#8A8A82'}}>Payouts</a>
          <a href="/admin/campaigns" style={{fontSize:12,color:'#8A8A82'}}>Campaigns</a>
        </div>
      </nav>

      <div style={a.page}>
        {/* Left — list */}
        <div style={a.listCol}>
          <div style={a.listHeader}>
            <h2 style={a.listTitle}>Verification queue</h2>
            <div style={a.filterTabs}>
              {['pending','approved','rejected','all'].map(f=>(
                <button key={f} style={{...a.filterTab, background:filter===f?'#1A1A18':'transparent', color:filter===f?'#fff':'#8A8A82', border:`1px solid ${filter===f?'#1A1A18':'#E8E4DC'}`}} onClick={()=>setFilter(f)}>
                  {f} {f!=='all'&&<span style={{fontSize:10,marginLeft:3}}>{queue.filter(q=>q.status===f).length}</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={a.list}>
            {filtered.map(q => (
              <div key={q.id} style={{...a.listItem, background:selected===q.id?'#E8F5EF':'#fff', borderColor:selected===q.id?'#0A6B4B':'#E8E4DC'}} onClick={()=>setSelected(q.id)}>
                <div style={a.listAv}>{q.name[0]}</div>
                <div style={a.listInfo}>
                  <div style={a.listName}>{q.name}</div>
                  <div style={a.listCampaign}>{q.campaign.slice(0,45)}{q.campaign.length>45?'…':''}</div>
                  <div style={a.listMeta}>{q.phone} · {q.submitted}</div>
                </div>
                <div style={{...a.statusPill, color:q.status==='approved'?'#0A6B4B':q.status==='rejected'?'#C0392B':'#B85C00', background:q.status==='approved'?'#E8F5EF':q.status==='rejected'?'#FCEBEB':'#FEF3E2'}}>
                  {q.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — review panel */}
        <div style={a.reviewCol}>
          {item ? (
            <div style={a.reviewCard}>
              <div style={a.reviewHeader}>
                <div>
                  <div style={a.reviewName}>{item.name}</div>
                  <div style={a.reviewMeta}>{item.phone} · {item.category} campaign · Submitted {item.submitted}</div>
                </div>
                <div style={{...a.statusPill, color:item.status==='approved'?'#0A6B4B':item.status==='rejected'?'#C0392B':'#B85C00', background:item.status==='approved'?'#E8F5EF':item.status==='rejected'?'#FCEBEB':'#FEF3E2', fontSize:11}}>
                  {item.status}
                </div>
              </div>

              <div style={a.campaignPreview}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:4}}>Campaign</div>
                <div style={{fontSize:13,fontWeight:600,color:'#1A1A18'}}>{item.campaign}</div>
              </div>

              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>ID document</div>
                <div style={a.idGrid}>
                  <div>
                    <div style={{fontSize:10,color:'#8A8A82',marginBottom:4}}>Front</div>
                    <img src={item.front} style={a.idImg} alt="Front"/>
                  </div>
                  <div>
                    <div style={{fontSize:10,color:'#8A8A82',marginBottom:4}}>Back</div>
                    <img src={item.back} style={a.idImg} alt="Back"/>
                  </div>
                </div>
              </div>

              {item.status==='pending' && !showReject && (
                <div style={{display:'flex',gap:8}}>
                  <button style={{flex:2,padding:'11px',background:'#0A6B4B',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={()=>approve(item.id)}>Approve ✓</button>
                  <button style={{flex:1,padding:'11px',background:'transparent',color:'#C0392B',border:'1px solid #C0392B',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer'}} onClick={()=>setShowReject(true)}>Reject</button>
                </div>
              )}

              {showReject && (
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#4A4A44',display:'block',marginBottom:6}}>Reason for rejection (sent to campaigner)</label>
                  <textarea style={{width:'100%',padding:'10px 12px',border:'1.5px solid #C0392B',borderRadius:8,fontSize:13,minHeight:80,resize:'vertical',marginBottom:8}} placeholder="e.g. Photo is too blurry — please retake with better lighting" value={rejectReason} onChange={e=>setRejectReason(e.target.value)}/>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{flex:1,padding:'10px',background:'#C0392B',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',opacity:rejectReason.trim()?1:.45}} disabled={!rejectReason.trim()} onClick={()=>reject(item.id)}>Send rejection</button>
                    <button style={{padding:'10px 14px',background:'transparent',border:'1px solid #E8E4DC',borderRadius:8,fontSize:12,cursor:'pointer'}} onClick={()=>setShowReject(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {item.status==='approved' && <div style={{fontSize:13,color:'#0A6B4B',background:'#E8F5EF',padding:'10px 12px',borderRadius:8,textAlign:'center'}}>✓ Approved — campaign is live</div>}
              {item.status==='rejected' && <div style={{fontSize:13,color:'#C0392B',background:'#FCEBEB',padding:'10px 12px',borderRadius:8}}>Rejected: {item.rejectReason}</div>}
            </div>
          ) : (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'40px',textAlign:'center',color:'#8A8A82',fontSize:13}}>Select a submission to review</div>
          )}
        </div>
      </div>
    </>
  );
}

const a = {
  page:{maxWidth:1060,margin:'0 auto',padding:'24px 24px 64px',display:'grid',gridTemplateColumns:'340px 1fr',gap:20,alignItems:'start'},
  listCol:{},
  listHeader:{marginBottom:14},
  listTitle:{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#1A1A18',marginBottom:10},
  filterTabs:{display:'flex',gap:5,flexWrap:'wrap'},
  filterTab:{fontSize:11,fontWeight:500,padding:'4px 10px',borderRadius:20,cursor:'pointer',transition:'all .15s'},
  list:{display:'flex',flexDirection:'column',gap:7},
  listItem:{display:'flex',alignItems:'center',gap:10,background:'#fff',border:'1.5px solid',borderRadius:11,padding:'11px 12px',cursor:'pointer',transition:'all .15s'},
  listAv:{width:34,height:34,borderRadius:'50%',background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#0A6B4B',flexShrink:0},
  listInfo:{flex:1,minWidth:0},
  listName:{fontSize:13,fontWeight:600,color:'#1A1A18'},
  listCampaign:{fontSize:11,color:'#8A8A82',marginTop:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'},
  listMeta:{fontSize:10,color:'#C8C4BC',marginTop:1},
  statusPill:{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,flexShrink:0},
  reviewCol:{position:'sticky',top:72},
  reviewCard:{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px'},
  reviewHeader:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:14,paddingBottom:14,borderBottom:'1px solid #E8E4DC'},
  reviewName:{fontSize:16,fontWeight:700,color:'#1A1A18',marginBottom:3},
  reviewMeta:{fontSize:11,color:'#8A8A82',lineHeight:1.5},
  campaignPreview:{background:'#F5F4F0',borderRadius:8,padding:'10px 12px',marginBottom:14},
  idGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10},
  idImg:{width:'100%',height:110,objectFit:'cover',borderRadius:7,display:'block'},
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. ADMIN PAYOUTS
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_PROOFS = [
  { id:'p1', campaign:'Help Ama get kidney surgery', organiser:'Kwame Mensah', milestone:'Surgery fees', amount:12000, network:'MTN MoMo', momoNumber:'024 123 4567', submitted:'1 hr ago', status:'pending', proof:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&q=70&auto=format&fit=crop', note:'This covers the surgical fees at Korle Bu. Receipt attached.' },
  { id:'p2', campaign:'School supplies Volta Region', organiser:'Ama Boateng', milestone:'Buy supplies', amount:4500, network:'Vodafone Cash', momoNumber:'020 987 6543', submitted:'3 hrs ago', status:'pending', proof:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=70&auto=format&fit=crop', note:'Supplies purchased from Accra Central market. Receipts attached.' },
  { id:'p3', campaign:'Community borehole project', organiser:'Efua Owusu', milestone:'Drilling deposit', amount:8000, network:'AirtelTigo', momoNumber:'026 111 2222', submitted:'2 days ago', status:'approved', proof:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&q=70&auto=format&fit=crop', note:'Deposit paid to DrillersCo Ghana.' },
];

export function AdminPayouts() {
  const [proofs, setProofs] = useState(MOCK_PROOFS);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [paying, setPaying] = useState(false);

  const filtered = proofs.filter(p => filter==='all'||p.status===filter);
  const item = proofs.find(p=>p.id===selected);

  async function approvePayout(id) {
    setPaying(true);
    await new Promise(r=>setTimeout(r,1000));
    setPaying(false);
    setProofs(prev=>prev.map(p=>p.id===id?{...p,status:'approved'}:p));
    setSelected(null);
  }

  function rejectProof(id) {
    setProofs(prev=>prev.map(p=>p.id===id?{...p,status:'rejected',rejectNote}:p));
    setSelected(null); setRejectNote(''); setShowReject(false);
  }

  return (
    <>
      <style>{BASE}</style>
      <nav style={{...n.nav}}>
        <div style={n.navLeft}>
          <a href="/" style={n.logo}>Every<em style={{color:'#0A6B4B',fontStyle:'normal'}}>Giving</em></a>
          <div style={n.div}/>
          <span style={n.section}>Admin · Milestone payouts</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <a href="/admin/verify" style={{fontSize:12,color:'#8A8A82'}}>Verifications</a>
          <a href="/admin/campaigns" style={{fontSize:12,color:'#8A8A82'}}>Campaigns</a>
        </div>
      </nav>

      <div style={a.page}>
        <div style={a.listCol}>
          <div style={a.listHeader}>
            <h2 style={a.listTitle}>Milestone payouts</h2>
            <div style={a.filterTabs}>
              {['pending','approved','rejected','all'].map(f=>(
                <button key={f} style={{...a.filterTab,background:filter===f?'#1A1A18':'transparent',color:filter===f?'#fff':'#8A8A82',border:`1px solid ${filter===f?'#1A1A18':'#E8E4DC'}`}} onClick={()=>setFilter(f)}>
                  {f} {f!=='all'&&<span style={{fontSize:10,marginLeft:3}}>{proofs.filter(p=>p.status===f).length}</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={a.list}>
            {filtered.map(p=>(
              <div key={p.id} style={{...a.listItem,background:selected===p.id?'#E8F5EF':'#fff',borderColor:selected===p.id?'#0A6B4B':'#E8E4DC'}} onClick={()=>{setSelected(p.id);setShowReject(false);}}>
                <div style={{...a.listAv,background:'#E6F1FB',color:'#185FA5'}}>₵</div>
                <div style={a.listInfo}>
                  <div style={a.listName}>{p.milestone} — ₵{p.amount.toLocaleString()}</div>
                  <div style={a.listCampaign}>{p.campaign.slice(0,40)}{p.campaign.length>40?'…':''}</div>
                  <div style={a.listMeta}>{p.organiser} · {p.submitted}</div>
                </div>
                <div style={{...a.statusPill,color:p.status==='approved'?'#0A6B4B':p.status==='rejected'?'#C0392B':'#B85C00',background:p.status==='approved'?'#E8F5EF':p.status==='rejected'?'#FCEBEB':'#FEF3E2'}}>{p.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={a.reviewCol}>
          {item ? (
            <div style={a.reviewCard}>
              <div style={a.reviewHeader}>
                <div>
                  <div style={a.reviewName}>₵{item.amount.toLocaleString()} · {item.milestone}</div>
                  <div style={a.reviewMeta}>{item.campaign} · {item.organiser}</div>
                </div>
                <div style={{...a.statusPill,color:item.status==='approved'?'#0A6B4B':item.status==='rejected'?'#C0392B':'#B85C00',background:item.status==='approved'?'#E8F5EF':item.status==='rejected'?'#FCEBEB':'#FEF3E2',fontSize:11}}>{item.status}</div>
              </div>

              {/* Payout details */}
              <div style={{background:'#F5F4F0',borderRadius:9,padding:'12px',marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>Payout destination</div>
                {[['Network',item.network],['MoMo number',item.momoNumber],['Amount',`₵${item.amount.toLocaleString()}`]].map(([l,v],i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}>
                    <span style={{color:'#8A8A82'}}>{l}</span>
                    <span style={{fontWeight:600,color:'#1A1A18'}}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Proof */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>Submitted proof</div>
                <img src={item.proof} style={{width:'100%',height:140,objectFit:'cover',borderRadius:8,display:'block',marginBottom:8}} alt="Proof"/>
                <div style={{fontSize:12,color:'#4A4A44',lineHeight:1.65,background:'#FDFAF5',padding:'10px 12px',borderRadius:7,border:'1px solid #E8E4DC'}}>{item.note}</div>
              </div>

              {item.status==='pending' && !showReject && (
                <div style={{display:'flex',gap:8}}>
                  <button style={{flex:2,padding:'11px',background:'#0A6B4B',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',opacity:paying?.6:1}} disabled={paying} onClick={()=>approvePayout(item.id)}>
                    {paying?'Sending to MoMo…':'Approve & pay →'}
                  </button>
                  <button style={{flex:1,padding:'11px',background:'transparent',color:'#C0392B',border:'1px solid #C0392B',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer'}} onClick={()=>setShowReject(true)}>Reject</button>
                </div>
              )}

              {showReject && (
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#4A4A44',display:'block',marginBottom:6}}>Reason (sent to campaigner)</label>
                  <textarea style={{width:'100%',padding:'10px',border:'1.5px solid #C0392B',borderRadius:8,fontSize:12,minHeight:70,resize:'vertical',marginBottom:8}} placeholder="e.g. Please provide a clearer receipt with the supplier's name" value={rejectNote} onChange={e=>setRejectNote(e.target.value)}/>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{flex:1,padding:'10px',background:'#C0392B',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={()=>rejectProof(item.id)}>Send rejection</button>
                    <button style={{padding:'10px 14px',background:'transparent',border:'1px solid #E8E4DC',borderRadius:8,fontSize:11,cursor:'pointer'}} onClick={()=>setShowReject(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {item.status==='approved' && <div style={{fontSize:13,color:'#0A6B4B',background:'#E8F5EF',padding:'10px',borderRadius:8,textAlign:'center'}}>✓ Paid — ₵{item.amount.toLocaleString()} sent to {item.network}</div>}
            </div>
          ) : (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'40px',textAlign:'center',color:'#8A8A82',fontSize:13}}>Select a proof submission to review</div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. CAMPAIGN EDITOR
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_CAMPAIGN_EDIT = {
  title:'Help Ama get life-saving kidney surgery at Korle Bu',
  story:'My mother Ama is 54 years old. She has woken up at 4am every day for thirty years to sell at Makola Market so her children could go to school. Last month she collapsed and was diagnosed with kidney disease and needs surgery within 90 days to survive.',
  goalAmount:20000,
  raisedAmount:14400,
  firstDonationReceived: true,
  milestones:[
    {id:'m1',name:'Hospital deposit',amount:5000,status:'released'},
    {id:'m2',name:'Surgery fees',amount:12000,status:'collecting'},
    {id:'m3',name:'Post-op care',amount:3000,status:'pending'},
  ],
  category:'Medical',
  coverImg:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=480&q=80&auto=format&fit=crop',
};

export function CampaignEditor() {
  const [form, setForm] = useState({...MOCK_CAMPAIGN_EDIT});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('story');

  function update(k,v) { setForm(f=>({...f,[k]:v})); setDirty(true); setSaved(false); }
  function updateMs(id,k,v) { setForm(f=>({...f,milestones:f.milestones.map(m=>m.id===id?{...m,[k]:v}:m)})); setDirty(true); }

  async function handleSave() {
    setSaving(true);
    await new Promise(r=>setTimeout(r,700));
    setSaving(false);
    setSaved(true);
    setDirty(false);
  }

  return (
    <>
      <style>{BASE}</style>
      <nav style={{...n.nav}}>
        <div style={n.navLeft}>
          <a href="/" style={n.logo}>Every<em style={{color:'#0A6B4B',fontStyle:'normal'}}>Giving</em></a>
          <div style={n.div}/>
          <span style={n.section}>Edit campaign</span>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {saved && <span style={{fontSize:11,color:'#0A6B4B',fontWeight:500}}>✓ Saved</span>}
          {dirty && <span style={{fontSize:11,color:'#B85C00'}}>Unsaved changes</span>}
          <a href="/dashboard" style={{fontSize:12,color:'#8A8A82'}}>Cancel</a>
          <button style={{fontSize:13,fontWeight:600,color:'#fff',background:'#0A6B4B',border:'none',padding:'7px 16px',borderRadius:8,cursor:'pointer',opacity:dirty&&!saving?1:.5}} disabled={!dirty||saving} onClick={handleSave}>
            {saving?'Saving…':'Save changes'}
          </button>
        </div>
      </nav>

      <div style={{maxWidth:860,margin:'0 auto',padding:'24px 24px 80px'}}>

        {/* Tab nav */}
        <div style={{display:'flex',gap:4,marginBottom:20,background:'#fff',border:'1px solid #E8E4DC',borderRadius:10,padding:4}}>
          {['story','photo','milestones'].map(tab=>(
            <button key={tab} style={{flex:1,padding:'9px',borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:activeTab===tab?600:400,background:activeTab===tab?'#1A1A18':'transparent',color:activeTab===tab?'#fff':'#8A8A82',textTransform:'capitalize',transition:'all .15s'}} onClick={()=>setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab==='story' && (
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'22px'}}>
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

        {activeTab==='photo' && (
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'22px'}}>
            <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:16}}>Cover photo</h3>
            <div style={{position:'relative',height:240,borderRadius:10,overflow:'hidden',marginBottom:16}}>
              <img src={form.coverImg} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt=""/>
              <button style={{position:'absolute',bottom:10,right:10,fontSize:12,fontWeight:600,color:'#fff',background:'rgba(0,0,0,.55)',border:'none',padding:'7px 14px',borderRadius:7,cursor:'pointer'}}>Change photo</button>
            </div>
            <div style={{fontSize:12,color:'#8A8A82',lineHeight:1.65}}>Adding a new photo does not re-send notifications to donors. They'll see it when they next visit your campaign page.</div>
          </div>
        )}

        {activeTab==='milestones' && (
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'22px'}}>
            <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:6}}>Milestones</h3>
            <p style={{fontSize:12,color:'#8A8A82',marginBottom:16,lineHeight:1.6}}>You can edit milestones that haven't been triggered yet. Released and collecting milestones are locked.</p>
            {form.milestones.map((ms,i)=>{
              const locked = ms.status==='released'||ms.status==='collecting';
              return (
                <div key={ms.id} style={{display:'flex',gap:10,alignItems:'center',marginBottom:10,padding:'12px',background:locked?'#F5F4F0':'#fff',border:`1px solid ${locked?'#E8E4DC':'#E8E4DC'}`,borderRadius:9}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:ms.status==='released'?'#0A6B4B':ms.status==='collecting'?'#B85C00':'#E8E4DC',color:ms.status!=='pending'?'#fff':'#8A8A82',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <input style={{flex:2,padding:'8px 10px',border:`1.5px solid ${locked?'#E8E4DC':'#E8E4DC'}`,borderRadius:7,fontSize:13,color:'#1A1A18',background:locked?'#F5F4F0':'#fff'}} value={ms.name} onChange={e=>updateMs(ms.id,'name',e.target.value)} disabled={locked}/>
                  <div style={{display:'flex',alignItems:'center',border:`1.5px solid ${locked?'#E8E4DC':'#E8E4DC'}`,borderRadius:7,background:locked?'#F5F4F0':'#fff',overflow:'hidden',flex:1}}>
                    <span style={{fontSize:13,fontWeight:600,color:'#8A8A82',padding:'8px 8px',borderRight:'1px solid #E8E4DC'}}>₵</span>
                    <input style={{flex:1,border:'none',padding:'8px',fontSize:13,background:'transparent',color:'#1A1A18'}} type="number" value={ms.amount} onChange={e=>updateMs(ms.id,'amount',e.target.value)} disabled={locked}/>
                  </div>
                  <div style={{fontSize:10,fontWeight:700,color:ms.status==='released'?'#0A6B4B':ms.status==='collecting'?'#B85C00':'#8A8A82',background:ms.status==='released'?'#E8F5EF':ms.status==='collecting'?'#FEF3E2':'#F2F3F4',padding:'3px 8px',borderRadius:20,flexShrink:0}}>{ms.status}</div>
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
