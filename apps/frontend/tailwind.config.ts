import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── Exact Figma font families ──────────────────────────────────
      fontFamily: {
        sans: ['Bricolage Grotesque', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },

      // ── Exact Figma color palette ──────────────────────────────────
      colors: {
        page: '#f0f0f0',
        sidebar: '#ffffff',
        card: '#ffffff',
        'nav-active': '#efefef',
        'bg-profile': '#efefef',
        'bg-input': '#f6f6f6',
        dark: '#171717',
        'create-btn': '#262626',
        banner: '#1d1b20',
        primary: '#2f2f2f',
        muted: '#5d5d5d',
        faint: '#a9a9a9',
        orange: '#ff5623',
        green: '#4bc16c',
        danger: '#c43535',
        'border-light': '#dddddd',
        'border-input': '#e8eaed',
      },

      // ── Exact Figma border radii ───────────────────────────────────
      borderRadius: {
        nav: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '40px',
        card: '24px',
        form: '32px',
        pill: '100px',
        circle: '9999px',
      },

      // ── Box shadows ────────────────────────────────────────────────
      boxShadow: {
        sidebar: '0 4px 24px rgba(0,0,0,0.06)',
        card: '0 2px 12px rgba(0,0,0,0.04)',
        topbar: '0 1px 8px rgba(0,0,0,0.05)',
        dropdown: '0 4px 16px rgba(0,0,0,0.12)',
        btn: '0 2px 8px rgba(0,0,0,0.15)',
      },

      // ── Backdrop blur ──────────────────────────────────────────────
      backdropBlur: {
        topbar: '12px',
      },

      // ── Animations ─────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'spin-slow': 'spin-slow 2s linear infinite',
        shimmer: 'shimmer 2s infinite linear',
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
