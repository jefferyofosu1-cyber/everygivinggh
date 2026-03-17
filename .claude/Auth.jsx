/**
 * EveryGiving — Auth Pages
 *
 * Four screens in one file — each exported separately.
 *
 * SignUp      → /auth/signup
 * Login       → /auth/login
 * ForgotPw    → /auth/forgot-password
 * VerifyEmail → /auth/verify-email
 *
 * Design decisions:
 * - Split-panel layout: left = brand/trust, right = form
 * - Phone OTP is the primary signup method for Ghana (no email required)
 * - Email is optional at signup — collected later when needed
 * - Role selection at signup: "I want to raise" vs "I want to donate"
 *   (affects post-signup redirect: campaigner → /create, donor → /campaigns)
 * - No social login (Google etc.) — not relevant for Ghana context
 * - All forms validate inline, not on submit
 * - Password strength meter on signup
 * - Auto-advance after OTP entry
 *
 * Backend integration points:
 *   POST /api/auth/signup          { phone, name, role, password }
 *   POST /api/auth/send-otp        { phone }
 *   POST /api/auth/verify-otp      { phone, otp }
 *   POST /api/auth/login           { phoneOrEmail, password }
 *   POST /api/auth/forgot-password { email }
 *   POST /api/auth/verify-email    { token }
 *   POST /api/auth/resend-otp      { phone }
 */

'use client';

import { useState, useRef, useEffect } from 'react';

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function AuthLayout({ children, title, sub, showBack = true }) {
  return (
    <div style={s.page}>
      {/* LEFT PANEL */}
      <div style={s.leftPanel}>
        <a href="/" style={s.brandLogo}>
          Every<span style={{ color: '#B7DEC9' }}>Giving</span>
        </a>
        <div style={s.brandContent}>
          <h2 style={s.brandTitle}>
            Ghana's most<br />
            <em style={{ color: '#B7DEC9', fontStyle: 'italic' }}>trusted giving platform</em>
          </h2>
          <div style={s.trustPoints}>
            {[
              { icon: '✓', text: 'Every campaign identity-verified' },
              { icon: '✓', text: 'Funds held in milestones until proof submitted' },
              { icon: '✓', text: 'MTN · Vodafone · AirtelTigo built in' },
              { icon: '✓', text: '₵0 platform fee — always' },
            ].map((pt, i) => (
              <div key={i} style={s.trustPt}>
                <span style={s.trustIcon}>{pt.icon}</span>
                <span style={s.trustText}>{pt.text}</span>
              </div>
            ))}
          </div>
          <div style={s.testimonial}>
            <div style={s.testiQ}>
              "I raised ₵18,500 in three weeks. Strangers donated because they could
              see my identity was verified."
            </div>
            <div style={s.testiAuthor}>
              <div style={s.testiAv}>AK</div>
              <div>
                <div style={s.testiName}>Ama Korantema</div>
                <div style={s.testiRole}>Accra · Medical campaign</div>
              </div>
            </div>
          </div>
        </div>
        <div style={s.brandFooter}>
          © 2026 EveryGiving · Built in Ghana 🇬🇭
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={s.rightPanel}>
        <div style={s.formWrap}>
          {showBack && (
            <a href="/" style={s.backLink}>← Back to EveryGiving</a>
          )}
          <div style={s.formHeader}>
            <h1 style={s.formTitle}>{title}</h1>
            {sub && <p style={s.formSub}>{sub}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div style={s.field}>
      {label && <label style={s.fieldLabel}>{label}</label>}
      {children}
      {error && <div style={s.fieldError}>{error}</div>}
      {hint && !error && <div style={s.fieldHint}>{hint}</div>}
    </div>
  );
}

function Input({ prefix, suffix, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      ...s.inputWrap,
      borderColor: focused ? '#0A6B4B' : props.error ? '#C0392B' : '#E8E4DC',
      boxShadow: focused ? '0 0 0 3px rgba(10,107,75,.08)' : 'none',
    }}>
      {prefix && <span style={s.inputPrefix}>{prefix}</span>}
      <input
        {...props}
        style={s.inputEl}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {suffix && <span style={s.inputSuffix}>{suffix}</span>}
    </div>
  );
}

function PasswordStrength({ password }) {
  const score = !password ? 0
    : password.length < 6 ? 1
    : password.length < 8 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4
    : 3;
  const labels = ['', 'Too short', 'Weak', 'Good', 'Strong'];
  const colors = ['#E8E4DC', '#C0392B', '#B85C00', '#185FA5', '#0A6B4B'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? colors[score] : '#E8E4DC',
            transition: 'background .2s',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: colors[score] }}>{labels[score]}</div>
    </div>
  );
}

function OTPInput({ length = 6, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const inputs = useRef([]);

  function handleChange(i, v) {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next = [...values];
    next[i] = digit;
    setValues(next);
    if (digit && i < length - 1) inputs.current[i + 1]?.focus();
    if (next.every(d => d) && onComplete) onComplete(next.join(''));
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !values[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const next = Array(length).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setValues(next);
    const focusIdx = Math.min(pasted.length, length - 1);
    inputs.current[focusIdx]?.focus();
    if (pasted.length === length && onComplete) onComplete(pasted);
  }

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array(length).fill(null).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={values[i]}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: 44, height: 52, textAlign: 'center', fontSize: 20,
            fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
            border: `1.5px solid ${values[i] ? '#0A6B4B' : '#E8E4DC'}`,
            borderRadius: 10, background: values[i] ? '#E8F5EF' : '#fff',
            color: '#1A1A18', outline: 'none', transition: 'all .15s',
          }}
        />
      ))}
    </div>
  );
}

function Divider({ text }) {
  return (
    <div style={s.divider}>
      <div style={s.dividerLine} />
      <span style={s.dividerText}>{text}</span>
      <div style={s.dividerLine} />
    </div>
  );
}

// ─── SIGN UP ──────────────────────────────────────────────────────────────────

export function SignUp() {
  const [step, setStep] = useState(1); // 1=role, 2=details, 3=otp, 4=done
  const [role, setRole] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  }

  function validateDetails() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your full name';
    if (!form.phone.match(/^0[0-9]{9}$/)) errs.phone = 'Enter a valid 10-digit Ghana phone number';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleDetails() {
    if (!validateDetails()) return;
    setLoading(true);
    // TODO: POST /api/auth/send-otp { phone: form.phone }
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setOtpSent(true);
    setStep(3);
  }

  async function handleOTP(code) {
    setLoading(true);
    // TODO: POST /api/auth/verify-otp { phone: form.phone, otp: code }
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    setStep(4);
  }

  const titles = {
    1: { title: 'Create your account', sub: 'Already have an account? Sign in' },
    2: { title: role === 'campaigner' ? 'Set up your campaign account' : 'Set up your donor account', sub: null },
    3: { title: 'Verify your phone', sub: `We sent a 6-digit code to ${form.phone}` },
    4: { title: role === 'campaigner' ? 'Account created' : 'Welcome to EveryGiving', sub: null },
  };

  return (
    <AuthLayout title={titles[step].title} sub={titles[step].sub}>

      {/* STEP 1 — ROLE SELECTION */}
      {step === 1 && (
        <div>
          <div style={s.roleGrid}>
            <div
              style={{ ...s.roleCard, borderColor: role === 'campaigner' ? '#0A6B4B' : '#E8E4DC', background: role === 'campaigner' ? '#E8F5EF' : '#fff' }}
              onClick={() => setRole('campaigner')}
            >
              <div style={s.roleImg}>
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&q=80&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
              <div style={s.roleCheck(role === 'campaigner')} />
              <div style={s.roleTitle}>I want to raise money</div>
              <div style={s.roleSub}>Start a campaign for medical, education, community or any cause</div>
            </div>
            <div
              style={{ ...s.roleCard, borderColor: role === 'donor' ? '#0A6B4B' : '#E8E4DC', background: role === 'donor' ? '#E8F5EF' : '#fff' }}
              onClick={() => setRole('donor')}
            >
              <div style={s.roleImg}>
                <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=80&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </div>
              <div style={s.roleCheck(role === 'donor')} />
              <div style={s.roleTitle}>I want to donate</div>
              <div style={s.roleSub}>Give to verified campaigns and track your impact</div>
            </div>
          </div>
          <button
            style={{ ...s.btnPrimary, opacity: role ? 1 : .5, cursor: role ? 'pointer' : 'default' }}
            onClick={() => role && setStep(2)}
            disabled={!role}
          >
            Continue →
          </button>
          <div style={s.authSwitch}>
            Already have an account? <a href="/auth/login" style={s.authLink}>Sign in</a>
          </div>
        </div>
      )}

      {/* STEP 2 — DETAILS FORM */}
      {step === 2 && (
        <div>
          <Field label="Full name" error={errors.name}>
            <Input
              type="text"
              placeholder="e.g. Kwame Mensah"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
            />
          </Field>
          <Field label="Phone number" error={errors.phone} hint="Your MTN, Vodafone, or AirtelTigo number">
            <Input
              type="tel"
              placeholder="e.g. 024 123 4567"
              value={form.phone}
              onChange={e => setField('phone', e.target.value.replace(/\s/g, ''))}
              prefix="+233"
            />
          </Field>
          <Field label="Password" error={errors.password}>
            <Input
              type={showPw ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={e => setField('password', e.target.value)}
              suffix={
                <button style={s.showPwBtn} onClick={() => setShowPw(v => !v)}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              }
            />
            <PasswordStrength password={form.password} />
          </Field>
          <button
            style={{ ...s.btnPrimary, opacity: loading ? .7 : 1 }}
            onClick={handleDetails}
            disabled={loading}
          >
            {loading ? 'Sending code…' : 'Continue — send verification code'}
          </button>
          <p style={{ ...s.authSwitch, marginTop: 12 }}>
            By continuing, you agree to our{' '}
            <a href="/terms" style={s.authLink}>Terms</a> and{' '}
            <a href="/privacy" style={s.authLink}>Privacy Policy</a>
          </p>
        </div>
      )}

      {/* STEP 3 — OTP */}
      {step === 3 && (
        <div>
          <div style={s.otpInfo}>
            <div style={s.otpPhone}>+233 {form.phone.slice(1)}</div>
            <div style={s.otpNote}>Enter the 6-digit code sent to your phone. It expires in 10 minutes.</div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <OTPInput length={6} onComplete={handleOTP} />
          </div>
          {loading && <div style={s.loadingNote}>Verifying…</div>}
          <div style={s.resendRow}>
            Didn't receive it?{' '}
            <button style={s.resendBtn}
              onClick={async () => {
                // TODO: POST /api/auth/resend-otp { phone: form.phone }
              }}
            >
              Resend code
            </button>
            {' '}or{' '}
            <button style={s.resendBtn} onClick={() => setStep(2)}>change number</button>
          </div>
        </div>
      )}

      {/* STEP 4 — SUCCESS */}
      {step === 4 && (
        <div style={{ textAlign: 'center' }}>
          <div style={s.successIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#0A6B4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1A1A18', marginBottom: 8 }}>
            {role === 'campaigner' ? 'You\'re ready to raise' : 'Welcome to EveryGiving'}
          </h3>
          <p style={{ fontSize: 14, color: '#8A8A82', lineHeight: 1.7, marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
            {role === 'campaigner'
              ? 'Your account is verified. Start your campaign — it takes under 15 minutes.'
              : 'Your account is ready. Browse verified campaigns and make your first donation.'}
          </p>
          <a
            href={role === 'campaigner' ? '/create' : '/campaigns'}
            style={s.btnPrimary}
          >
            {role === 'campaigner' ? 'Start my campaign →' : 'Browse campaigns →'}
          </a>
        </div>
      )}

    </AuthLayout>
  );
}

// ─── LOG IN ───────────────────────────────────────────────────────────────────

export function Login() {
  const [method, setMethod] = useState('phone'); // 'phone' | 'email'
  const [form, setForm] = useState({ phoneOrEmail: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
    setLoginError('');
  }

  function validate() {
    const errs = {};
    if (!form.phoneOrEmail) errs.phoneOrEmail = 'Please enter your phone number or email';
    if (!form.password) errs.password = 'Please enter your password';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    // TODO: POST /api/auth/login { phoneOrEmail: form.phoneOrEmail, password: form.password }
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    // On success: redirect to /dashboard or intended URL
    // On failure: setLoginError('Incorrect phone or password. Please try again.')
  }

  return (
    <AuthLayout title="Welcome back" sub="Sign in to your EveryGiving account">
      {loginError && (
        <div style={s.alertError}>{loginError}</div>
      )}

      <div style={s.methodTabs}>
        <button
          style={{ ...s.methodTab, borderColor: method === 'phone' ? '#0A6B4B' : 'transparent', color: method === 'phone' ? '#0A6B4B' : '#8A8A82', background: method === 'phone' ? '#E8F5EF' : 'transparent' }}
          onClick={() => setMethod('phone')}
        >
          Phone number
        </button>
        <button
          style={{ ...s.methodTab, borderColor: method === 'email' ? '#0A6B4B' : 'transparent', color: method === 'email' ? '#0A6B4B' : '#8A8A82', background: method === 'email' ? '#E8F5EF' : 'transparent' }}
          onClick={() => setMethod('email')}
        >
          Email address
        </button>
      </div>

      <Field
        label={method === 'phone' ? 'Phone number' : 'Email address'}
        error={errors.phoneOrEmail}
      >
        <Input
          type={method === 'phone' ? 'tel' : 'email'}
          placeholder={method === 'phone' ? 'e.g. 024 123 4567' : 'e.g. kwame@example.com'}
          value={form.phoneOrEmail}
          onChange={e => setField('phoneOrEmail', e.target.value)}
          prefix={method === 'phone' ? '+233' : undefined}
        />
      </Field>

      <Field label="Password" error={errors.password}>
        <Input
          type={showPw ? 'text' : 'password'}
          placeholder="Your password"
          value={form.password}
          onChange={e => setField('password', e.target.value)}
          suffix={
            <button style={s.showPwBtn} onClick={() => setShowPw(v => !v)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          }
        />
      </Field>

      <div style={s.forgotRow}>
        <a href="/auth/forgot-password" style={s.authLink}>Forgot your password?</a>
      </div>

      <button
        style={{ ...s.btnPrimary, opacity: loading ? .7 : 1 }}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <Divider text="or" />

      <div style={s.authSwitch}>
        Don't have an account?{' '}
        <a href="/auth/signup" style={s.authLink}>Create one free →</a>
      </div>
    </AuthLayout>
  );
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (!email.includes('@')) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    // TODO: POST /api/auth/forgot-password { email }
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthLayout
      title={sent ? 'Check your email' : 'Reset your password'}
      sub={sent ? null : 'Enter your email and we\'ll send you a reset link'}
    >
      {!sent ? (
        <>
          <Field label="Email address" error={error}>
            <Input
              type="email"
              placeholder="e.g. kwame@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
            />
          </Field>
          <button
            style={{ ...s.btnPrimary, opacity: loading ? .7 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <div style={{ ...s.authSwitch, marginTop: 16 }}>
            <a href="/auth/login" style={s.authLink}>← Back to sign in</a>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={s.successIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#0A6B4B" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ fontSize: 14, color: '#4A4A44', lineHeight: 1.75, marginBottom: 8 }}>
            We sent a password reset link to
          </p>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A18', marginBottom: 24 }}>{email}</p>
          <p style={{ fontSize: 13, color: '#8A8A82', lineHeight: 1.65, marginBottom: 28 }}>
            Check your inbox and click the link within 30 minutes.
            If you don't see it, check your spam folder.
          </p>
          <button style={{ ...s.btnSecondary, width: '100%' }} onClick={() => setSent(false)}>
            Try a different email
          </button>
          <div style={{ ...s.authSwitch, marginTop: 16 }}>
            <a href="/auth/login" style={s.authLink}>← Back to sign in</a>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}

// ─── VERIFY EMAIL ─────────────────────────────────────────────────────────────

export function VerifyEmail() {
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'expired' | 'error'

  useEffect(() => {
    // In production, read token from URL params:
    // const token = new URLSearchParams(window.location.search).get('token')
    // Then POST /api/auth/verify-email { token }
    const timer = setTimeout(() => setStatus('success'), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthLayout title="" showBack={false}>
      <div style={{ textAlign: 'center', paddingTop: 20 }}>
        {status === 'verifying' && (
          <>
            <div style={s.spinnerWrap}>
              <div style={s.spinner} />
            </div>
            <h3 style={s.verifyTitle}>Verifying your email…</h3>
            <p style={s.verifySub}>This will only take a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={s.successIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#0A6B4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 style={s.verifyTitle}>Email verified</h3>
            <p style={s.verifySub}>Your email address has been confirmed. You're all set.</p>
            <a href="/dashboard" style={{ ...s.btnPrimary, display: 'block', marginBottom: 10 }}>
              Go to your dashboard →
            </a>
            <a href="/campaigns" style={s.authLink}>Browse campaigns instead</a>
          </>
        )}

        {status === 'expired' && (
          <>
            <div style={{ ...s.successIcon, background: '#FCEBEB' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#C0392B" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h3 style={{ ...s.verifyTitle, color: '#C0392B' }}>Link expired</h3>
            <p style={s.verifySub}>This verification link has expired. Request a new one below.</p>
            <button style={s.btnPrimary} onClick={() => {/* TODO: resend */}}>
              Resend verification email
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const s = {
  page: {
    display: 'grid', gridTemplateColumns: '420px 1fr',
    minHeight: '100vh', fontFamily: "'DM Sans', sans-serif",
  },

  // LEFT PANEL
  leftPanel: {
    background: '#1A1A18', display: 'flex', flexDirection: 'column',
    padding: '32px 36px', position: 'sticky', top: 0, height: '100vh',
    overflow: 'hidden',
  },
  brandLogo: {
    fontFamily: "'DM Serif Display', serif", fontSize: 22,
    color: '#fff', textDecoration: 'none', marginBottom: 'auto',
  },
  brandContent: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 24 },
  brandTitle: {
    fontFamily: "'DM Serif Display', serif", fontSize: 30,
    color: '#fff', lineHeight: 1.2, marginBottom: 28,
  },
  trustPoints: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 },
  trustPt: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  trustIcon: { color: '#B7DEC9', fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 },
  trustText: { fontSize: 13, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 },
  testimonial: {
    background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 12, padding: '18px 16px',
  },
  testiQ: {
    fontFamily: "'DM Serif Display', serif", fontSize: 14,
    color: '#fff', lineHeight: 1.65, fontStyle: 'italic', marginBottom: 14,
  },
  testiAuthor: { display: 'flex', alignItems: 'center', gap: 10 },
  testiAv: {
    width: 32, height: 32, borderRadius: '50%', background: '#0A6B4B',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
  },
  testiName: { fontSize: 12, fontWeight: 600, color: '#fff' },
  testiRole: { fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 },
  brandFooter: { fontSize: 11, color: 'rgba(255,255,255,.25)', marginTop: 'auto', paddingTop: 16 },

  // RIGHT PANEL
  rightPanel: {
    background: '#FDFAF5', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '40px 24px', minHeight: '100vh',
  },
  formWrap: { width: '100%', maxWidth: 420 },
  backLink: { fontSize: 13, color: '#8A8A82', display: 'inline-block', marginBottom: 28, textDecoration: 'none' },
  formHeader: { marginBottom: 28 },
  formTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#1A1A18', marginBottom: 6 },
  formSub: { fontSize: 14, color: '#8A8A82', lineHeight: 1.6 },

  // ROLE SELECTION
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 },
  roleCard: {
    border: '1.5px solid', borderRadius: 12, padding: '0 0 16px',
    cursor: 'pointer', transition: 'all .15s', overflow: 'hidden',
    position: 'relative',
  },
  roleImg: { height: 110, overflow: 'hidden', marginBottom: 12 },
  roleCheck: (active) => ({
    position: 'absolute', top: 8, right: 8, width: 20, height: 20,
    borderRadius: '50%', background: active ? '#0A6B4B' : '#fff',
    border: `2px solid ${active ? '#0A6B4B' : '#E8E4DC'}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#fff', fontWeight: 700,
    ...(active ? {} : {}),
    transition: 'all .15s',
  }),
  roleTitle: { fontSize: 13, fontWeight: 600, color: '#1A1A18', padding: '0 12px', marginBottom: 4 },
  roleSub: { fontSize: 11, color: '#8A8A82', padding: '0 12px', lineHeight: 1.5 },

  // FORM FIELDS
  field: { marginBottom: 16 },
  fieldLabel: { display: 'block', fontSize: 12, fontWeight: 600, color: '#4A4A44', marginBottom: 6 },
  fieldError: { fontSize: 11, color: '#C0392B', marginTop: 5 },
  fieldHint: { fontSize: 11, color: '#8A8A82', marginTop: 5, lineHeight: 1.5 },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff', border: '1.5px solid', borderRadius: 10,
    padding: '10px 12px', transition: 'all .15s',
  },
  inputPrefix: { fontSize: 13, color: '#8A8A82', flexShrink: 0 },
  inputSuffix: { flexShrink: 0 },
  inputEl: {
    flex: 1, border: 'none', outline: 'none', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", color: '#1A1A18', background: 'transparent',
    minWidth: 0,
  },
  showPwBtn: {
    background: 'none', border: 'none', fontSize: 11, fontWeight: 600,
    color: '#8A8A82', cursor: 'pointer', padding: '0 2px', flexShrink: 0,
    fontFamily: "'DM Sans', sans-serif",
  },

  // METHOD TABS
  methodTabs: { display: 'flex', gap: 6, marginBottom: 20 },
  methodTab: {
    flex: 1, padding: '8px 12px', border: '1.5px solid', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
    fontFamily: "'DM Sans', sans-serif", background: 'transparent',
  },

  // FORGOT/SWITCH
  forgotRow: { textAlign: 'right', marginBottom: 16, marginTop: -8 },
  authSwitch: { textAlign: 'center', fontSize: 13, color: '#8A8A82', marginTop: 16 },
  authLink: { color: '#0A6B4B', fontWeight: 600, textDecoration: 'none' },

  // OTP
  otpInfo: { textAlign: 'center', marginBottom: 24 },
  otpPhone: { fontSize: 16, fontWeight: 700, color: '#1A1A18', marginBottom: 6 },
  otpNote: { fontSize: 13, color: '#8A8A82', lineHeight: 1.6 },
  loadingNote: { textAlign: 'center', fontSize: 13, color: '#8A8A82', marginBottom: 12 },
  resendRow: { textAlign: 'center', fontSize: 12, color: '#8A8A82', marginTop: 20 },
  resendBtn: {
    background: 'none', border: 'none', color: '#0A6B4B', fontSize: 12,
    fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif",
  },

  // BUTTONS
  btnPrimary: {
    display: 'block', width: '100%', padding: '13px', background: '#0A6B4B',
    color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600,
    border: 'none', cursor: 'pointer', textAlign: 'center',
    fontFamily: "'DM Sans', sans-serif", transition: 'background .15s',
    textDecoration: 'none',
  },
  btnSecondary: {
    display: 'block', width: '100%', padding: '12px', background: 'transparent',
    color: '#1A1A18', borderRadius: 10, fontSize: 14, fontWeight: 500,
    border: '1px solid #E8E4DC', cursor: 'pointer', textAlign: 'center',
    fontFamily: "'DM Sans', sans-serif",
  },

  // DIVIDER
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: '#E8E4DC' },
  dividerText: { fontSize: 12, color: '#8A8A82', flexShrink: 0 },

  // ALERTS
  alertError: {
    background: '#FCEBEB', border: '1px solid #F0B0B0', borderRadius: 8,
    padding: '10px 12px', fontSize: 13, color: '#C0392B', marginBottom: 16,
    lineHeight: 1.5,
  },

  // SUCCESS
  successIcon: {
    width: 56, height: 56, borderRadius: '50%', background: '#E8F5EF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },

  // VERIFY
  spinnerWrap: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
  spinner: {
    width: 40, height: 40, border: '3px solid #E8E4DC',
    borderTopColor: '#0A6B4B', borderRadius: '50%',
    animation: 'spin .8s linear infinite',
  },
  verifyTitle: { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#1A1A18', marginBottom: 8 },
  verifySub: { fontSize: 13, color: '#8A8A82', lineHeight: 1.7, marginBottom: 24 },
};
