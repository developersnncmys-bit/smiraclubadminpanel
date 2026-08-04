/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        ink: {
          900: '#0b1524',
          800: '#152238',
          700: '#28374f',
          600: '#4a5a73',
          500: '#6d7c93',
          400: '#96a2b4',
        },
        // Travel brand: deep ocean teal + sunset coral
        brand: {
          50: '#eefbf7',
          100: '#d3f5ec',
          200: '#a8ebda',
          300: '#6dd9c3',
          400: '#34bfa6',
          500: '#14a58c',
          600: '#0b8472',
          700: '#0b6a5d',
          800: '#0c554c',
          900: '#0b463f',
        },
        sunset: {
          100: '#ffe9d9',
          300: '#ffb27a',
          500: '#f97316',
          600: '#ea6c1f',
        },
        ocean: '#0ea5e9',
        grape: '#7c5cff',
        coral: '#f9714a',
        gold: '#f5b73c',
        surface: {
          base: '#f4f7fa',
          card: '#ffffff',
          soft: '#eef2f7',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,21,36,0.04), 0 8px 28px -12px rgba(11,21,36,0.12)',
        lift: '0 20px 45px -20px rgba(11,21,36,0.28)',
        glow: '0 18px 40px -18px rgba(20,165,140,0.55)',
      },
      backgroundImage: {
        'app-aurora':
          'radial-gradient(55% 45% at 8% 0%, rgba(20,165,140,0.14) 0%, transparent 60%), radial-gradient(45% 40% at 92% 4%, rgba(14,165,233,0.14) 0%, transparent 60%), radial-gradient(60% 45% at 55% 110%, rgba(249,113,74,0.10) 0%, transparent 60%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
