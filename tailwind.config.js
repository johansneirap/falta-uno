/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F5F0E8',
        primary: '#F97316',
        secondary: '#22C55E',
        danger: '#EF4444',
        brutal: {
          black: '#1A1A1A',
          border: '#000000',
        },
      },
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        brutal: '4px 4px 0px 0px #000000',
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal-lg': '6px 6px 0px 0px #000000',
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
}
