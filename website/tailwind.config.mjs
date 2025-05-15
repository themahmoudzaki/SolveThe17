/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'honey': {
          50: '#FEF9E7',
          100: '#FCF3CF',
          200: '#F9E79F',
          300: '#F7DC6F',
          400: '#F4D03F',
          500: '#F6B93B', // Primary honey gold
          600: '#E59D1B',
          700: '#D68910',
          800: '#B9770E',
          900: '#9A7D0A',
        },
        'leaf': {
          50: '#F1F9EE',
          100: '#E3F4DD',
          200: '#C7E9BC',
          300: '#ABDF9A',
          400: '#8FD479',
          500: '#78C850', // Primary leaf green
          600: '#5CA63E',
          700: '#4C8933',
          800: '#3D6C29',
          900: '#2D501F',
        },
        'earth': {
          50: '#F7F3EF',
          100: '#EEE7DF',
          200: '#DDCFC0',
          300: '#CCB7A0',
          400: '#BBA080',
          500: '#A67C52', // Primary earthy brown
          600: '#8B6544',
          700: '#715136',
          800: '#573D29',
          900: '#3D2A1C',
        }
      },
      fontFamily: {
        sans: [
          'Inter', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Helvetica Neue', 
          'Arial', 
          'sans-serif'
        ],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-in-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-in-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}