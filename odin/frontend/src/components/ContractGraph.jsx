import React, { useState } from 'react'
import { Share2, AlertTriangle, ShieldCheck, ArrowRight, Layers, Info } from 'lucide-react'

const NODES = [
  { id: 'quillhub', label: 'Quillhub Inc.', type: 'company', x: 400, y: 250, color: '#06b6d4' },
  { id: 'stratonode', label: 'StratoNode Inc. (A1/A2/A3)', type: 'vendor', x: 150, y: 120, color: '#3b82f6' },
  { id: 'harbor', label: 'Harbor Retail (B1/B2)', type: 'customer', x: 650, y: 120, color: '#ef4444' },
  { id: 'vantage', label: 'Vantage Logistics (C1)', type: 'customer', x: 650, y: 380, color: '#f59e0b' },
  { id: 'pixelwright', label: 'Pixelwright Studio (D1)', type: 'contractor', x: 150, y: 380, color: '#a855f7' },
  { id: 'std', label: 'Common Paper STD v2.0', type: 'standard', x: 400, y: 70, color: '#94a3b8' },
]

const EDGES = [
  { from: 'quillhub', to: 'stratonode', label: 'Upstream Cloud ($8k/mo)', conflict: true, note: 'SLA Mismatch: 99.5% target vs Harbor 99.9% target. 15-day claim window.' },
  { from: 'harbor', to: 'quillhub', label: 'Enterprise Route Optimizer ($40k/mo)', conflict: true, note: 'Exclusivity in PNW Grocery. Consecutive SLA termination right.' },
  { from: 'vantage', to: 'quillhub', label: 'Route Optimizer Pro ($12k/mo)', conflict: true, note: 'Exclusivity in PNW 3PL across all tiers. Overlaps with Harbor.' },
  { from: 'pixelwright', to: 'quillhub', label: 'Frontend Contractor ($65k SOW)', conflict: false, note: 'M4 deemed accepted under D1 §4.3. M5 pending.' },
  { from: 'std', to: 'stratonode', label: 'Incorporated by A1', conflict: false },
  { from: 'std', to: 'harbor', label: 'Incorporated by B1', conflict: false },
  { from: 'std', to: 'vantage', label: 'Incorporated by C1', conflict: false },
  { from: 'harbor', to: 'vantage', label: 'TERRITORIAL CONFLICT', conflict: true, dashed: true, note: 'Harbor PNW Grocery Exclusivity vs Vantage PNW 3PL All-Tiers Exclusivity.' },
]

export function ContractGraph() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-[#090e1a] text-slate-100 overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Share2 className="text-cyan-400" size={16} />
            <span className="font-semibold text-sm tracking-wide text-white">
              Cross-Contract Dependency & Conflict Topology
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Quillhub</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Upstream Host</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High-Risk Client</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Logistics</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Contractor</span>
          </div>
        </div>

        <div className="p-4 relative overflow-hidden flex flex-col items-center">
          <svg className="w-full max-w-4xl h-[480px]" viewBox="0 0 800 480">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
              <marker id="arrow-conflict" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
              </marker>
            </defs>

            {/* Edges */}
            {EDGES.map((edge, idx) => {
              const fromNode = NODES.find(n => n.id === edge.from)
              const toNode = NODES.find(n => n.id === edge.to)
              if (!fromNode || !toNode) return null

              const isConflict = edge.conflict
              const strokeColor = isConflict ? '#f43f5e' : '#334155'
              const midX = (fromNode.x + toNode.x) / 2
              const midY = (fromNode.y + toNode.y) / 2

              return (
                <g
                  key={idx}
                  className="cursor-pointer group"
                  onClick={() => { setSelectedEdge(edge); setSelectedNode(null); }}
                >
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={strokeColor}
                    strokeWidth={isConflict ? 2.5 : 1.5}
                    strokeDasharray={edge.dashed ? '6,4' : undefined}
                    markerEnd={isConflict ? 'url(#arrow-conflict)' : 'url(#arrow)'}
                    className="transition-all duration-300 group-hover:stroke-cyan-400"
                  />
                  <rect
                    x={midX - 60}
                    y={midY - 10}
                    width={120}
                    height={20}
                    rx={4}
                    fill="#0f172a"
                    stroke={isConflict ? '#f43f5e' : '#334155'}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    fill={isConflict ? '#fda4af' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="font-bold pointer-events-none"
                  >
                    {edge.label.length > 20 ? edge.label.slice(0, 18) + '..' : edge.label}
                  </text>
                </g>
              )
            })}

            {/* Nodes */}
            {NODES.map((node) => {
              const isSelected = selectedNode?.id === node.id

              return (
                <g
                  key={node.id}
                  className="cursor-pointer"
                  onClick={() => { setSelectedNode(node); setSelectedEdge(null); }}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 32 : 26}
                    fill="#0f172a"
                    stroke={node.color}
                    strokeWidth={isSelected ? 3.5 : 2}
                    className="transition-all duration-200 hover:scale-105"
                  />
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 14 : 10}
                    fill={node.color}
                    opacity={0.3}
                  />
                  <text
                    x={node.x}
                    y={node.y + 42}
                    fill="#f8fafc"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {node.label}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 54}
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {node.type.toUpperCase()}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Inspector panel */}
        {(selectedNode || selectedEdge) && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-start gap-4">
            {selectedNode && (
              <div className="space-y-1 text-xs">
                <div className="font-bold font-mono text-cyan-400 text-sm flex items-center gap-2">
                  <Layers size={14} />
                  NODE INSPECTION: {selectedNode.label}
                </div>
                <div className="text-slate-400">Entity Type: <span className="text-white font-bold">{selectedNode.type}</span></div>
                <div className="text-slate-200 mt-2 font-mono">
                  {selectedNode.id === 'quillhub' && 'Principal entity. Route Optimizer B2B SaaS platform provider.'}
                  {selectedNode.id === 'stratonode' && 'Upstream Cloud Provider (A1, A2, A3). 99.5% uptime target, 15-day SLA claim deadline.'}
                  {selectedNode.id === 'harbor' && 'Enterprise Retail Grocer (B1, B2). $40,000/mo. 99.9% uptime target. Insurance lapse termination trap.'}
                  {selectedNode.id === 'vantage' && 'Logistics Client (C1). $12,000/mo. Go-Live May 15, 2027. Exclusivity across all Route Optimizer tiers.'}
                  {selectedNode.id === 'pixelwright' && 'Design Studio Contractor (D1). SOW $65,000 fixed fee. 10-day review deemed acceptance rule.'}
                  {selectedNode.id === 'std' && 'Common Paper Cloud Service Standard Terms v2.0 incorporated into A1, B1, C1.'}
                </div>
              </div>
            )}

            {selectedEdge && (
              <div className="space-y-1 text-xs">
                <div className="font-bold font-mono text-rose-400 text-sm flex items-center gap-2">
                  <AlertTriangle size={14} />
                  RELATIONSHIP & CONFLICT: {selectedEdge.label}
                </div>
                <div className="text-slate-400 font-mono">
                  Between: <span className="text-white font-bold">{selectedEdge.from}</span> ➔ <span className="text-white font-bold">{selectedEdge.to}</span>
                </div>
                <div className="text-slate-200 mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded font-mono text-xs">
                  {selectedEdge.note}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
