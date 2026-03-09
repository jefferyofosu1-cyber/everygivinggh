'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', location: '' })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setForm({ full_name: data.full_name || '', phone: data.phone || '', location: data.location || '' })
      setLoading(false)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      full_name: form.full_name,
      phone: form.phone,
      location: form.location,
    }).eq('id', user.id)
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-12 px-5">
        <div className="max-w-lg mx-auto">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-primary mb-6 inline-block">← Back to dashboard</Link>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h1 className="font-nunito font-black text-navy text-2xl mb-6">Edit profile</h1>

            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Full name</label>
                <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3.5 text-sm outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Phone / MoMo number</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="024 000 0000"
                  className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3.5 text-sm outline-none transition-all" />
                <p className="text-xs text-gray-400 mt-1.5">This is the number where campaign payouts will be sent</p>
              </div>
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">Location</label>
                <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Accra, Kumasi…"
                  className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3.5 text-sm outline-none transition-all" />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving || saved}
              className={`w-full mt-7 py-4 font-nunito font-black rounded-full text-sm transition-all ${saved ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/20'} disabled:opacity-70`}>
              {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
