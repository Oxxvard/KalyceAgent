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
        ink: {
          DEFAULT: "#0b0f10",
          soft: "#101416",
          mauve: "#16191b",
          deep: "#070a0b",
        },
        line: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.16)",
        },
        surface: {
          DEFAULT: "rgba(255,255,255,0.04)",
          raised: "rgba(255,255,255,0.06)",
          hover: "rgba(255,255,255,0.07)",
        },
        gold: {
          DEFAULT: "#e6c488",
          deep: "#a87a3e",
          soft: "#f4dfb6",
        },
        ember: {
          DEFAULT: "#e8724a",
          soft: "#f5a882",
        },
        muted: "#8b8778",
        textL: "#d1d5db",
        success: "#6ee7b7",
        warn: "#f5a882",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.35), 0 1px 2px 0 rgba(0,0,0,0.20)",
        glow: "0 8px 40px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "gold-grad": "linear-gradient(135deg, #e6c488, #a87a3e)",
        "gold-ember": "linear-gradient(135deg, #e6c488, #e8724a)",
        "score-aura":
          "linear-gradient(135deg, rgba(230,196,136,0.12) 0%, rgba(232,114,74,0.08) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
