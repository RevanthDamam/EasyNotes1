import React, { useEffect, useState, useMemo } from 'react'
import { useStore } from '../store'
import { FileStack, Download, ShieldAlert, Layers, Search, Eye, X, FileBadge, ChevronRight, Library } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Utility to extract "Unit X" from a file title if it exists
const extractUnit = (title) => {
  const match = title.match(/unit[\s_-]*\d+/i);
  return match ? match[0].toUpperCase() : 'General Notes';
}

export default function StudentDashboard() {
  const { files, fetchFiles, isProfileIncomplete } = useStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSubject, setActiveSubject] = useState(null)
  const [viewingPdf, setViewingPdf] = useState(null)
  
  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    fetchFiles()
  }, [])

  // Group files by subject
  const groupedFiles = useMemo(() => {
    const grouped = files.reduce((acc, file) => {
      if (!acc[file.subject]) acc[file.subject] = [];
      acc[file.subject].push(file);
      return acc;
    }, {});
    return grouped;
  }, [files]);

  // Subjects filtered by search
  const subjects = useMemo(() => {
    return Object.keys(groupedFiles)
      .filter((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));
  }, [groupedFiles, searchTerm]);

  // Set initial active subject if none is selected and subjects are loaded
  useEffect(() => {
    if (!activeSubject && subjects.length > 0) {
      setActiveSubject(subjects[0]);
    } else if (activeSubject && !subjects.includes(activeSubject) && subjects.length > 0) {
      setActiveSubject(subjects[0]);
    } else if (subjects.length === 0) {
      setActiveSubject(null);
    }
  }, [subjects, activeSubject]);


  // Group files of the active subject by Unit
  const activeSubjectFiles = activeSubject ? groupedFiles[activeSubject] : [];
  
  const filesByUnit = useMemo(() => {
    const grouped = activeSubjectFiles.reduce((acc, file) => {
      const unit = extractUnit(file.title);
      if (!acc[unit]) acc[unit] = [];
      acc[unit].push(file);
      return acc;
    }, {});

    // Sort units: Unit 1, Unit 2... General Notes
    return Object.entries(grouped).sort(([unitA], [unitB]) => {
      if (unitA === 'General Notes') return 1;
      if (unitB === 'General Notes') return -1;
      return unitA.localeCompare(unitB);
    });
  }, [activeSubjectFiles]);


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

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 p-2 md:p-6 rounded-[2.5rem] border border-indigo-100/50 shadow-sm">
      
      {/* LEFT SIDEBAR (Subjects) */}
      <div className={`
        fixed md:static inset-0 z-40 md:z-0
        bg-surface-50 md:bg-white/80 md:backdrop-blur-md
        transition-transform duration-300 md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-full md:w-80 shrink-0 md:rounded-3xl border border-slate-200/60 shadow-sm flex flex-col overflow-hidden
      `}>
        {/* Mobile Sidebar Close Button */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
          <h2 className="font-semibold text-slate-800">Subjects</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 border-b border-slate-100/60">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight hidden md:block mb-4">Subject Library</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search subjects..."
              className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:border-primary-400 focus:ring-2 focus:ring-primary-100 rounded-xl pl-9 pr-4 py-2 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {subjects.length === 0 ? (
            <div className="p-6 text-center">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No subjects found.</p>
            </div>
          ) : (
            subjects.map(subject => {
              const isActive = activeSubject === subject;
              return (
                <button
                  key={subject}
                  onClick={() => {
                    setActiveSubject(subject);
                    setIsSidebarOpen(false); // Close on mobile after selection
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary-50 to-white shadow-sm border border-primary-100/50 text-primary-700' 
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent'}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-primary-100/50 text-primary-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                      <Library className="w-4 h-4" />
                    </div>
                    <span className={`font-medium text-sm line-clamp-2 ${isActive ? 'font-semibold' : ''}`}>
                      {subject}
                    </span>
                  </div>
                  {isActive && (
                    <motion.div layoutId="active-indicator" className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* OVERLAY FOR MOBILE */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
        
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center p-4 border-b border-slate-200/60 bg-white mb-2 shadow-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center text-primary-600 font-medium">
            <ChevronRight className="w-5 h-5 mr-1" />
            <span className="truncate">{activeSubject || 'Select Subject'}</span>
          </button>
        </div>

        {!activeSubject ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Layers className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700">Select a Subject</h3>
            <p className="text-slate-500 mt-2 max-w-sm">
              Choose a subject from the sidebar to view its units and related PDF resources.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={activeSubject}
              className="space-y-12"
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{activeSubject}</h1>
                <div className="hidden sm:flex items-center px-4 py-1.5 bg-primary-50 border border-primary-100 rounded-full text-primary-700 text-sm font-medium">
                  {activeSubjectFiles.length} Resource{activeSubjectFiles.length !== 1 ? 's' : ''}
                </div>
              </div>

              {filesByUnit.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-slate-500">No units found under this subject.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {filesByUnit.map(([unit, filesInUnit], unitIdx) => (
                    <motion.div 
                      key={unit}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: unitIdx * 0.05 }}
                    >
                      <h2 className="text-xl font-semibold text-slate-700 mb-6 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-primary-400 mr-3"></span>
                        {unit}
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filesInUnit.map(file => (
                          <div 
                            key={file.id} 
                            className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-200 flex flex-col h-full relative overflow-hidden"
                          >
                            {/* Decorative top accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-primary-400 group-hover:to-primary-600 transition-all duration-500" />
                            
                            <div className="flex items-start mb-4">
                              <div className="p-2.5 bg-red-50 text-red-500 rounded-xl mr-4 shrink-0 shadow-sm border border-red-100 backdrop-blur-sm">
                                <FileStack className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-800 text-base leading-tight mb-1 truncate" title={file.title}>
                                  {file.title}
                                </h3>
                                {/* File Type Badge */}
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                    <FileBadge className="w-3 h-3 mr-1" /> PDF
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {new Date(file.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                {file.description || "No specific description provided for this resource."}
                              </p>
                            </div>
                            
                            <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100/80">
                              <button 
                                onClick={() => setViewingPdf(`http://localhost:5000${file.file_url}`)}
                                className="flex-1 flex items-center justify-center py-2 px-3 bg-white border border-slate-200 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 text-slate-600 text-sm font-medium rounded-xl transition-colors duration-200"
                              >
                                <Eye className="w-4 h-4 mr-1.5" />
                                View
                              </button>
                              
                              <a 
                                href={`http://localhost:5000${file.file_url}`}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 flex items-center justify-center py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20 text-sm font-medium rounded-xl transition-all duration-200"
                              >
                                <Download className="w-4 h-4 mr-1.5" />
                                Download
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>

      {/* PDF VIEWER MODAL */}
      <AnimatePresence>
        {viewingPdf && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden border border-white/20"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                    <FileStack className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">Document Viewer</h3>
                    <p className="text-xs text-slate-500">Secure PDF Presentation</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <a 
                    href={viewingPdf}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="hidden sm:flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </a>
                  <button 
                    onClick={() => setViewingPdf(null)}
                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-slate-200 relative">
                {/* iFrame for PDF loading */}
                <iframe 
                  src={viewingPdf} 
                  className="w-full h-full border-0"
                  title="PDF Viewer"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
