'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

// ─── AUTH LAYOUT ───────────────────────────────────────────────────────────────

export function AuthLayout({ children, title, sub, showBack = true }: {
  children: React.ReactNode; title: string; sub?: string; showBack?: boolean
}) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'420px 1fr', minHeight:'100vh', fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none;color:inherit}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:720px){.auth-grid{grid-template-columns:1fr !important}.auth-left{display:none !important}}
      `}</style>

      {/* LEFT PANEL */}
      <div className="auth-left" style={{ background: 'var(--surface-alt)', display: 'flex', flexDirection: 'column' as const, padding: '32px 36px', position: 'sticky' as const, top: 0, height: '100vh', overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
        <Link href="/" style={{ fontFamily: "'DM Serif Display',serif", fontSize: 22, color: 'var(--text-main)', marginBottom: 'auto', display: 'block' }}>
          Every<span style={{ color: 'var(--primary)' }}>Giving</span>
        </Link>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', paddingBottom: 24 }}>
          <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 30, color: 'var(--text-main)', lineHeight: 1.2, marginBottom: 28 }}>
            Ghana's most<br />
            <em style={{ color: 'var(--primary)', fontStyle: 'italic' }}>trusted giving platform</em>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10, marginBottom: 32 }}>
            {['Every campaign identity-verified', 'Funds held in milestones until proof submitted', 'MTN · Vodafone · AirtelTigo built in', '2.5% + ₵0.50 — transparent fees always'].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 16px' }}>
            <div style={{ fontFamily: "'DM Serif Display',serif", fontSize: 14, color: 'var(--text-main)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: 14 }}>
              "I raised ₵18,500 in three weeks. Strangers donated because they could see my identity was verified."
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>AK</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)' }}>Ama Korantema</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Accra · Medical campaign</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 16 }}>© 2026 EveryGiving · Built in Ghana 🇬🇭</div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {showBack && (
            <Link href="/" style={{ fontSize: 13, color: 'var(--text-muted)', display: 'inline-block', marginBottom: 28 }}>← Back to EveryGiving</Link>
          )}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: 28, color: 'var(--text-main)', marginBottom: 6 }}>{title}</h1>
            {sub && <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{sub}</p>}
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
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-main)', opacity: 0.8, marginBottom: 6 }}>{label}</label>}
      {children}
      {error && <div style={{ fontSize: 11, color: '#C0392B', marginTop: 5 }}>{error}</div>}
      {hint && !error && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  )
}

// ─── INPUT ─────────────────────────────────────────────────────────────────────

export function Input({ prefix, suffix, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { prefix?: React.ReactNode; suffix?: React.ReactNode; error?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface)', border: `1.5px solid ${focused ? 'var(--primary)' : error ? '#C0392B' : 'var(--border)'}`, borderRadius: 10, padding: '10px 12px', transition: 'all .15s', boxShadow: focused ? '0 0 0 3px var(--primary-light)' : 'none' }}>
      {prefix && <span style={{ fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>{prefix}</span>}
      <input {...props} style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: 'var(--text-main)', background: 'transparent', minWidth: 0 }}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }} onBlur={e => { setFocused(false); props.onBlur?.(e) }} />
      {suffix && <span style={{ flexShrink: 0 }}>{suffix}</span>}
    </div>
  )
}

// ─── DIVIDER ───────────────────────────────────────────────────────────────────

export function Divider({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{text}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
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
    const digit = v.replace(/\D/g,'').slice(-1)
    const next = [...values]; next[i] = digit; setValues(next)
    if (digit && i < length-1) inputs.current[i+1]?.focus()
    if (next.every(d=>d) && onComplete) onComplete(next.join(''))
  }
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key==='Backspace' && !values[i] && i>0) inputs.current[i-1]?.focus()
  }
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,length)
    const next = Array(length).fill('')
    pasted.split('').forEach((d,i)=>{ next[i]=d })
    setValues(next)
    inputs.current[Math.min(pasted.length, length-1)]?.focus()
    if (pasted.length===length) onComplete(pasted)
  }
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array(length).fill(null).map((_, i) => (
        <input key={i} ref={el => { inputs.current[i] = el }} type="text" inputMode="numeric" maxLength={1} value={values[i]}
          onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} onPaste={handlePaste}
          style={{ width: 44, height: 52, textAlign: 'center' as const, fontSize: 20, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", border: `1.5px solid ${values[i] ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 10, background: values[i] ? 'var(--primary-light)' : 'var(--surface)', color: 'var(--text-main)', outline: 'none', transition: 'all .15s' }} />
      ))}
    </div>
  )
}

// ─── BUTTON ────────────────────────────────────────────────────────────────────

export function PrimaryBtn({ children, loading, disabled, onClick, type='button' }: { children: React.ReactNode; loading?: boolean; disabled?: boolean; onClick?: ()=>void; type?: 'button'|'submit' }) {
  return (
    <button type={type} style={{ display: 'block', width: '100%', padding: 13, background: 'var(--primary)', color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600, border: 'none', cursor: loading || disabled ? 'default' : 'pointer', textAlign: 'center' as const, fontFamily: "'DM Sans',sans-serif", transition: 'all .15s', opacity: loading || disabled ? .7 : 1 }}
      onMouseEnter={e => !disabled && !loading && (e.currentTarget.style.background = 'var(--primary-dark)')}
      onMouseLeave={e => !disabled && !loading && (e.currentTarget.style.background = 'var(--primary)')}
      onClick={onClick} disabled={!!(loading || disabled)}>
      {children}
    </button>
  )
}
