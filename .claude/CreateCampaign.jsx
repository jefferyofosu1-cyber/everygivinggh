/**
 * EveryGiving — Create Campaign
 * Route: /create
 *
 * 7 steps:
 *   1. Who are you raising for? (myself / someone else / organisation)
 *   2. Category selection
 *   3. Story — title + description with tips
 *   4. Photo upload (cover photo)
 *   5. Goal + milestones
 *   6. MoMo payout details
 *   7. Review + submit
 *
 * On submit → campaign created with status 'pending_verification'
 * → redirect to /verify if not yet verified, else /dashboard
 */

'use client';
import { useState } from 'react';

const CATEGORIES = [
  { id:'medical',     label:'Medical',        img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&q=70&auto=format&fit=crop' },
  { id:'education',   label:'Education',      img:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=70&auto=format&fit=crop' },
  { id:'emergency',   label:'Emergency',      img:'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300&q=70&auto=format&fit=crop' },
  { id:'faith',       label:'Faith',          img:'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=300&q=70&auto=format&fit=crop' },
  { id:'community',   label:'Community',      img:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&q=70&auto=format&fit=crop' },
  { id:'funeral',     label:'Funeral',        img:'https://images.unsplash.com/photo-1477768663691-75d0040e5af0?w=300&q=70&auto=format&fit=crop' },
  { id:'family',      label:'Family',         img:'https://images.unsplash.com/photo-1520350094754-f0fdcac35c1c?w=300&q=70&auto=format&fit=crop' },
  { id:'sports',      label:'Sports',         img:'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=300&q=70&auto=format&fit=crop' },
  { id:'community',   label:'Volunteer',      img:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70&auto=format&fit=crop' },
  { id:'business',    label:'Business',       img:'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=70&auto=format&fit=crop' },
  { id:'arts',        label:'Arts & Culture', img:'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&q=70&auto=format&fit=crop' },
  { id:'other',       label:'Other',          img:'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=300&q=70&auto=format&fit=crop' },
];

const NETWORKS = [
  { id:'mtn',        label:'MTN MoMo',      color:'#FFD700', text:'#7A5800' },
  { id:'vodafone',   label:'Vodafone Cash', color:'#E60000', text:'#fff' },
  { id:'airteltigo', label:'AirtelTigo',    color:'#CC0000', text:'#fff' },
];

const STEPS = ['Who','Category','Story','Photo','Goal','Payout','Review'];

const emptyMilestone = () => ({ id: Date.now(), name:'', amount:'' });

export default function CreateCampaign() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    raisingFor: '',       // 'myself' | 'someone' | 'organisation'
    beneficiaryName: '',
    category: '',
    title: '',
    story: '',
    coverPhoto: null,
    coverPreview: null,
    goalAmount: '',
    milestones: [emptyMilestone()],
    network: '',
    momoNumber: '',
    momoName: '',
    agreedToTerms: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function addMilestone() {
    if (form.milestones.length >= 5) return;
    set('milestones', [...form.milestones, emptyMilestone()]);
  }
  function updateMilestone(id, k, v) {
    set('milestones', form.milestones.map(m => m.id === id ? { ...m, [k]: v } : m));
  }
  function removeMilestone(id) {
    if (form.milestones.length <= 1) return;
    set('milestones', form.milestones.filter(m => m.id !== id));
  }

  function handlePhoto(file) {
    if (!file) return;
    set('coverPhoto', file);
    set('coverPreview', URL.createObjectURL(file));
  }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  }

  const canAdvance = () => {
    if (step === 1) return !!form.raisingFor && (form.raisingFor === 'myself' || !!form.beneficiaryName);
    if (step === 2) return !!form.category;
    if (step === 3) return form.title.length >= 10 && form.story.length >= 50;
    if (step === 4) return !!form.coverPhoto;
    if (step === 5) return !!form.goalAmount && form.milestones.every(m => m.name && m.amount);
    if (step === 6) return !!form.network && !!form.momoNumber && !!form.momoName;
    if (step === 7) return form.agreedToTerms;
    return false;
  };

  if (submitted) return <SuccessScreen form={form} />;

  return (
    <>
      <style>{BASE_STYLES}</style>
      <nav style={s.nav}>
        <a href="/" style={s.navLogo}>Every<span style={{color:'#0A6B4B'}}>Giving</span></a>
        <div style={s.navMeta}>Campaign creation · Step {step} of {STEPS.length}</div>
        <a href="/dashboard" style={s.navExit}>Save & exit</a>
      </nav>

      {/* Progress bar */}
      <div style={s.progressWrap}>
        <div style={{...s.progressFill, width:`${(step/STEPS.length)*100}%`}} />
      </div>
      <div style={s.stepLabels}>
        {STEPS.map((l,i) => (
          <div key={i} style={{...s.stepLabel, color: i+1===step?'#1A1A18':i+1<step?'#0A6B4B':'#C8C4BC', fontWeight:i+1===step?600:400}}>
            {i+1<step?'✓ ':''}{l}
          </div>
        ))}
      </div>

      <div style={s.page}>
        <div style={s.formCol}>
          <div style={{animation:'fadeup .22s ease both'}}>
            {step===1 && <Step1 form={form} set={set} />}
            {step===2 && <Step2 form={form} set={set} />}
            {step===3 && <Step3 form={form} set={set} />}
            {step===4 && <Step4 form={form} handlePhoto={handlePhoto} />}
            {step===5 && <Step5 form={form} set={set} addMilestone={addMilestone} updateMilestone={updateMilestone} removeMilestone={removeMilestone} />}
            {step===6 && <Step6 form={form} set={set} />}
            {step===7 && <Step7 form={form} set={set} submitting={submitting} onSubmit={handleSubmit} />}
          </div>

          <div style={s.navButtons}>
            {step > 1 && <button style={s.backBtn} onClick={() => setStep(s=>s-1)}>← Back</button>}
            {step < 7 && (
              <button
                style={{...s.nextBtn, opacity: canAdvance()?1:.45}}
                disabled={!canAdvance()}
                onClick={() => setStep(s=>s+1)}
              >
                {step===6 ? 'Review campaign →' : 'Continue →'}
              </button>
            )}
          </div>
        </div>

        <div style={s.tipCol}>
          <StepTip step={step} form={form} />
        </div>
      </div>
    </>
  );
}

// ─── STEP COMPONENTS ─────────────────────────────────────────────────────────

function Step1({ form, set }) {
  const options = [
    { id:'myself', label:'Myself', desc:'I am the person who needs help', img:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=70&auto=format&fit=crop' },
    { id:'someone', label:'Someone else', desc:'I\'m raising on behalf of another person', img:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&q=70&auto=format&fit=crop' },
    { id:'organisation', label:'Organisation', desc:'A community, church, school, or group', img:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&q=70&auto=format&fit=crop' },
  ];
  return (
    <div>
      <h2 style={s.stepTitle}>Who are you raising money for?</h2>
      <p style={s.stepSub}>This determines how your campaign is presented to donors.</p>
      <div style={s.optionGrid}>
        {options.map(o => (
          <div key={o.id} style={{...s.optionCard, borderColor: form.raisingFor===o.id?'#0A6B4B':'#E8E4DC', background: form.raisingFor===o.id?'#E8F5EF':'#fff'}} onClick={() => set('raisingFor', o.id)}>
            <div style={s.optionImg}><img src={o.img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/></div>
            {form.raisingFor===o.id && <div style={s.optionCheck}>✓</div>}
            <div style={s.optionLabel}>{o.label}</div>
            <div style={s.optionDesc}>{o.desc}</div>
          </div>
        ))}
      </div>
      {(form.raisingFor==='someone'||form.raisingFor==='organisation') && (
        <div style={{marginTop:20}}>
          <label style={s.fieldLabel}>{form.raisingFor==='someone'?'Their full name':'Organisation name'}</label>
          <input style={s.input} type="text" placeholder={form.raisingFor==='someone'?'e.g. Ama Mensah':'e.g. Bethel Assembly'} value={form.beneficiaryName} onChange={e=>set('beneficiaryName',e.target.value)}/>
        </div>
      )}
    </div>
  );
}

function Step2({ form, set }) {
  return (
    <div>
      <h2 style={s.stepTitle}>What category best fits your campaign?</h2>
      <p style={s.stepSub}>Choose the one that matches your cause most closely.</p>
      <div style={s.catGrid}>
        {CATEGORIES.map((c,i) => (
          <div key={i} style={{...s.catCard, borderColor: form.category===c.id&&form.catLabel===c.label?'#0A6B4B':'#E8E4DC'}}
            onClick={() => {set('category',c.id);set('catLabel',c.label);}}>
            <div style={s.catImg}><img src={c.img} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/></div>
            {form.category===c.id && <div style={s.optionCheck}>✓</div>}
            <div style={s.catLabel}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step3({ form, set }) {
  return (
    <div>
      <h2 style={s.stepTitle}>Tell your story</h2>
      <p style={s.stepSub}>Donors give to people, not causes. Be specific, honest, and personal.</p>
      <div style={{marginBottom:16}}>
        <label style={s.fieldLabel}>Campaign title</label>
        <input style={s.input} type="text" placeholder='e.g. "Help Ama get life-saving kidney surgery at Korle Bu"' value={form.title} onChange={e=>set('title',e.target.value)} maxLength={100}/>
        <div style={s.charCount}>{form.title.length}/100</div>
      </div>
      <div>
        <label style={s.fieldLabel}>Your story</label>
        <textarea style={{...s.input, minHeight:180, resize:'vertical'}} placeholder={'Start with the person\'s name and one specific detail.\n\n"My mother Ama is 54 years old. She has woken up at 4am every day for thirty years to sell at Makola Market so her children could go to school..."'} value={form.story} onChange={e=>set('story',e.target.value)} maxLength={5000}/>
        <div style={s.charCount}>{form.story.length}/5000 · minimum 50 characters</div>
      </div>
    </div>
  );
}

function Step4({ form, handlePhoto }) {
  return (
    <div>
      <h2 style={s.stepTitle}>Add a cover photo</h2>
      <p style={s.stepSub}>A real photo of the person raises more than any stock image. Show the face.</p>
      {form.coverPreview ? (
        <div style={s.photoPreview}>
          <img src={form.coverPreview} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt=""/>
          <button style={s.changePhotoBtn} onClick={() => document.getElementById('cover-input').click()}>Change photo</button>
        </div>
      ) : (
        <div style={s.dropZone} onClick={() => document.getElementById('cover-input').click()}>
          <div style={{fontSize:36,marginBottom:10}}>📷</div>
          <div style={s.dropText}>Tap to add a photo</div>
          <div style={s.dropHint}>JPEG · PNG · HEIC · Auto-compressed</div>
        </div>
      )}
      <input id="cover-input" type="file" accept="image/*" style={{display:'none'}} onChange={e=>handlePhoto(e.target.files[0])}/>
    </div>
  );
}

function Step5({ form, set, addMilestone, updateMilestone, removeMilestone }) {
  const msTotal = form.milestones.reduce((a,m)=>a+(parseFloat(m.amount)||0),0);
  const goalNum = parseFloat(form.goalAmount)||0;
  return (
    <div>
      <h2 style={s.stepTitle}>Set your goal and milestones</h2>
      <p style={s.stepSub}>Milestones show donors exactly how funds will be used — campaigns with milestones raise 3× more.</p>
      <div style={{marginBottom:20}}>
        <label style={s.fieldLabel}>Fundraising goal (GHS)</label>
        <div style={s.monoInputWrap}><span style={s.monoPrefix}>₵</span><input style={s.monoInput} type="number" placeholder="e.g. 18000" value={form.goalAmount} onChange={e=>set('goalAmount',e.target.value)} min="1"/></div>
        <div style={s.fieldHint}>Under ₵20,000 raises 2.5× faster. Be realistic.</div>
      </div>
      <div>
        <label style={s.fieldLabel}>Milestones — when should funds be released?</label>
        {form.milestones.map((m,i) => (
          <div key={m.id} style={s.msRow}>
            <div style={s.msNum}>{i+1}</div>
            <input style={{...s.input,flex:2,marginBottom:0}} placeholder={`e.g. ${['Pay hospital deposit','Fund surgery','Post-op care'][i]||'Milestone name'}`} value={m.name} onChange={e=>updateMilestone(m.id,'name',e.target.value)}/>
            <div style={{...s.monoInputWrap,flex:1,marginBottom:0}}><span style={s.monoPrefix}>₵</span><input style={{...s.monoInput,fontSize:14}} type="number" placeholder="Amount" value={m.amount} onChange={e=>updateMilestone(m.id,'amount',e.target.value)}/></div>
            {form.milestones.length>1 && <button style={s.removeMs} onClick={()=>removeMilestone(m.id)}>×</button>}
          </div>
        ))}
        {form.milestones.length<5 && <button style={s.addMsBtn} onClick={addMilestone}>+ Add milestone</button>}
        {msTotal>0 && goalNum>0 && (
          <div style={{...s.fieldHint, marginTop:8, color: Math.abs(msTotal-goalNum)<1?'#0A6B4B':'#B85C00'}}>
            Milestone total: ₵{msTotal.toLocaleString()} {Math.abs(msTotal-goalNum)<1?'✓ matches goal':`(goal is ₵${goalNum.toLocaleString()})`}
          </div>
        )}
      </div>
    </div>
  );
}

function Step6({ form, set }) {
  return (
    <div>
      <h2 style={s.stepTitle}>Where should we send the funds?</h2>
      <p style={s.stepSub}>Funds are paid out directly to your MoMo wallet when each milestone is approved.</p>
      <div style={{marginBottom:16}}>
        <label style={s.fieldLabel}>Select your MoMo network</label>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {NETWORKS.map(n => (
            <button key={n.id} style={{...s.networkBtn, borderColor:form.network===n.id?'#0A6B4B':'#E8E4DC', boxShadow:form.network===n.id?'0 0 0 2px rgba(10,107,75,.12)':'none'}} onClick={()=>set('network',n.id)}>
              <div style={{width:14,height:14,borderRadius:'50%',background:n.color,flexShrink:0}}/>
              <span style={{flex:1,fontSize:14,fontWeight:500,textAlign:'left'}}>{n.label}</span>
              {form.network===n.id && <span style={{color:'#0A6B4B',fontWeight:700}}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:16}}>
        <label style={s.fieldLabel}>Your MoMo number</label>
        <div style={s.phoneWrap}><span style={s.phonePrefix}>+233</span><input style={s.phoneInput} type="tel" placeholder="024 123 4567" value={form.momoNumber} onChange={e=>set('momoNumber',e.target.value)}/></div>
      </div>
      <div>
        <label style={s.fieldLabel}>Name on your MoMo account</label>
        <input style={s.input} type="text" placeholder="As registered with your network" value={form.momoName} onChange={e=>set('momoName',e.target.value)}/>
        <div style={s.fieldHint}>This must match your Ghana Card — payouts are verified before release.</div>
      </div>
    </div>
  );
}

function Step7({ form, set, submitting, onSubmit }) {
  const net = NETWORKS.find(n=>n.id===form.network);
  return (
    <div>
      <h2 style={s.stepTitle}>Review your campaign</h2>
      <p style={s.stepSub}>Check everything before submitting. Our team will review your Ghana Card within 24 hours.</p>
      <div style={s.reviewCard}>
        {form.coverPreview && <img src={form.coverPreview} style={{width:'100%',height:160,objectFit:'cover',display:'block',borderRadius:'8px 8px 0 0'}} alt=""/>}
        <div style={{padding:'14px 16px'}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',color:'#0A6B4B',marginBottom:4}}>{form.catLabel||form.category}</div>
          <div style={{fontSize:16,fontWeight:700,color:'#1A1A18',marginBottom:8,lineHeight:1.35}}>{form.title}</div>
          <div style={{fontSize:13,color:'#4A4A44',lineHeight:1.7,marginBottom:12}}>{form.story.slice(0,200)}{form.story.length>200?'…':''}</div>
          {[
            ['Goal', `₵${parseFloat(form.goalAmount||0).toLocaleString()}`],
            ['Milestones', `${form.milestones.length} milestone${form.milestones.length>1?'s':''}`],
            ['Payout', `${net?.label||''} · ${form.momoNumber}`],
            ['Raising for', form.raisingFor==='myself'?'Myself':form.beneficiaryName],
          ].map(([l,v],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',paddingBottom:8,marginBottom:8,borderBottom:i<3?'1px solid #E8E4DC':'none'}}>
              <span style={{fontSize:12,color:'#8A8A82'}}>{l}</span>
              <span style={{fontSize:12,fontWeight:600,color:'#1A1A18'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={s.termsRow}>
        <input type="checkbox" id="terms" checked={form.agreedToTerms} onChange={e=>set('agreedToTerms',e.target.checked)} style={{marginTop:2,accentColor:'#0A6B4B'}}/>
        <label htmlFor="terms" style={{fontSize:13,color:'#4A4A44',lineHeight:1.55,cursor:'pointer'}}>
          I confirm all information is truthful and I agree to the <a href="/terms" style={{color:'#0A6B4B',fontWeight:600}}>Terms of Service</a>. I understand my Ghana Card will be reviewed before my campaign goes live.
        </label>
      </div>
      <button style={{...s.nextBtn, opacity:form.agreedToTerms&&!submitting?1:.45}} disabled={!form.agreedToTerms||submitting} onClick={onSubmit}>
        {submitting ? 'Submitting…' : 'Submit campaign for review →'}
      </button>
    </div>
  );
}

function SuccessScreen({ form }) {
  return (
    <div style={{minHeight:'100vh',background:'#FDFAF5',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <style>{BASE_STYLES}</style>
      <div style={{maxWidth:480,textAlign:'center'}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#0A6B4B" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>
        <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:'#1A1A18',marginBottom:10}}>Campaign submitted</h2>
        <p style={{fontSize:14,color:'#4A4A44',lineHeight:1.75,marginBottom:28}}>
          <strong>"{form.title}"</strong> has been submitted for review. Our team will review your Ghana Card within 24 hours and notify you by SMS when your campaign goes live.
        </p>
        <a href="/verify" style={{display:'block',padding:'13px',background:'#0A6B4B',color:'#fff',borderRadius:10,fontSize:14,fontWeight:700,marginBottom:10,textDecoration:'none'}}>Verify your identity →</a>
        <a href="/dashboard" style={{fontSize:13,color:'#0A6B4B',fontWeight:500,textDecoration:'none'}}>Go to dashboard</a>
      </div>
    </div>
  );
}

function StepTip({ step, form }) {
  const tips = {
    1: { title:'Why this matters', body:'Donors respond more to campaigns where they can see a specific person. "Help Ama" outperforms "Help a family" every time.' },
    2: { title:'Category affects discovery', body:'Donors browsing by category will find your campaign. Choose the closest match — you can change it before going live.' },
    3: { title:'What makes a strong story', body:'Lead with the person\'s name and one specific detail. State the exact problem, the cost, and the deadline. Specific numbers build trust.' },
    4: { title:'Photos that raise more', body:'A real photo of the person — not a stock image. Show their face. A phone photo taken today outperforms a polished image from three months ago.' },
    5: { title:'Why milestones work', body:'Campaigns with milestones raise 3× more. Donors give more when they can see exactly what their money does. Set milestones that match real expenses.' },
    6: { title:'MoMo payout is instant', body:'When our team approves your milestone proof, funds land on your MoMo wallet same day. No bank account needed. No waiting.' },
    7: { title:'What happens next', body:'Submit → our team reviews your Ghana Card (24hrs) → campaign goes live → you get an SMS. Share your link within 24 hours for best results.' },
  };
  const t = tips[step];
  return (
    <div style={s.tipCard}>
      <div style={s.tipTitle}>{t?.title}</div>
      <div style={s.tipBody}>{t?.body}</div>
      {step===3 && (
        <div style={s.exampleBox}>
          <div style={s.exampleLabel}>Example opening</div>
          <div style={s.exampleText}>"My mother Ama is 54 years old. She has woken up at 4am every day for thirty years to sell at Makola so her children could go to school. Last month she collapsed and was diagnosed with kidney disease…"</div>
        </div>
      )}
      {step===7 && (
        <div style={s.tipStat}>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,color:'#0A6B4B',lineHeight:1}}>3×</div>
          <div style={{fontSize:12,color:'#4A4A44',marginTop:6,lineHeight:1.5}}>more raised by campaigns shared within 48 hours of going live</div>
        </div>
      )}
    </div>
  );
}

const BASE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
  a{text-decoration:none;color:inherit}
  button,input,textarea{font-family:'DM Sans',sans-serif}
  input:focus,textarea:focus{outline:none;border-color:#0A6B4B!important}
  @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
`;

const s = {
  nav:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100},
  navLogo:{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18'},
  navMeta:{fontSize:12,color:'#8A8A82'},
  navExit:{fontSize:12,fontWeight:500,color:'#8A8A82'},
  progressWrap:{height:3,background:'#E8E4DC',position:'sticky',top:56,zIndex:99},
  progressFill:{height:'100%',background:'#0A6B4B',transition:'width .4s ease'},
  stepLabels:{display:'flex',gap:0,padding:'10px 24px',background:'#fff',borderBottom:'1px solid #E8E4DC',overflowX:'auto'},
  stepLabel:{fontSize:11,fontWeight:400,color:'#C8C4BC',whiteSpace:'nowrap',padding:'0 12px',borderRight:'1px solid #E8E4DC',transition:'color .2s'},
  page:{maxWidth:960,margin:'0 auto',padding:'28px 24px 80px',display:'grid',gridTemplateColumns:'1fr 280px',gap:28,alignItems:'start'},
  formCol:{},
  tipCol:{position:'sticky',top:130},
  stepTitle:{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'#1A1A18',marginBottom:6},
  stepSub:{fontSize:13,color:'#8A8A82',lineHeight:1.65,marginBottom:22},
  optionGrid:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:0},
  optionCard:{border:'1.5px solid',borderRadius:12,cursor:'pointer',overflow:'hidden',position:'relative',transition:'all .15s'},
  optionImg:{height:80,overflow:'hidden'},
  optionCheck:{position:'absolute',top:7,right:7,width:20,height:20,borderRadius:'50%',background:'#0A6B4B',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'},
  optionLabel:{fontSize:13,fontWeight:600,color:'#1A1A18',padding:'8px 10px 4px'},
  optionDesc:{fontSize:11,color:'#8A8A82',padding:'0 10px 10px',lineHeight:1.4},
  catGrid:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10},
  catCard:{border:'1.5px solid #E8E4DC',borderRadius:10,cursor:'pointer',overflow:'hidden',position:'relative',transition:'all .15s'},
  catImg:{height:64,overflow:'hidden'},
  catLabel:{fontSize:12,fontWeight:500,color:'#1A1A18',padding:'7px 9px',textAlign:'center'},
  fieldLabel:{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6},
  input:{width:'100%',padding:'10px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:14,color:'#1A1A18',background:'#fff',display:'block',marginBottom:0},
  charCount:{fontSize:10,color:'#8A8A82',marginTop:4,textAlign:'right'},
  fieldHint:{fontSize:11,color:'#8A8A82',marginTop:4,lineHeight:1.5},
  dropZone:{border:'1.5px dashed #E8E4DC',borderRadius:12,padding:'36px 20px',textAlign:'center',cursor:'pointer',transition:'all .15s'},
  dropText:{fontSize:14,fontWeight:500,color:'#4A4A44',marginBottom:4},
  dropHint:{fontSize:11,color:'#8A8A82'},
  photoPreview:{height:220,borderRadius:12,overflow:'hidden',position:'relative'},
  changePhotoBtn:{position:'absolute',bottom:10,right:10,fontSize:12,fontWeight:600,color:'#fff',background:'rgba(0,0,0,.55)',border:'none',padding:'6px 12px',borderRadius:7,cursor:'pointer'},
  monoInputWrap:{display:'flex',alignItems:'center',border:'1.5px solid #E8E4DC',borderRadius:9,background:'#fff',marginBottom:0},
  monoPrefix:{fontSize:16,fontWeight:600,color:'#8A8A82',padding:'10px 12px',borderRight:'1px solid #E8E4DC',flexShrink:0},
  monoInput:{flex:1,border:'none',outline:'none',padding:'10px 12px',fontSize:16,fontWeight:600,color:'#1A1A18',background:'transparent'},
  msRow:{display:'flex',gap:8,alignItems:'center',marginBottom:8},
  msNum:{width:24,height:24,borderRadius:'50%',background:'#0A6B4B',color:'#fff',fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
  removeMs:{background:'none',border:'none',fontSize:18,color:'#C0392B',cursor:'pointer',padding:'0 4px',lineHeight:1},
  addMsBtn:{fontSize:12,fontWeight:600,color:'#0A6B4B',background:'#E8F5EF',border:'none',padding:'8px 14px',borderRadius:7,cursor:'pointer',marginTop:4},
  networkBtn:{display:'flex',alignItems:'center',gap:10,padding:'11px 13px',border:'1.5px solid',borderRadius:9,background:'#fff',cursor:'pointer',transition:'all .15s',width:'100%'},
  phoneWrap:{display:'flex',alignItems:'center',border:'1.5px solid #E8E4DC',borderRadius:9,background:'#fff',overflow:'hidden'},
  phonePrefix:{fontSize:12,color:'#8A8A82',padding:'10px 12px',borderRight:'1px solid #E8E4DC'},
  phoneInput:{flex:1,border:'none',outline:'none',padding:'10px 12px',fontSize:14,color:'#1A1A18',background:'transparent'},
  reviewCard:{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,overflow:'hidden',marginBottom:16},
  termsRow:{display:'flex',gap:10,alignItems:'flex-start',marginBottom:16},
  navButtons:{display:'flex',gap:10,marginTop:24},
  backBtn:{fontSize:13,fontWeight:500,color:'#4A4A44',background:'transparent',border:'1px solid #E8E4DC',padding:'11px 20px',borderRadius:9,cursor:'pointer'},
  nextBtn:{flex:1,padding:'13px',background:'#0A6B4B',color:'#fff',border:'none',borderRadius:9,fontSize:14,fontWeight:700,cursor:'pointer',transition:'opacity .15s'},
  tipCard:{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px'},
  tipTitle:{fontSize:12,fontWeight:700,color:'#1A1A18',marginBottom:8},
  tipBody:{fontSize:12,color:'#4A4A44',lineHeight:1.7,marginBottom:0},
  exampleBox:{background:'#F5F4F0',borderRadius:8,padding:'12px',marginTop:12},
  exampleLabel:{fontSize:10,fontWeight:700,color:'#8A8A82',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:6},
  exampleText:{fontSize:12,color:'#4A4A44',lineHeight:1.7,fontStyle:'italic'},
  tipStat:{textAlign:'center',marginTop:16,padding:'12px 0',borderTop:'1px solid #E8E4DC'},
};
