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
        /* Official Light Palette (Unchanged) */
        'yr-navy': '#0B1F3A',
        'yr-navy-light': '#162F52',
        'yr-navy-dark': '#071527',
        'yr-yellow': '#F5C400',
        'yr-yellow-hover': '#DDAF00',
        'yr-orange': '#F59E0B',
        'yr-bg': '#F7F8FA',
        'yr-card': '#FFFFFF',
        'yr-border': '#E2E8F0',
        'yr-success': '#16A34A',
        'yr-danger': '#DC2626',
        'yr-warning': '#F59E0B',
        'yr-info': '#2563EB',
        /* Pure Black Dark Palette */
        'yr-dark-bg': '#000000',
        'yr-dark-surface': '#0A0A0A',
        'yr-dark-card': '#111111',
        'yr-dark-border': '#222222',
        'yr-dark-border-subtle': '#181818',
        'yr-dark-text-sec': '#A1A1AA',
        'yr-dark-text-muted': '#71717A',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
