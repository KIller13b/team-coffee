export const AGENT_ROLES = {
  odin: {
    id: 'odin',
    name: 'Odin',
    title: 'Supreme Orchestrator',
    role: 'Orchestrates the workflow and delegates tasks',
    avatar: '👑',
    color: '#60A5FA', // Blue
    badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    description: 'Deconstructs contract analysis requests into modular subtasks, coordinates specialized agents, and maintains mission state.',
  },
  thor: {
    id: 'thor',
    name: 'Thor',
    title: 'Clause & Evidence Extractor',
    role: 'Extracts contract terms and supporting evidence',
    avatar: '⚡',
    color: '#2DD4BF', // Teal
    badgeBg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
    description: 'Parses legal syntax, verifies citations, extracts clauses (payment, termination, penalty), and anchors them to verbatim evidence.',
  },
  norns: {
    id: 'norns',
    name: 'Norns',
    title: 'Timeline & Obligation Oracle',
    role: 'Builds obligation timelines and worst-case projections',
    avatar: '⏳',
    color: '#A855F7', // Violet
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    description: 'Weaves chronologies, tracks recursive auto-renewal windows, computes milestone triggers, and simulates downstream penalties.',
  },
  loki: {
    id: 'loki',
    name: 'Loki',
    title: 'Adversarial Risk Challenger',
    role: 'Challenges contract interpretations and identifies hidden risks',
    avatar: '🔥',
    color: '#F87171', // Red
    badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400',
    description: 'Acts as red team devil’s advocate: hunts ambiguity, cross-contract clause collisions, indemnification traps, and breach exposures.',
  },
  heimdall: {
    id: 'heimdall',
    name: 'Heimdall',
    title: 'External Sentinel & Fact-Checker',
    role: 'Monitors events and verifies risk claims',
    avatar: '👁️',
    color: '#38BDF8', // Cyan
    badgeBg: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    description: 'Maintains all-seeing vigilance over ERP timestamps, regulatory updates, notices delivered, and evidentiary substantiation.',
  },
  tyr: {
    id: 'tyr',
    name: 'Tyr',
    title: 'Arbiter & Prescriptive Strategist',
    role: 'Resolves disagreements and prepares recommended actions',
    avatar: '⚖️',
    color: '#FBBF24', // Amber
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    description: 'Weighs adversarial contentions, resolves doctrinal disputes, and renders conclusive, audit-ready operational decisions.',
  },
} as const

export type AgentId = keyof typeof AGENT_ROLES

export const RISK_LEVEL_COLORS = {
  low: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    hex: '#10B981',
    label: 'Low',
  },
  medium: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    hex: '#FBBF24',
    label: 'Medium',
  },
  high: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    dot: 'bg-orange-400',
    hex: '#FB923C',
    label: 'High',
  },
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
    dot: 'bg-red-400',
    hex: '#F87171',
    label: 'Critical',
  },
} as const

export const CONTRACT_TYPES = [
  'Master Services Agreement (MSA)',
  'Service Level Agreement (SLA)',
  'Cloud Infrastructure & Hosting',
  'Software License Agreement',
  'Vendor Supply Contract',
  'Consulting & Professional Services',
  'Non-Disclosure & Data Protection',
] as const
