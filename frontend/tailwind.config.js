/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b1120',
          900: '#0f1729',
          800: '#151f38',
          700: '#1d2a48',
          600: '#2a3a5c',
        },
        signal: {
          400: '#5eead4',
          500: '#2dd4bf',
          600: '#14b8a6',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        coral: {
          400: '#fb7185',
          500: '#f43f5e',
        },
      },
      fontFamily: {
        // System font stacks only - no CDN font loading. "display" leans on
        // the rounder system faces (Avenir/Segoe) for headings, "mono" on
        // the system monospace stack for ids/dates/codes.
        display: ['Avenir Next', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
