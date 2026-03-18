'use client'
import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  color: string
  friction: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      const particleCount = Math.min(50, Math.floor(window.innerWidth / 30))

      for (let i = 0; i < particleCount; i++) {
        const shapes = ['circle', 'square', 'triangle'] as const
        const colors = [
          'rgba(16, 185, 129, 0.3)', // emerald
          'rgba(59, 130, 246, 0.3)', // blue
          'rgba(139, 92, 246, 0.3)', // purple
          'rgba(236, 72, 153, 0.3)', // pink
        ]

        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -(Math.random() * 0.5 + 0.3), // upward velocity (negative = up)
          radius: Math.random() * 40 + 20,
          opacity: Math.random() * 0.4 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
          friction: 0.99,
        })
      }
    }

    initParticles()

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.active = true
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX
        mouseRef.current.y = e.touches[0].clientY
        mouseRef.current.active = true
      }
    }

    const handleTouchEnd = () => {
      mouseRef.current.active = false
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    // Animation loop
    const animate = () => {
      // Clear with trail effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.02)' // very subtle trail in dark mode
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i]

        // Apply anti-gravity (constant upward force)
        p.vy -= 0.05

        // Mouse repulsion
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x
          const dy = p.y - mouseRef.current.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          const repulsionRadius = 200

          if (distance < repulsionRadius) {
            const force = (1 - distance / repulsionRadius) * 0.8
            p.vx += (dx / distance) * force
            p.vy += (dy / distance) * force
          }
        }

        // Apply friction
        p.vx *= p.friction
        p.vy *= p.friction

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Bounce off edges
        const margin = 50
        if (p.x - p.radius < -margin) p.x = canvas.width + margin
        if (p.x + p.radius > canvas.width + margin) p.x = -margin
        if (p.y + p.radius < -margin) {
          p.y = canvas.height + margin
          p.vy = -(Math.random() * 0.5 + 0.3) // reset upward velocity
        }
        if (p.y - p.radius > canvas.height + margin) {
          p.y = -margin
          p.vy = -(Math.random() * 0.5 + 0.3)
        }

        // Draw particle with blur effect
        ctx.save()
        ctx.filter = `blur(${2}px)`
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity

        // Draw circle (simplified for performance)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ 
          zIndex: -10,
          background: 'linear-gradient(135deg, #0F172A 0%, #1A1F35 50%, #0F172A 100%)'
        }}
      />
      {/* Glassmorphism overlay */}
      <div 
        className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-slate-950/30" 
        style={{ zIndex: -9 }}
      />
    </>
  )
}
