/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        mufi: {
          bg: '#f2f4f1',
          surface: '#ffffff',
          label: '#1e2420',
          secondary: '#6b736c',
          tertiary: '#9aa39a',
          accent: '#4a7c59',
          'accent-hover': '#3d6a4b',
          'accent-soft': '#e8f0ea',
          border: 'rgba(30, 36, 32, 0.08)',
          divider: 'rgba(30, 36, 32, 0.1)',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(30, 36, 32, 0.06), 0 1px 2px rgba(30, 36, 32, 0.04)',
        nav: '0 -1px 0 rgba(30, 36, 32, 0.06), 0 -8px 24px rgba(30, 36, 32, 0.05)',
      },
    },
  },
  plugins: [],
}
