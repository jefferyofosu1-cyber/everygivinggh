'use client'

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
      redirectTo: `${window.location.origin}/auth/reset-password`,
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
