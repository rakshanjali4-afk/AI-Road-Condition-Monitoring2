/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f5ff',
          100: '#e0ebff',
          200: '#c3d6ff',
          300: '#97b6ff',
          400: '#6b93f8',
          500: '#4b70f0',
          600: '#3a5be0',
          700: '#3349bc',
          800: '#0f1e3d',
          900: '#0a1428',
          950: '#050b18',
        },
        electric: {
          400: '#3b82f6',
          500: '#2563eb',
          600: '#1d4ed8',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'scan-line': 'scanLine 2.5s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'progress-fill': 'progressFill 1s ease-out forwards',
        'spin-slow': 'spin 3s linear infinite',
        'blink': 'blink 1.2s ease-in-out infinite',
      },
      keyframes: {
        scanLine: {
          '0%, 100%': { top: '0%', opacity: '0.3' },
          '50%': { top: '100%', opacity: '1' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(40px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34,211,238,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(34,211,238,0.6)' },
        },
        progressFill: {
          from: { width: '0%' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
