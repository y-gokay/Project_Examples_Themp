/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      letterSpacing: {
        tightish: '-0.015em',
      },
      colors: {
        // Teal — ana marka
        primary: {
          50:  '#f0fafa',
          100: '#ccefef',
          200: '#99dfdf',
          300: '#5dc9c8',
          400: '#2db0af',
          500: '#0e7c7b',
          600: '#0a6463',
          700: '#084f4e',
          800: '#063b3a',
          900: '#042828',
          950: '#0b1f22',
        },
        // Soft lavender — secondary/accent
        lavender: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b7dd4',
          600: '#7b6dab',
          700: '#6b5d8c',
          800: '#4c3f6a',
          900: '#2e2440',
        },
        // Sage green — health/healing states
        sage: {
          50:  '#f2faf5',
          100: '#d5f0e1',
          200: '#a9e1c2',
          300: '#7dd2a3',
          400: '#51c384',
          500: '#4a9e6f',
          600: '#3a7f58',
          700: '#2c6043',
          800: '#1e402d',
          900: '#102018',
        },
        // Deep blue-gray dark backgrounds
        deep: {
          950: '#080f18',
          900: '#0d1a28',
          800: '#122235',
          700: '#172b43',
          600: '#1d3451',
        },
        bg: {
          base: '#f8fafc',
          elev: '#ffffff',
          muted: '#f1f5f9',
        },
        border: {
          subtle: 'rgba(15, 23, 42, 0.08)',
          strong: 'rgba(15, 23, 42, 0.14)',
        },
        accent: {
          DEFAULT: '#7c3aed',
          soft: 'rgba(124, 58, 237, 0.12)',
        },
      },
      boxShadow: {
        soft:   '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        card:   '0 4px 20px rgba(14,124,123,0.08)',
        lift:   '0 8px 30px rgba(14,124,123,0.15)',
        glow:   '0 0 24px rgba(14,124,123,0.35)',
        'glow-lg': '0 0 40px rgba(14,124,123,0.22)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%,100%': { transform: 'translateY(0px) scale(1)' },
          '50%':     { transform: 'translateY(-18px) scale(1.04)' },
        },
        breathe: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%':     { transform: 'scale(1.08)', opacity: '0.9' },
        },
        'pulse-dot': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0.3' },
        },
        sunpulse: {
          '0%,100%': { transform: 'scale(1)', opacity: '0.28' },
          '50%':     { transform: 'scale(1.05)', opacity: '0.34' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'count-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up':     'fade-up 0.6s ease-out both',
        'fade-in':     'fade-in 0.5s ease-out both',
        'scale-in':    'scale-in 0.4s ease-out both',
        float:         'float 5s ease-in-out infinite',
        'float-slow':  'float-slow 7s ease-in-out infinite',
        breathe:       'breathe 4s ease-in-out infinite',
        'pulse-dot':   'pulse-dot 2s ease-in-out infinite',
        'count-up':    'count-up 0.5s ease-out both',
        sunpulse:      'sunpulse 8s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
