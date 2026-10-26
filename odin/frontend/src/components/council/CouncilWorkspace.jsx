import React from 'react'
import { MessageSquare, Bot } from 'lucide-react'
import { ChatPanel } from '../ChatPanel'

export function CouncilWorkspace({ store }) {
  return (
    <div className="space-y-5">
      {/* Workspace Banner */}
      <div className="workspace-panel p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Interactive Agent Council
            </span>
            <span className="text-xs font-mono text-slate-400">
              Multi-Agent Consultation
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Council Chatbot
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query Thor, Loki, Heimdall, Tyr, Norns, or the full Council for grounded legal analysis with verbatim citations.
          </p>
        </div>
      </div>

      {/* Interactive Chatbot */}
      <ChatPanel store={store} />
    </div>
  )
}
