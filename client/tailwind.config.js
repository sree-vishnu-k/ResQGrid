/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f7ff',
          100: '#e0efff',
          200: '#baddff',
          300: '#7dbeff',
          400: '#3b9dff',
          500: '#1a7de8',
          600: '#0f5fc7',
          700: '#0d4da3',
          800: '#0e3f86',
          900: '#0f356e',
          950: '#081d42',
        },
        risk: {
          green:  '#16a34a',
          yellow: '#ca8a04',
          orange: '#ea580c',
          red:    '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'apple':    '0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
        'apple-lg': '0 12px 40px rgba(0,0,0,0.09), 0 4px 12px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};