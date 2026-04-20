import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: "#0B1E3F",
          50: "#E6EAF1",
          100: "#C2CCDC",
          200: "#8A9CBA",
          300: "#536C97",
          400: "#2C4674",
          500: "#0B1E3F",
          600: "#091932",
          700: "#071326",
          800: "#040D1A",
          900: "#02060D",
        },
        slate: {
          deep: "#334155",
          soft: "#F1F5F9",
        },
        accent: {
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px 0 rgba(15, 23, 42, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
