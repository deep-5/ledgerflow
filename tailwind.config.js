/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F7FC',
          100: '#D9EFFA',
          200: '#BCE3F7',
          300: '#86CDF2',
          400: '#3EAFE7',
          500: '#087EDB', // Primary bright blue
          600: '#087EDB', // Primary action
          700: '#0668B6', // Primary hover
          800: '#075491',
          900: '#0B4775',
        },
        electric: {
          50: '#F0F7FC',
          100: '#D9EFFA',
          200: '#BCE3F7',
          300: '#86CDF2',
          400: '#3EAFE7',
          500: '#087EDB',
          600: '#0668B6',
          700: '#075491',
        },
        lime: {
          highlight: '#A7F477', // Lime green highlights
          50: '#F7FEEB',
          100: '#EBFDD8',
          200: '#D8FBB6',
          300: '#BEF88F',
          400: '#A7F477',
          500: '#A7F477',
          600: '#5DB321',
          700: '#448914',
          dark: '#2A5D07',
        },
        canvas: '#E2F0F6', // Soft blue background
        surface: {
          DEFAULT: '#FFFFFF', // White cards & sidebar
          subtle: '#F3F7FA', // Cool gray sections
          hover: '#EEF5F9',
          border: '#E5EBF0', // Borders
          'border-subtle': '#EDF2F6',
          secondary: '#D9EFFA', // Light blue secondary cards
        },
        text: {
          main: '#202938', // Main text
          secondary: '#788596', // Secondary text
          muted: '#9AA6B5',
        },
        status: {
          success: '#5DB321',
          'success-bg': '#EBFDD8',
          'success-border': '#D8FBB6',
          warning: '#D97706',
          'warning-bg': '#FFFBEB',
          'warning-border': '#FEF3C7',
          error: '#DC2626',
          'error-bg': '#FEF2F2',
          'error-border': '#FEE2E2',
          info: '#087EDB',
          'info-bg': '#D9EFFA',
          'info-border': '#BCE3F7',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 10px 25px -3px rgba(15, 23, 42, 0.06), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
        'elevated': '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'modal': '0 25px 50px -12px rgba(15, 23, 42, 0.18)',
        'dropdown': '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
        'inner-light': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.015em',
      }
    },
  },
  plugins: [],
}
