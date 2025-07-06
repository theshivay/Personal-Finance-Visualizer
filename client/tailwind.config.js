/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        background: {
          light: '#f9fafb',
          dark: '#111827',
        },
        foreground: {
          light: '#1f2937',
          dark: '#f9fafb',
        },
        muted: {
          light: '#6b7280',
          dark: '#9ca3af',
        },
        border: {
          light: '#e5e7eb',
          dark: '#374151',
        },
        card: {
          light: '#ffffff',
          dark: '#1f2937',
        },
        accent: '#10b981', // Emerald accent color
        destructive: '#ef4444', // Red for destructive actions
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card-light': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-dark': '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
      },
    },
  },
  plugins: [],
}
