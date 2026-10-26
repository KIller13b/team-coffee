// Zustand store for global war room state
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
  // ── Clock ─────────────────────────────────────────────────────────────────
  checkpoints: [],
  currentCheckpoint: 1,  // default to checkpoint 2 (Jun 01)

  // ── Analysis state ────────────────────────────────────────────────────────
  analysis: null,
  loading: false,
  error: null,
  log: [],

  // ── UI state ──────────────────────────────────────────────────────────────
  activeTab: 'overview',

  // ── Actions ───────────────────────────────────────────────────────────────
  setActiveTab: (tab) => set({ activeTab: tab }),

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
    set({ loading: true, error: null, log: [] })
    try {
      const data = await apiPost('/api/run', {
        checkpoint_index: checkpointIndex ?? get().currentCheckpoint,
        max_iterations: 3
      })
      set({ analysis: data, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  loadAnalysis: async (checkpointIndex) => {
    const idx = checkpointIndex ?? get().currentCheckpoint
    set({ loading: true, error: null })
    try {
      const data = await apiFetch(`/api/state/${idx}`)
      set({ analysis: data, loading: false })
    } catch (e) {
      // If no cached state, auto-run
      set({ loading: false })
      await get().runAnalysis(idx)
    }
  },

  // Benchmark Q answers
  loadBenchmarkQ1: async () => {
    return apiFetch('/api/benchmark/q1')
  },
  loadBenchmarkQ2: async () => {
    return apiFetch('/api/benchmark/q2')
  },
}))
