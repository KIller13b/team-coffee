import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, MessageSquare, Trash2, ArrowRight } from 'lucide-react'
import { Citation, AgentBadge } from './Shared'

const AGENTS = [
  { id: 'council', name: 'ALL COUNCIL', role: 'Full War Room Consensus' },
  { id: 'loki', name: 'LOKI', role: 'Adversarial Red-Team' },
  { id: 'norns', name: 'NORNS', role: 'Timeline & Financial Calculations' },
  { id: 'thor', name: 'THOR', role: 'Contract Clause & Grounding' },
  { id: 'heimdall', name: 'HEIMDALL', role: 'Event Incident Verifier' },
  { id: 'tyr', name: 'TYR', role: 'Legal Rulings & Notices' },
]

const QUICK_PROMPTS = [
  {
    title: 'PS-2 Q1: Harbor Material Breach',
    text: 'Is Quillhub currently in default or material breach of any terms in the Harbor Retail agreement (B1), unrelated to service outages? Cite specific provisions and company records.',
    agent: 'council'
  },
  {
    title: 'PS-2 Q2: March 3 Outage & Recovery Gap',
    text: 'On March 3, 2027, an unscheduled outage occurred (Event E-04). What was Quillhub’s platform uptime percentage for March 2027, what financial credits does Quillhub owe its customers, and what credits can Quillhub recover from StratoNode?',
    agent: 'norns'
  },
  {
    title: 'Insurance Expiration Risk',
    text: 'What happens if we do not renew our Meridian Mutual insurance policies before June 30, 2027?',
    agent: 'loki'
  },
  {
    title: 'Territorial Exclusivity Overlap',
    text: 'Explain the territorial exclusivity conflict between Harbor Retail (B1 §6.1) and Vantage Logistics (C1 §4.1).',
    agent: 'loki'
  },
  {
    title: 'Pixelwright M4 Deemed Acceptance',
    text: 'Did Quillhub accept Pixelwright M4 deliverable, and are we obligated to pay the $12,000 fee?',
    agent: 'thor'
  },
  {
    title: 'A3 Silent Supersession',
    text: 'What terms in Cover Page A1 and SLA A2 were silently amended by Amendment A3?',
    agent: 'loki'
  }
]

export function ChatPanel({ store }) {
  const [selectedAgent, setSelectedAgent] = useState('council')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'agent',
      agent: 'odin',
      agentTitle: 'Odin (War Room Orchestrator)',
      content: 'Welcome to the Odin War Room interactive council. Ask any question regarding Quillhub\'s contracts, default conditions, SLA math, recovery gaps, or real-time event impacts.',
      citations: [],
      timestamp: new Date().toLocaleTimeString()
    }
  ])
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = async (textToSend = input, agentToSend = selectedAgent) => {
    const query = textToSend.trim()
    if (!query || loading) return

    const userMsg = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          agent: agentToSend,
          checkpoint_index: store.currentCheckpoint
        })
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const agentMsg = {
        role: 'agent',
        agent: data.agent,
        agentTitle: data.agent_title,
        content: data.reply,
        citations: data.citations || [],
        followups: data.suggested_followups || [],
        timestamp: new Date().toLocaleTimeString()
      }

      setMessages(prev => [...prev, agentMsg])
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'agent',
          agent: 'odin',
          agentTitle: 'System Alert',
          content: `Error contacting agent council: ${err.message}. Please verify the backend is running.`,
          citations: [],
          timestamp: new Date().toLocaleTimeString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="workspace-panel border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[660px] overflow-hidden bg-white">
      {/* 1. Integrated Agent Filter Header */}
      <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <Bot size={15} className="text-indigo-600" /> Target Agent:
          </span>
          {AGENTS.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAgent(a.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedAgent === a.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          title="Clear chat history"
          className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
        >
          <Trash2 size={13} />
          <span>Clear History</span>
        </button>
      </div>

      {/* 2. Quick Prompts Sub-Bar */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs shrink-0 select-none">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Sparkles size={12} className="text-amber-500" /> Prompts:
        </span>
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedAgent(p.agent)
              handleSend(p.text, p.agent)
            }}
            className="shrink-0 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all text-left shadow-2xs font-medium text-[11px]"
          >
            <span>{p.title}</span>
          </button>
        ))}
      </div>

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-slate-50/40">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user'

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-900 text-amber-400 border border-slate-800'
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} />}
              </div>

              {/* Message Bubble with comfortable padding and max-width */}
              <div
                className={`max-w-2xl rounded-2xl p-4 space-y-2.5 shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-subtle'
                }`}
              >
                {/* Bubble Header */}
                <div className={`flex items-center justify-between gap-4 border-b ${isUser ? 'border-indigo-400/30 text-indigo-100' : 'border-slate-100 text-slate-500'} pb-1.5 text-[11px]`}>
                  <span className="font-semibold font-mono tracking-wider">
                    {isUser ? 'YOU' : m.agentTitle}
                  </span>
                  <span className="font-mono text-[10px] opacity-80">{m.timestamp}</span>
                </div>

                {/* Message Body */}
                <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans ${isUser ? 'text-white' : 'text-slate-700'}`}>
                  {m.content}
                </div>

                {/* Grounded Citations */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase tracking-wider">
                      Grounded Citations & Evidence:
                    </span>
                    {m.citations.map((c, cIdx) => (
                      <Citation key={cIdx} citation={c} />
                    ))}
                  </div>
                )}

                {/* Suggested followups */}
                {m.followups && m.followups.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {m.followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(f, m.agent)}
                        className="text-[11px] bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-indigo-700 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors font-medium shadow-2xs"
                      >
                        <ArrowRight size={10} />
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          <div className="flex items-center gap-2.5 text-slate-500 text-xs animate-pulse p-3 bg-white rounded-xl border border-slate-200 w-fit shadow-2xs">
            <Bot size={15} className="text-indigo-600 animate-spin" />
            <span>Agent council deliberating and verifying citations...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 4. Integrated Pinned Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <div className="flex items-end gap-2.5 bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 rounded-xl p-2.5 transition-all shadow-2xs">
          <textarea
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask the council anything about Quillhub contracts, SLA gaps, default conditions, or events... (Press Enter to send)"
            className="flex-1 bg-transparent border-0 p-1 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-2">
          <span>Press <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600 text-[10px]">Enter</kbd> to send, <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-slate-600 text-[10px]">Shift + Enter</kbd> for new line</span>
          <span className="font-mono text-slate-500 hidden sm:inline">Grounded in verified contract clauses</span>
        </div>
      </div>
    </div>
  )
}
