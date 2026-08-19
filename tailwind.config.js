/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Montserrat', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      colors: {
        border: { DEFAULT: '#eae2d6' },
        ink: '#18140f',
        paper: '#ffffff',
        section: '#fbf6ef',
        muted: '#7c7267',
        coral: '#69418b',
        coralLight: 'rgba(105, 65, 139, 0.2)',
        coralDark: '#54346f',
        coraldark: '#54346f',
        pine: '#0e3b34',
        pineLight: '#155048',
        line: '#eae2d6',
        shadow: { DEFAULT: '#eae2d6' },
        peach: '#ffe6d9',
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        coral: '0 4px 6px -1px rgba(105, 65, 139, 0.1), 0 2px 4px -1px rgba(105, 65, 139, 0.05)',
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
    },
  },
  plugins: [],
}