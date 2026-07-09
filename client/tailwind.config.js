/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#111827",
          primary: "#4f46e5",
          secondary: "#7c3aed",
          soft: "#eef2ff"
        }
      }
    }
  },
  plugins: []
};