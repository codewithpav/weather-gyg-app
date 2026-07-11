/** @type {import('tailwindcss').Config} */
const fallbackSans = [
  "ui-sans-serif",
  "system-ui",
  "-apple-system",
  "Segoe UI",
  "Roboto",
  "Helvetica Neue",
  "Arial",
  "sans-serif",
];

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fallbackSans],
        display: ["var(--font-display)", "var(--font-sans)", ...fallbackSans],
      },
      colors: {
        // Ownable brand accent — an "iris" indigo that harmonises with the
        // sky→indigo weather gradients. Used for primary CTAs, links, and
        // active states so the interface reads as one branded system.
        brand: {
          50: "#eef0ff",
          100: "#e0e2ff",
          200: "#c6c8ff",
          300: "#a3a4fc",
          400: "#8480f8",
          500: "#6a63f0",
          600: "#5546e0",
          700: "#4536c4",
          800: "#392f9e",
          900: "#332d7d",
        },
      },
    },
  },
  plugins: [],
};
