'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'medical', label: 'Medical Support', emoji: '🏥' },
  { value: 'education', label: 'Education', emoji: '🎓' },
  { value: 'church', label: 'Church Project', emoji: '⛪' },
  { value: 'emergency', label: 'Emergency', emoji: '🆘' },
  { value: 'business', label: 'Business', emoji: '💼' },
  { value: 'community', label: 'Community', emoji: '🏡' },
]

const STEPS = ['Campaign details', 'Your story', 'Verification', 'Payout setup']

export default function CreatePage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '', category: '', goal_amount: '', story: '', location: '',
    deadline: '', payout_method: 'momo', momo_number: ''
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { toast.error('Please sign in first'); router.push('/auth/login') }
      else setUser(data.user)
    })
  }, [])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!user) return
    setLoading(true)
    try {
      let image_url = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `campaigns/${user.id}-${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('campaign-images').upload(path, imageFile)
        if (!uploadErr) {
          const { data } = supabase.storage.from('campaign-images').getPublicUrl(path)
          image_url = data.publicUrl
        }
      }
      const { data, error } = await supabase.from('campaigns').insert({
        user_id: user.id, title: form.title, story: form.story,
        category: form.category, goal_amount: parseInt(form.goal_amount),
        location: form.location, deadline: form.deadline || null,
        image_url, status: 'pending'
      }).select().single()

      if (error) throw error
      toast.success('Campaign submitted! We\'ll review it within 24 hours. 🎉')
      router.push(`/campaigns/${data.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    }
    setLoading(false)
  }

  const nextStep = () => {
    if (step === 1 && (!form.title || !form.category || !form.goal_amount)) {
      toast.error('Please fill all required fields'); return
    }
    if (step === 2 && !form.story) {
      toast.error('Please write your story'); return
    }
    if (step < 4) setStep(s => s + 1)
    else handleSubmit()
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 py-10">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs font-bold transition-colors ${i + 1 === step ? 'text-primary' : i + 1 < step ? 'text-gray-400' : 'text-gray-200'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all ${i + 1 === step ? 'bg-primary border-primary text-white' : i + 1 < step ? 'bg-gray-200 border-gray-200 text-gray-500' : 'border-gray-200 text-gray-300'}`}>
                  {i + 1 < step ? '✓' : i + 1}
                </div>
                <span className="hidden md:block">{s}</span>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          {/* Step 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-nunito font-black text-navy text-xl mb-1">Tell us about your campaign</h2>
                <p className="text-gray-400 text-sm">Fill in the basic details to get started</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Category <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.value} type="button" onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${form.category === cat.value ? 'border-primary bg-primary-light' : 'border-gray-100 hover:border-gray-200'}`}>
                      <div className="text-xl mb-1">{cat.emoji}</div>
                      <div className={`text-xs font-bold ${form.category === cat.value ? 'text-primary-dark' : 'text-gray-600'}`}>{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Campaign title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={set('title')} maxLength={80} placeholder="e.g. Help Kwame fund his kidney surgery at Korle Bu"
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                <div className="text-xs text-gray-300 text-right mt-1">{form.title.length}/80</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Goal amount (₵) <span className="text-red-400">*</span></label>
                  <input type="number" value={form.goal_amount} onChange={set('goal_amount')} placeholder="30000"
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Location</label>
                  <input value={form.location} onChange={set('location')} placeholder="Accra, Ghana"
                    className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">End date (optional)</label>
                <input type="date" value={form.deadline} onChange={set('deadline')}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-nunito font-black text-navy text-xl mb-1">Share your story</h2>
                <p className="text-gray-400 text-sm">Be specific and honest — donors give more when they feel connected</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Your story <span className="text-red-400">*</span></label>
                <textarea value={form.story} onChange={set('story')} rows={8}
                  placeholder="Tell donors who needs help, why you're raising money, and exactly how the funds will be used. Be specific — mention names, amounts, and what happens if you reach your goal."
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-none" />
                <div className="text-xs text-gray-300 text-right mt-1">{form.story.length} characters</div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">Campaign photo</label>
                <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-gray-50">
                  {imagePreview ? (
                    <img src={imagePreview} className="h-32 object-cover rounded-lg" alt="Preview" />
                  ) : (
                    <>
                      <div className="text-3xl mb-2">📸</div>
                      <div className="text-sm font-bold text-gray-500">Click to upload photo</div>
                      <div className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</div>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-nunito font-black text-navy text-xl mb-1">Identity verification</h2>
                <p className="text-gray-400 text-sm">Verification is completely free and helps donors trust your campaign.</p>
              </div>
              <div className="bg-primary-light border border-primary/20 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🪪</span>
                  <div>
                    <div className="font-nunito font-black text-navy text-sm">Free verification</div>
                    <div className="text-xs text-gray-500 mt-0.5">Verified campaigns raise 3× more on average</div>
                  </div>
                  <div className="ml-auto bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Free</div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  After submitting your campaign, our team will reach out to verify your identity using your Ghana Card and any supporting documents. This adds a verified badge to your campaign and builds donor confidence.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '✓', text: 'Ghana Card verification' },
                  { icon: '✓', text: 'Verified badge on campaign' },
                  { icon: '✓', text: 'Higher donor trust' },
                  { icon: '✓', text: 'Reviewed within 24 hours' },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-primary font-bold">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Verification is optional but strongly recommended. You can skip it and still launch your campaign immediately.
              </p>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-nunito font-black text-navy text-xl mb-1">How do you want to get paid?</h2>
                <p className="text-gray-400 text-sm">Funds will be sent directly to your chosen method</p>
              </div>
              {[
                { value: 'momo', label: 'MTN MoMo', emoji: '📱' },
                { value: 'vodafone', label: 'Vodafone Cash', emoji: '📲' },
                { value: 'bank', label: 'Bank Transfer', emoji: '🏦' },
              ].map(method => (
                <div key={method.value} onClick={() => setForm(f => ({ ...f, payout_method: method.value }))}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all flex items-center gap-3 ${form.payout_method === method.value ? 'border-primary bg-primary-light/30' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className="text-2xl">{method.emoji}</div>
                  <div className="font-nunito font-extrabold text-navy text-sm">{method.label}</div>
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.payout_method === method.value ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {form.payout_method === method.value && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Mobile money number / Account number</label>
                <input value={form.momo_number} onChange={set('momo_number')} placeholder="+233 24 000 0000"
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
              </div>
              <div className="bg-primary-light border border-primary/20 rounded-xl p-4 text-sm text-primary-dark">
                <strong>🔒 Your payment info is secure</strong><br />
                Funds are released in stages after milestones are verified. You'll receive a notification when each release is processed.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:border-gray-300 transition-colors text-sm">
                ← Back
              </button>
            ) : <div />}
            <button onClick={nextStep} disabled={loading}
              className="px-7 py-2.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-px disabled:opacity-60 text-sm shadow">
              {loading ? 'Submitting...' : step === 4 ? '🚀 Submit campaign' : 'Continue →'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
