/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#14213D', 800: '#1b2c4f', 700: '#243a66', 900: '#0d1730' },
        brand: { DEFAULT: '#2563EB', dark: '#1d4ed8', light: '#dbeafe' },
        accent: { DEFAULT: '#06B6D4', light: '#cffafe' },
        surface: '#F8FAFC',
        ink: '#1E293B',
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)',
        pop: '0 10px 30px rgba(15,23,42,.12)',
      },
    },
  },
  plugins: [],
};
