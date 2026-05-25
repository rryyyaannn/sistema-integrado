/**
 * Tailwind CSS (via NativeWind v4). As cores espelham
 * packages/ui-tokens/src/colors.ts — manter em sincronia.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f4f8',
          100: '#dfe4ec',
          200: '#bfc7d5',
          300: '#94a1b7',
          400: '#677893',
          500: '#455a78',
          600: '#344662',
          700: '#28374c',
          800: '#1a2a3d',
          900: '#0e1825',
        },
        steel: {
          50: '#f6f7f9',
          100: '#e8eaed',
          200: '#cdd2d8',
          300: '#a8b0ba',
          400: '#7e8893',
          500: '#5b6571',
          600: '#475058',
          700: '#353c44',
          800: '#252a30',
          900: '#14181c',
        },
      },
    },
  },
  plugins: [],
};
