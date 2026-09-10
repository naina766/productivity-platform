/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#050505',
          'bg-secondary': '#0A0A0A',
          card: '#111111',
          'card-elevated': '#161616',
          border: 'rgba(255, 255, 255, 0.10)',
        },
        light: {
          bg: '#F7F7F5',
          'bg-secondary': '#EFEFED',
          card: '#FFFFFF',
          border: '#E5E5E5',
        },
        nova: {
          // NOVA accent palette — NO blue, purple, violet, or indigo
          primary: '#22C55E',       // emerald-500
          secondary: '#84CC16',     // lime-500
          highlight: '#A3E635',     // lime-400
          teal: '#14B8A6',          // teal-500
          'primary-light': '#16A34A',  // emerald-600 (light mode)
          'secondary-light': '#65A30D', // lime-600 (light mode)
          text: '#F5F5F5',
          'text-muted': '#A3A3A3',
          'text-light': '#171717',
          'text-light-muted': '#525252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 28s linear infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'border-beam': 'border-beam 4s ease infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backgroundImage: {
        'nova-gradient': 'linear-gradient(135deg, #22C55E 0%, #84CC16 50%, #14B8A6 100%)',
        'nova-glow': 'radial-gradient(ellipse at center, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
}
