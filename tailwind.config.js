/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium adult energy palette
        ink: {
          900: '#070b18', // deepest charcoal/navy
          800: '#0a1124', // primary background
          700: '#101a36', // elevated panels
          600: '#18244a',
        },
        razz: {
          // Electric blue (Blue Razz)
          400: '#5cc8ff',
          500: '#38bdf8',
          600: '#0ea5e9',
        },
        lemon: {
          // Lemon yellow (Lemonade)
          300: '#ffe066',
          400: '#fdd835',
          500: '#f5c518',
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
        glow: '0 0 60px -12px rgba(56, 189, 248, 0.45)',
        card: '0 20px 50px -20px rgba(0, 0, 0, 0.6)',
      },
      backgroundImage: {
        'razz-lemon': 'linear-gradient(135deg, #38bdf8 0%, #fdd835 100%)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}
