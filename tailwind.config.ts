import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "ui-serif", "Georgia", "serif"],
        sans: ["'Nunito'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        blush: {
          50: "#fff5f7",
          100: "#ffe4ec",
          200: "#ffc9d9",
          300: "#ffa6c1",
          400: "#ff7ba5",
          500: "#f6558b",
          600: "#dc3b76",
        },
        peach: {
          100: "#ffe6d1",
          200: "#ffd0ad",
          300: "#ffb98a",
        },
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(246, 85, 139, 0.35)",
        glow: "0 0 40px rgba(255, 166, 193, 0.55)",
      },
      keyframes: {
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%,60%": { transform: "translateX(-8px)" },
          "40%,80%": { transform: "translateX(8px)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pop: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        shake: "shake 0.45s ease-in-out",
        floaty: "floaty 4s ease-in-out infinite",
        pop: "pop 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
