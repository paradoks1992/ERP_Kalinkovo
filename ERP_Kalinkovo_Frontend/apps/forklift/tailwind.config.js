/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: "#0E9F6E",
        brandDark: "#0B7A54",
        danger: "#E02424",
        warning: "#F59E0B"
      }
    }
  },
  plugins: []
};
