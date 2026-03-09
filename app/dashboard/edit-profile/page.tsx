'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

const BANKS = ['GCB Bank','Absa Ghana','Ecobank Ghana','Fidelity Bank','Stanbic Bank','Cal Bank','Access Bank','Standard Chartered','Republic Bank','Agricultural Development Bank (ADB)','National Investment Bank (NIB)','Consolidated Bank Ghana','OmniBSIC Bank','Prudential Bank','Universal Merchant Bank (UMB)','First Atlantic Bank','Zenith Bank','Guaranty Trust Bank','ARB Apex Bank','Other']

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    full_name: '', phone: '', whatsapp: '', mobile_network: '', location: '',
    payout_method: 'momo',
    momo_number: '', momo_network: '',
    bank_name: '', bank_account: '',
    address: '', landmark: '', gps_address: '',
  })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setForm({
        full_name: data.full_name || '', phone: data.phone || '', whatsapp: data.whatsapp || '',
        mobile_network: data.mobile_network || '', location: data.location || '',
        payout_method: data.payout_method || 'momo',
        momo_number: data.momo_number || '', momo_network: data.momo_network || '',
        bank_name: data.bank_name || '', bank_account: data.bank_account || '',
        address: data.address || '', landmark: data.landmark || '', gps_address: data.gps_address || '',
      })
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update(form).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); router.push('/dashboard') }, 1200)
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  )

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <div>
      <label className="text-xs font-bold text-gray-500 block mb-1.5">{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)} placeholder={placeholder}
        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all" />
    </div>
  )

  const select = (label: string, key: string, options: {value: string, label: string}[]) => (
    <div>
      <label className="text-xs font-bold text-gray-500 block mb-1.5">{label}</label>
      <select value={(form as any)[key]} onChange={e => set(key, e.target.value)}
        className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-all bg-white">
        <option value="">Select…</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12 px-5">
        <div className="max-w-lg mx-auto">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-primary mb-6 inline-block">← Back to dashboard</Link>
          <h1 className="font-nunito font-black text-navy text-2xl mb-6">Edit profile</h1>

          <div className="flex flex-col gap-5">

            {/* Personal */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-black text-navy uppercase tracking-wider mb-4">Personal information</div>
              <div className="flex flex-col gap-4">
                {field('Full name', 'full_name', 'text', 'Your full legal name')}
                <div className="grid grid-cols-2 gap-3">
                  {field('Phone number', 'phone', 'tel', '024 000 0000')}
                  {field('WhatsApp number', 'whatsapp', 'tel', 'Same as phone?')}
                </div>
                {select('Mobile network', 'mobile_network', [
                  { value: 'mtn', label: 'MTN' },
                  { value: 'telecel', label: 'Telecel (Vodafone)' },
                  { value: 'airteltigo', label: 'AirtelTigo' },
                ])}
                {field('City / region', 'location', 'text', 'e.g. Accra, Kumasi…')}
              </div>
            </div>

            {/* Payout */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-black text-navy uppercase tracking-wider mb-4">Payout method</div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[{ id: 'momo', label: '📱 Mobile Money' }, { id: 'bank', label: '🏦 Bank account' }].map(opt => (
                  <button key={opt.id} type="button" onClick={() => set('payout_method', opt.id)}
                    className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${form.payout_method === opt.id ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-400 hover:border-gray-200'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {form.payout_method === 'momo' && (
                <div className="flex flex-col gap-3">
                  {field('MoMo number', 'momo_number', 'tel', '024 000 0000')}
                  {select('MoMo network', 'momo_network', [
                    { value: 'mtn', label: 'MTN MoMo' },
                    { value: 'telecel', label: 'Telecel Cash' },
                    { value: 'airteltigo', label: 'AirtelTigo Money' },
                  ])}
                </div>
              )}
              {form.payout_method === 'bank' && (
                <div className="flex flex-col gap-3">
                  {select('Bank name', 'bank_name', BANKS.map(b => ({ value: b, label: b })))}
                  {field('Account number', 'bank_account', 'text', 'Your account number')}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-xs font-black text-navy uppercase tracking-wider mb-4">Address <span className="text-gray-300 font-normal normal-case">(optional)</span></div>
              <div className="flex flex-col gap-3">
                {field('Home / office address', 'address', 'text', 'e.g. 14 Cantonments Road, Accra')}
                {field('Nearest landmark', 'landmark', 'text', 'e.g. Near Kotoka Airport')}
                <div>
                  {field('Ghana Post GPS address', 'gps_address', 'text', 'e.g. GA-123-4567')}
                  <p className="text-xs text-gray-400 mt-1.5">Find yours at <a href="https://ghanapostgps.com" target="_blank" className="text-primary">ghanapostgps.com</a></p>
                </div>
              </div>
            </div>

          </div>

          <button onClick={handleSave} disabled={saving || saved}
            className={`w-full mt-6 py-4 font-nunito font-black rounded-full text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20'} disabled:opacity-70`}>
            {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}
