import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, MessageSquare, Trash2, ArrowRight } from 'lucide-react'
import { Citation, AgentBadge } from './Shared'

const AGENTS = [
  { id: 'council', name: 'ALL COUNCIL (ODIN)', role: 'Synthesized War Room Consensus', color: 'text-war-cyan border-war-cyan' },
  { id: 'loki', name: 'LOKI', role: 'Adversarial Counterparty Counsel', color: 'text-orange-400 border-orange-400' },
  { id: 'norns', name: 'NORNS', role: 'Timeline & Financial Calculations', color: 'text-purple-400 border-purple-400' },
  { id: 'thor', name: 'THOR', role: 'Contract Clause & Evidence Grounding', color: 'text-yellow-400 border-yellow-400' },
  { id: 'heimdall', name: 'HEIMDALL', role: 'Event Logs & Incident Verifier', color: 'text-blue-400 border-blue-400' },
  { id: 'tyr', name: 'TYR', role: 'Arbitrator & Action Notice Drafter', color: 'text-green-400 border-green-400' },
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
    <div className="flex flex-col h-[calc(100vh-180px)] space-y-3 font-mono">
      {/* Top Agent Selector */}
      <div className="card p-3 flex flex-wrap items-center gap-2 border-war-cyan/30 bg-war-surface">
        <span className="text-xs text-war-muted font-bold mr-1 flex items-center gap-1.5">
          <Bot size={14} className="text-war-cyan" /> QUERY AGENT:
        </span>
        {AGENTS.map(a => (
          <button
            key={a.id}
            onClick={() => setSelectedAgent(a.id)}
            className={`px-2.5 py-1 text-xs rounded border transition-all ${
              selectedAgent === a.id
                ? 'bg-war-blue text-white font-bold border-war-cyan shadow-sm shadow-war-blue/30'
                : 'border-war-border text-war-muted hover:text-war-text hover:border-war-cyan'
            }`}
          >
            {a.name}
          </button>
        ))}
        <button
          onClick={() => setMessages([messages[0]])}
          title="Clear chat history"
          className="ml-auto text-xs text-war-muted hover:text-red-400 p-1 rounded"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedAgent(p.agent)
              handleSend(p.text, p.agent)
            }}
            className="shrink-0 bg-war-surface hover:bg-war-accent/30 border border-war-border hover:border-war-gold text-war-text px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-left"
          >
            <Sparkles size={12} className="text-war-gold shrink-0" />
            <span className="font-bold">{p.title}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 card p-4 overflow-y-auto space-y-4 bg-war-bg/60">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user'
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-war-blue text-white'
                    : 'bg-gradient-to-br from-war-surface to-war-card border border-war-cyan text-war-cyan'
                }`}
              >
                {isUser ? <User size={15} /> : <Bot size={15} />}
              </div>

              <div
                className={`max-w-[85%] rounded-lg p-4 space-y-3 ${
                  isUser
                    ? 'bg-war-blue/20 border border-war-blue/40 text-war-text'
                    : 'bg-war-surface border border-war-border text-war-text shadow-md'
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-war-border/50 pb-1.5 text-[11px] text-war-muted">
                  <span className="font-bold text-war-cyan flex items-center gap-1.5">
                    {isUser ? 'YOU' : m.agentTitle}
                  </span>
                  <span>{m.timestamp}</span>
                </div>

                {/* Message body */}
                <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans prose prose-invert max-w-none">
                  {m.content}
                </div>

                {/* Grounded Citations */}
                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-war-border/60 space-y-1.5">
                    <span className="text-[11px] text-war-muted font-mono block font-bold">
                      GROUNDED CITATIONS & EVIDENCE:
                    </span>
                    {m.citations.map((c, cIdx) => (
                      <Citation key={cIdx} citation={c} />
                    ))}
                  </div>
                )}

                {/* Suggested followups */}
                {m.followups && m.followups.length > 0 && (
                  <div className="pt-2 border-t border-war-border/60 flex flex-wrap gap-1.5">
                    {m.followups.map((f, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(f, m.agent)}
                        className="text-[11px] bg-war-bg hover:bg-war-accent/30 border border-war-border text-war-cyan px-2 py-1 rounded flex items-center gap-1 transition-colors"
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
          <div className="flex items-center gap-3 text-war-muted text-xs animate-pulse p-2">
            <Bot size={16} className="text-war-cyan" />
            <span>Council agents deliberating and verifying citations...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input box */}
      <div className="flex gap-2">
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
          className="flex-1 bg-war-surface border border-war-border rounded-lg p-3 text-xs text-war-text placeholder-war-muted focus:outline-none focus:border-war-cyan resize-none font-mono"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-5 bg-war-blue hover:bg-blue-600 disabled:opacity-40 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-war-blue/20"
        >
          <Send size={15} />
          SEND
        </button>
      </div>
    </div>
  )
}
