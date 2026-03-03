'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, phone: form.phone } }
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Check your email to verify.')
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-nunito font-black text-2xl text-primary">EveryGiving</Link>
          <h1 className="font-nunito font-black text-navy text-2xl mt-4 mb-1">Create your account</h1>
          <p className="text-gray-400 text-sm">Free to start · No credit card needed</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            {[
              { key: 'full_name', label: 'Full name', type: 'text', placeholder: 'Kwame Mensah' },
              { key: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Phone number', type: 'tel', placeholder: '+233 24 000 0000' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">{field.label}</label>
                <input type={field.type} value={(form as any)[field.key]} onChange={set(field.key)} required
                  placeholder={field.placeholder}
                  className="w-full bg-gray-50 border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-nunito font-black py-3.5 rounded-xl transition-all hover:-translate-y-px disabled:opacity-60 mt-1">
              {loading ? 'Creating account...' : 'Create free account →'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            By signing up you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>
          </p>

          <div className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
