import React, { useState } from 'react'
import { Award, MessageSquare, Sparkles, BookOpen, Scale, ArrowRight } from 'lucide-react'
import { BenchmarkPanel } from '../BenchmarkPanel'
import { ChatPanel } from '../ChatPanel'

export function CouncilWorkspace({ store }) {
  const [activeTab, setActiveTab] = useState('benchmark') // 'benchmark' | 'chat'

  return (
    <div className="space-y-6">
      {/* Workspace Banner */}
      <div className="workspace-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Agent Council & Evaluation Suite
            </span>
            <span className="text-xs font-mono text-slate-400">
              Ragnarok PS-2 Ground Truth
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Adjudication Benchmarks & Interactive Council
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-computed, rigorously cited benchmark answers and a natural language consultation console.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'benchmark'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award size={14} className={activeTab === 'benchmark' ? 'text-amber-500' : ''} />
            <span>PS-2 Benchmark Q&A</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              activeTab === 'chat'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare size={14} className={activeTab === 'chat' ? 'text-indigo-600' : ''} />
            <span>Interactive Chatbot</span>
          </button>
        </div>
      </div>

      {/* Render selected view */}
      {activeTab === 'benchmark' ? (
        <BenchmarkPanel store={store} />
      ) : (
        <ChatPanel store={store} />
      )}
    </div>
  )
}
