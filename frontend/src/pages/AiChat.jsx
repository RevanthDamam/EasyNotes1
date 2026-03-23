import React, { useState, useRef, useEffect, useMemo } from 'react'
import axios from 'axios'
import { MessageCircle, Send, User, Bot, Loader2, Library, Layers, Sparkles, BookOpen, PenTool, MessageSquare, Copy, Check, RefreshCw } from 'lucide-react'
import { useStore } from '../store'
import { motion, AnimatePresence } from 'framer-motion'

// Utility to parse unit from title
const extractUnit = (title) => {
  const match = title.match(/unit[\s_-]*\d+/i);
  return match ? match[0].toUpperCase() : 'General Notes';
}

const MODES = [
  { id: 'qa_mode', label: 'Q&A Mode', icon: MessageSquare, desc: 'Direct, clear answers' },
  { id: 'quick_revision', label: 'Quick Revision', icon: Sparkles, desc: 'Fast exam review' },
  { id: 'detailed_explanation', label: 'Detailed Explanation', icon: BookOpen, desc: '10-mark answers' },
  { id: 'practice_mode', label: 'Practice Mode', icon: PenTool, desc: 'Self testing' },
]

export default function AiChat() {
  const { files, fetchFiles } = useStore()
  const [messages, setMessages] = useState([{ 
    id: 'welcome', 
    role: 'system', 
    content: 'Hello! I am your AI study assistant. Configure your study mode above and ask me anything.' 
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  
  // Settings
  const [activeMode, setActiveMode] = useState('qa_mode')
  const [selectedSubject, setSelectedSubject] = useState('None')
  const [selectedUnit, setSelectedUnit] = useState('None')
  
  const endRef = useRef(null)

  useEffect(() => {
    fetchFiles()
  }, [])

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Derive subjects and units
  const availableSubjects = useMemo(() => {
    const subs = Array.from(new Set(files.map(f => f.subject).filter(Boolean)));
    return subs.sort((a,b) => a.localeCompare(b));
  }, [files])

  const availableUnits = useMemo(() => {
    if (selectedSubject === 'None') return [];
    const subjectFiles = files.filter(f => f.subject === selectedSubject);
    const units = Array.from(new Set(subjectFiles.map(f => extractUnit(f.title))));
    return units.sort((a,b) => a.localeCompare(b));
  }, [files, selectedSubject])

  // Reset unit if subject changes
  useEffect(() => {
    setSelectedUnit('None');
  }, [selectedSubject]);

  const sendMessage = async (textToSubmit, isRegenerate = false) => {
    if (!textToSubmit.trim() || isLoading) return;

    if (!isRegenerate) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: textToSubmit }]);
      setInput('');
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post('/ai/chat', { 
        message: textToSubmit,
        mode: activeMode,
        subject: selectedSubject,
        unit: selectedUnit
      });
      setMessages(prev => [...prev, { id: Date.now().toString() + '_sys', role: 'system', content: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString() + '_err', role: 'system', content: "Sorry, I'm having trouble connecting to the AI core right now." }]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  }

  const handleRegenerate = () => {
    // Find the last user message
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        sendMessage(messages[i].content, true);
        return;
      }
    }
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-glow-indigo rounded-xl">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AI Study Assistant</h1>
            <p className="text-slate-500 text-sm mt-0.5">Context-aware personalized tutoring</p>
          </div>
        </div>

        {/* ── Context Selectors ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Library className="w-4 h-4" />
            </div>
            <select 
              className="appearance-none pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 shadow-sm rounded-xl text-slate-700 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 cursor-pointer"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              <option value="None">Global Context</option>
              {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Layers className="w-4 h-4" />
            </div>
            <select 
              className="appearance-none pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 shadow-sm rounded-xl text-slate-700 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 cursor-pointer disabled:opacity-50 disabled:bg-slate-50"
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              disabled={selectedSubject === 'None' || availableUnits.length === 0}
            >
              <option value="None">All Units</option>
              {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden shadow-sm border border-slate-200/60 relative p-1">
        
        {/* ── Mode Selector Tabs (Inside Panel header) ── */}
        <div className="p-3 border-b border-slate-100/50 flex overflow-x-auto custom-scrollbar bg-slate-50/50 rounded-t-2xl">
          <div className="flex items-center space-x-2 w-max">
            {MODES.map(mode => {
              const isActive = activeMode === mode.id;
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`
                    flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shrink-0
                    ${isActive 
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60 border border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <span className="block">{mode.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Chat Feed ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8 bg-gradient-to-b from-slate-50/20 to-transparent">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id || i} 
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* System Avatar */}
                {msg.role !== 'user' && (
                  <div className="w-9 h-9 shrink-0 mt-1 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.role !== 'user' && i !== 0 && (
                     <div className="text-xs font-semibold text-slate-500 mb-1 ml-1 flex items-center gap-2">
                       EasyNotes AI 
                       <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {MODES.find(m => m.id === activeMode)?.label}
                       </span>
                     </div>
                  )}

                  <div className={`
                    p-4 rounded-2xl relative group
                    ${msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                      : 'bg-white text-slate-800 shadow-sm border border-slate-200/80 rounded-tl-sm'
                    }
                  `}>
                    <div className="text-[15px] leading-relaxed whitespace-pre-wrap markdown-content">
                      {msg.content}
                    </div>

                    {/* Action buttons for system messages */}
                    {msg.role === 'system' && i !== 0 && (
                      <div className="absolute -bottom-10 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-lg p-1 z-10">
                        <button 
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-md"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        {i === messages.length - 1 && (
                          <button 
                            onClick={handleRegenerate}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-md"
                            title="Regenerate"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {msg.role === 'user' && (
                  <div className="w-9 h-9 shrink-0 mt-1 rounded-xl bg-slate-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex gap-4 justify-start">
                <div className="w-9 h-9 shrink-0 mt-1 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex items-center">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={endRef} className="h-4" />
          </AnimatePresence>
        </div>

        {/* ── Input Area ── */}
        <div className="p-4 bg-white/70 backdrop-blur-md border-t border-slate-200/60 rounded-b-2xl">
          <form onSubmit={handleSubmit} className="flex space-x-3 items-end max-w-4xl mx-auto relative">
            <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-2xl focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-400 transition-all duration-200">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                     e.preventDefault();
                     handleSubmit(e);
                  }
                }}
                placeholder="Message AI Tutor... (Press enter to send)"
                className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3.5 px-4 text-[15px] max-h-32 min-h-[52px] scrollbar-hide text-slate-800 placeholder:text-slate-400"
                rows={1}
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-[52px] w-[52px] bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl flex justify-center items-center shadow-md hover:shadow-glow-indigo transition-all duration-200 disabled:opacity-50 disabled:hover:shadow-none shrink-0"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">AI CAN MAKE MISTAKES. VERIFY CRITICAL INFO.</span>
          </div>
        </div>
      </div>
    </div>
  )
}