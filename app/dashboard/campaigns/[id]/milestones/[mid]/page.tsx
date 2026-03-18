'use client';
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
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea{font-family:'DM Sans',sans-serif}
        input:focus,textarea:focus{outline:none;border-color:#0A6B4B!important}
        @keyframes pop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
      ` }} />

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
              <div style={{height:'100%',background:'#0A6B4B',borderRadius:3,width:`${pct}%`}}/>
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
