/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        neutral: 'var(--neutral)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        cover: 'var(--cover)',
        cover2: 'var(--cover-2)',
        borderc: 'var(--border)',
        white8: 'var(--white-8)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        glow: {
          '0%,100%': { boxShadow: '0 0 0 rgba(233, 88, 52, 0)' },
          '50%': { boxShadow: '0 0 24px rgba(233, 88, 52, 0.28)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .45s ease-out both',
        floaty: 'floaty 3s ease-in-out infinite',
        glow: 'glow 2.8s ease-in-out infinite',
      },
      boxShadow: {
        flat: '0 8px 24px rgba(0,0,0,.15)',
      },
      fontFamily: {
        vazir: ['Vazirmatn', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

