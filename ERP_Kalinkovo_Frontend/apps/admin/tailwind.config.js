/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          600: '#1f7a1f',
          700: '#166316'
        }
      }
    }
  },
  plugins: []
};
