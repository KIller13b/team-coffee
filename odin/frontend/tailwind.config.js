/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        workspace: {
          bg: '#f8fafc',
          subtle: '#f1f5f9',
          card: '#ffffff',
          border: '#e2e8f0',
          'border-strong': '#cbd5e1',
          text: '#0f172a',
          muted: '#64748b',
          faint: '#94a3b8',
        },
        console: {
          bg: '#080d19',
          surface: '#0f172a',
          card: '#131e36',
          border: '#1e293b',
          'border-strong': '#334155',
          text: '#f8fafc',
          muted: '#94a3b8',
        },
        agent: {
          odin: '#f59e0b',
          thor: '#06b6d4',
          norns: '#8b5cf6',
          loki: '#f43f5e',
          heimdall: '#3b82f6',
          tyr: '#10b981',
        },
        severity: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#10b981',
          info: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'agent-glow': '0 0 20px -3px rgba(6, 182, 212, 0.15)',
      }
    },
  },
  plugins: [],
}

