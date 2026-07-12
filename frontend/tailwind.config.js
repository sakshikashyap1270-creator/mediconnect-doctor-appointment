/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // Medical Blue
          hover: '#2563eb',
          light: 'rgba(59, 130, 246, 0.1)',
        },
        success: {
          DEFAULT: '#10b981',
          hover: '#059669',
          light: 'rgba(16, 185, 129, 0.1)',
        },
        warning: '#f59e0b',
        danger: {
          DEFAULT: '#ef4444',
          light: 'rgba(239, 68, 68, 0.1)',
        },
      },
      fontFamily: {
        title: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
