'use client'

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
      ? form.identity.replace(/\s/g,'') + '@everygiving.phone' // fallback pattern
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
          <button key={m} style={{ flex:1, padding:'8px 12px', border:`1.5px solid ${method===m?'#0A6B4B':'transparent'}`, borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s', fontFamily:"'DM Sans',sans-serif", background:method===m?'#E8F5EF':'transparent', color:method===m?'#0A6B4B':'#8A8A82' }}
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
