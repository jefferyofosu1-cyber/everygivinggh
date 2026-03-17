'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { AuthLayout, Field, Input, PasswordStrength, PrimaryBtn } from '@/components/auth/shared'
import { trackFundraiserSignup } from '@/lib/crm'

interface FormState { name: string; email: string; phone: string; password: string }

export default function SignupPage() {
  const [step, setStep] = useState(1)  // 1=role 2=details 3=confirm 4=done
  const [role, setRole] = useState<'campaigner'|'donor'|''>('')
  const [form, setForm] = useState<FormState>({ name:'', email:'', phone:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  function setField(k: keyof FormState, v: string) {
    setForm(f=>({...f,[k]:v})); setErrors(e=>({...e,[k]:''})); setServerError('')
  }

  function validateDetails() {
    const errs: Record<string,string> = {}
    if (!form.name.trim()) errs.name = 'Enter your full name'
    if (!form.email.includes('@')) errs.email = 'Enter a valid email address'
    if (form.phone && !form.phone.match(/^0[0-9]{9}$/)) errs.phone = 'Enter a valid 10-digit Ghana number'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    setErrors(errs); return !Object.keys(errs).length
  }

  async function handleDetails() {
    if (!validateDetails()) return
    setLoading(true); setServerError('')
    const supabase = createClient()
    const [firstName, ...rest] = form.name.trim().split(' ')
    const lastName = rest.join(' ')
    const { data, error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${role==='campaigner'?'/create':'/campaigns'}`,
        data: { full_name: form.name.trim(), phone: form.phone, role }
      }
    })
    if (error) { setServerError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({ id:data.user.id, full_name:form.name.trim(), phone:form.phone, email:form.email, role })
      if (role==='campaigner') {
        trackFundraiserSignup({ email:form.email, firstName, lastName:lastName||'', phone:form.phone }).catch(()=>{})
      }
    }
    setLoading(false); setStep(3)
  }

  return (
    <AuthLayout
      title={step===1?'Create your account':step===2?'Your details':step===3?'Check your email':'Welcome!'}
      sub={step===1?'Already have one? Sign in':step===3?'We sent a confirmation link':undefined}>

      {/* STEP 1 — ROLE */}
      {step===1 && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
            {([
              ['campaigner','🙋','I want to raise money','Start a campaign for medical, education, or community causes'],
              ['donor','🤝','I want to donate','Give to verified campaigns and track your impact'],
            ] as [string,string,string,string][]).map(([r,emoji,title,sub])=>(
              <div key={r} style={{ border:`1.5px solid ${role===r?'#0A6B4B':'#E8E4DC'}`, background:role===r?'#E8F5EF':'#fff', borderRadius:12, padding:'20px 16px', cursor:'pointer', transition:'all .15s', textAlign:'center' as const }}
                onClick={()=>setRole(r as 'campaigner'|'donor')}>
                <div style={{ fontSize:32, marginBottom:10 }}>{emoji}</div>
                <div style={{ fontSize:13, fontWeight:600, color:'#1A1A18', marginBottom:4 }}>{title}</div>
                <div style={{ fontSize:11, color:'#8A8A82', lineHeight:1.5 }}>{sub}</div>
                {role===r && <div style={{ marginTop:10, fontSize:11, fontWeight:700, color:'#0A6B4B' }}>✓ Selected</div>}
              </div>
            ))}
          </div>
          <PrimaryBtn disabled={!role} onClick={()=>role&&setStep(2)}>Continue →</PrimaryBtn>
          <div style={{ textAlign:'center' as const, fontSize:13, color:'#8A8A82', marginTop:16 }}>
            Already have an account? <Link href="/auth/login" style={{ color:'#0A6B4B', fontWeight:600 }}>Sign in</Link>
          </div>
        </div>
      )}

      {/* STEP 2 — DETAILS */}
      {step===2 && (
        <div>
          {serverError && <div style={{ background:'#FCEBEB', border:'1px solid #F0B0B0', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#C0392B', marginBottom:16 }}>{serverError}</div>}
          <Field label="Full name" error={errors.name}>
            <Input type="text" placeholder="e.g. Kwame Mensah" value={form.name} onChange={e=>setField('name',e.target.value)} error={errors.name} />
          </Field>
          <Field label="Email address" error={errors.email}>
            <Input type="email" placeholder="e.g. kwame@gmail.com" value={form.email} onChange={e=>setField('email',e.target.value)} error={errors.email} />
          </Field>
          <Field label="Phone number (optional)" error={errors.phone} hint="Your MTN, Vodafone, or AirtelTigo number — for MoMo payouts">
            <Input type="tel" placeholder="e.g. 024 123 4567" value={form.phone} onChange={e=>setField('phone',e.target.value.replace(/\s/g,''))} prefix="+233" error={errors.phone} />
          </Field>
          <Field label="Password" error={errors.password}>
            <Input type={showPw?'text':'password'} placeholder="At least 8 characters" value={form.password}
              onChange={e=>setField('password',e.target.value)} error={errors.password}
              suffix={<button style={{ background:'none',border:'none',fontSize:11,fontWeight:600,color:'#8A8A82',cursor:'pointer',padding:'0 2px',fontFamily:"'DM Sans',sans-serif" }} onClick={()=>setShowPw(v=>!v)}>{showPw?'Hide':'Show'}</button>} />
            <PasswordStrength password={form.password} />
          </Field>
          <PrimaryBtn loading={loading} onClick={handleDetails}>{loading?'Creating account…':'Create account'}</PrimaryBtn>
          <p style={{ fontSize:12, color:'#8A8A82', textAlign:'center' as const, marginTop:12, lineHeight:1.6 }}>
            By continuing you agree to our{' '}
            <Link href="/terms" style={{ color:'#0A6B4B' }}>Terms</Link> and{' '}
            <Link href="/privacy" style={{ color:'#0A6B4B' }}>Privacy Policy</Link>
          </p>
        </div>
      )}

      {/* STEP 3 — CHECK EMAIL */}
      {step===3 && (
        <div style={{ textAlign:'center' as const }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'#E8F5EF', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:24 }}>📧</div>
          <p style={{ fontSize:14, color:'#4A4A44', marginBottom:6, lineHeight:1.7 }}>We sent a confirmation link to</p>
          <p style={{ fontSize:15, fontWeight:600, color:'#1A1A18', marginBottom:24 }}>{form.email}</p>
          <p style={{ fontSize:13, color:'#8A8A82', lineHeight:1.65, marginBottom:28 }}>
            Click the link in your email to activate your account. Check your spam folder if you don't see it.
          </p>
          <button style={{ width:'100%', padding:12, background:'transparent', color:'#1A1A18', borderRadius:10, fontSize:14, fontWeight:500, border:'1px solid #E8E4DC', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", marginBottom:10 }}
            onClick={async()=>{ const s=createClient(); await s.auth.resend({ type:'signup', email:form.email }) }}>
            Resend email
          </button>
          <Link href="/auth/login" style={{ fontSize:13, color:'#8A8A82', display:'block' }}>← Back to sign in</Link>
        </div>
      )}

    </AuthLayout>
  )
}
