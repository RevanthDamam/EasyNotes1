import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { GraduationCap, Mail, Lock, ArrowRight, BookOpen, Users, Star, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

// ── Canvas Ripple Effect ──────────────────────────────────────────────
function RippleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let ripples = []
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e) => {
      const x = e.clientX ?? e.touches?.[0]?.clientX
      const y = e.clientY ?? e.touches?.[0]?.clientY
      if (x == null) return
      ripples.push({ x, y, r: 0, alpha: 0.35 })
      if (ripples.length > 8) ripples.shift()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ripples = ripples.filter(rp => rp.alpha > 0.01)
      for (const rp of ripples) {
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(139,92,246,${rp.alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
        rp.r += 2.5
        rp.alpha *= 0.93
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="ripple-canvas" />
}

// ── Features list for left panel ─────────────────────────────────────
const features = [
  { icon: BookOpen,  text: 'Organized academic notes by subject & unit' },
  { icon: Users,     text: 'Role-based access for students & admins'     },
  { icon: Star,      text: 'Premium PDF viewer & instant downloads'       },
  { icon: Zap,       text: 'AI-powered study assistant built in'          },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const success = await login(email, password)
    setLoading(false)
    if (success) {
      const user = useStore.getState().user
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    }
  }

  return (
    <div className="auth-bg min-h-screen flex relative overflow-hidden">
      <RippleCanvas />

      {/* ── Decorative blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] rounded-full top-[-200px] left-[-200px] animate-spin-slow"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-[-100px] right-[-100px] animate-spin-slow"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, transparent 70%)', animationDirection: 'reverse' }} />
        <div className="absolute w-[250px] h-[250px] rounded-full top-[30%] left-[25%] animate-float"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* ── Left Panel (Info) ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg glow-indigo">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">EasyNotes</span>
        </motion.div>

        {/* Main Headline */}
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.2 }}
          className="space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
              Your academic<br />
              <span className="text-gradient">library, reimagined.</span>
            </h1>
            <p className="mt-5 text-lg text-white/50 leading-relaxed max-w-md">
              EasyNotes organizes your notes by regulation, year, and subject — so you always find what you need, instantly.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }, i) => (
              <motion.div key={i}
                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-white/08 border border-white/10 flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-white/60 text-sm">{text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
          className="text-white/20 text-xs">
          © 2025 EasyNotes. All rights reserved.
        </motion.p>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
          transition={{ duration:0.5, ease:'easeOut' }}
          className="w-full max-w-md glass-dark rounded-3xl p-10"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">EasyNotes</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-white/40 text-sm mt-1">Sign in to access your notes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="auth-label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-dark pl-10 w-full"
                  placeholder="you@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="auth-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-dark pl-10 w-full"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-2 py-3 text-sm font-semibold text-white rounded-xl flex items-center justify-center gap-2
                         bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                         shadow-md hover:shadow-indigo-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-white/30">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
