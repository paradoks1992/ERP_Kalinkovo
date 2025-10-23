export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#3E8F4D", 50:"#F0F7F2",100:"#DBEDE1",200:"#B5D9C0",300:"#8DC49E",400:"#6BB285",500:"#4EA571",600:"#3E8F4D",700:"#2F6B3A",800:"#214C28",900:"#16351B" },
        brandDark: "#2F6B3A",
        danger: "#E53935"
      },
      borderRadius: { xl2: "14px" }
    }
  },
  plugins: []
};
