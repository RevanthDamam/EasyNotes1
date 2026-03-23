import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { BookOpen } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const success = await login(email, password)
    if (success) {
      const user = useStore.getState().user
      if (user.role === 'admin') navigate('/admin')
      else navigate('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center p-4">
      <div className="w-full max-w-sm glass-panel p-8 rounded-2xl">
        <div className="flex flex-col items-center mb-8">
          <BookOpen className="w-12 h-12 text-primary-600 mb-2" />
          <h2 className="text-2xl font-bold text-slate-900">Sign in to EasyNotes</h2>
          <p className="text-sm text-slate-500 mt-1">Access your academic resources</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" 
              placeholder="student@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" 
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full btn-primary text-base py-2.5 mt-2">
            Sign In
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
