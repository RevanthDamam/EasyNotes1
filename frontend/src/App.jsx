import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useStore } from './store'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import AiChat from './pages/AiChat'
import { LogOut, BookOpen, User, MessageCircle, Settings } from 'lucide-react'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" />
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />
  }
  return children
}

const Layout = ({ children }) => {
  const { user, logout } = useStore()
  const location = useLocation()

  const navItems = user?.role === 'admin' ? [
    { name: 'Dashboard', path: '/admin', icon: BookOpen }
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: BookOpen },
    { name: 'AI Chat', path: '/chat', icon: MessageCircle },
    { name: 'Profile', path: '/profile', icon: User },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-10 flex flex-col">
        <div className="flex items-center justify-center hidden sm:flex h-16 border-b border-slate-200">
          <BookOpen className="w-8 h-8 text-primary-600 mr-2" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-teal-500">EasyNotes</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={logout} className="nav-link w-full text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 sm:hidden">
          <span className="text-xl font-bold text-slate-800">EasyNotes</span>
        </header>
        <div className="p-8 pb-24 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

function App() {
  const { initAuth } = useStore()

  useEffect(() => {
    initAuth()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <StudentDashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <AiChat />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
