import React, { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useStore } from './store'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import AiChat from './pages/AiChat'
import { LogOut, Library, User, Sparkles, GraduationCap, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />
  }
  return children
}

// ── Animated indicator follows active nav item ────────────────────────
function NavIndicator({ activeEl }) {
  const [style, setStyle] = useState({ left: 0, width: 0, opacity: 0 })

  useEffect(() => {
    if (!activeEl) return
    setStyle({
      left: activeEl.offsetLeft,
      width: activeEl.offsetWidth,
      opacity: 1,
    })
  }, [activeEl])

  return (
    <motion.div
      className="absolute top-1 bottom-1 rounded-xl bg-white shadow-sm border border-indigo-100/60"
      animate={style}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      style={{ height: 'calc(100% - 8px)' }}
    />
  )
}

const Layout = ({ children }) => {
  const { user, logout } = useStore()
  const location = useLocation()
  const navRef = useRef(null)
  const [activeEl, setActiveEl] = useState(null)

  const navItems = user?.role === 'admin' ? [
    { name: 'Dashboard', path: '/admin', icon: LayoutGrid },
  ] : [
    { name: 'Notes',    path: '/dashboard', icon: Library },
    { name: 'AI Chat',  path: '/chat',      icon: Sparkles },
    { name: 'Profile',  path: '/profile',   icon: User },
  ]

  useEffect(() => {
    if (!navRef.current) return
    const el = navRef.current.querySelector('.nav-tab.active')
    setActiveEl(el)
  }, [location.pathname])

  return (
    <div className="dashboard-bg min-h-screen">
      {/* ── Top Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}
              className="flex items-center gap-2.5 group cursor-pointer shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight hidden sm:block"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                EasyNotes
              </span>
            </Link>

            {/* Center Nav */}
            <nav ref={navRef} className="relative flex items-center gap-0.5 bg-surface-100/70 rounded-2xl p-1 backdrop-blur-sm">
              <NavIndicator activeEl={activeEl} />
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path ||
                  (item.path === '/admin' && location.pathname.startsWith('/admin'))
                return (
                  <Link key={item.path} to={item.path}
                    className={`nav-tab relative z-10 ${isActive ? 'active' : ''}`}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right: user badge + logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100/80 border border-surface-200/60">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-surface-600 capitalize">{user?.role}</span>
              </div>
              <button onClick={logout}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 rounded-xl
                           hover:text-red-600 hover:bg-red-50/80 transition-all duration-200 cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="pt-20 pb-12 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function App() {
  const { initAuth } = useStore()
  useEffect(() => { initAuth() }, [])
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

function AppRoutes() {
  const location = useLocation()
  return (
    <Routes location={location}>
      <Route path="/login"  element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentDashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/chat" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><AiChat /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App
