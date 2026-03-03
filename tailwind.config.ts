import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#02A95C',
        'primary-dark': '#017A42',
        'primary-light': '#E8FBF2',
        navy: '#16233A',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        sans: ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
