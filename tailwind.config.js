/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#090F15',
        mountain: '#262F36',
        'apres-ski': '#6C6D74',
        slopes: '#B3B7BA',
        arctic: '#D3D1CE',
        snow: '#F8F7F4',
        brand: '#0000F0',
      },
      fontFamily: {
        sans: ['"Neue Haas Display"'],
      },
    },
  },
  plugins: [],
}; 
