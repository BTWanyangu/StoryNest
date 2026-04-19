/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Lora', 'serif'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        night: '#0d0d1a',
        night2: '#13132a',
        night3: '#1a1a38',
        star: '#f9f4e8',
        moon: '#ffd97d',
        moon2: '#ffb347',
        purple: '#7c5cbf',
        purple2: '#a07ee0',
        purple3: '#c9b3f5',
        teal: '#4ecdc4',
        coral: '#ff6b6b',
        green: '#6bcb77',
        card: '#1e1e40',
        card2: '#252550',
        text: '#e8e4f8',
        muted: '#9898c8',
      },
      boxShadow: {
        moon: '0 8px 24px rgba(255,183,71,.4)',
        purple: '0 6px 20px rgba(124,92,191,.4)',
      },
      borderRadius: {
        xl2: '16px',
        sm2: '10px',
      },
      keyframes: {
        twinkle: {
          '0%,100%': { opacity: '0.15', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.4)' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
      },
      animation: {
        twinkle: 'twinkle var(--d,3s) ease-in-out infinite var(--delay,0s)',
        floaty: 'floaty 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
