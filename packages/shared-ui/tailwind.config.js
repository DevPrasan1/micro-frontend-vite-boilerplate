/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#eedeff',
          200: '#ddd6fe',
          300: '#c7d2fe',
          400: '#a5b4fc',
          500: '#818cf8',
          600: '#6366f1',
          700: '#4f46e5',
          800: '#4338ca',
          900: '#3730a3',
          950: '#1e1b4b',
        },
        background: '#09090b', // zinc-950
        surface: '#18181b', // zinc-900
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
