import React, { useEffect, useState, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Card } from '../../components/ui/Card'
import { LoadingState } from '../../components/ui/LoadingState'
import { contractsService } from '../../services/contractsService'

export const ContractGraphView: React.FC = () => {
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<any | null>(null)

  useEffect(() => {
    const fetchGraph = async () => {
      try {
        setIsLoading(true)
        const data = await contractsService.getContractGraph()
        setGraphData(data)
      } finally {
        setIsLoading(false)
      }
    }
    fetchGraph()
  }, [])

  // Position nodes spatially in an intuitive multi-tier topological layout
  const positionedNodes: Node[] = useMemo(() => {
    if (!graphData.nodes || graphData.nodes.length === 0) return []

    // Coordinates layout mapping
    const layoutMap: Record<string, { x: number; y: number }> = {
      // Top Tier: Parties
      'p-quillhub': { x: 450, y: 30 },
      'p-stratonode': { x: 100, y: 30 },
      'p-harbor': { x: 800, y: 30 },
      'p-vantage': { x: 1000, y: 150 },
      'p-pixelwright': { x: 100, y: 300 },

      // Mid Tier: Contracts
      'cnt-STD': { x: 450, y: 160 },
      'cnt-A1': { x: 150, y: 160 },
      'cnt-A2': { x: 280, y: 270 },
      'cnt-A3': { x: 120, y: 400 },
      'cnt-B1': { x: 700, y: 160 },
      'cnt-B2': { x: 850, y: 270 },
      'cnt-C1': { x: 950, y: 300 },
      'cnt-D1': { x: 300, y: 420 },

      // Bottom Tier: Critical Clauses & Collisions
      'cls-node-sla-995': { x: 320, y: 360 },
      'cls-node-sla-999': { x: 620, y: 270 },
      'cls-node-cyber-ins': { x: 780, y: 400 },
      'cls-node-m3-deemed': { x: 450, y: 460 },
      'cls-node-notice-124': { x: 500, y: 100 },
    }

    return graphData.nodes.map((n) => {
      const pos = layoutMap[n.id] || { x: 400 + Math.random() * 200, y: 200 + Math.random() * 200 }
      const isParty = n.type === 'party'
      const isContract = n.type === 'contract'
      const isClause = n.type === 'clause'
      const isSelected = selectedNode?.id === n.id

      return {
        id: n.id,
        position: pos,
        type: 'default',
        data: {
          label: (
            <div
              onClick={() => setSelectedNode(n)}
              className={`p-3 rounded-xl shadow-xl transition-all cursor-pointer text-left min-w-[170px] max-w-[220px] ${
                isSelected
                  ? 'ring-2 ring-teal-400 scale-105'
                  : ''
              } ${
                isParty
                  ? 'bg-[#081727] border-2 border-blue-500/60 hover:border-blue-400'
                  : isContract
                  ? 'bg-[#0D2033] border-2 border-teal-500/50 hover:border-teal-400'
                  : 'bg-[#10263B] border border-amber-500/50 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">
                  {isParty ? '🏢' : isContract ? '📜' : '⚖️'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-[#94A3B8]">
                  {n.type}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#F1F5F9] leading-tight truncate">
                {n.label}
              </h4>
              {n.data?.role && (
                <p className="text-[10.5px] text-[#94A3B8] mt-0.5 line-clamp-1">
                  {n.data.role}
                </p>
              )}
              {n.data?.counterparty && (
                <span className="inline-block text-[9.5px] font-mono text-teal-300 mt-1">
                  {n.data.counterparty}
                </span>
              )}
            </div>
          ),
        },
        style: { background: 'transparent', border: 'none', padding: 0 },
      }
    })
  }, [graphData.nodes, selectedNode])

  const styledEdges: Edge[] = useMemo(() => {
    if (!graphData.edges) return []
    return graphData.edges.map((e) => {
      const isCollision = e.type === 'collision'
      const isDependency = e.type === 'dependency'

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: isCollision,
        style: {
          stroke: isCollision ? '#EF4444' : isDependency ? '#14B8A6' : '#38BDF8',
          strokeWidth: isCollision ? 3 : 1.5,
          strokeDasharray: isDependency ? '4 4' : undefined,
        },
        labelStyle: {
          fill: isCollision ? '#FCA5A5' : '#94A3B8',
          fontSize: 10,
          fontWeight: isCollision ? 700 : 500,
        },
        labelBgStyle: {
          fill: '#081727',
          fillOpacity: 0.9,
          stroke: isCollision ? '#EF4444' : '#1D344B',
          strokeWidth: 1,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCollision ? '#EF4444' : isDependency ? '#14B8A6' : '#38BDF8',
        },
      }
    })
  }, [graphData.edges])

  if (isLoading) {
    return <LoadingState message="Constructing topological contract dependency and collision mesh..." />
  }

  return (
    <div className="space-y-4">
      {/* Graph Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#081727] border border-[#1D344B]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🕸️</span>
            <h3 className="text-sm font-bold text-[#F1F5F9] tracking-tight">
              Interactive Contract & Cross-Contract Collision Graph (FR9.1)
            </h3>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Visualize commercial relationships, dependencies, and upstream/downstream SLA collision paths.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-[#94A3B8]">Parties</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="text-[#94A3B8]">Contracts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[#94A3B8]">Clauses</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-400 font-bold">Cross Collision</span>
          </div>
        </div>
      </div>

      {/* Main Flow Canvas */}
      <Card className="h-[560px] relative overflow-hidden bg-[#030B14]">
        <ReactFlow
          nodes={positionedNodes}
          edges={styledEdges}
          fitView
          attributionPosition="bottom-left"
          minZoom={0.3}
          maxZoom={1.5}
        >
          <Background color="#1D344B" gap={20} size={1} />
          <Controls className="bg-[#081727] border border-[#1D344B] fill-[#94A3B8]" />
        </ReactFlow>

        {/* Node Detail Popup Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 max-w-sm p-4 rounded-xl bg-[#081727]/95 border border-teal-500/40 shadow-2xl backdrop-blur space-y-2 z-10 text-xs animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-bold">
                {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <h4 className="font-bold text-[#F1F5F9] text-sm">{selectedNode.label}</h4>
            {selectedNode.data?.role && (
              <p className="text-[#94A3B8]">{selectedNode.data.role}</p>
            )}
            {selectedNode.data?.description && (
              <p className="text-red-300 font-mono text-[11px] bg-red-500/10 p-2 rounded border border-red-500/20">
                {selectedNode.data.description}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
