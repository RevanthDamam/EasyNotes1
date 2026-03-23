import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
import { FileText, Download, ShieldAlert, Folder, Search } from 'lucide-react'

export default function StudentDashboard() {
  const { files, fetchFiles, isProfileIncomplete } = useStore()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchFiles()
  }, [])

  if (isProfileIncomplete) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-slate-200 mt-10">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Profile Incomplete</h2>
        <p className="text-slate-600 text-center max-w-md">
          Please complete your profile (Regulation, Year, Semester) to view your personalized study materials and notes.
        </p>
      </div>
    )
  }

  // Group files by subject
  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.subject]) acc[file.subject] = []
    acc[file.subject].push(file)
    return acc
  }, {})

  // Filter based on search term
  const subjects = Object.entries(groupedFiles)
    .filter(([subject]) => subject.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Your Dashboard</h1>
          <p className="text-slate-500 mt-1">Access notes tailored to your curriculum</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            className="input-field pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed">
          <Folder className="w-16 h-16 text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No notes found</h3>
          <p className="text-slate-500 mt-2 text-center max-w-sm">No materials have been uploaded for your current academic profile or matching your search.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {subjects.map(([subject, subjectFiles]) => (
            <div key={subject} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-primary-50 px-6 py-4 border-b border-primary-100 flex items-center">
                <Book className="w-5 h-5 text-primary-600 mr-2" />
                <h2 className="text-xl font-semibold text-primary-900">{subject}</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {subjectFiles.map(file => (
                  <div key={file.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-start mb-4 md:mb-0">
                      <FileText className="w-10 h-10 text-primary-400 mr-4 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-lg font-medium text-slate-800">{file.title}</h3>
                        <p className="text-sm text-slate-500 mt-1 max-w-xl">{file.description}</p>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center">
                      <span className="text-xs text-slate-400 mr-4 hidden md:inline-block">
                        {new Date(file.created_at).toLocaleDateString()}
                      </span>
                      <a
                        href={`http://localhost:5000${file.file_url}`}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary flex items-center shadow-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Book(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}
