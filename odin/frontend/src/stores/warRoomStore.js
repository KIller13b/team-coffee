// Zustand store for global war room state and page navigation
import { create } from 'zustand'

const API = ''  // proxied via vite to localhost:8000

async function apiFetch(path) {
  const res = await fetch(API + path)
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

async function apiPost(path, body) {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`)
  return res.json()
}

export const useStore = create((set, get) => ({
  // ── Navigation & Page Routing ─────────────────────────────────────────────
  activePage: 'dashboard', // 'dashboard' | 'timeline' | 'contracts' | 'council' | 'settings'
  setActivePage: (page) => set({ activePage: page }),

  // ── Clock & Checkpoints ───────────────────────────────────────────────────
  checkpoints: [],
  currentCheckpoint: 1,  // default to checkpoint 2 (Jun 01, 2027)

  // ── Analysis state ────────────────────────────────────────────────────────
  analysis: null,
  loading: false,
  error: null,
  lastRunTimestamp: null,

  // ── Filter & Contract Inspection State ────────────────────────────────────
  selectedContractId: 'B1', // default to Harbor Retail
  setSelectedContractId: (id) => set({ selectedContractId: id }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  statusFilter: 'all',
  setStatusFilter: (filter) => set({ statusFilter: filter }),

  // ── System Health & Diagnostics ───────────────────────────────────────────
  systemHealth: {
    status: 'checking',
    backendOnline: false,
    latencyMs: 0,
    version: '1.0.0',
    lastChecked: null,
  },

  checkHealth: async () => {
    const t0 = performance.now()
    try {
      const data = await apiFetch('/health')
      const latency = Math.round(performance.now() - t0)
      set({
        systemHealth: {
          status: data.status === 'ok' ? 'operational' : 'degraded',
          backendOnline: true,
          latencyMs: latency,
          version: '1.0.0',
          lastChecked: new Date().toLocaleTimeString(),
        }
      })
    } catch (e) {
      set({
        systemHealth: {
          status: 'offline',
          backendOnline: false,
          latencyMs: 0,
          version: 'unknown',
          lastChecked: new Date().toLocaleTimeString(),
        }
      })
    }
  },

  // ── Actions ───────────────────────────────────────────────────────────────
  loadCheckpoints: async () => {
    try {
      const data = await apiFetch('/api/checkpoints')
      set({ checkpoints: data.checkpoints })
    } catch (e) {
      console.error('Failed to load checkpoints:', e)
    }
  },

  setCheckpoint: (index) => set({ currentCheckpoint: index }),

  runAnalysis: async (checkpointIndex) => {
    const idx = checkpointIndex ?? get().currentCheckpoint
    set({ loading: true, error: null })
    try {
      const data = await apiPost('/api/run', {
        checkpoint_index: idx,
        max_iterations: 3
      })
      set({ 
        analysis: data, 
        loading: false, 
        lastRunTimestamp: new Date().toISOString() 
      })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  loadAnalysis: async (checkpointIndex) => {
    const idx = checkpointIndex ?? get().currentCheckpoint
    set({ loading: true, error: null })
    try {
      const data = await apiFetch(`/api/state/${idx}`)
      set({ 
        analysis: data, 
        loading: false, 
        lastRunTimestamp: new Date().toISOString() 
      })
    } catch (e) {
      // If no cached state for this checkpoint, trigger a fresh run
      set({ loading: false })
      await get().runAnalysis(idx)
    }
  },

  // Benchmark helpers
  loadBenchmarkQ1: async () => apiFetch('/api/benchmark/q1'),
  loadBenchmarkQ2: async () => apiFetch('/api/benchmark/q2'),

  // ── What-If Strategy Sandbox State ────────────────────────────────────────
  simulationResult: null,
  simulating: false,
  whatIfPresets: [],

  loadWhatIfPresets: async () => {
    try {
      const data = await apiFetch('/api/what-if/presets')
      set({ whatIfPresets: data.presets || [] })
      return data.presets
    } catch (e) {
      console.error('Failed to load what-if presets:', e)
      return []
    }
  },

  runWhatIfSimulation: async (params) => {
    set({ simulating: true })
    try {
      const result = await apiPost('/api/what-if/simulate', {
        checkpoint_index: get().currentCheckpoint,
        ...params
      })
      set({ simulationResult: result, simulating: false })
      return result
    } catch (e) {
      console.error('Simulation error:', e)
      set({ simulating: false })
      throw e
    }
  }
}))
