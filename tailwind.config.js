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
        fifa: {
          dark: '#080c14',
          card: '#0f172a',
          cardLight: '#162238',
          border: '#1e293b',
          borderHighlight: '#334155',
          neon: '#00f59b',
          neonHover: '#00dc8b',
          emerald: '#10b981',
          gold: '#fbbf24',
          danger: '#f43f5e',
          accent: '#38bdf8'
        }
      },
      fontFamily: {
        gaming: ['"Outfit"', '"Rajdhani"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'neon-glow': '0 0 20px -3px rgba(0, 245, 155, 0.35)',
        'danger-glow': '0 0 20px -3px rgba(244, 63, 94, 0.35)',
        'gold-glow': '0 0 20px -3px rgba(251, 191, 36, 0.35)',
        'blue-glow': '0 0 20px -3px rgba(56, 189, 248, 0.35)',
      }
    },
  },
  plugins: [],
}
