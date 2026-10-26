/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        war: {
          bg: '#0a0e1a',
          surface: '#0f1629',
          card: '#141c30',
          border: '#1e2d4a',
          accent: '#1e3a5f',
          blue: '#2563eb',
          cyan: '#06b6d4',
          gold: '#f59e0b',
          red: '#ef4444',
          orange: '#f97316',
          green: '#22c55e',
          text: '#e2e8f0',
          muted: '#64748b',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
