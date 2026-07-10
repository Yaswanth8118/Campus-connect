/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // ── Primary: Ink Red — deep editorial crimson ────
        primary: {
          50:  '#fef2f2',
          100: '#fde3e3',
          200: '#fdcbcb',
          300: '#faa7a7',
          400: '#f47272',
          500: '#e94545',
          600: '#c92a2a',   // ← brand anchor
          700: '#a82222',
          800: '#8b2020',
          900: '#742121',
          950: '#3f0d0d',
        },

        // ── Gold: Paper Gold — warm luxurious accents ────
        gold: {
          50:  '#fdfaf3',
          100: '#faf2de',
          200: '#f4e2b8',
          300: '#eccc88',
          400: '#e3b25a',
          500: '#d99a3a',
          600: '#c47f2a',   // ← main gold
          700: '#a36224',
          800: '#854e24',
          900: '#6e4120',
          950: '#3d2110',
        },

        // ── Ink: Deep charcoal-blues for text ────────────
        ink: {
          50:  '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c9',
          400: '#8590ab',
          500: '#667291',
          600: '#525c78',
          700: '#434b62',
          800: '#3a4053',
          900: '#343847',
          950: '#1a1c25',
        },

        // ── Paper: Warm off-white surfaces (light theme) ─
        paper: {
          50:  '#fefdfb',
          100: '#fdf9f4',
          200: '#faf3e8',
          300: '#f5e9d6',
          400: '#eddbc0',
          500: '#e2c9a5',
          600: '#d1ae82',
          700: '#b8905e',
          800: '#9a7648',
          900: '#7e613d',
        },

        // ── Dark theme: Rich warm charcoal ───────────────
        dark: {
          50:  '#F5F3F1',
          100: '#E8E4E0',
          200: '#D4CEC8',
          300: '#A8A099',
          400: '#7D756E',
          500: '#5C544E',
          600: '#443E3A',
          700: '#362F2C',
          750: '#2E2825',
          800: '#252120',
          850: '#1E1A19',
          900: '#171413',
          950: '#0F0D0C',
        },

        // ── Accent: Sage green for secondary actions ─────
        accent: {
          50:  '#f2f8f4',
          100: '#e0f0e4',
          200: '#c2e0cb',
          300: '#95c8a5',
          400: '#65ab7b',
          500: '#438f5e',
          600: '#32734a',
          700: '#295c3d',
          800: '#244a33',
          900: '#1f3d2b',
          950: '#0f2218',
        },

        // ── Semantic ─────────────────────────────────────
        success: {
          50:  '#f0faf4', 100: '#dcf5e5',
          400: '#5cb87a', 500: '#3d9d5a', 600: '#2d7f46',
        },
        warning: {
          50:  '#fef9ed', 100: '#fdf0cf',
          400: '#e6a833', 500: '#d4922a', 600: '#b87a22',
        },
        danger: {
          50:  '#fef2f2', 100: '#fee2e2',
          400: '#e06060', 500: '#d44545', 600: '#b83333',
        },
        info: {
          50:  '#f0f6fe', 100: '#dde9fc',
          400: '#6a9ee6', 500: '#4a82d4', 600: '#3368b8',
        },
      },

      animation: {
        'fade-in':        'fadeIn 0.5s ease-out',
        'fade-in-up':     'fadeInUp 0.6s ease-out',
        'slide-up':       'slideUp 0.4s ease-out',
        'slide-down':     'slideDown 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in':       'scaleIn 0.35s ease-out',
        'bounce-subtle':  'bounceSubtle 0.6s ease-out',
        'pulse-slow':     'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':           'glow 2s ease-in-out infinite alternate',
        'shimmer':        'shimmer 2.5s linear infinite',
        'spin-slow':      'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:       { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp:     { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp:      { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown:    { '0%': { transform: 'translateY(-10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideInRight: { '0%': { transform: 'translateX(-20px)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        scaleIn:      { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        bounceSubtle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
        glow:         { '0%': { boxShadow: '0 0 10px rgba(201,42,42,0.4), 0 0 20px rgba(201,42,42,0.2)' }, '100%': { boxShadow: '0 0 25px rgba(201,42,42,0.6), 0 0 40px rgba(201,42,42,0.3)' } },
        shimmer:      { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
      },

      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'dark-sm':  '0 1px 3px 0 rgba(0,0,0,0.4)',
        'dark-md':  '0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.3)',
        'dark-lg':  '0 10px 15px -3px rgba(0,0,0,0.6), 0 4px 6px -4px rgba(0,0,0,0.4)',
        'dark-xl':  '0 20px 25px -5px rgba(0,0,0,0.7), 0 8px 10px -6px rgba(0,0,0,0.4)',
        'glow-primary': '0 0 20px rgba(201,42,42,0.25), 0 0 40px rgba(201,42,42,0.10)',
        'glow-gold':    '0 0 20px rgba(196,127,42,0.25), 0 0 40px rgba(196,127,42,0.10)',
        'card':         '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
        'card-hover':   '0 4px 20px rgba(201,42,42,0.08), 0 1px 4px rgba(0,0,0,0.04)',
      },
      borderRadius: { 'xl': '12px', '2xl': '16px', '3xl': '20px' },
    },
  },
  plugins: [],
};
