/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Premium primary color palette (Copper/Orange)
        primary: {
          50: '#fef7f3',
          100: '#fdeee5',
          200: '#fbd9c9',
          300: '#f8bfa7',
          400: '#f39b75',
          500: '#ed7544',
          600: '#e05a2b',
          700: '#c14622',
          800: '#9d3a21',
          900: '#7f311f',
          950: '#45170d',
        },
        // EXACT colors from screenshot - Professional dark charcoal system
        dark: {
          50: '#F4F4F5',   // Highest contrast text (white-ish)
          100: '#E5E7EB',  // Headers/titles
          200: '#D1D5DB',  // Subheaders
          300: '#9CA3AF',  // Body text (readable gray)
          400: '#6B7280',  // Muted text
          500: '#4B5563',  // Borders medium
          600: '#374151',  // Borders dark
          700: '#30333A',  // Card borders and dividers
          750: '#2A2D33',  // Slightly lighter borders
          800: '#202226',  // Card backgrounds (medium-dark surfaces)
          850: '#1A1C1F',  // Elevated card surfaces
          900: '#131416',  // Main background (dark charcoal)
          950: '#0F0F11',  // Deepest background
        },
        // Premium accent colors - soft neon highlights
        accent: {
          cyan: {
            400: '#22D3EE',
            500: '#06B6D4',
            600: '#0891B2',
          },
          green: {
            400: '#4ADE80',
            500: '#22C55E',
            600: '#16A34A',
          },
          blue: {
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB',
          },
          orange: {
            400: '#FB923C',
            500: '#F97316',
            600: '#EA580C',
          },
        },
        // High contrast success colors
        success: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        // Enhanced warning colors
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Premium danger/error colors
        danger: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        // Clean info/blue colors
        info: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'scale-in': 'scaleIn 0.35s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(237, 117, 68, 0.5), 0 0 20px rgba(237, 117, 68, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(237, 117, 68, 0.8), 0 0 40px rgba(237, 117, 68, 0.4)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'dark-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'glow-primary': '0 0 20px rgba(237, 117, 68, 0.35), 0 0 40px rgba(237, 117, 68, 0.15)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.35), 0 0 40px rgba(34, 211, 238, 0.15)',
        'glow-green': '0 0 20px rgba(74, 222, 128, 0.35), 0 0 40px rgba(74, 222, 128, 0.15)',
      },
    },
  },
  plugins: [],
};
