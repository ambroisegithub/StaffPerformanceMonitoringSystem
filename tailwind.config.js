/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        black: '#1A1A1A',
        white: '#FFFFFF',
        blue: '#1E90FF',
        green: '#2ECC71',
        yellow: '#FFD700',
        orange: '#FF8C00',
        secondary: '#1C4A93',
        background: '#f8f9fa',
        text: '#212529',
        success: '#28a745',
        warning: '#ffc107',
        info: '#17a2b8',
        light: '#f8f9fa',
        dark: '#343a40',
      }
    },
  },
  plugins: [],
}