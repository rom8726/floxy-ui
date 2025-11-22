/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          dark: '#1e40af',
        },
        secondary: '#8b5cf6',
        accent: '#3b82f6',
        gradient: {
          start: '#3b82f6',
          end: '#8b5cf6',
        },
        text: {
          DEFAULT: '#e5e5e5',
          secondary: '#a0a0a0',
          dark: '#1a1a1a',
        },
        bg: {
          DEFAULT: '#0a0a0a',
          secondary: '#111111',
          tertiary: '#1a1a1a',
          light: '#ffffff',
          lightSecondary: '#f8f9fa',
          lightTertiary: '#f1f3f5',
        },
        border: {
          DEFAULT: '#262626',
          light: '#e5e7eb',
        },
        code: {
          DEFAULT: '#1e1e1e',
          light: '#f9fafb',
        },
        warning: '#EF4444',
        success: '#10B981',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '12px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}

