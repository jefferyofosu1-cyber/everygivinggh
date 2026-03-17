const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

// ─── SHARED COMPONENTS FILE ───────────────────────────────────────────────────

const shared = `'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

// ─── AUTH LAYOUT ───────────────────────────────────────────────────────────────

export function AuthLayout({ children, title, sub, showBack = true }: {
  children: React.ReactNode; title: string; sub?: string; showBack?: boolean
}) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'420px 1fr', minHeight:'100vh', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{\`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:720px){.auth-grid{grid-template-columns:1fr !important}.auth-left{display:none !important}}
      \`}</style>

      {/* LEFT PANEL */}
      <div className="auth-left" style={{ background:'#1A1A18', display:'flex', flexDirection:'column' as const, padding:'32px 36px', position:'sticky' as const, top:0, height:'100vh', overflow:'hidden' }}>
        <Link href="/" style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, color:'#fff', marginBottom:'auto', display:'block' }}>
          Every<span style={{ color:'#B7DEC9' }}>Giving</span>
        </Link>
        <div style={{ flex:1, display:'flex', flexDirection:'column' as const, justifyContent:'center', paddingBottom:24 }}>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, color:'#fff', lineHeight:1.2, marginBottom:28 }}>
            Ghana's most<br />
            <em style={{ color:'#B7DEC9', fontStyle:'italic' }}>trusted giving platform</em>
          </h2>
          <div style={{ display:'flex', flexDirection:'column' as const, gap:10, marginBottom:32 }}>
            {['Every campaign identity-verified','Funds held in milestones until proof submitted','MTN · Vodafone · AirtelTigo built in','2.5% + ₵0.50 — transparent fees always'].map((t,i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <span style={{ color:'#B7DEC9', fontWeight:700, fontSize:13, flexShrink:0 }}>✓</span>
                <span style={{ fontSize:13, color:'rgba(255,255,255,.65)', lineHeight:1.5 }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.08)', borderRadius:12, padding:'18px 16px' }}>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:14, color:'#fff', lineHeight:1.65, fontStyle:'italic', marginBottom:14 }}>
              "I raised ₵18,500 in three weeks. Strangers donated because they could see my identity was verified."
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#0A6B4B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>AK</div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'#fff' }}>Ama Korantema</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:1 }}>Accra · Medical campaign</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,.25)', paddingTop:16 }}>© 2026 EveryGiving · Built in Ghana 🇬🇭</div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ background:'#FDFAF5', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 24px', minHeight:'100vh' }}>
        <div style={{ width:'100%', maxWidth:420 }}>
          {showBack && (
            <Link href="/" style={{ fontSize:13, color:'#8A8A82', display:'inline-block', marginBottom:28 }}>← Back to EveryGiving</Link>
          )}
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:'#1A1A18', marginBottom:6 }}>{title}</h1>
            {sub && <p style={{ fontSize:14, color:'#8A8A82', lineHeight:1.6 }}>{sub}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── FIELD ─────────────────────────────────────────────────────────────────────

export function Field({ label, error, hint, children }: { label?: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4A4A44', marginBottom:6 }}>{label}</label>}
      {children}
      {error && <div style={{ fontSize:11, color:'#C0392B', marginTop:5 }}>{error}</div>}
      {hint && !error && <div style={{ fontSize:11, color:'#8A8A82', marginTop:5, lineHeight:1.5 }}>{hint}</div>}
    </div>
  )
}

// ─── INPUT ─────────────────────────────────────────────────────────────────────

export function Input({ prefix, suffix, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { prefix?: React.ReactNode; suffix?: React.ReactNode; error?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, background:'#fff', border:\`1.5px solid \${focused?'#0A6B4B':error?'#C0392B':'#E8E4DC'}\`, borderRadius:10, padding:'10px 12px', transition:'all .15s', boxShadow:focused?'0 0 0 3px rgba(10,107,75,.08)':'none' }}>
      {prefix && <span style={{ fontSize:13, color:'#8A8A82', flexShrink:0 }}>{prefix}</span>}
      <input {...props} style={{ flex:1, border:'none', outline:'none', fontSize:14, fontFamily:"'DM Sans',sans-serif", color:'#1A1A18', background:'transparent', minWidth:0 }}
        onFocus={e=>{setFocused(true);props.onFocus?.(e)}} onBlur={e=>{setFocused(false);props.onBlur?.(e)}} />
      {suffix && <span style={{ flexShrink:0 }}>{suffix}</span>}
    </div>
  )
}

// ─── DIVIDER ───────────────────────────────────────────────────────────────────

export function Divider({ text }: { text: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
      <div style={{ flex:1, height:1, background:'#E8E4DC' }} />
      <span style={{ fontSize:12, color:'#8A8A82', flexShrink:0 }}>{text}</span>
      <div style={{ flex:1, height:1, background:'#E8E4DC' }} />
    </div>
  )
}

// ─── PASSWORD STRENGTH ─────────────────────────────────────────────────────────

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const score = password.length < 6 ? 1 : password.length < 8 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3
  const labels = ['','Too short','Weak','Good','Strong']
  const colors = ['#E8E4DC','#C0392B','#B85C00','#185FA5','#0A6B4B']
  return (
    <div style={{ marginTop:6 }}>
      <div style={{ display:'flex', gap:3, marginBottom:4 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ flex:1, height:3, borderRadius:2, background:i<=score?colors[score]:'#E8E4DC', transition:'background .2s' }} />)}
      </div>
      <div style={{ fontSize:11, color:colors[score] }}>{labels[score]}</div>
    </div>
  )
}

// ─── OTP INPUT ─────────────────────────────────────────────────────────────────

export function OTPInput({ length=6, onComplete }: { length?: number; onComplete: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const inputs = useRef<(HTMLInputElement|null)[]>([])

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\\D/g,'').slice(-1)
    const next = [...values]; next[i] = digit; setValues(next)
    if (digit && i < length-1) inputs.current[i+1]?.focus()
    if (next.every(d=>d) && onComplete) onComplete(next.join(''))
  }
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key==='Backspace' && !values[i] && i>0) inputs.current[i-1]?.focus()
  }
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\\D/g,'').slice(0,length)
    const next = Array(length).fill('')
    pasted.split('').forEach((d,i)=>{ next[i]=d })
    setValues(next)
    inputs.current[Math.min(pasted.length, length-1)]?.focus()
    if (pasted.length===length) onComplete(pasted)
  }
  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
      {Array(length).fill(null).map((_,i) => (
        <input key={i} ref={el=>{ inputs.current[i]=el }} type="text" inputMode="numeric" maxLength={1} value={values[i]}
          onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKeyDown(i,e)} onPaste={handlePaste}
          style={{ width:44, height:52, textAlign:'center' as const, fontSize:20, fontWeight:700, fontFamily:"'DM Sans',sans-serif", border:\`1.5px solid \${values[i]?'#0A6B4B':'#E8E4DC'}\`, borderRadius:10, background:values[i]?'#E8F5EF':'#fff', color:'#1A1A18', outline:'none', transition:'all .15s' }} />
      ))}
    </div>
  )
}

// ─── BUTTON ────────────────────────────────────────────────────────────────────

export function PrimaryBtn({ children, loading, disabled, onClick, type='button' }: { children: React.ReactNode; loading?: boolean; disabled?: boolean; onClick?: ()=>void; type?: 'button'|'submit' }) {
  return (
    <button type={type} style={{ display:'block', width:'100%', padding:13, background:'#0A6B4B', color:'#fff', borderRadius:10, fontSize:14, fontWeight:600, border:'none', cursor:loading||disabled?'default':'pointer', textAlign:'center' as const, fontFamily:"'DM Sans',sans-serif", transition:'background .15s', opacity:loading||disabled?.7:1 }}
      onClick={onClick} disabled={!!(loading||disabled)}>
      {children}
    </button>
  )
}
`;

fs.writeFileSync(path.join(root, 'components', 'auth', 'shared.tsx'), shared, 'utf8');
console.log('shared.tsx:', fs.statSync(path.join(root, 'components', 'auth', 'shared.tsx')).size, 'bytes');

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────

const login = `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AuthLayout, Field, Input, Divider, PrimaryBtn } from '@/components/auth/shared'

export default function LoginPage() {
  const router = useRouter()
  const [method, setMethod] = useState<'phone'|'email'>('phone')
  const [form, setForm] = useState({ identity: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})
  const [loginError, setLoginError] = useState('')
  const [loading, setLoading] = useState(false)

  function setField(k: string, v: string) {
    setForm(f => ({...f, [k]:v}))
    setErrors(e => ({...e, [k]:''}))
    setLoginError('')
  }

  function validate() {
    const errs: Record<string,string> = {}
    if (!form.identity) errs.identity = method==='phone'?'Enter your phone number':'Enter your email address'
    if (!form.password) errs.password = 'Enter your password'
    setErrors(errs)
    return !Object.keys(errs).length
  }

  async function handleLogin() {
    if (!validate()) return
    setLoading(true)
    const supabase = createClient()
    // Phone users sign in with email derived from phone, or just use email field
    const emailInput = method==='phone'
      ? form.identity.replace(/\\s/g,'') + '@everygiving.phone' // fallback pattern
      : form.identity
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: form.password,
    })
    if (error) {
      setLoginError(error.message==='Invalid login credentials'
        ? 'Incorrect credentials. Please try again.'
        : error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <AuthLayout title="Welcome back" sub="Sign in to your EveryGiving account">
      {loginError && (
        <div style={{ background:'#FCEBEB', border:'1px solid #F0B0B0', borderRadius:8, padding:'10px 12px', fontSize:13, color:'#C0392B', marginBottom:16, lineHeight:1.5 }}>
          {loginError}
        </div>
      )}

      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {(['phone','email'] as const).map(m => (
          <button key={m} style={{ flex:1, padding:'8px 12px', border:\`1.5px solid \${method===m?'#0A6B4B':'transparent'}\`, borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s', fontFamily:"'DM Sans',sans-serif", background:method===m?'#E8F5EF':'transparent', color:method===m?'#0A6B4B':'#8A8A82' }}
            onClick={()=>{ setMethod(m); setField('identity','') }}>
            {m==='phone'?'Phone number':'Email address'}
          </button>
        ))}
      </div>

      <Field label={method==='phone'?'Phone number':'Email address'} error={errors.identity}>
        <Input type={method==='phone'?'tel':'email'}
          placeholder={method==='phone'?'e.g. 024 123 4567':'e.g. kwame@example.com'}
          value={form.identity}
          onChange={e=>setField('identity',e.target.value)}
          prefix={method==='phone'?'+233':undefined}
          error={errors.identity} />
      </Field>

      <Field label="Password" error={errors.password}>
        <Input type={showPw?'text':'password'} placeholder="Your password"
          value={form.password} onChange={e=>setField('password',e.target.value)}
          error={errors.password}
          suffix={<button style={{ background:'none', border:'none', fontSize:11, fontWeight:600, color:'#8A8A82', cursor:'pointer', padding:'0 2px', fontFamily:"'DM Sans',sans-serif" }} onClick={()=>setShowPw(v=>!v)}>{showPw?'Hide':'Show'}</button>} />
      </Field>

      <div style={{ textAlign:'right' as const, marginBottom:16, marginTop:-8 }}>
        <Link href="/auth/forgot-password" style={{ fontSize:12, color:'#0A6B4B', fontWeight:600 }}>Forgot your password?</Link>
      </div>

      <PrimaryBtn loading={loading} onClick={handleLogin}>{loading?'Signing in…':'Sign in'}</PrimaryBtn>

      <Divider text="or" />

      <div style={{ textAlign:'center' as const, fontSize:13, color:'#8A8A82', marginTop:8 }}>
        Don't have an account?{' '}
        <Link href="/auth/signup" style={{ color:'#0A6B4B', fontWeight:600 }}>Create one free →</Link>
      </div>
    </AuthLayout>
  )
}
`;

fs.writeFileSync(path.join(root, 'app', 'auth', 'login', 'page.tsx'), login, 'utf8');
console.log('login/page.tsx:', fs.statSync(path.join(root, 'app', 'auth', 'login', 'page.tsx')).size, 'bytes');

// ─── SIGNUP PAGE ──────────────────────────────────────────────────────────────

const signup = `'use client'

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
        emailRedirectTo: \`\${window.location.origin}/auth/callback?next=\${role==='campaigner'?'/create':'/campaigns'}\`,
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
              <div key={r} style={{ border:\`1.5px solid \${role===r?'#0A6B4B':'#E8E4DC'}\`, background:role===r?'#E8F5EF':'#fff', borderRadius:12, padding:'20px 16px', cursor:'pointer', transition:'all .15s', textAlign:'center' as const }}
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
            <Input type="tel" placeholder="e.g. 024 123 4567" value={form.phone} onChange={e=>setField('phone',e.target.value.replace(/\\s/g,''))} prefix="+233" error={errors.phone} />
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
            onClick={async()=>{ const s=createClient(); await s.auth.resendSignUp({ type:'signup', email:form.email }) }}>
            Resend email
          </button>
          <Link href="/auth/login" style={{ fontSize:13, color:'#8A8A82', display:'block' }}>← Back to sign in</Link>
        </div>
      )}

    </AuthLayout>
  )
}
`;

fs.writeFileSync(path.join(root, 'app', 'auth', 'signup', 'page.tsx'), signup, 'utf8');
console.log('signup/page.tsx:', fs.statSync(path.join(root, 'app', 'auth', 'signup', 'page.tsx')).size, 'bytes');

// ─── FORGOT PASSWORD PAGE ─────────────────────────────────────────────────────

const forgot = `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { AuthLayout, Field, Input, PrimaryBtn } from '@/components/auth/shared'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!email.includes('@')) { setError('Enter a valid email address'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: \`\${window.location.origin}/auth/reset-password\`,
    })
    setLoading(false)
    if (resetError) { setError(resetError.message); return }
    setSent(true)
  }

  return (
    <AuthLayout
      title={sent?'Check your email':'Reset your password'}
      sub={sent?undefined:"Enter your email and we'll send you a reset link"}>
      {!sent ? (
        <>
          <Field label="Email address" error={error}>
            <Input type="email" placeholder="e.g. kwame@gmail.com" value={email}
              onChange={e=>{ setEmail(e.target.value); setError('') }} error={error} />
          </Field>
          <PrimaryBtn loading={loading} onClick={handleSubmit}>{loading?'Sending…':'Send reset link'}</PrimaryBtn>
          <div style={{ textAlign:'center' as const, marginTop:16 }}>
            <Link href="/auth/login" style={{ fontSize:13, color:'#8A8A82' }}>← Back to sign in</Link>
          </div>
        </>
      ) : (
        <div style={{ textAlign:'center' as const }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'#E8F5EF', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#0A6B4B" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </div>
          <p style={{ fontSize:14, color:'#4A4A44', marginBottom:6, lineHeight:1.7 }}>We sent a reset link to</p>
          <p style={{ fontSize:15, fontWeight:600, color:'#1A1A18', marginBottom:24 }}>{email}</p>
          <p style={{ fontSize:13, color:'#8A8A82', lineHeight:1.65, marginBottom:28 }}>
            Click the link in your email within 30 minutes. Check your spam folder if you don't see it.
          </p>
          <button style={{ width:'100%', padding:12, background:'transparent', color:'#1A1A18', borderRadius:10, fontSize:14, fontWeight:500, border:'1px solid #E8E4DC', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", marginBottom:12 }}
            onClick={()=>setSent(false)}>Try a different email</button>
          <Link href="/auth/login" style={{ fontSize:13, color:'#8A8A82', display:'block' }}>← Back to sign in</Link>
        </div>
      )}
    </AuthLayout>
  )
}
`;

fs.writeFileSync(path.join(root, 'app', 'auth', 'forgot-password', 'page.tsx'), forgot, 'utf8');
console.log('forgot-password/page.tsx:', fs.statSync(path.join(root, 'app', 'auth', 'forgot-password', 'page.tsx')).size, 'bytes');

console.log('\nAll auth files written ✅');
