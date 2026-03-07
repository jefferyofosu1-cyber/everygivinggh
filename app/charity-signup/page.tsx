'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

type OrgType = 'charity' | 'ngo' | 'church' | 'school' | 'hospital' | 'community' | 'corporate' | ''

const ORG_TYPES: { id: OrgType; label: string; icon: string; desc: string }[] = [
  { id: 'charity', label: 'Registered Charity', icon: '🤲', desc: 'Officially registered with Ghana\'s Department of Social Welfare' },
  { id: 'ngo', label: 'NGO / Non-profit', icon: '🌍', desc: 'Non-governmental organisation registered in Ghana' },
  { id: 'church', label: 'Church / Faith org', icon: '⛪', desc: 'Registered church, mosque or faith-based organisation' },
  { id: 'school', label: 'School / University', icon: '🎓', desc: 'Accredited educational institution' },
  { id: 'hospital', label: 'Hospital / Clinic', icon: '🏥', desc: 'Licensed medical facility or health organisation' },
  { id: 'community', label: 'Community group', icon: '🏘', desc: 'Formally organised community group or association' },
  { id: 'corporate', label: 'Corporate / Business', icon: '💼', desc: 'Company running a CSR or charitable programme' },
]

export default function CharitySignupPage() {
  const [orgType, setOrgType] = useState<OrgType>('')
  const [step, setStep] = useState<'type' | 'form' | 'done'>('type')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    orgName: '', regNumber: '', contactName: '', email: '', phone: '',
    website: '', description: '', address: '', password: '',
  })

  const selectedOrg = ORG_TYPES.find(o => o.id === orgType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          full_name: form.contactName,
          org_name: form.orgName,
          org_type: orgType,
          phone: form.phone,
          is_organisation: true,
        },
      },
    })

    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.contactName,
        phone: form.phone,
        org_name: form.orgName,
        org_type: orgType,
        reg_number: form.regNumber,
        is_organisation: true,
      })
    }
    setLoading(false)
    setStep('done')
  }

  if (step === 'done') return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-16">
        <div className="max-w-md w-full text-center">
          <div className="relative inline-flex w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl shadow-xl shadow-primary/30">✉️</div>
          </div>
          <h1 className="font-nunito font-black text-navy text-3xl mb-3">Application received!</h1>
          <p className="text-gray-500 text-sm mb-2">Check your email at <strong className="text-navy">{form.email}</strong></p>
          <p className="text-gray-400 text-xs mb-8 leading-relaxed">Confirm your email to activate your organisation account. Our team will review your registration within 2 business days.</p>
          <Link href="/" className="text-primary text-sm font-bold hover:underline">← Go to homepage</Link>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">

        {/* Header */}
        <section className="bg-navy py-14 px-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="relative max-w-2xl mx-auto text-center">
            <div className="inline-block bg-primary/15 border border-primary/30 text-primary text-xs font-bold px-4 py-1.5 rounded-full mb-4">Organisations & charities</div>
            <h1 className="font-nunito font-black text-white text-3xl md:text-4xl tracking-tight mb-3" style={{ letterSpacing: -1 }}>
              Register your organisation
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-lg mx-auto">
              Charities, NGOs, churches, schools and organisations get a dedicated verified page, bulk campaign tools and a donation tracker — all free.
            </p>
          </div>
        </section>

        <div className="max-w-2xl mx-auto px-5 py-10">

          {/* Benefits */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4">What organisations get</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '✅', label: 'Verified Organisation badge' },
                { icon: '📋', label: 'Multiple campaigns at once' },
                { icon: '📊', label: 'Full donation dashboard' },
                { icon: '📱', label: 'MoMo & bank payouts' },
                { icon: '📧', label: 'Donor CRM & email tools' },
                { icon: '🔗', label: 'Custom campaign URL' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{b.icon}</span>{b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1 — choose org type */}
          {step === 'type' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h2 className="font-nunito font-black text-navy text-xl mb-1">What type of organisation are you?</h2>
              <p className="text-gray-400 text-sm mb-6">This determines what verification documents we will need.</p>
              <div className="grid grid-cols-1 gap-3 mb-7">
                {ORG_TYPES.map(org => (
                  <button key={org.id} type="button" onClick={() => setOrgType(org.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${orgType === org.id ? 'border-primary bg-primary-light' : 'border-gray-100 hover:border-gray-200 bg-gray-50'}`}>
                    <span className="text-2xl flex-shrink-0">{org.icon}</span>
                    <div>
                      <div className={`font-nunito font-black text-sm ${orgType === org.id ? 'text-primary-dark' : 'text-navy'}`}>{org.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{org.desc}</div>
                    </div>
                    {orgType === org.id && <div className="ml-auto w-5 h-5 bg-primary rounded-full flex items-center justify-center flex-shrink-0"><span className="text-white text-xs font-black">✓</span></div>}
                  </button>
                ))}
              </div>
              <button disabled={!orgType} onClick={() => setStep('form')}
                className={`w-full py-4 font-nunito font-black rounded-full text-sm transition-all ${orgType ? 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — registration form */}
          {step === 'form' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{selectedOrg?.icon}</span>
                <div>
                  <h2 className="font-nunito font-black text-navy text-xl">Register as {selectedOrg?.label}</h2>
                  <button onClick={() => setStep('type')} className="text-primary text-xs hover:underline">Change type</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Organisation name *</label>
                    <input type="text" required value={form.orgName} onChange={e => setForm(p => ({ ...p, orgName: e.target.value }))}
                      placeholder="e.g. Hope Foundation Ghana"
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Registration number</label>
                    <input type="text" value={form.regNumber} onChange={e => setForm(p => ({ ...p, regNumber: e.target.value }))}
                      placeholder="DSW/CG/2024/0001"
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Website (optional)</label>
                    <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))}
                      placeholder="https://hopefoundation.org.gh"
                      className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <div className="text-xs font-bold text-navy uppercase tracking-wider mb-4">Contact person</div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Full name *</label>
                      <input type="text" required value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))}
                        placeholder="Kofi Mensah"
                        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Phone (MoMo) *</label>
                      <input type="tel" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        placeholder="024 000 0000"
                        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Email address *</label>
                      <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        placeholder="info@hopefoundation.org.gh"
                        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Password *</label>
                      <input type="password" required minLength={8} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder="At least 8 characters"
                        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Organisation address *</label>
                      <input type="text" required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                        placeholder="Location, City, Ghana"
                        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-1.5">Brief description *</label>
                      <textarea required rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                        placeholder="Briefly describe what your organisation does and who it serves…"
                        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none" />
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-700">
                  <strong>After submitting:</strong> Confirm your email, then our team will verify your organisation within 2 business days. You will receive an Organisation Verified badge once approved.
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('type')}
                    className="flex-1 py-4 border-2 border-gray-200 text-gray-600 font-nunito font-black rounded-full text-sm transition-all hover:border-gray-300">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-full text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-60">
                    {loading ? 'Submitting…' : 'Register organisation →'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <p className="text-center text-gray-400 text-xs mt-6">
            Individual fundraiser?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">Sign up here instead</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
