/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium adult energy palette — tuned to the 30Up packaging
        // (near-black charcoal, electric blue, gold).
        ink: {
          950: '#04060a', // deepest black
          900: '#07090f', // footer / deep sections
          800: '#0b0e15', // primary background
          700: '#121724', // elevated panels
          600: '#1b2230', // borders / hovers
        },
        razz: {
          // Electric blue (Blue Razz) — matches the logo/pack blue
          300: '#7ab6ff',
          400: '#4d9bff',
          500: '#2a8cff',
          600: '#0f6fe6',
          700: '#0a55b8',
        },
        lemon: {
          // Gold/lemon accent (Lemonade)
          300: '#ffd95e',
          400: '#f7c01a',
          500: '#e0a800',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        glow: '0 0 60px -12px rgba(42, 140, 255, 0.5)',
        card: '0 24px 60px -24px rgba(0, 0, 0, 0.75)',
      },
      backgroundImage: {
        'razz-lemon': 'linear-gradient(135deg, #2a8cff 0%, #f7c01a 100%)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}
