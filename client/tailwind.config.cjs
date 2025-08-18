/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // CHANGE: Add this line to enable class-based dark mode
  theme: {
    extend: {
      colors: { // CHANGE: Add the colors object to extend the theme
        black: '#000000',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}