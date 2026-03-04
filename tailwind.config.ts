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
        primary: {
          DEFAULT: '#1E1E1E',
          dark: '#1A1A1A',
        },
        secondary: {
          DEFAULT: '#2C2C2C',
          dark: '#282828',
        },
        accent: {
          green: '#66BB6A',
          'green-dark': '#388E3C',
          blue: '#2196F3',
          'blue-dark': '#1E88E5',
          gold: '#FFA000',
          'gold-light': '#FFC107',
        },
        border: '#404040',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
      },
    },
  },
  plugins: [],
}

export default config
