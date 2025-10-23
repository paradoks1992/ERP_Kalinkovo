/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#e6f4ea",100:"#e5efe7",200:"#cfe6d7",300:"#a8d3b5",400:"#7fbf93",
          500:"#55a962",600:"#3e8f4d",700:"#2f7140",800:"#285c35",900:"#1f462a"
        }
      },
      borderRadius: { xl2: "1rem" }
    }
  },
  plugins: []
}
