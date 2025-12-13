import typography from '@tailwindcss/typography';

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  // Use class strategy so next-themes can toggle the `dark` class
  darkMode: 'class',
  plugins: [
    typography,
  ],
};
