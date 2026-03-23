import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { MessageCircle, Send, User, Bot, Loader2 } from 'lucide-react'

export default function AiChat() {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hello! I am your AI study assistant. Ask me anything about your subjects, notes, or academic topics.' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef(null)

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await axios.post('/ai/chat', { message: input })
      setMessages(prev => [...prev, { role: 'system', content: res.data.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'system', content: "Sorry, I'm having trouble connecting right now." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">

      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <MessageCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Study Assistant</h1>
          <p className="text-slate-500 text-sm mt-0.5">Powered by OpenAI</p>
        </div>
      </div>

      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary-600 ml-3' : 'bg-indigo-600 mr-3'
                  }`}>
                  {msg.role === 'user'
                    ? <User className="w-5 h-5 text-white" />
                    : <Bot className="w-5 h-5 text-white" />}
                </div>

                <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
                  }`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>

              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] flex-row">
                <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 mr-3 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
                  <span className="text-sm text-slate-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your studies..."
              className="input-field flex-1 !rounded-full !py-3 !px-6"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 bg-primary-600 text-white rounded-full flex justify-center items-center shadow-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-5 h-5 -ml-1 mt-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}