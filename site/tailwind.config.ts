import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#070708",
        panel: "#0e0e11",
        panel2: "#141418",
        line: "#232327",
        lineDim: "#1a1a1e",
        ink: "#f6f3ec",
        inkMid: "#a4a4a8",
        inkDim: "#6e6e74",
        red: "#e50914",
        redSoft: "#ff2530",
        amber: "#ffb000",
      },
      fontFamily: {
        display: ["var(--font-anton)", "Impact", "sans-serif"],
        body: ["var(--font-archivo)", "system-ui", "sans-serif"],
        mono: ["var(--font-jet)", "monospace"],
      },
      maxWidth: { content: "1200px" },
      boxShadow: {
        redglow: "0 10px 30px rgba(229,9,20,0.45)",
        screen:
          "0 50px 130px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), 0 30px 80px rgba(229,9,20,0.12)",
      },
      keyframes: {
        pulse2: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.35" } },
      },
      animation: { pulse2: "pulse2 1.5s ease-in-out infinite" },
    },
  },
  plugins: [],
};

export default config;
