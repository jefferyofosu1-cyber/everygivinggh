'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
  a{text-decoration:none;color:inherit}
  button,input,textarea{font-family:'DM Sans',sans-serif}
  input:focus,textarea:focus{outline:none;border-color:#0A6B4B!important}
  @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pop{0%{transform:scale(.8);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
`;

type VerifyStatus = 'not_submitted' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'more_info';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string } | null> = {
  not_submitted: null,
  submitted:  { label: 'Submitted', color: '#185FA5', bg: '#E6F1FB' },
  pending:    { label: 'Under review', color: '#B85FA5', bg: '#F5F3FF' }, // Purple-ish for review
  approved:   { label: 'Approved', color: '#0A6B4B', bg: '#E8F5EF' },
  rejected:   { label: 'Rejected', color: '#C0392B', bg: '#FCEBEB' },
  more_info:  { label: 'Action Required', color: '#185FA5', bg: '#E6F1FB' },
};

function IDUpload({ label, hint, value, onChange, inputId }: {
  label: string; hint: string; value: File | null;
  onChange: (f: File) => void; inputId: string;
}) {
  return (
    <div>
      <div style={{fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>{label}</div>
      <div
        style={{height:130,border:`1.5px dashed ${value?'#0A6B4B':'#E8E4DC'}`,borderRadius:10,
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
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getStatus() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, status, verified, admin_note')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (campaigns?.[0]) {
        const c = campaigns[0];
        setCampaign(c);
        setStatus(c.verified ? 'approved' : c.status || 'not_submitted');
      }
      setLoading(false);
    }
    getStatus();
  }, []);

  async function handleSubmit() {
    if (!front || !back || !campaign) return;
    setSubmitting(true);
    
    const supabase = createClient();
    
    // 1. Upload files to storage (Simplified for this example, assuming bucket 'verification')
    const fileExtFront = front.name.split('.').pop();
    const fileNameFront = `${campaign.id}_front_${Math.random()}.${fileExtFront}`;
    const { data: uploadFront } = await supabase.storage.from('verification').upload(fileNameFront, front);
    
    const fileExtBack = back.name.split('.').pop();
    const fileNameBack = `${campaign.id}_back_${Math.random()}.${fileExtBack}`;
    const { data: uploadBack } = await supabase.storage.from('verification').upload(fileNameBack, back);

    if (uploadFront && uploadBack) {
      const frontUrl = supabase.storage.from('verification').getPublicUrl(uploadFront.path).data.publicUrl;
      const backUrl = supabase.storage.from('verification').getPublicUrl(uploadBack.path).data.publicUrl;

      // 2. Update campaign record
      await supabase.from('campaigns').update({
        status: 'pending',
        id_front_url: frontUrl,
        selfie_url: backUrl, // Reusing selfie_url as back of card for now
        admin_note: null // Clear the note on resubmission
      }).eq('id', campaign.id);

      setStatus('submitted');
    }

    setSubmitting(false);
  }

  const cfg = STATUS_CFG[status];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: BASE_CSS }} />

      <div style={{maxWidth:900,margin:'0 auto',padding:'28px 24px 64px',display:'grid',gridTemplateColumns:'1fr 260px',gap:24,alignItems:'start'}}>
        <div>
          {cfg && (
            <div style={{padding:'16px 20px',borderRadius:12,marginBottom:20,fontSize:14,lineHeight:1.6,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.color}15`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:status==='more_info'?10:0}}>
                <span style={{fontSize:18}}>{status==='approved'?'✅':status==='more_info'?'⚠️':'⏳'}</span>
                <strong>{cfg.label}</strong>
              </div>
              
              {status==='pending' && 'Our team is reviewing your submission. This usually takes less than 24 hours.'}
              {status==='approved' && 'Your identity has been verified. Your campaign is now active or ready to launch.'}
              {status==='submitted' && "We've received your documents. You'll get an SMS as soon as we've reviewed them."}
              
              {status==='more_info' && (
                <div style={{marginTop:8,background:'rgba(255,255,255,0.6)',padding:'12px 14px',borderRadius:8,borderLeft:`4px solid ${cfg.color}`}}>
                  <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:4,opacity:0.8}}>Request from EveryGiving Team</div>
                  <div style={{fontWeight:600,fontSize:15}}>{campaign?.admin_note || 'Please resubmit with clearer photos.'}</div>
                </div>
              )}
              
              {status==='rejected' && (
                <div style={{marginTop:8}}>
                  Reason: <strong>{campaign?.admin_note || 'Guidelines not met.'}</strong>
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div style={{padding:60,textAlign:'center',color:'#8A8A82'}}>Loading your status…</div>
          ) : (

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

            {(status === 'not_submitted' || status === 'rejected' || status === 'more_info') ? (
              <button
                style={{display:'block',width:'100%',padding:13,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer',opacity:front&&back&&!submitting?1:.45,transition:'opacity .15s'}}
                disabled={!front||!back||submitting}
                onClick={handleSubmit}
              >
                {submitting?'Uploading…':(status==='rejected' || status === 'more_info')?'Resubmit verification →':'Submit for verification →'}
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
        )}
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
