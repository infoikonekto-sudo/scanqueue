/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#1E3A8A', // Navy
          hover: '#172554',
          light: '#DBEAFE',
        },
        'secondary': {
          DEFAULT: '#0EA5E9', // Sky
          hover: '#0284C7',
          light: '#E0F2FE',
        },
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F59E0B',
        'navy': '#1E3A8A',
        'navy-light': '#3B82F6',
        'navy-dark': '#0F172A',
      },
      fontSize: {
        'order': '64px', // Aumentado para mayor visibilidad
      },
      spacing: {
        'card': '20px',
      },
      borderRadius: {
        'card': '12px', // Más redondeado para look moderno
      },
      boxShadow: {
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'subtle': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'premium': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '4k': '3840px',
      }
    },
  },
  plugins: [],
}
