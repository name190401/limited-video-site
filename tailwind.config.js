/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'serif'],
        serifjp: ['"Noto Serif JP"', 'serif'],
        sansjp: ['"Noto Sans JP"', 'sans-serif'],
      },
      colors: {
        gold: {
          50: '#FBF7EC',
          100: '#F5ECD3',
          200: '#EBD9A7',
          300: '#E0C57B',
          400: '#D4AF37',
          500: '#C5A55A',
          600: '#A68A3E',
          700: '#876E2F',
          800: '#685321',
          900: '#4A3B17',
        },
        dark: {
          50: '#2A2A2A',
          100: '#222222',
          200: '#1A1A1A',
          300: '#151515',
          400: '#111111',
          500: '#0D0D0D',
          600: '#0A0A0A',
          700: '#070707',
          800: '#050505',
          900: '#020202',
        },
        // 紺×金・明るめ。コンセプトカラー（グラデーション可）。
        navy: {
          50: '#EEF2FB',
          100: '#D6E0F5',
          200: '#AEC0E8',
          300: '#7E97D4',
          400: '#4F6BBC',
          500: '#33489A',
          600: '#24367D',
          700: '#1B2A52',
          800: '#132040',
          900: '#0C1530',
        },
      },
      keyframes: {
        'fade-in-up': { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-150% 0' }, '100%': { backgroundPosition: '250% 0' } },
      },
      animation: {
        'fade-in-up': 'fade-in-up 240ms ease-out both',
        'fade-in': 'fade-in 220ms ease-out both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}
