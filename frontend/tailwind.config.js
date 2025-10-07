/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'server-active': '#10b981',
        'server-crashed': '#ef4444',
        'server-leader': '#3b82f6',
        'log-info': '#6366f1',
        'log-warning': '#f59e0b',
        'log-error': '#dc2626',
        'log-success': '#059669'
      }
    },
  },
  plugins: [],
}
