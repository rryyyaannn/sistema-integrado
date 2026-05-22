/**
 * Tailwind CSS (via NativeWind v4). As cores `brand` espelham
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
          50: '#eef4fb',
          100: '#d6e4f5',
          200: '#aecbe9',
          300: '#7da8d8',
          400: '#4d83c2',
          500: '#2e63a3',
          600: '#244e84',
          700: '#1d3e69',
          800: '#172f50',
          900: '#0f1f36',
        },
      },
    },
  },
  plugins: [],
};
