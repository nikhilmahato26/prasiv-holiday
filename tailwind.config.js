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
          DEFAULT: '#16294D',
        },
        navy: {
          50:'#EEF2F8', 100:'#DDE5F0', 200:'#C3D0E4', 400:'#4A6FA8', 500:'#2F5490',
          600:'#1F3B66', 700:'#16294D', 800:'#132441', 900:'#0E1B33', 950:'#08111F',
          DEFAULT: '#16294D',
        },
        // Accent — gold (Prashiv Holiday logo)
        gold: {
          50:'#FBF6E7', 100:'#F5E9C6', 200:'#EBD79A', 300:'#E0C264', 400:'#D9B44A',
          500:'#C9A227', 600:'#B08D1F', 700:'#8A6E1C', 800:'#6B5514',
          DEFAULT: '#C9A227',
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
