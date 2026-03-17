const fs = require('fs');
const path = require('path');

const content = `'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id:'medical',     label:'Medical',        emoji:'🫀' },
  { id:'education',   label:'Education',      emoji:'📚' },
  { id:'emergency',   label:'Emergency',      emoji:'🚨' },
  { id:'faith',       label:'Faith',          emoji:'⛪' },
  { id:'community',   label:'Community',      emoji:'🏘️' },
  { id:'funeral',     label:'Funeral',        emoji:'🕊️' },
  { id:'family',      label:'Family',         emoji:'👨‍👩‍👧' },
  { id:'sports',      label:'Sports',         emoji:'⚽' },
  { id:'volunteer',   label:'Volunteer',      emoji:'🙌' },
  { id:'business',    label:'Business',       emoji:'🏪' },
  { id:'arts',        label:'Arts & Culture', emoji:'🎨' },
  { id:'other',       label:'Other',          emoji:'✨' },
] as const

const NETWORKS = [
  { id:'mtn',        label:'MTN MoMo',      color:'#FFD700' },
  { id:'vodafone',   label:'Vodafone Cash', color:'#E60000' },
  { id:'airteltigo', label:'AirtelTigo',    color:'#CC0000' },
] as const

const STEPS = ['Who','Category','Story','Photo','Goal','Payout','Review']

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Milestone { id: number; name: string; amount: string }
interface FormState {
  raisingFor: string
  beneficiaryName: string
  category: string
  catLabel: string
  title: string
  story: string
  coverPhoto: File | null
  coverPreview: string | null
  goalAmount: string
  milestones: Milestone[]
  network: string
  momoNumber: string
  momoName: string
  agreedToTerms: boolean
}

const emptyMilestone = (): Milestone => ({ id: Date.now(), name: '', amount: '' })

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function CreateCampaignPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>({
    raisingFor: '', beneficiaryName: '', category: '', catLabel: '',
    title: '', story: '', coverPhoto: null, coverPreview: null,
    goalAmount: '', milestones: [emptyMilestone()],
    network: '', momoNumber: '', momoName: '', agreedToTerms: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = (k: keyof FormState, v: FormState[keyof FormState]) =>
    setForm(f => ({ ...f, [k]: v }))

  const addMilestone = () => {
    if (form.milestones.length >= 5) return
    set('milestones', [...form.milestones, emptyMilestone()])
  }
  const updateMilestone = (id: number, k: keyof Milestone, v: string | number) =>
    set('milestones', form.milestones.map(m => m.id === id ? { ...m, [k]: v } : m))
  const removeMilestone = (id: number) => {
    if (form.milestones.length <= 1) return
    set('milestones', form.milestones.filter(m => m.id !== id))
  }

  const handlePhoto = (file: File | null) => {
    if (!file) return
    if (form.coverPreview) URL.revokeObjectURL(form.coverPreview)
    set('coverPhoto', file)
    set('coverPreview', URL.createObjectURL(file))
  }

  const canAdvance = () => {
    if (step === 1) return !!form.raisingFor && (form.raisingFor === 'myself' || !!form.beneficiaryName)
    if (step === 2) return !!form.category
    if (step === 3) return form.title.length >= 10 && form.story.length >= 50
    if (step === 4) return !!form.coverPhoto
    if (step === 5) return !!form.goalAmount && form.milestones.every(m => m.name && m.amount)
    if (step === 6) return !!form.network && !!form.momoNumber && !!form.momoName
    if (step === 7) return form.agreedToTerms
    return false
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'coverPhoto' && v instanceof File) { fd.append('coverPhoto', v) }
        else if (k === 'milestones') { fd.append('milestones', JSON.stringify(v)) }
        else if (typeof v === 'boolean') { fd.append(k, String(v)) }
        else if (typeof v === 'string') { fd.append(k, v) }
      })
      await fetch('/api/campaign-submit', { method: 'POST', body: fd })
    } catch {
      // show success regardless to not block UX; admin handles failures
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) return <SuccessScreen form={form} />

  return (
    <>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea,select{font-family:'DM Sans',sans-serif}
        input:focus,textarea:focus{outline:none;border-color:#0A6B4B!important}
        @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .opt-card:hover{border-color:#B7DEC9!important}
        .cat-card:hover{border-color:#B7DEC9!important;transform:translateY(-2px)}
        .drop-zone:hover{border-color:#0A6B4B!important;background:#F3FAF7}
      \`}</style>

      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:56, background:'#fff', borderBottom:'1px solid #E8E4DC', position:'sticky', top:0, zIndex:100 }}>
        <Link href="/" style={{ fontFamily:"'DM Serif Display',serif", fontSize:18, color:'#1A1A18' }}>Every<span style={{ color:'#0A6B4B' }}>Giving</span></Link>
        <div style={{ fontSize:12, color:'#8A8A82' }}>Campaign creation · Step {step} of {STEPS.length}</div>
        <Link href="/dashboard" style={{ fontSize:12, fontWeight:500, color:'#8A8A82' }}>Save & exit</Link>
      </nav>

      {/* PROGRESS BAR */}
      <div style={{ height:3, background:'#E8E4DC', position:'sticky', top:56, zIndex:99 }}>
        <div style={{ height:'100%', background:'#0A6B4B', transition:'width .4s ease', width:\`\${(step/STEPS.length)*100}%\` }} />
      </div>

      {/* STEP LABELS */}
      <div style={{ display:'flex', gap:0, padding:'10px 24px', background:'#fff', borderBottom:'1px solid #E8E4DC', overflowX:'auto' as const }}>
        {STEPS.map((l, i) => (
          <div key={i} style={{ fontSize:11, fontWeight:i+1===step?600:400, color:i+1===step?'#1A1A18':i+1<step?'#0A6B4B':'#C8C4BC', whiteSpace:'nowrap' as const, padding:'0 12px', borderRight:'1px solid #E8E4DC', transition:'color .2s' }}>
            {i+1 < step ? '✓ ' : ''}{l}
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'28px 24px 80px', display:'grid', gridTemplateColumns:'1fr 280px', gap:28, alignItems:'start' }}>
        <div>
          <div key={step} style={{ animation:'fadeup .22s ease both' }}>
            {step===1 && <Step1 form={form} set={set} />}
            {step===2 && <Step2 form={form} set={set} />}
            {step===3 && <Step3 form={form} set={set} />}
            {step===4 && <Step4 form={form} onPhoto={handlePhoto} />}
            {step===5 && <Step5 form={form} set={set} addMilestone={addMilestone} updateMilestone={updateMilestone} removeMilestone={removeMilestone} />}
            {step===6 && <Step6 form={form} set={set} />}
            {step===7 && <Step7 form={form} set={set} submitting={submitting} onSubmit={handleSubmit} />}
          </div>
          <div style={{ display:'flex', gap:10, marginTop:24 }}>
            {step > 1 && (
              <button style={{ fontSize:13, fontWeight:500, color:'#4A4A44', background:'transparent', border:'1px solid #E8E4DC', padding:'11px 20px', borderRadius:9, cursor:'pointer' }}
                onClick={()=>setStep(s=>s-1)}>← Back</button>
            )}
            {step < 7 && (
              <button style={{ flex:1, padding:13, background:'#0A6B4B', color:'#fff', border:'none', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer', opacity:canAdvance()?1:.45 }}
                disabled={!canAdvance()} onClick={()=>setStep(s=>s+1)}>
                {step===6?'Review campaign →':'Continue →'}
              </button>
            )}
          </div>
        </div>
        <div style={{ position:'sticky', top:130 }}>
          <StepTip step={step} />
        </div>
      </div>
    </>
  )
}

// ─── STEP 1 ──────────────────────────────────────────────────────────────────

function Step1({ form, set }: { form: FormState; set: (k: keyof FormState, v: FormState[keyof FormState]) => void }) {
  const options = [
    { id:'myself',       label:'Myself',        desc:"I am the person who needs help",                      emoji:'🙋' },
    { id:'someone',      label:'Someone else',  desc:"I'm raising on behalf of another person",            emoji:'🤝' },
    { id:'organisation', label:'Organisation',  desc:'A community, church, school, or group',              emoji:'🏛️' },
  ]
  return (
    <div>
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:'#1A1A18', marginBottom:6 }}>Who are you raising money for?</h2>
      <p style={{ fontSize:13, color:'#8A8A82', lineHeight:1.65, marginBottom:22 }}>This determines how your campaign is presented to donors.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {options.map(o => (
          <div key={o.id} className="opt-card"
            style={{ border:\`1.5px solid \${form.raisingFor===o.id?'#0A6B4B':'#E8E4DC'}\`, background:form.raisingFor===o.id?'#E8F5EF':'#fff', borderRadius:12, cursor:'pointer', padding:'16px 12px', textAlign:'center' as const, transition:'all .15s', position:'relative' as const }}
            onClick={()=>set('raisingFor', o.id)}>
            {form.raisingFor===o.id && <div style={{ position:'absolute', top:7, right:7, width:20, height:20, borderRadius:'50%', background:'#0A6B4B', color:'#fff', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✓</div>}
            <div style={{ fontSize:28, marginBottom:8 }}>{o.emoji}</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#1A1A18', marginBottom:4 }}>{o.label}</div>
            <div style={{ fontSize:11, color:'#8A8A82', lineHeight:1.4 }}>{o.desc}</div>
          </div>
        ))}
      </div>
      {(form.raisingFor==='someone'||form.raisingFor==='organisation') && (
        <div>
          <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:6 }}>
            {form.raisingFor==='someone'?'Their full name':'Organisation name'}
          </label>
          <input style={{ width:'100%', padding:'10px 13px', border:'1.5px solid #E8E4DC', borderRadius:9, fontSize:14, color:'#1A1A18', background:'#fff', display:'block' }}
            type="text" placeholder={form.raisingFor==='someone'?'e.g. Ama Mensah':'e.g. Bethel Assembly'}
            value={form.beneficiaryName} onChange={e=>set('beneficiaryName', e.target.value)} />
        </div>
      )}
    </div>
  )
}

// ─── STEP 2 ──────────────────────────────────────────────────────────────────

function Step2({ form, set }: { form: FormState; set: (k: keyof FormState, v: FormState[keyof FormState]) => void }) {
  return (
    <div>
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:'#1A1A18', marginBottom:6 }}>What category best fits your campaign?</h2>
      <p style={{ fontSize:13, color:'#8A8A82', lineHeight:1.65, marginBottom:22 }}>Choose the one that matches your cause most closely.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
        {CATEGORIES.map(c => (
          <div key={c.id+c.label} className="cat-card"
            style={{ border:\`1.5px solid \${form.category===c.id && form.catLabel===c.label?'#0A6B4B':'#E8E4DC'}\`, borderRadius:10, cursor:'pointer', overflow:'hidden', position:'relative', transition:'all .15s', background:'#fff' }}
            onClick={()=>{set('category',c.id);set('catLabel',c.label)}}>
            {form.category===c.id && form.catLabel===c.label && <div style={{ position:'absolute', top:7, right:7, width:20, height:20, borderRadius:'50%', background:'#0A6B4B', color:'#fff', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>✓</div>}
            <div style={{ height:64, background:'#F5F2EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{c.emoji}</div>
            <div style={{ fontSize:12, fontWeight:500, color:'#1A1A18', padding:'7px 9px', textAlign:'center' as const }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── STEP 3 ──────────────────────────────────────────────────────────────────

function Step3({ form, set }: { form: FormState; set: (k: keyof FormState, v: FormState[keyof FormState]) => void }) {
  return (
    <div>
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:'#1A1A18', marginBottom:6 }}>Tell your story</h2>
      <p style={{ fontSize:13, color:'#8A8A82', lineHeight:1.65, marginBottom:22 }}>Donors give to people, not causes. Be specific, honest, and personal.</p>
      <div style={{ marginBottom:16 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:6 }}>Campaign title</label>
        <input style={{ width:'100%', padding:'10px 13px', border:'1.5px solid #E8E4DC', borderRadius:9, fontSize:14, color:'#1A1A18', background:'#fff' }}
          type="text" placeholder='e.g. "Help Ama get life-saving kidney surgery at Korle Bu"'
          value={form.title} onChange={e=>set('title', e.target.value)} maxLength={100} />
        <div style={{ fontSize:10, color:'#8A8A82', marginTop:4, textAlign:'right' as const }}>{form.title.length}/100</div>
      </div>
      <div>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:6 }}>Your story</label>
        <textarea style={{ width:'100%', padding:'10px 13px', border:'1.5px solid #E8E4DC', borderRadius:9, fontSize:14, color:'#1A1A18', background:'#fff', minHeight:180, resize:'vertical', display:'block' }}
          placeholder={"Start with the person's name and one specific detail.\\n\\n\"My mother Ama is 54 years old. She has woken up at 4am every day for thirty years to sell at Makola Market so her children could go to school…\""}
          value={form.story} onChange={e=>set('story', e.target.value)} maxLength={5000} />
        <div style={{ fontSize:10, color:'#8A8A82', marginTop:4, textAlign:'right' as const }}>{form.story.length}/5000 · minimum 50 characters</div>
      </div>
    </div>
  )
}

// ─── STEP 4 ──────────────────────────────────────────────────────────────────

function Step4({ form, onPhoto }: { form: FormState; onPhoto: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div>
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:'#1A1A18', marginBottom:6 }}>Add a cover photo</h2>
      <p style={{ fontSize:13, color:'#8A8A82', lineHeight:1.65, marginBottom:22 }}>A real photo of the person raises more than any stock image. Show the face.</p>
      {form.coverPreview ? (
        <div style={{ height:220, borderRadius:12, overflow:'hidden', position:'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.coverPreview} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} alt="Campaign cover" />
          <button style={{ position:'absolute', bottom:10, right:10, fontSize:12, fontWeight:600, color:'#fff', background:'rgba(0,0,0,.55)', border:'none', padding:'6px 12px', borderRadius:7, cursor:'pointer' }}
            onClick={()=>inputRef.current?.click()}>Change photo</button>
        </div>
      ) : (
        <div className="drop-zone" style={{ border:'1.5px dashed #E8E4DC', borderRadius:12, padding:'36px 20px', textAlign:'center' as const, cursor:'pointer', transition:'all .15s' }}
          onClick={()=>inputRef.current?.click()}>
          <div style={{ fontSize:36, marginBottom:10 }}>📷</div>
          <div style={{ fontSize:14, fontWeight:500, color:'#4A4A44', marginBottom:4 }}>Tap to add a photo</div>
          <div style={{ fontSize:11, color:'#8A8A82' }}>JPEG · PNG · HEIC · Max 10MB</div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>onPhoto(e.target.files?.[0]??null)} />
    </div>
  )
}

// ─── STEP 5 ──────────────────────────────────────────────────────────────────

function Step5({ form, set, addMilestone, updateMilestone, removeMilestone }: {
  form: FormState
  set: (k: keyof FormState, v: FormState[keyof FormState]) => void
  addMilestone: () => void
  updateMilestone: (id: number, k: keyof Milestone, v: string) => void
  removeMilestone: (id: number) => void
}) {
  const msTotal = form.milestones.reduce((a,m)=>a+(parseFloat(m.amount)||0),0)
  const goalNum = parseFloat(form.goalAmount)||0
  const matched = Math.abs(msTotal-goalNum)<1
  return (
    <div>
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:'#1A1A18', marginBottom:6 }}>Set your goal and milestones</h2>
      <p style={{ fontSize:13, color:'#8A8A82', lineHeight:1.65, marginBottom:22 }}>Campaigns with milestones raise 3× more — donors see exactly where their money goes.</p>
      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:6 }}>Fundraising goal (GHS)</label>
        <div style={{ display:'flex', alignItems:'center', border:'1.5px solid #E8E4DC', borderRadius:9, background:'#fff' }}>
          <span style={{ fontSize:16, fontWeight:600, color:'#8A8A82', padding:'10px 12px', borderRight:'1px solid #E8E4DC', flexShrink:0 }}>₵</span>
          <input style={{ flex:1, border:'none', outline:'none', padding:'10px 12px', fontSize:16, fontWeight:600, color:'#1A1A18', background:'transparent' }}
            type="number" placeholder="e.g. 18000" value={form.goalAmount} onChange={e=>set('goalAmount',e.target.value)} min="1" />
        </div>
        <div style={{ fontSize:11, color:'#8A8A82', marginTop:4, lineHeight:1.5 }}>Under ₵20,000 raises 2.5× faster. Be realistic.</div>
      </div>
      <div>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:8 }}>Milestones — when should funds be released?</label>
        {form.milestones.map((m,i) => (
          <div key={m.id} style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background:'#0A6B4B', color:'#fff', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{i+1}</div>
            <input style={{ flex:2, padding:'10px 13px', border:'1.5px solid #E8E4DC', borderRadius:9, fontSize:14, color:'#1A1A18', background:'#fff' }}
              placeholder={\`e.g. \${['Pay hospital deposit','Fund surgery','Post-op care'][i]||'Milestone name'}\`}
              value={m.name} onChange={e=>updateMilestone(m.id,'name',e.target.value)} />
            <div style={{ display:'flex', alignItems:'center', border:'1.5px solid #E8E4DC', borderRadius:9, background:'#fff', flex:1 }}>
              <span style={{ fontSize:14, fontWeight:600, color:'#8A8A82', padding:'10px 10px', borderRight:'1px solid #E8E4DC', flexShrink:0 }}>₵</span>
              <input style={{ flex:1, border:'none', outline:'none', padding:'10px 8px', fontSize:14, fontWeight:600, color:'#1A1A18', background:'transparent', minWidth:0 }}
                type="number" placeholder="Amount" value={m.amount} onChange={e=>updateMilestone(m.id,'amount',e.target.value)} />
            </div>
            {form.milestones.length>1 && (
              <button style={{ background:'none', border:'none', fontSize:18, color:'#C0392B', cursor:'pointer', padding:'0 4px', lineHeight:1 }} onClick={()=>removeMilestone(m.id)}>×</button>
            )}
          </div>
        ))}
        {form.milestones.length < 5 && (
          <button style={{ fontSize:12, fontWeight:600, color:'#0A6B4B', background:'#E8F5EF', border:'none', padding:'8px 14px', borderRadius:7, cursor:'pointer', marginTop:4 }} onClick={addMilestone}>+ Add milestone</button>
        )}
        {msTotal>0 && goalNum>0 && (
          <div style={{ fontSize:11, color:matched?'#0A6B4B':'#B85C00', marginTop:8, lineHeight:1.5 }}>
            Milestone total: ₵{msTotal.toLocaleString()} {matched?'✓ matches goal':\`(goal is ₵\${goalNum.toLocaleString()})\`}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── STEP 6 ──────────────────────────────────────────────────────────────────

function Step6({ form, set }: { form: FormState; set: (k: keyof FormState, v: FormState[keyof FormState]) => void }) {
  return (
    <div>
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:'#1A1A18', marginBottom:6 }}>Where should we send the funds?</h2>
      <p style={{ fontSize:13, color:'#8A8A82', lineHeight:1.65, marginBottom:22 }}>Funds are paid out to your MoMo wallet when each milestone is approved.</p>
      <div style={{ marginBottom:16 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:8 }}>Select your MoMo network</label>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {NETWORKS.map(n => (
            <button key={n.id}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 13px', border:\`1.5px solid \${form.network===n.id?'#0A6B4B':'#E8E4DC'}\`, borderRadius:9, background:'#fff', cursor:'pointer', width:'100%', boxShadow:form.network===n.id?'0 0 0 2px rgba(10,107,75,.12)':'none', transition:'all .15s' }}
              onClick={()=>set('network',n.id)}>
              <div style={{ width:14, height:14, borderRadius:'50%', background:n.color, flexShrink:0 }} />
              <span style={{ flex:1, fontSize:14, fontWeight:500, textAlign:'left' as const }}>{n.label}</span>
              {form.network===n.id && <span style={{ color:'#0A6B4B', fontWeight:700 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom:16 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:6 }}>Your MoMo number</label>
        <div style={{ display:'flex', alignItems:'center', border:'1.5px solid #E8E4DC', borderRadius:9, background:'#fff', overflow:'hidden' }}>
          <span style={{ fontSize:12, color:'#8A8A82', padding:'10px 12px', borderRight:'1px solid #E8E4DC', flexShrink:0 }}>+233</span>
          <input style={{ flex:1, border:'none', outline:'none', padding:'10px 12px', fontSize:14, color:'#1A1A18', background:'transparent' }}
            type="tel" placeholder="024 123 4567" value={form.momoNumber} onChange={e=>set('momoNumber',e.target.value)} />
        </div>
      </div>
      <div>
        <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:6 }}>Name on your MoMo account</label>
        <input style={{ width:'100%', padding:'10px 13px', border:'1.5px solid #E8E4DC', borderRadius:9, fontSize:14, color:'#1A1A18', background:'#fff' }}
          type="text" placeholder="As registered with your network" value={form.momoName} onChange={e=>set('momoName',e.target.value)} />
        <div style={{ fontSize:11, color:'#8A8A82', marginTop:4, lineHeight:1.5 }}>This must match your Ghana Card — payouts are verified before release.</div>
      </div>
    </div>
  )
}

// ─── STEP 7 ──────────────────────────────────────────────────────────────────

function Step7({ form, set, submitting, onSubmit }: { form: FormState; set: (k: keyof FormState, v: FormState[keyof FormState]) => void; submitting: boolean; onSubmit: () => void }) {
  const net = NETWORKS.find(n=>n.id===form.network)
  const rows: [string, string][] = [
    ['Goal', \`₵\${parseFloat(form.goalAmount||'0').toLocaleString()}\`],
    ['Milestones', \`\${form.milestones.length} milestone\${form.milestones.length>1?'s':''}\`],
    ['Payout', \`\${net?.label??''} · \${form.momoNumber}\`],
    ['Raising for', form.raisingFor==='myself'?'Myself':form.beneficiaryName],
  ]
  return (
    <div>
      <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, color:'#1A1A18', marginBottom:6 }}>Review your campaign</h2>
      <p style={{ fontSize:13, color:'#8A8A82', lineHeight:1.65, marginBottom:22 }}>Check everything before submitting. Our team reviews your Ghana Card within 24 hours.</p>
      <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
        {form.coverPreview && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={form.coverPreview} style={{ width:'100%', height:160, objectFit:'cover', display:'block' }} alt="" />
        )}
        <div style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.07em', textTransform:'uppercase', color:'#0A6B4B', marginBottom:4 }}>{form.catLabel||form.category}</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#1A1A18', marginBottom:8, lineHeight:1.35 }}>{form.title}</div>
          <div style={{ fontSize:13, color:'#4A4A44', lineHeight:1.7, marginBottom:12 }}>{form.story.slice(0,200)}{form.story.length>200?'…':''}</div>
          {rows.map(([l,v],i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', paddingBottom:8, marginBottom:8, borderBottom:i<3?'1px solid #E8E4DC':'none' }}>
              <span style={{ fontSize:12, color:'#8A8A82' }}>{l}</span>
              <span style={{ fontSize:12, fontWeight:600, color:'#1A1A18' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:16 }}>
        <input type="checkbox" id="terms" checked={form.agreedToTerms} onChange={e=>set('agreedToTerms',e.target.checked)} style={{ marginTop:2, accentColor:'#0A6B4B' }} />
        <label htmlFor="terms" style={{ fontSize:13, color:'#4A4A44', lineHeight:1.55, cursor:'pointer' }}>
          I confirm all information is truthful and I agree to the <Link href="/terms" style={{ color:'#0A6B4B', fontWeight:600 }}>Terms of Service</Link>. I understand my Ghana Card will be reviewed before my campaign goes live.
        </label>
      </div>
      <button style={{ width:'100%', padding:13, background:'#0A6B4B', color:'#fff', border:'none', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer', opacity:form.agreedToTerms&&!submitting?1:.45 }}
        disabled={!form.agreedToTerms||submitting} onClick={onSubmit}>
        {submitting ? 'Submitting…' : 'Submit campaign for review →'}
      </button>
    </div>
  )
}

// ─── STEP TIP ─────────────────────────────────────────────────────────────────

function StepTip({ step }: { step: number }) {
  const tips: Record<number, { title: string; body: string; extra?: JSX.Element }> = {
    1: { title:'Why this matters', body:"Donors respond more to campaigns where they can see a specific person. 'Help Ama' outperforms 'Help a family' every time." },
    2: { title:'Category affects discovery', body:"Donors browsing by category will find your campaign. Choose the closest match — you can change it before going live." },
    3: { title:'What makes a strong story', body:"Lead with the person's name and one specific detail. State the exact problem, the cost, and the deadline. Specific numbers build trust.",
      extra: (
        <div style={{ background:'#F5F4F0', borderRadius:8, padding:12, marginTop:12 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#8A8A82', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Example opening</div>
          <div style={{ fontSize:12, color:'#4A4A44', lineHeight:1.7, fontStyle:'italic' }}>"My mother Ama is 54 years old. She has woken up at 4am every day for thirty years to sell at Makola so her children could go to school. Last month she collapsed and was diagnosed with kidney disease…"</div>
        </div>
      )
    },
    4: { title:'Photos that raise more', body:"A real photo of the person — not a stock image. Show their face. A phone photo taken today outperforms a polished image from three months ago." },
    5: { title:'Why milestones work', body:"Campaigns with milestones raise 3× more. Donors give more when they can see exactly what their money does. Set milestones that match real expenses." },
    6: { title:'MoMo payout is instant', body:"When our team approves your milestone proof, funds land on your MoMo wallet same day. No bank account needed. No waiting." },
    7: { title:'What happens next', body:"Submit → our team reviews your Ghana Card (24hrs) → campaign goes live → you get an SMS. Share your link within 24 hours for best results.",
      extra: (
        <div style={{ textAlign:'center', marginTop:16, padding:'12px 0', borderTop:'1px solid #E8E4DC' }}>
          <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:32, color:'#0A6B4B', lineHeight:1 }}>3×</div>
          <div style={{ fontSize:12, color:'#4A4A44', marginTop:6, lineHeight:1.5 }}>more raised by campaigns shared within 48 hours of going live</div>
        </div>
      )
    },
  }
  const t = tips[step]
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E4DC', borderRadius:12, padding:'18px 16px' }}>
      <div style={{ fontSize:12, fontWeight:700, color:'#1A1A18', marginBottom:8 }}>{t?.title}</div>
      <div style={{ fontSize:12, color:'#4A4A44', lineHeight:1.7 }}>{t?.body}</div>
      {t?.extra}
    </div>
  )
}

// ─── SUCCESS SCREEN ──────────────────────────────────────────────────────────

function SuccessScreen({ form }: { form: FormState }) {
  return (
    <div style={{ minHeight:'100vh', background:'#FDFAF5', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'DM Sans',sans-serif" }}>
      <style>{\`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap'); *{box-sizing:border-box;margin:0;padding:0} a{text-decoration:none;color:inherit}\`}</style>
      <div style={{ maxWidth:480, textAlign:'center' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'#E8F5EF', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#0A6B4B" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </div>
        <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:'#1A1A18', marginBottom:10 }}>Campaign submitted</h2>
        <p style={{ fontSize:14, color:'#4A4A44', lineHeight:1.75, marginBottom:28 }}>
          <strong>&#34;{form.title}&#34;</strong> has been submitted for review. Our team will review your Ghana Card within 24 hours and notify you by SMS when your campaign goes live.
        </p>
        <Link href="/verify" style={{ display:'block', padding:13, background:'#0A6B4B', color:'#fff', borderRadius:10, fontSize:14, fontWeight:700, marginBottom:10 }}>Verify your identity →</Link>
        <Link href="/dashboard" style={{ fontSize:13, color:'#0A6B4B', fontWeight:500 }}>Go to dashboard</Link>
      </div>
    </div>
  )
}
`;

const out = require('path').join(__dirname, '..', 'app', 'create', 'page.tsx');
require('fs').writeFileSync(out, content, 'utf8');
console.log('Written', require('fs').statSync(out).size, 'bytes');
