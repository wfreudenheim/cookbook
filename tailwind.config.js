/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#FEFEFE',
          secondary: '#FCFCFC',
        },
        text: {
          primary: '#2A2A2A',
          secondary: '#4A4A4A',
        },
        accent: {
          primary: '#6B7F6A',
          secondary: '#8FA08E',
        },
        border: {
          light: '#E5E5E5',
          medium: '#D1D1D1',
        },
        success: '#A3B3A2',
        error: '#C4857A',
      },
    },
  },
  plugins: [],
} 