/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'yr-navy': '#0B1F3A',
        'yr-navy-light': '#162F52',
        'yr-navy-dark': '#071527',
        'yr-yellow': '#F5C400',
        'yr-yellow-hover': '#DDAF00',
        'yr-bg': '#F7F8FA',
        'yr-card': '#FFFFFF',
        'yr-border': '#E2E8F0',
        'yr-success': '#16A34A',
        'yr-danger': '#DC2626',
        'yr-warning': '#F59E0B',
        'yr-info': '#2563EB',
        /* Dark Mode Palette */
        'yr-dark-bg': '#071525',
        'yr-dark-surface': '#0F2138',
        'yr-dark-card': '#10263F',
        'yr-dark-border': '#263A52',
        'yr-dark-border-subtle': '#1B2F47',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
