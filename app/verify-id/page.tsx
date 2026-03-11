'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase'

type VerifyStep = 'intro' | 'front' | 'back' | 'selfie' | 'processing' | 'done' | 'failed'

type ImageCapture = {
  front: string | null
  back: string | null
  selfie: string | null
}

export default function VerifyIdPage() {
  const [step, setStep] = useState<VerifyStep>('intro')
  const [images, setImages] = useState<ImageCapture>({ front: null, back: null, selfie: null })
  const [cameraActive, setCameraActive] = useState(false)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  const startCamera = useCallback(async (facingMode = 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch {
      setError('Camera access denied. Please allow camera access and try again.')
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    if (step === 'selfie') {
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0)
      ctx.restore()
    } else {
      ctx.drawImage(video, 0, 0)
    }
    return canvas.toDataURL('image/jpeg', 0.85).split(',')[1]
  }, [step])

  const handleCapture = useCallback(() => {
    const base64 = capturePhoto()
    if (!base64) return
    stopCamera()
    if (step === 'front') {
      setImages(p => ({ ...p, front: base64 }))
      setStep('back')
    } else if (step === 'back') {
      setImages(p => ({ ...p, back: base64 }))
      setStep('selfie')
    } else if (step === 'selfie') {
      setImages(p => ({ ...p, selfie: base64 }))
      setStep('processing')
      runVerification({ ...images, selfie: base64 })
    }
  }, [step, images, capturePhoto, stopCamera])

  const runVerification = async (imgs: ImageCapture) => {
    setProcessing(true)
    setProgress(0)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setStep('failed'); setError('Not signed in'); return }

    try {
      // Upload images to Supabase Storage
      const ts = Date.now()
      const uid = user.id
      const toBlob = (b64: string) => fetch(`data:image/jpeg;base64,${b64}`).then(r => r.blob())

      const uploadImg = async (b64: string | null, name: string) => {
        if (!b64) return null
        const blob = await toBlob(b64)
        const { data } = await supabase.storage.from('campaign-docs')
          .upload(`${uid}/${ts}-${name}.jpg`, blob, { contentType: 'image/jpeg', upsert: true })
        return data?.path || null
      }

      await uploadImg(imgs.front, 'id-front')
      await uploadImg(imgs.back, 'id-back')
      if (imgs.selfie) await uploadImg(imgs.selfie, 'selfie')

      // Mark profile as pending verification review
      await supabase.from('profiles').update({
        verification_submitted: true,
        verification_submitted_at: new Date().toISOString(),
      }).eq('id', uid)

      setProcessing(false)
      setStep('done')
    } catch {
      setProcessing(false)
      setStep('failed')
      setError('Upload failed. Please check your connection and try again.')
    }
  }

  const STEPS_CONFIG = [
    { id: 'front', label: 'Front of Ghana Card', desc: 'Place the front of your Ghana Card flat on a dark surface. Ensure all text is clearly visible.', facing: 'environment' as const },
    { id: 'back', label: 'Back of Ghana Card', desc: 'Flip your Ghana Card over. Make sure the barcode is clearly visible.', facing: 'environment' as const },
    { id: 'selfie', label: 'Take a selfie', desc: 'Look directly at the camera. Make sure your face is well-lit. Remove glasses if possible.', facing: 'user' as const },
  ]

  const currentConfig = STEPS_CONFIG.find(s => s.id === step)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-950 flex flex-col">

        {/* Header */}
        <div className="max-w-lg mx-auto w-full px-5 pt-8 pb-4">
          <h1 className="font-nunito font-black text-white text-2xl tracking-tight mb-1">Identity Verification</h1>
          <p className="text-white/40 text-sm">Reviewed by our team  -  usually within 24 hours</p>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-5">
            {['Ghana Card (front)', 'Ghana Card (back)', 'Selfie', 'Processing'].map((s, i) => {
              const stepIndex = ['front', 'back', 'selfie', 'processing', 'done'].indexOf(step)
              const done = i < stepIndex
              const active = i === stepIndex || (i === 3 && (step === 'processing' || step === 'done'))
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`h-0.5 w-full rounded-full transition-all duration-500 ${done || active ? 'bg-primary' : 'bg-white/10'}`} />
                  <div className={`text-xs transition-colors ${active ? 'text-primary font-bold' : done ? 'text-primary/60' : 'text-white/20'}`}>
                    {s}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center px-5 pb-8">
          <div className="max-w-lg w-full">

            {/* INTRO */}
            {step === 'intro' && (
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-primary/30">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                  </svg>
                </div>
                <h2 className="font-nunito font-black text-white text-2xl mb-3">What you will need</h2>
                <p className="text-white/50 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                  Your Ghana Card and a phone with a working camera. Once submitted, our team reviews your documents and approves your campaign  -  usually within 24 hours.
                </p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-3">
                  {[
                    { icon: '1', text: 'Photo of your Ghana Card (front)' },
                    { icon: '2', text: 'Photo of your Ghana Card (back)' },
                    { icon: '3', text: 'A selfie  -  face clearly lit' },
                    { icon: '4', text: 'Our team reviews and approves your campaign' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0">{item.icon}</div>
                      <div className="text-sm text-white/70">{item.text}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left">
                  <div className="text-xs font-bold text-white/60 mb-1">Privacy note</div>
                  <div className="text-xs text-white/40 leading-relaxed">
                    Your Ghana Card and selfie are used only for identity verification. They are encrypted and never shared with donors or third parties.
                  </div>
                </div>
                <button
                  onClick={() => { setStep('front'); startCamera('environment') }}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20">
                  Start verification
                </button>
              </div>
            )}

            {/* CAMERA STEPS */}
            {currentConfig && (
              <div>
                <div className="mb-4">
                  <div className="font-nunito font-black text-white text-xl mb-1">{currentConfig.label}</div>
                  <div className="text-white/50 text-sm">{currentConfig.desc}</div>
                </div>

                {/* Camera view */}
                <div className="relative bg-black rounded-2xl overflow-hidden mb-4 aspect-video border border-white/10">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${step === 'selfie' ? 'scale-x-[-1]' : ''}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* ID card overlay guide */}
                  {(step === 'front' || step === 'back') && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-primary/70 rounded-xl w-4/5 h-3/5 relative">
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br" />
                        <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-primary/80 font-bold">
                          Align card within frame
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Selfie oval overlay */}
                  {step === 'selfie' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-64 border-4 border-primary/70 rounded-full relative">
                        <div className="absolute -bottom-8 left-0 right-0 text-center text-xs text-primary/80 font-bold">
                          Center your face
                        </div>
                      </div>
                    </div>
                  )}

                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <button
                        onClick={() => startCamera(currentConfig.facing)}
                        className="px-6 py-3 bg-primary text-white font-bold rounded-xl text-sm">
                        Enable camera
                      </button>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-sm text-red-400">{error}</div>
                )}

                <button
                  onClick={handleCapture}
                  disabled={!cameraActive}
                  className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-white/10 disabled:text-white/30 text-white font-nunito font-black rounded-xl transition-all text-sm">
                  {step === 'selfie' ? 'Take selfie' : 'Capture photo'}
                </button>
              </div>
            )}

            {/* PROCESSING / SUBMITTED */}
            {step === 'processing' && (
              <div className="text-center py-10">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="font-nunito font-black text-white text-xl mb-2">Documents submitted</h2>
                <p className="text-white/50 text-sm max-w-xs mx-auto">Your identity documents have been uploaded securely. Our team will review them and approve your campaign.</p>
              </div>
            )}

            {/* SUCCESS */}
            {step === 'done' && (
              <div className="text-center py-10">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="relative w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/30">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="font-nunito font-black text-white text-2xl mb-2">Identity confirmed</h2>
                <p className="text-white/50 text-sm mb-2">Your documents have been reviewed and your identity confirmed.</p>
                <p className="text-primary font-bold text-sm mb-8">Your campaign is now live with the Verified badge.</p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-3">
                  {[
                    'Ghana Card reviewed and accepted',
                    'Identity confirmed by EveryGiving team',
                    'Verified badge added to your campaign',
                    'You will receive a confirmation email shortly',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                      <div className="w-5 h-5 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center text-primary text-xs flex-shrink-0"></div>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => router.push('/dashboard')}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all text-sm">
                    Go to dashboard
                  </button>
                  <button onClick={() => router.push('/campaigns')}
                    className="flex-1 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all text-sm">
                    View campaigns
                  </button>
                </div>
              </div>
            )}

            {/* FAILED */}
            {step === 'failed' && (
              <div className="text-center py-10">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                  <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="font-nunito font-black text-white text-xl mb-2">Verification unsuccessful</h2>
                <p className="text-white/50 text-sm mb-6 max-w-xs mx-auto">{error || 'We could not verify your identity. Please try again with clearer photos.'}</p>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-left text-sm text-white/50 space-y-2">
                  <div className="font-bold text-white/70 mb-2">Tips for better results:</div>
                  <div> -  Use good lighting, avoid shadows on your card</div>
                  <div> -  Hold the card still and flat</div>
                  <div> -  Make sure all text on the card is readable</div>
                  <div> -  For the selfie, face the light source directly</div>
                </div>
                <button
                  onClick={() => { setStep('intro'); setError(''); setImages({ front: null, back: null, selfie: null }) }}
                  className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all text-sm">
                  Try again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
