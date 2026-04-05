/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0d1117',
        'bg-secondary': '#161b22',
        'bg-tertiary': '#21262d',
        'accent-primary': '#58a6ff',
        'accent-secondary': '#8b949e',
        'status-green': '#3fb950',
        'status-yellow': '#d29922',
        'status-orange': '#d29922',
        'status-red': '#f85149',
        'text-primary': '#ffffff',
        'text-secondary': '#c9d1d9',
        'text-muted': '#8b949e',
      },
      fontFamily: {
        'heading': ['DM Sans', 'sans-serif'],
        'body': ['DM Sans', 'sans-serif'],
        'mono': ['DM Mono', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'flow': 'flow 3s linear infinite',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 51, 102, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 51, 102, 0.8)' },
        },
        flow: {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
