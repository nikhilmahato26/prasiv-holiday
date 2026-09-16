/** @type {import('tailwindcss').Config} */
// Note: Tailwind v4 reads its theme from the `@theme` block in app/globals.css.
// This file is kept in sync for tooling / editor intellisense.
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        cursive: ['"Playball"', 'cursive'],
      },
      colors: {
        // Primary — navy blue (Prashiv Holiday logo)
        primary: {
          DEFAULT: '#013893',
        },
        navy: {
          50:'#E6F0FF', 100:'#CCE0FF', 200:'#B3D4FF', 400:'#1A75FF', 500:'#0252D8',
          600:'#012E7A', 700:'#013893', 800:'#011A45', 900:'#012560', 950:'#000B1F',
          DEFAULT: '#013893',
        },
        // Accent — gold (Prashiv Holiday logo)
        gold: {
          50:'#FFF0E5', 100:'#FFE4CC', 200:'#FFCA99', 300:'#FFB166', 400:'#D9B44A',
          500:'#FB6D01', 600:'#B08D1F', 700:'#8A6E1C', 800:'#8A3300',
          DEFAULT: '#FB6D01',
        },
        cream: { DEFAULT:'#F3EFE1', 50:'#FAF8F0', 100:'#F3EFE1', 200:'#EFE6CE', 300:'#E6D7B0' },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from:{ opacity:0 }, to:{ opacity:1 } },
        slideUp: { from:{ opacity:0, transform:'translateY(20px)' }, to:{ opacity:1, transform:'translateY(0)' } },
        float: { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}
