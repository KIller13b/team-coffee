import React, { useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { AgentId } from '../../lib/constants'

interface WorkflowGraphProps {
  onSelectAgent?: (agentId: AgentId) => void
}

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({ onSelectAgent }) => {
  const initialNodes: Node[] = useMemo(
    () => [
      {
        id: 'odin',
        position: { x: 380, y: 20 },
        data: {
          label: (
            <div
              onClick={() => onSelectAgent?.('odin')}
              className="p-3 rounded-xl bg-[#081727] border-2 border-blue-500/50 shadow-lg text-center cursor-pointer hover:border-blue-400 transition-all min-w-[150px]"
            >
              <span className="text-xl">👑</span>
              <h4 className="text-xs font-bold text-blue-300">Odin</h4>
              <p className="text-[9.5px] text-[#94A3B8]">Supreme Orchestrator</p>
              <span className="inline-block text-[9px] font-mono text-teal-300 bg-teal-500/10 px-1 rounded mt-1">
                RUNNING
              </span>
            </div>
          ),
        },
        type: 'default',
        style: { background: 'transparent', border: 'none', padding: 0 },
      },
      {
        id: 'thor',
        position: { x: 120, y: 140 },
        data: {
          label: (
            <div
              onClick={() => onSelectAgent?.('thor')}
              className="p-3 rounded-xl bg-[#081727] border-2 border-teal-500/50 shadow-lg text-center cursor-pointer hover:border-teal-400 transition-all min-w-[150px]"
            >
              <span className="text-xl">⚡</span>
              <h4 className="text-xs font-bold text-teal-300">Thor</h4>
              <p className="text-[9.5px] text-[#94A3B8]">Clause Extractor</p>
              <span className="inline-block text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-1 rounded mt-1">
                COMPLETED
              </span>
            </div>
          ),
        },
        style: { background: 'transparent', border: 'none', padding: 0 },
      },
      {
        id: 'norns',
        position: { x: 640, y: 140 },
        data: {
          label: (
            <div
              onClick={() => onSelectAgent?.('norns')}
              className="p-3 rounded-xl bg-[#081727] border-2 border-purple-500/50 shadow-lg text-center cursor-pointer hover:border-purple-400 transition-all min-w-[150px]"
            >
              <span className="text-xl">⏳</span>
              <h4 className="text-xs font-bold text-purple-300">Norns</h4>
              <p className="text-[9.5px] text-[#94A3B8]">Timeline Oracle</p>
              <span className="inline-block text-[9px] font-mono text-teal-300 bg-teal-500/10 px-1 rounded mt-1">
                RUNNING
              </span>
            </div>
          ),
        },
        style: { background: 'transparent', border: 'none', padding: 0 },
      },
      {
        id: 'loki',
        position: { x: 250, y: 270 },
        data: {
          label: (
            <div
              onClick={() => onSelectAgent?.('loki')}
              className="p-3 rounded-xl bg-[#081727] border-2 border-red-500/50 shadow-lg text-center cursor-pointer hover:border-red-400 transition-all min-w-[150px]"
            >
              <span className="text-xl">🔥</span>
              <h4 className="text-xs font-bold text-red-400">Loki</h4>
              <p className="text-[9.5px] text-[#94A3B8]">Adversarial Challenger</p>
              <span className="inline-block text-[9px] font-mono text-amber-300 bg-amber-500/10 px-1 rounded mt-1">
                WAITING ARBITER
              </span>
            </div>
          ),
        },
        style: { background: 'transparent', border: 'none', padding: 0 },
      },
      {
        id: 'heimdall',
        position: { x: 510, y: 270 },
        data: {
          label: (
            <div
              onClick={() => onSelectAgent?.('heimdall')}
              className="p-3 rounded-xl bg-[#081727] border-2 border-sky-500/50 shadow-lg text-center cursor-pointer hover:border-sky-400 transition-all min-w-[150px]"
            >
              <span className="text-xl">👁️</span>
              <h4 className="text-xs font-bold text-sky-300">Heimdall</h4>
              <p className="text-[9.5px] text-[#94A3B8]">External Sentinel</p>
              <span className="inline-block text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-1 rounded mt-1">
                VERIFIED
              </span>
            </div>
          ),
        },
        style: { background: 'transparent', border: 'none', padding: 0 },
      },
      {
        id: 'tyr',
        position: { x: 380, y: 400 },
        data: {
          label: (
            <div
              onClick={() => onSelectAgent?.('tyr')}
              className="p-3 rounded-xl bg-[#081727] border-2 border-amber-500/60 shadow-lg text-center cursor-pointer hover:border-amber-400 transition-all min-w-[150px]"
            >
              <span className="text-xl">⚖️</span>
              <h4 className="text-xs font-bold text-amber-300">Tyr</h4>
              <p className="text-[9.5px] text-[#94A3B8]">Arbiter & Strategist</p>
              <span className="inline-block text-[9px] font-mono text-amber-300 bg-amber-500/10 px-1 rounded mt-1">
                RENDERED RULING
              </span>
            </div>
          ),
        },
        style: { background: 'transparent', border: 'none', padding: 0 },
      },
    ],
    [onSelectAgent]
  )

  const initialEdges: Edge[] = useMemo(
    () => [
      {
        id: 'e-odin-thor',
        source: 'odin',
        target: 'thor',
        animated: true,
        style: { stroke: '#2DD4BF', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#2DD4BF' },
        label: 'Dispatches Extraction',
        labelStyle: { fill: '#94A3B8', fontSize: 10 },
      },
      {
        id: 'e-odin-norns',
        source: 'odin',
        target: 'norns',
        animated: true,
        style: { stroke: '#A855F7', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A855F7' },
        label: 'Dispatches Milestones',
        labelStyle: { fill: '#94A3B8', fontSize: 10 },
      },
      {
        id: 'e-thor-loki',
        source: 'thor',
        target: 'loki',
        style: { stroke: '#F87171', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F87171' },
        label: 'Clauses for Challenge',
        labelStyle: { fill: '#94A3B8', fontSize: 10 },
      },
      {
        id: 'e-norns-loki',
        source: 'norns',
        target: 'loki',
        style: { stroke: '#F87171', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#F87171' },
      },
      {
        id: 'e-loki-heimdall',
        source: 'loki',
        target: 'heimdall',
        animated: true,
        style: { stroke: '#38BDF8', strokeWidth: 1.5, strokeDasharray: '4 4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#38BDF8' },
        label: 'Verifies Factual Claims',
        labelStyle: { fill: '#94A3B8', fontSize: 10 },
      },
      {
        id: 'e-loki-tyr',
        source: 'loki',
        target: 'tyr',
        animated: true,
        style: { stroke: '#FBBF24', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#FBBF24' },
        label: 'Escalates Collision',
        labelStyle: { fill: '#FBBF24', fontSize: 10 },
      },
      {
        id: 'e-heimdall-tyr',
        source: 'heimdall',
        target: 'tyr',
        style: { stroke: '#FBBF24', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#FBBF24' },
        label: 'Provides Audit Logs',
        labelStyle: { fill: '#FBBF24', fontSize: 10 },
      },
      {
        id: 'e-tyr-odin',
        source: 'tyr',
        target: 'odin',
        animated: true,
        style: { stroke: '#60A5FA', strokeWidth: 2, strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#60A5FA' },
        label: 'Binding Directive',
        labelStyle: { fill: '#60A5FA', fontSize: 10 },
      },
    ],
    []
  )

  return (
    <div className="w-full h-[520px] rounded-xl bg-[#06111F] border border-[#1D344B] overflow-hidden relative">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background color="#1D344B" gap={20} size={1} />
        <Controls className="bg-[#0D2033] border border-[#1D344B] text-[#94A3B8] fill-[#94A3B8] rounded-lg" />
      </ReactFlow>

      <div className="absolute bottom-3 left-3 bg-[#081727]/90 backdrop-blur-xs border border-[#1D344B] px-3 py-1.5 rounded-lg text-[10.5px] text-[#94A3B8] flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <span>Click any agent node to inspect operational telemetry</span>
      </div>
    </div>
  )
}
