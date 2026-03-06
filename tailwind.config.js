/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'h-dark': '#16697A',     // Deep Teal
        'h-blue': '#489FB5',     // Main Blue
        'h-light': '#82C0CC',    // Sky Blue
        'h-cream': '#EDE7E3',    // Background
        'h-orange': '#FFA62B',   // Accent
      },
    },
  },
  plugins: [],
}