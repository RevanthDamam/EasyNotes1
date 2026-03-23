import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
import { User, ShieldAlert, CheckCircle2 } from 'lucide-react'

export default function Profile() {
  const { profile, fetchProfile, updateProfile, isProfileIncomplete } = useStore()
  const [formData, setFormData] = useState({
    regulation: '', year: '', semester: '', leetcode_url: '', github_url: '', custom_links: []
  })

  useEffect(() => {
    fetchProfile().then(p => {
      if (p) {
        setFormData({
          regulation: p.regulation || '',
          year: p.year || '',
          semester: p.semester || '',
          leetcode_url: p.leetcode_url || '',
          github_url: p.github_url || '',
          custom_links: p.custom_links || []
        })
      }
    })
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProfile(formData)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {isProfileIncomplete && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start shadow-sm">
          <ShieldAlert className="w-5 h-5 text-amber-500 mr-3 mt-0.5" />
          <div>
            <h3 className="text-amber-800 font-medium">Profile Incomplete</h3>
            <p className="text-amber-700 text-sm mt-1">
              Please complete your academic profile (Regulation, Year, Semester) to access notes.
            </p>
          </div>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-8">
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-full">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Student Profile</h2>
            <p className="text-slate-500 text-sm">Manage your academic identity</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Regulation *</label>
              <select name="regulation" required value={formData.regulation} onChange={handleChange} className="input-field">
                <option value="">Select Regulation</option>
                <option value="R19">R19</option>
                <option value="R20">R20</option>
                <option value="R21">R21</option>
                <option value="R22">R22</option>
                <option value="R23">R23</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year *</label>
              <select name="year" required value={formData.year} onChange={handleChange} className="input-field">
                <option value="">Select Year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Semester *</label>
              <select name="semester" required value={formData.semester} onChange={handleChange} className="input-field">
                <option value="">Select Sem</option>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GitHub Profile</label>
              <input type="url" name="github_url" value={formData.github_url} onChange={handleChange} className="input-field" placeholder="https://github.com/YourUsername" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">LeetCode Profile</label>
              <input type="url" name="leetcode_url" value={formData.leetcode_url} onChange={handleChange} className="input-field" placeholder="https://leetcode.com/YourUsername" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn-primary flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
