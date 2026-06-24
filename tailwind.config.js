/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          dark: 'var(--color-secondary-dark)',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        content: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        },
        divider: 'var(--color-divider)',
        
        accent: '#EE8A2F',
        coffee: {
          light: '#CAAB7F',
          DEFAULT: '#BFA06E',
          dark: '#86673A',
        },
        customGray: {
          light: '#393E42',
          dark: '#3B3B45',
        },
        semantic: {
          success: '#00AA5B',
          error: '#EE2737',
          warning: '#F8C20A',
          info: '#0066FF',
        }
      },
    },
  },
  plugins: [],
}