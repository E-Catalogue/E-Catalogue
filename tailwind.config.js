/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          soft: 'var(--color-surface-soft)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          soft: 'var(--color-ink-soft)',
        },
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        divider: 'var(--color-divider)',

        // Accent palette for stat cards / charts
        accent: {
          blue: '#2563EB',
          green: '#16A34A',
          orange: '#EA580C',
          amber: '#F59E0B',
          purple: '#7C3AED',
          teal: '#0D9488',
        },
        semantic: {
          success: '#16A34A',
          error: '#E11933',
          warning: '#F59E0B',
          info: '#2563EB',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(24,29,42,0.04), 0 8px 24px -12px rgba(24,29,42,0.10)',
        'card-hover': '0 4px 12px rgba(24,29,42,0.06), 0 16px 40px -16px rgba(24,29,42,0.18)',
        glow: '0 8px 24px -8px rgba(217,119,87,0.45)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
