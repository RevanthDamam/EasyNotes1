import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
import { CloudUpload, Trash2, Edit, Files, LayoutList, Layers } from 'lucide-react'

const predefinedSubjects = {
  'R19-1-1': ['English', 'Mathematics I', 'Physics', 'Programming for Problem Solving'],
  'R20-1-1': ['English', 'Mathematics I', 'Physics', 'Programming for Problem Solving'],
  'R20-1-2': ['Mathematics II', 'Chemistry', 'Data Structures', 'Engineering Graphics'],
  'R20-2-1': ['DBMS', 'OOP', 'Digital Logic Design', 'Discrete Math'],
  // simplified for brevity
}

export default function AdminDashboard() {
  const { files, fetchFiles, uploadFile, deleteFile } = useStore()
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '', description: '', regulation: 'R20', year: '1', semester: '1', subject: '', file: null
  })
  const [filters, setFilters] = useState({
    regulation: '', year: '', semester: '', search: ''
  })

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const filteredFiles = files.filter(file => {
    return (!filters.regulation || file.regulation === filters.regulation) &&
           (!filters.year || file.year === String(filters.year)) &&
           (!filters.semester || file.semester === String(filters.semester)) &&
           (!filters.search || file.title.toLowerCase().includes(filters.search.toLowerCase()) || file.subject.toLowerCase().includes(filters.search.toLowerCase()));
  });

  const currentSubjects =
    predefinedSubjects[`${formData.regulation}-${formData.year}-${formData.semester}`] || ['General Subject']

  const allSubjects = Array.from(new Set([
    ...currentSubjects,
    ...files.map(f => f.subject).filter(Boolean)
  ]))

  const handleChange = (e) => {
    const { name, value, files: fileList } = e.target
    if (name === 'file') {
      setFormData({ ...formData, file: fileList[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)

    const data = new FormData()
    data.append('title', formData.title)
    data.append('description', formData.description)
    data.append('regulation', formData.regulation)
    data.append('year', formData.year)
    data.append('semester', formData.semester)
    data.append('subject', formData.subject)
    if (formData.file) data.append('file', formData.file)

    await uploadFile(data)
    setIsUploading(false)
    setFormData({ ...formData, file: null, title: '', description: '' })
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 p-6 md:p-10 rounded-[2.5rem] min-h-[calc(100vh-8rem)] border border-indigo-100/50 shadow-sm">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Control Panel</h1>
        <p className="text-slate-500 mt-1">Manage files and academic resources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 h-max">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <CloudUpload className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Upload Note</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="input-field" placeholder="E.g., DBMS Unit 1 Notes" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input-field h-20" placeholder="Optional details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Regulation</label>
                <select name="regulation" value={formData.regulation} onChange={handleChange} className="input-field">
                  <option value="R19">R19</option>
                  <option value="R20">R20</option>
                  <option value="R21">R21</option>
                  <option value="R22">R22</option>
                  <option value="R23">R23</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <select name="year" value={formData.year} onChange={handleChange} className="input-field">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                <select name="semester" value={formData.semester} onChange={handleChange} className="input-field">
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Type or select subject"
                  required
                  list="subjects-list"
                />
                <datalist id="subjects-list">
                  {allSubjects.map(sub => <option key={sub} value={sub} />)}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select File</label>
              <input type="file" name="file" required onChange={handleChange} className="input-field file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
            </div>

            <button type="submit" disabled={isUploading} className="w-full btn-primary flex justify-center items-center mt-2">
              {isUploading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </form>
        </div>

        {/* File List */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                <Files className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Uploaded Files Overview</h2>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <input 
                type="text" 
                placeholder="Search files..." 
                className="input-field py-1.5 px-3 text-sm w-32 xl:w-40 bg-white"
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
              <select 
                className="input-field py-1.5 px-2 text-sm w-24 bg-white"
                value={filters.regulation}
                onChange={e => setFilters({...filters, regulation: e.target.value})}
              >
                <option value="">All Regs</option>
                <option value="R19">R19</option>
                <option value="R20">R20</option>
                <option value="R21">R21</option>
                <option value="R22">R22</option>
                <option value="R23">R23</option>
              </select>
              <select 
                className="input-field py-1.5 px-2 text-sm w-20 bg-white"
                value={filters.year}
                onChange={e => setFilters({...filters, year: e.target.value})}
              >
                <option value="">All Yrs</option>
                <option value="1">Y1</option>
                <option value="2">Y2</option>
                <option value="3">Y3</option>
                <option value="4">Y4</option>
              </select>
              <select 
                className="input-field py-1.5 px-2 text-sm w-24 bg-white"
                value={filters.semester}
                onChange={e => setFilters({...filters, semester: e.target.value})}
              >
                <option value="">All Sems</option>
                <option value="1">Sem 1</option>
                <option value="2">Sem 2</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Title & Subject</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Categorization</th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map(file => (
                  <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-medium text-slate-800">{file.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{file.subject}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 mr-2">
                        {file.regulation}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                        Y{file.year} S{file.semester}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`http://localhost:5000${file.file_url}`, '_blank')}
                          className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                          title="View/Download"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this file?')) {
                              deleteFile(file.id)
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFiles.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-500 text-sm">
                      {files.length === 0 ? "No files uploaded yet." : "No files match the selected filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
