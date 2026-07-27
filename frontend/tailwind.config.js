/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#111317',
        'on-background': '#e2e2e8',
        'bg-secondary': '#181B22',
        'bg-surface': '#242932',
        surface: '#111317',
        'on-surface': '#e2e2e8',
        'border-subtle': '#334155',
        primary: '#ffd200',
        'on-primary': '#3b2f00',
        secondary: '#ddb7ff', // AI Purple
        'on-secondary': '#490080',
        'status-healthy': '#22C55E',
        'status-warning': '#F59E0B',
        'status-critical': '#EF4444',
        'status-offline': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Hanken Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'lg': '16px',
        'md': '8px',
        'full': '9999px',
      },
      spacing: {
        '24': '24px', // The 24px Rule
      }
    },
  },
  plugins: [],
}
