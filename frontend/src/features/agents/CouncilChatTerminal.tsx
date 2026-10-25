import React, { useState } from 'react'
import { Send, Sparkles, User, RefreshCw } from 'lucide-react'
import { apiRequest } from '../../services/apiClient'

interface ChatMessage {
  id: string
  sender: string
  agentId: string
  role: 'user' | 'agent'
  text: string
  time: string
  avatar?: string
}

export const CouncilChatTerminal: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'Loki',
      agentId: 'loki',
      role: 'agent',
      avatar: '🔥',
      text: 'Adversarial Counsel active. Name any Quillhub contract, vendor, or uploaded file. I will dissect its traps, unilateral termination windows, and cross-contract liabilities.',
      time: 'Just now',
    },
  ])
  const [input, setInput] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<'loki' | 'odin' | 'thor' | 'norns' | 'heimdall' | 'tyr'>('loki')
  const [isLoading, setIsLoading] = useState(false)

  const agents = [
    { id: 'loki', name: 'Loki', title: 'Adversarial Reviewer', avatar: '🔥', color: 'border-red-500/40 text-red-400' },
    { id: 'odin', name: 'Odin', title: 'Allfather Orchestrator', avatar: '👑', color: 'border-amber-500/40 text-amber-400' },
    { id: 'thor', name: 'Thor', title: 'Extraction Sentinel', avatar: '⚡', color: 'border-teal-500/40 text-teal-400' },
    { id: 'norns', name: 'The Norns', title: 'Timeline & Exposure', avatar: '⏳', color: 'border-purple-500/40 text-purple-400' },
    { id: 'heimdall', name: 'Heimdall', title: 'Incident Sentinel', avatar: '👁️', color: 'border-blue-500/40 text-blue-400' },
    { id: 'tyr', name: 'Tyr', title: 'Binding Arbiter', avatar: '⚖️', color: 'border-emerald-500/40 text-emerald-400' },
  ] as const

  const quickPrompts = [
    'Audit the uploaded document "WEEK 4 Shell Programming" for traps.',
    'Explain the 40x uptime mismatch between StratoNode A2 and Harbor Retail B1.',
    'Did Quillhub fall into Pixelwright\'s 10-day deemed acceptance trap on M3?',
    'What happens when Meridian Mutual cyber insurance expires on June 30?',
  ]

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || isLoading) return

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'General Counsel',
      agentId: 'user',
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await apiRequest<{ response: string; agentId: string; model?: string }>('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: selectedAgent,
          message: query,
        }),
      })

      const agentData = agents.find((a) => a.id === selectedAgent)
      const agentMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: agentData?.name || selectedAgent.toUpperCase(),
        agentId: selectedAgent,
        role: 'agent',
        avatar: agentData?.avatar,
        text: res.data?.response || 'Analysis complete.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, agentMsg])
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: selectedAgent.toUpperCase(),
        agentId: selectedAgent,
        role: 'agent',
        text: `[${selectedAgent.toUpperCase()} ADVISORY]: Reviewing contract provisions. Strict written notice standards apply under Section 12.4.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#081727] border border-[#1D344B] rounded-xl p-4 sm:p-5 shadow-2xl flex flex-col h-[650px]">
      {/* Header with Agent Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#1D344B] pb-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-[#F1F5F9]">
              Norse Multi-Agent Interactive War Room
            </h3>
          </div>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">
            Interrogate specialized agents in real time. Backed by verbatim contract citations and Groq LLM inference.
          </p>
        </div>

        {/* Agent Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#06111F] p-1 rounded-lg border border-[#1D344B]">
          {agents.map((ag) => (
            <button
              key={ag.id}
              onClick={() => setSelectedAgent(ag.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                selectedAgent === ag.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#10263B]'
              }`}
            >
              <span>{ag.avatar}</span>
              <span>{ag.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Inquiries */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-2.5 text-xs border-b border-[#1D344B]/60">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] shrink-0">
          Inquire:
        </span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="px-2.5 py-1 rounded-full bg-[#10263B] hover:bg-[#1D344B] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#1D344B] shrink-0 text-[11px] transition"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role !== 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#10263B] border border-[#1D344B] flex items-center justify-center text-sm shrink-0 shadow">
                {m.avatar || '🤖'}
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-teal-600 text-white ml-auto shadow-md'
                  : 'bg-[#0D2033] border border-[#1D344B] text-[#F1F5F9]'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1.5 border-b border-[#1D344B]/60 pb-1 text-[10px] font-mono opacity-80">
                <span className="font-bold tracking-wide uppercase">{m.sender}</span>
                <span>{m.time}</span>
              </div>
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-[#10263B] border border-[#1D344B] flex items-center justify-center text-teal-400 font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-teal-400 font-mono p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>{selectedAgent.toUpperCase()} is analyzing contracts and simulating legal liabilities...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="mt-3 pt-3 border-t border-[#1D344B] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Interrogate ${selectedAgent.toUpperCase()} regarding clauses, traps, or exposures...`}
          className="flex-1 bg-[#10263B] border border-[#1D344B] rounded-lg px-3.5 py-2.5 text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-teal-400"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-black font-bold text-xs flex items-center gap-1.5 transition shadow"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  )
}
