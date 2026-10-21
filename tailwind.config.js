/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0b0b0e',
          900: '#111116',
          850: '#16161d',
          800: '#1c1c24',
          750: '#23232e',
          700: '#2d2d3a',
          600: '#3e3e4f',
          500: '#5c5c70',
          400: '#8b8b9e',
          300: '#b8b8c7',
          200: '#dcdce5',
          100: '#f0f0f5',
        },
        magenta: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          accent: '#e11d74',
          glow: 'rgba(225, 29, 116, 0.25)',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'magenta-glow': '0 0 20px -3px rgba(225, 29, 116, 0.35)',
        'magenta-sm': '0 0 10px -2px rgba(225, 29, 116, 0.25)',
      },
    },
  },
  plugins: [],
};
