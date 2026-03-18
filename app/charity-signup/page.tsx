'use client'
import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 'done'

type OrgType = 'ngo' | 'charity' | 'church' | 'school' | 'hospital' | 'community' | 'corporate' | ''

interface FormState {
  // Step 1
  orgType: OrgType
  orgName: string
  location: string
  contactName: string
  email: string
  phone: string
  password: string
  // Step 2
  regNumber: string
  taxId: string
  momoNumber: string
  bankName: string
  bankAccount: string
  website: string
  facebook: string
  instagram: string
  pastProjects: string
  references: string
  // Step 3
  description: string
  mission: string
}

const INIT: FormState = {
  orgType: '', orgName: '', location: '', contactName: '', email: '', phone: '', password: '',
  regNumber: '', taxId: '', momoNumber: '', bankName: '', bankAccount: '',
  website: '', facebook: '', instagram: '', pastProjects: '', references: '',
  description: '', mission: '',
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const ORG_TYPES = [
  { id: 'ngo' as OrgType, label: 'NGO / Non-profit', desc: 'Registered non-governmental organisation operating in Ghana' },
  { id: 'charity' as OrgType, label: 'Registered Charity', desc: "Registered with Ghana's Department of Social Welfare" },
  { id: 'church' as OrgType, label: 'Church / Faith Org', desc: 'Licensed church, mosque, or faith-based organisation' },
  { id: 'school' as OrgType, label: 'School / University', desc: 'Accredited educational institution' },
  { id: 'hospital' as OrgType, label: 'Hospital / Clinic', desc: 'Licensed medical facility or health organisation' },
  { id: 'community' as OrgType, label: 'Community Group', desc: 'Formally organised community group or association' },
  { id: 'corporate' as OrgType, label: 'Corporate / CSR', desc: 'Company operating a charitable giving programme' },
]

const TIERS = [
  {
    name: 'Basic',
    color: '#185FA5',
    bg: '#E6F1FB',
    desc: 'Identity confirmed. Can create campaigns.',
    items: ['Identity verified', 'Campaign creation unlocked', 'Basic page listing'],
  },
  {
    name: 'Standard',
    color: '#0A6B4B',
    bg: '#E8F5EF',
    desc: 'Documents reviewed. Gets the Verified badge.',
    items: ['All Basic features', 'Verified badge on profile', 'Higher search visibility', 'Donor trust boost'],
  },
  {
    name: 'Premium',
    color: '#7C3AED',
    bg: '#F3EEFF',
    desc: 'Full compliance check. Featured placement.',
    items: ['All Standard features', 'Featured placement', 'Priority support', 'Full compliance review'],
  },
]

const GHANA_CITIES = [
  'Accra', 'Kumasi', 'Tamale', 'Sekondi-Takoradi', 'Cape Coast', 'Obuasi',
  'Teshie', 'Tema', 'Sunyani', 'Koforidua', 'Ho', 'Wa', 'Bolgatanga', 'Other',
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function FileUploadBox({
  label, hint, id, accept, value, onChange, required,
}: {
  label: string; hint: string; id: string; accept: string
  value: File | null; onChange: (f: File) => void; required?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const preview = value ? URL.createObjectURL(value) : null
  const isImage = value?.type.startsWith('image/')
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4A4A44', marginBottom: 6 }}>
        {label}{required && ' *'}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          height: 100, border: `1.5px dashed ${value ? '#0A6B4B' : '#D1D5DB'}`,
          borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
          background: value ? '#E8F5EF' : '#F9FAFB', transition: 'all .15s',
        }}
      >
        {value && isImage && preview ? (
          <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : value ? (
          <div style={{ textAlign: 'center', padding: '0 12px' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📄</div>
            <div style={{ fontSize: 11, color: '#0A6B4B', fontWeight: 600 }}>{value.name}</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '0 16px' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>⬆</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#4A4A44' }}>Click to upload</div>
            <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{hint}</div>
          </div>
        )}
        <input ref={inputRef} id={id} type="file" accept={accept} style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && onChange(e.target.files[0])} />
      </div>
    </div>
  )
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 12 }}>
        {[1, 2, 3].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0,
              background: step >= s ? '#0A6B4B' : '#E5E7EB',
              color: step >= s ? '#fff' : '#9CA3AF',
              boxShadow: step === s ? '0 0 0 4px rgba(10,107,75,0.15)' : 'none',
              transition: 'all .2s',
            }}>{step > s ? '✓' : s}</div>
            {i < 2 && (
              <div style={{ flex: 1, height: 2, background: step > s ? '#0A6B4B' : '#E5E7EB', transition: 'background .3s' }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {['Basic Info', 'Verification', 'Profile Setup'].map((label, i) => (
          <div key={label} style={{
            fontSize: 10, fontWeight: step === i + 1 ? 700 : 500,
            color: step === i + 1 ? '#0A6B4B' : step > i + 1 ? '#6B7280' : '#9CA3AF',
            width: i === 0 ? 'auto' : i === 2 ? 'auto' : '100%',
            textAlign: i === 0 ? 'left' : i === 2 ? 'right' : 'center',
          }}>{label}</div>
        ))}
      </div>
    </div>
  )
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 14px',
  fontSize: 13, outline: 'none', background: '#F9FAFB', transition: 'border-color .15s', fontFamily: 'inherit',
}
const LABEL_STYLE: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }
const SECTION_TITLE: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4, marginTop: 4 }
const SECTION_SUB: React.CSSProperties = { fontSize: 12, color: '#9CA3AF', marginBottom: 16 }

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function CharitySignupPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>(INIT)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const f = useCallback((k: keyof FormState) => (v: string) => setForm(p => ({ ...p, [k]: v })), [])

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
    const supabase = createClient()
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) return null
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return publicUrl
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const supabase = createClient()

    try {
      // 1. Create auth user
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: { full_name: form.contactName, is_organisation: true },
        },
      })
      if (authErr) throw new Error(authErr.message)
      const userId = authData.user?.id
      if (!userId) throw new Error('Could not create account.')

      // 2. Upload files
      const [certUrl, logoUrl, coverUrl] = await Promise.all([
        certFile ? uploadFile(certFile, 'org-files', `${userId}/cert-${Date.now()}`) : Promise.resolve(null),
        logoFile ? uploadFile(logoFile, 'org-files', `${userId}/logo-${Date.now()}`) : Promise.resolve(null),
        coverFile ? uploadFile(coverFile, 'org-files', `${userId}/cover-${Date.now()}`) : Promise.resolve(null),
      ])

      // 3. Insert organisation record
      const slug = slugify(`${form.orgName}-${Math.random().toString(36).slice(2, 6)}`)
      await supabase.from('organisations').insert({
        user_id: userId,
        name: form.orgName,
        slug,
        type: form.orgType,
        location: form.location,
        contact_name: form.contactName,
        email: form.email,
        phone: form.phone,
        website: form.website || null,
        description: form.description,
        mission: form.mission,
        reg_number: form.regNumber || null,
        reg_cert_url: certUrl,
        tax_id: form.taxId || null,
        momo_number: form.momoNumber || null,
        bank_name: form.bankName || null,
        bank_account: form.bankAccount || null,
        social_links: { facebook: form.facebook, instagram: form.instagram },
        past_projects: form.pastProjects || null,
        references_text: form.references || null,
        logo_url: logoUrl,
        cover_url: coverUrl,
        status: 'pending',
        verification_tier: 'none',
      })

      // 4. Update profile
      await supabase.from('profiles').upsert({
        id: userId,
        email: form.email,
        full_name: form.contactName,
        org_name: form.orgName,
        org_type: form.orgType,
        is_organisation: true,
        phone: form.phone,
        location: form.location,
      })

      setStep('done')
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  // Done state
  if (step === 'done') return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', background: '#FDFAF5' }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#0A6B4B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px', boxShadow: '0 0 0 12px rgba(10,107,75,.1)' }}>✓</div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 10 }}>Application received</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 12, fontFamily: 'inherit', lineHeight: 1.2 }}>
          Welcome to EveryGiving, <br />{form.orgName}
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.75, marginBottom: 8 }}>
          Your application has been submitted. Check your email to confirm your account.
        </p>
        <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.75, marginBottom: 28 }}>
          Our team will review your documents and be in touch within <strong>2 business days</strong>. We'll assign your verification tier on approval.
        </p>
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8 }}>What happens next</div>
          {['Confirm your email address', 'Our team reviews your registration documents', 'We assign your verification tier', 'Your org page goes live — start raising!'].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, color: '#6B7280', marginBottom: 6, lineHeight: 1.5 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#0A6B4B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              {t}
            </div>
          ))}
        </div>
        <Link href="/" style={{ display: 'inline-block', background: '#0A6B4B', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 28px', borderRadius: 100, textDecoration: 'none' }}>
          Back to home
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box}
        body{font-family:'DM Sans',sans-serif;background:#FDFAF5}
        input:focus,textarea:focus,select:focus{border-color:#0A6B4B !important;background:#fff !important;outline:none}
        .org-type-btn{cursor:pointer;border:1.5px solid #E5E7EB;background:#fff;border-radius:12px;padding:14px;transition:all .15s;text-align:left;width:100%}
        .org-type-btn:hover{border-color:#0A6B4B;background:#F0FBF6}
        .org-type-btn.selected{border-color:#0A6B4B;background:#E8F5EF}
        .trust-item{display:flex;align-items:flex-start;gap:10;margin-bottom:12px}
      ` }} />

      {/* HERO */}
      <section style={{ background: '#111827', padding: '56px 32px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,.04) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(10,107,75,.2)', border: '1px solid rgba(10,107,75,.4)', color: '#6EE7B7', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 100, marginBottom: 18 }}>
            For organisations
          </div>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 46, lineHeight: 1.1, color: '#fff', marginBottom: 16, letterSpacing: -1 }}>
            Register your organisation<br />
            <em style={{ color: '#6EE7B7', fontStyle: 'italic' }}>on EveryGiving</em>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 32px' }}>
            Get verified, build donor trust, and raise funds transparently across Ghana and beyond.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Identity verified', 'Secure via Paystack', 'Transparent tracking', 'Free to apply'].map(t => (
              <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>✓ {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* VERIFICATION TIERS */}
      <section style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '32px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#0A6B4B', marginBottom: 6 }}>Trust tiers</div>
            <p style={{ fontSize: 14, color: '#6B7280' }}>All organisations start at Basic and can apply for higher tiers after approval.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {TIERS.map(tier => (
              <div key={tier.name} style={{ background: tier.bg, border: `1.5px solid ${tier.color}30`, borderRadius: 14, padding: '20px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ background: tier.color, color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 100 }}>{tier.name.toUpperCase()}</div>
                </div>
                <div style={{ fontSize: 12, color: tier.color, marginBottom: 10, lineHeight: 1.5 }}>{tier.desc}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {tier.items.map(item => (
                    <div key={item} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', fontSize: 11, color: '#374151' }}>
                      <span style={{ color: tier.color, flexShrink: 0, fontWeight: 700 }}>✓</span>{item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM AREA */}
      <section style={{ padding: '48px 32px 80px', background: '#FDFAF5', minHeight: '60vh' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 32, alignItems: 'start' }}>
          {/* MAIN FORM */}
          <div>
            <ProgressBar step={step as number} />

            {/* ── STEP 1: Basic Info ─────────────────────── */}
            {step === 1 && (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32 }}>
                <div style={SECTION_TITLE}>Step 1: Basic information</div>
                <div style={SECTION_SUB}>Keep it quick — you can fill in more detail in the next steps.</div>

                <div style={{ marginBottom: 16 }}>
                  <label style={LABEL_STYLE}>Organisation type *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {ORG_TYPES.map(org => (
                      <button key={org.id} type="button" onClick={() => f('orgType')(org.id)}
                        className={`org-type-btn${form.orgType === org.id ? ' selected' : ''}`}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: form.orgType === org.id ? '#0A6B4B' : '#111827', marginBottom: 2 }}>{org.label}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.4 }}>{org.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={LABEL_STYLE}>Organisation name *</label>
                    <input value={form.orgName} onChange={e => f('orgName')(e.target.value)} style={INPUT_STYLE}
                      placeholder="e.g. Bright Futures Foundation" />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>City / Location *</label>
                    <select value={form.location} onChange={e => f('location')(e.target.value)} style={INPUT_STYLE}>
                      <option value="">Select city...</option>
                      {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <label style={LABEL_STYLE}>Contact person *</label>
                      <input value={form.contactName} onChange={e => f('contactName')(e.target.value)} style={INPUT_STYLE}
                        placeholder="Your full name" />
                    </div>
                    <div>
                      <label style={LABEL_STYLE}>Phone number *</label>
                      <input value={form.phone} onChange={e => f('phone')(e.target.value)} style={INPUT_STYLE}
                        placeholder="024 XXX XXXX" type="tel" />
                    </div>
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Email address *</label>
                    <input value={form.email} onChange={e => f('email')(e.target.value)} style={INPUT_STYLE}
                      placeholder="org@example.com" type="email" />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Create a password * <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(min 8 chars)</span></label>
                    <input value={form.password} onChange={e => f('password')(e.target.value)} style={INPUT_STYLE}
                      placeholder="At least 8 characters" type="password" minLength={8} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!form.orgType || !form.orgName || !form.location || !form.contactName || !form.email || !form.phone || !form.password)
                      return setError('Please fill in all required fields.')
                    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
                    setError(''); setStep(2)
                  }}
                  style={{ marginTop: 24, width: '100%', padding: '13px 0', background: '#0A6B4B', color: '#fff', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Continue to verification →
                </button>
                {error && <div style={{ marginTop: 12, fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>{error}</div>}
              </div>
            )}

            {/* ── STEP 2: Verification ─────────────────── */}
            {step === 2 && (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32 }}>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B7280', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                  ← Back
                </button>
                <div style={SECTION_TITLE}>Step 2: Verification details</div>
                <div style={SECTION_SUB}>This is how we verify your organisation and build donor trust.</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F3F4F6' }}>Registration documents</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 14 }}>
                      <FileUploadBox
                        label="Registration certificate" hint="PDF or image — Ghana Registrar General / NGO proof"
                        id="cert" accept="image/*,.pdf" value={certFile} onChange={setCertFile} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={LABEL_STYLE}>Registration number</label>
                        <input value={form.regNumber} onChange={e => f('regNumber')(e.target.value)} style={INPUT_STYLE}
                          placeholder="e.g. DSW/REG/001234" />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Tax ID <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                        <input value={form.taxId} onChange={e => f('taxId')(e.target.value)} style={INPUT_STYLE} placeholder="GRA Tax ID" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F3F4F6' }}>Payment details <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(for fund disbursement)</span></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div>
                        <label style={LABEL_STYLE}>Mobile Money number</label>
                        <input value={form.momoNumber} onChange={e => f('momoNumber')(e.target.value)} style={INPUT_STYLE} placeholder="024 XXX XXXX" />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>Bank name <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                        <input value={form.bankName} onChange={e => f('bankName')(e.target.value)} style={INPUT_STYLE} placeholder="e.g. GCB Bank" />
                      </div>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      <label style={LABEL_STYLE}>Bank account number <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                      <input value={form.bankAccount} onChange={e => f('bankAccount')(e.target.value)} style={INPUT_STYLE} placeholder="Account number" />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F3F4F6' }}>Online presence <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(optional but recommended)</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={LABEL_STYLE}>Website</label>
                        <input value={form.website} onChange={e => f('website')(e.target.value)} style={INPUT_STYLE} placeholder="https://yourorg.org" type="url" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <div>
                          <label style={LABEL_STYLE}>Facebook page</label>
                          <input value={form.facebook} onChange={e => f('facebook')(e.target.value)} style={INPUT_STYLE} placeholder="facebook.com/yourorg" />
                        </div>
                        <div>
                          <label style={LABEL_STYLE}>Instagram</label>
                          <input value={form.instagram} onChange={e => f('instagram')(e.target.value)} style={INPUT_STYLE} placeholder="@yourorg" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F3F4F6' }}>Impact <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400 }}>(optional — helps with Standard & Premium tier)</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={LABEL_STYLE}>Past projects or impact</label>
                        <textarea value={form.pastProjects} onChange={e => f('pastProjects')(e.target.value)}
                          style={{ ...INPUT_STYLE, resize: 'none' }} rows={3}
                          placeholder="Describe 2–3 past projects or the impact your organisation has made..." />
                      </div>
                      <div>
                        <label style={LABEL_STYLE}>References <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span></label>
                        <textarea value={form.references} onChange={e => f('references')(e.target.value)}
                          style={{ ...INPUT_STYLE, resize: 'none' }} rows={2}
                          placeholder="Name, title, and contact of someone who can vouch for your organisation..." />
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => { setError(''); setStep(3) }}
                  style={{ marginTop: 24, width: '100%', padding: '13px 0', background: '#0A6B4B', color: '#fff', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Continue to profile setup →
                </button>
                {error && <div style={{ marginTop: 12, fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>{error}</div>}
              </div>
            )}

            {/* ── STEP 3: Profile Setup ─────────────────── */}
            {step === 3 && (
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32 }}>
                <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B7280', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                  ← Back
                </button>
                <div style={SECTION_TITLE}>Step 3: Profile setup</div>
                <div style={SECTION_SUB}>This becomes your public organisation page on EveryGiving.</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={LABEL_STYLE}>Organisation description *</label>
                    <textarea value={form.description} onChange={e => f('description')(e.target.value)}
                      style={{ ...INPUT_STYLE, resize: 'none' }} rows={4} required
                      placeholder="Tell donors who you are, what you do, and why you raise money on EveryGiving..." />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>Mission statement *</label>
                    <textarea value={form.mission} onChange={e => f('mission')(e.target.value)}
                      style={{ ...INPUT_STYLE, resize: 'none' }} rows={2} required
                      placeholder="One or two sentences on your core mission..." />
                  </div>

                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid #F3F4F6' }}>Images</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <FileUploadBox label="Organisation logo" hint="Square PNG or JPG recommended" id="logo" accept="image/*" value={logoFile} onChange={setLogoFile} />
                      <FileUploadBox label="Cover image" hint="Wide banner — 1200×400px ideal" id="cover" accept="image/*" value={coverFile} onChange={setCoverFile} />
                    </div>
                  </div>

                  <div style={{ background: '#F0FBF6', border: '1px solid #A7F3D0', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#065F46', marginBottom: 4 }}>Tip: Create your first campaign after approval</div>
                    <div style={{ fontSize: 12, color: '#047857', lineHeight: 1.6 }}>
                      Once your organisation is approved, you can immediately create campaigns and start raising. Organisations with an active first campaign raise 3× more in their first month.
                    </div>
                  </div>
                </div>

                {error && <div style={{ marginTop: 16, fontSize: 12, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px' }}>{error}</div>}

                <button
                  onClick={() => {
                    if (!form.description || !form.mission) return setError('Please fill in description and mission.')
                    handleSubmit()
                  }}
                  disabled={loading}
                  style={{ marginTop: 24, width: '100%', padding: '14px 0', background: loading ? '#6B7280' : '#0A6B4B', color: '#fff', border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {loading ? 'Submitting application…' : 'Submit application →'}
                </button>
                <p style={{ marginTop: 12, fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 1.6 }}>
                  By submitting, you agree to our{' '}
                  <Link href="/terms" style={{ color: '#0A6B4B' }}>Terms</Link> and{' '}
                  <Link href="/privacy" style={{ color: '#0A6B4B' }}>Privacy Policy</Link>.
                  Our team reviews all applications within 2 business days.
                </p>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, padding: 20, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Why organisations choose EveryGiving</div>
              {[
                { icon: '✓', text: 'All organisations verified before receiving funds' },
                { icon: '✓', text: 'Secure payments powered by Paystack' },
                { icon: '✓', text: 'Transparent donation tracking for donors' },
                { icon: '✓', text: 'MoMo payouts — no bank account needed' },
                { icon: '✓', text: 'Your own public profile + campaign hub' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ color: '#0A6B4B', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div style={{ background: '#111827', borderRadius: 14, padding: 20, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Already registered?</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginBottom: 12 }}>Sign in to manage your organisation profile and campaigns.</p>
              <Link href="/auth/login" style={{ display: 'block', textAlign: 'center', background: '#fff', color: '#111827', fontWeight: 700, fontSize: 12, padding: '9px', borderRadius: 8, textDecoration: 'none' }}>
                Sign in →
              </Link>
            </div>

            <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#3730A3', marginBottom: 6 }}>Questions?</div>
              <p style={{ fontSize: 11, color: '#4338CA', lineHeight: 1.6, marginBottom: 10 }}>Our team is based in Accra and responds within a few hours.</p>
              <Link href="mailto:orgs@everygiving.org" style={{ fontSize: 11, fontWeight: 700, color: '#4338CA', textDecoration: 'underline' }}>
                orgs@everygiving.org
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
