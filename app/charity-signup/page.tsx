'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

type OrgType = 'charity' | 'ngo' | 'church' | 'school' | 'hospital' | 'community' | 'corporate' | ''

const ORG_TYPES: { id: OrgType; label: string; icon: string; desc: string }[] = [
  { id: 'charity',   label: 'Registered Charity',  icon: '*', desc: 'Officially registered with Ghana\'s Department of Social Welfare' },
  { id: 'ngo',       label: 'NGO / Non-profit',     icon: '*', desc: 'Registered non-governmental organisation operating in Ghana' },
  { id: 'church',    label: 'Church / Faith org',   icon: '*', desc: 'Registered church, mosque, or faith-based organisation' },
  { id: 'school',    label: 'School / University',  icon: '*', desc: 'Accredited educational institution' },
  { id: 'hospital',  label: 'Hospital / Clinic',    icon: '*', desc: 'Licensed medical facility or health organisation' },
  { id: 'community', label: 'Community group',      icon: '*', desc: 'Formally organised community group or association' },
  { id: 'corporate', label: 'Corporate / Business', icon: '*', desc: 'Company operating a CSR or charitable giving programme' },
]

const GHANA_BANKS = [
  'GCB Bank', 'Absa Bank', 'Ecobank', 'Fidelity Bank', 'Stanbic Bank',
  'Standard Chartered', 'Zenith Bank', 'Access Bank', 'UBA Ghana',
  'Agricultural Development Bank', 'National Investment Bank',
  'Consolidated Bank Ghana', 'Prudential Bank', 'Republic Bank', 'Other',
]

export default function CharitySignupPage() {
  const [orgType, setOrgType] = useState<OrgType>('')
  const [step, setStep] = useState<'type' | 'form' | 'done'>('type')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    orgName: '', regNumber: '', contactName: '', email: '',
    phone: '', website: '', description: '', address: '', password: '',
  })

  const selectedOrg = ORG_TYPES.find(o => o.id === orgType)
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: form.contactName,
          org_name: form.orgName,
          org_type: orgType,
          reg_number: form.regNumber,
          is_organisation: true,
        },
      },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email,
        full_name: form.contactName,
        org_name: form.orgName,
        org_type: orgType,
        reg_number: form.regNumber,
        is_organisation: true,
        phone: form.phone,
        location: form.address,
      })

      await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'fundraiser_signup',
          user: {
            email: form.email,
            firstName: form.contactName,
            phone: form.phone
          }
        }),
      })
    }

    setStep('done')
    setLoading(false)
  }

  if (step === 'done') return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-primary-light via-white to-blue-50 flex items-center justify-center px-5 py-16">
        <div className="max-w-md w-full text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-primary/30"></div>
          </div>
          <h1 className="font-nunito font-black text-navy text-3xl mb-3">Application received!</h1>
          <p className="text-gray-500 text-sm mb-2 max-w-sm mx-auto leading-relaxed">
            Thank you for registering <strong className="text-navy">{form.orgName}</strong> on EveryGiving.
          </p>
          <p className="text-gray-400 text-xs mb-8 max-w-sm mx-auto leading-relaxed">
            Check your email to confirm your account. Our team will review your organisation and be in touch within 2 business days.
          </p>
          <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-white font-nunito font-black px-8 py-3.5 rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
            Back to home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <main>

        {/* Hero */}
        <section className="bg-navy py-14 px-5 relative overflow-hidden">
          <div className="relative max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-5">
               For organisations
            </div>
            <h1 className="font-nunito font-black text-white text-4xl md:text-5xl mb-4" style={{ letterSpacing: -1 }}>
              Charity & organisation<br />
              <span className="text-primary">sign up</span>
            </h1>
            <p className="text-white/55 text-sm max-w-lg mx-auto leading-relaxed">
              Registered charities, NGOs, churches, schools, hospitals, and community groups get a dedicated verified page and access to recurring fundraising tools.
            </p>
          </div>
        </section>

        <section className="py-14 bg-gray-50 px-5 min-h-screen">
          <div className="max-w-2xl mx-auto">

            {/* Step 1: Organisation type */}
            {step === 'type' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="font-nunito font-black text-navy text-2xl mb-2">What type of organisation are you?</h2>
                  <p className="text-gray-400 text-sm">This helps us set up the right account type for you.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mb-8">
                  {ORG_TYPES.map(org => (
                    <button key={org.id} onClick={() => setOrgType(org.id)}
                      className={`text-left p-4 rounded-2xl border-2 transition-all ${orgType === org.id ? 'border-primary bg-primary-light' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl mt-0.5">{org.icon}</span>
                        <div>
                          <div className={`font-nunito font-black text-sm ${orgType === org.id ? 'text-primary-dark' : 'text-navy'}`}>{org.label}</div>
                          <div className="text-xs text-gray-400 mt-0.5 leading-snug">{org.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button onClick={() => orgType && setStep('form')} disabled={!orgType}
                    className="bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-nunito font-black px-10 py-4 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm">
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Registration form */}
            {step === 'form' && selectedOrg && (
              <div>
                <button onClick={() => setStep('type')} className="flex items-center gap-2 text-gray-400 hover:text-navy text-sm font-semibold mb-6 transition-colors">
                  <span>←</span> Back
                </button>
                <div className="bg-primary-light border border-primary/20 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
                  <span className="text-2xl">{selectedOrg.icon}</span>
                  <div>
                    <div className="font-nunito font-black text-primary-dark text-sm">{selectedOrg.label}</div>
                    <div className="text-xs text-gray-500">{selectedOrg.desc}</div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col gap-5">

                  <div>
                    <div className="font-nunito font-black text-navy text-base mb-1">Organisation details</div>
                    <div className="text-xs text-gray-400">Your registered organisation information.</div>
                  </div>

                  {[
                    { label: 'Organisation name', key: 'orgName', placeholder: 'e.g. Bright Futures Foundation', required: true },
                    { label: 'Registration number', key: 'regNumber', placeholder: 'e.g. DSW/REG/001234' },
                  ].map(({ label, key, placeholder, required }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}{required && ' *'}</label>
                      <input value={(form as any)[key]} onChange={e => f(key)(e.target.value)} required={required}
                        placeholder={placeholder}
                        className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white" />
                    </div>
                  ))}

                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-nunito font-black text-navy text-base mb-1">Contact person</div>
                    <div className="text-xs text-gray-400 mb-4">The primary contact for this organisation account.</div>
                    <div className="flex flex-col gap-4">
                      {[
                        { label: 'Full name', key: 'contactName', placeholder: 'Your full name', type: 'text', required: true },
                        { label: 'Email address', key: 'email', placeholder: 'org@example.com', type: 'email', required: true },
                        { label: 'Phone number', key: 'phone', placeholder: '024 XXX XXXX', type: 'tel', required: true },
                        { label: 'Website (optional)', key: 'website', placeholder: 'https://yourorg.org', type: 'url' },
                      ].map(({ label, key, placeholder, type, required }) => (
                        <div key={key}>
                          <label className="block text-xs font-bold text-gray-600 mb-1.5">{label}{required && ' *'}</label>
                          <input value={(form as any)[key]} onChange={e => f(key)(e.target.value)} type={type} required={required}
                            placeholder={placeholder}
                            className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">About your organisation *</label>
                    <textarea value={form.description} onChange={e => f('description')(e.target.value)} required rows={4}
                      placeholder="Describe your organisation, its mission, and why you are raising money on EveryGiving..."
                      className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white resize-none" />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Organisation address *</label>
                    <input value={form.address} onChange={e => f('address')(e.target.value)} required
                      placeholder="Physical address of your organisation"
                      className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white" />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="font-nunito font-black text-navy text-base mb-1">Create your password</div>
                    <div className="text-xs text-gray-400 mb-3">You will use this to log in to your organisation dashboard.</div>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5">Password *</label>
                    <input value={form.password} onChange={e => f('password')(e.target.value)} type="password" required minLength={8}
                      placeholder="At least 8 characters"
                      className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-gray-50 focus:bg-white" />
                  </div>

                  {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm">{error}</div>}

                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-nunito font-black rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm">
                    {loading ? 'Submitting application...' : 'Submit organisation application'}
                  </button>

                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    By submitting, you agree to our{' '}
                    <Link href="/terms" className="text-primary underline">Terms</Link> and{' '}
                    <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
                    Our team will verify your registration within 2 business days.
                  </p>
                </form>
              </div>
            )}
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
