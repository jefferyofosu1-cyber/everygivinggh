'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const TOPICS = [
  'My campaign is not showing up',
  'Verification failed',
  'I haven\'t received my payout',
  'I want to report a suspicious campaign',
  'Account login or password issue',
  'Privacy or data request',
  'Press or partnership enquiry',
  'Something else',
]

type FormState = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactPage() {
  const [topic, setTopic] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')

  const handleSubmit = async () => {
    if (!name || !email || !message || !topic) return
    setFormState('sending')
    // In production, wire this to your API route or a form service like Formspree
    // For now we simulate a submission delay
    await new Promise(r => setTimeout(r, 1200))
    // Redirect to mailto as fallback  -  replace with real API call
    const subject = encodeURIComponent(`[Every Giving Contact] ${topic}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`)
    window.location.href = `mailto:business@everygiving.org?subject=${subject}&body=${body}`
    setFormState('sent')
  }

  return (
    <>
      <Navbar />
      <main>

        {/* ── HEADER ── */}
        <section className="bg-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(2,169,92,.1), transparent 65%)', transform: 'translate(30%, -30%)' }} />
          <div className="relative max-w-4xl mx-auto px-5 py-16 md:py-20">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 tracking-widest uppercase">
              Get in touch
            </div>
            <h1 className="font-nunito font-black text-white text-3xl md:text-5xl tracking-tight mb-4 leading-tight" style={{ letterSpacing: -1 }}>
              We're here to help.
            </h1>
            <p className="text-white/40 text-sm leading-relaxed max-w-md">
              We respond to all enquiries within 2 business days. For urgent payout issues, include your campaign name and registered phone number in your message.
            </p>
          </div>
        </section>

        {/* ── MAIN CONTENT ── */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-5">
            <div className="grid md:grid-cols-5 gap-8">

              {/* ── LEFT  -  CONTACT INFO ── */}
              <div className="md:col-span-2 flex flex-col gap-4">

                {/* Direct email */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div className="font-nunito font-black text-navy text-sm mb-1">Email us directly</div>
                  <a href="mailto:business@everygiving.org" className="text-primary text-sm font-semibold hover:underline">
                    business@everygiving.org
                  </a>
                  <div className="text-gray-400 text-xs mt-2 leading-relaxed">We reply within 2 business days. Urgent payout issues are prioritised for same-day resolution.</div>
                </div>

                {/* Response times */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="font-nunito font-black text-navy text-sm mb-4">Typical response times</div>
                  <div className="flex flex-col gap-3">
                    {[
                      { type: 'Payout issues', time: 'Same day', color: 'text-primary' },
                      { type: 'Verification help', time: '24 hours', color: 'text-primary' },
                      { type: 'General questions', time: '2 business days', color: 'text-gray-500' },
                      { type: 'Press enquiries', time: '3 business days', color: 'text-gray-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{item.type}</span>
                        <span className={`font-bold ${item.color}`}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick links */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="font-nunito font-black text-navy text-sm mb-4">Quick answers</div>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Help Centre & FAQ', href: '/help' },
                      { label: 'How verification works', href: '/how-it-works' },
                      { label: 'Terms & Conditions', href: '/terms' },
                      { label: 'Privacy Policy', href: '/privacy' },
                    ].map((link, i) => (
                      <Link key={i} href={link.href}
                        className="flex items-center justify-between text-sm text-gray-500 hover:text-primary transition-colors py-1 group">
                        <span>{link.label}</span>
                        <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>

              {/* ── RIGHT  -  FORM ── */}
              <div className="md:col-span-3">
                <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">

                  {formState === 'sent' ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="20,6 9,17 4,12"/></svg>
                      </div>
                      <div className="font-nunito font-black text-navy text-xl mb-2">Message sent</div>
                      <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">Your email app should have opened with your message ready. We will respond within 2 business days.</p>
                      <button onClick={() => setFormState('idle')}
                        className="text-primary text-sm font-bold hover:underline">
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="font-nunito font-black text-navy text-xl mb-1">Send us a message</div>
                      <p className="text-gray-400 text-sm mb-6">Fill in the form and we'll get back to you.</p>

                      <div className="flex flex-col gap-4">

                        {/* Topic */}
                        <div>
                          <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>What is this about?</label>
                          <div className="grid grid-cols-1 gap-2">
                            {TOPICS.map(t => (
                              <button key={t} onClick={() => setTopic(t)}
                                className={`text-left text-sm px-4 py-3 rounded-xl border-2 transition-all font-medium ${topic === t ? 'border-primary bg-primary-light text-primary-dark' : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-gray-50'}`}>
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Name */}
                        <div>
                          <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Your name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ama Mensah"
                            className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 outline-none transition-all"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Email address</label>
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="ama@example.com"
                            className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 outline-none transition-all"
                          />
                        </div>

                        {/* Message */}
                        <div>
                          <label className="block text-xs font-bold text-navy mb-2 uppercase tracking-wider" style={{ fontFamily: 'DM Mono, monospace' }}>Message</label>
                          <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={5}
                            placeholder="Describe your issue or question in as much detail as possible. Include your campaign name if relevant."
                            className="w-full border-2 border-gray-100 focus:border-primary rounded-xl px-4 py-3 text-sm text-navy placeholder-gray-300 outline-none transition-all resize-none"
                          />
                        </div>

                        {/* Submit */}
                        <button
                          onClick={handleSubmit}
                          disabled={!name || !email || !message || !topic || formState === 'sending'}
                          className={`w-full font-nunito font-black text-sm py-4 rounded-full transition-all ${
                            !name || !email || !message || !topic
                              ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              : 'bg-primary hover:bg-primary-dark text-white hover:-translate-y-0.5 shadow-lg shadow-primary/25'
                          }`}>
                          {formState === 'sending' ? 'Opening email…' : 'Send message →'}
                        </button>

                        <p className="text-xs text-gray-300 text-center">
                          Or email directly at{' '}
                          <a href="mailto:business@everygiving.org" className="text-primary hover:underline">business@everygiving.org</a>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── REPORT FRAUD ── */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-5">
            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 flex items-start gap-5">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <div className="font-nunito font-black text-red-700 text-base mb-1">Report a suspicious campaign</div>
                <p className="text-red-600/70 text-sm leading-relaxed mb-3">
                  If you believe a campaign is fraudulent, misleading, or being used for illegal purposes, please contact us immediately. We take all reports seriously and investigate within 24 hours.
                </p>
                <a href="mailto:business@everygiving.org?subject=Fraud Report"
                  className="inline-block bg-red-500 hover:bg-red-600 text-white font-nunito font-black text-xs px-5 py-2.5 rounded-full transition-all hover:-translate-y-0.5">
                  Report fraud →
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
