/** @type {import('tailwindcss').Config} */
export default {
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
        'yr-bg': '#F7F8FA',
        'yr-card': '#FFFFFF',
        'yr-success': '#16A34A',
        'yr-danger': '#DC2626',
        'yr-warning': '#F59E0B',
        'yr-info': '#2563EB',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
