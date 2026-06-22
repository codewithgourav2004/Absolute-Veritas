/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        indigo: { DEFAULT: '#1A1F3C', 900: '#1A1F3C' },
        crimson: { DEFAULT: '#E63946' },
        pearl: { DEFAULT: '#F8F7F4' },
        steel: { DEFAULT: '#6B7280' },
        gold: { DEFAULT: '#D4AF37' },
      },
      fontFamily: {
        display: ['Playfair Display', 'Playfair Display Fallback', 'Georgia', 'serif'],
        body: ['DM Sans', 'DM Sans Fallback', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      animation: {
        'ticker': 'ticker 30s linear infinite',
        'marquee': 'marquee 25s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
