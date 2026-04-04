/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0e17',
        'bg-secondary': '#141b2d',
        'bg-tertiary': '#1e2942',
        'accent-primary': '#00d4ff',
        'accent-secondary': '#7b61ff',
        'status-green': '#00ff88',
        'status-yellow': '#ffd000',
        'status-orange': '#ff8c00',
        'status-red': '#ff3366',
        'text-primary': '#ffffff',
        'text-secondary': '#8892b0',
        'text-muted': '#5a6380',
      },
      fontFamily: {
        'heading': ['Orbitron', 'sans-serif'],
        'body': ['Rajdhani', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
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
