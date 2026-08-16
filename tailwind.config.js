/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#8b5cf6",
          deepPurple: "#6d28d9",
          orange: "#f59e0b",
          sky: "#38bdf8",
          green: "#22c55e",
          yellow: "#facc15",
        },
      },
      fontFamily: {
        heading: ["Fredoka", "sans-serif"],
        display: ["Fredoka", "sans-serif"],
        body: ["Quicksand", "sans-serif"],
      },
      borderRadius: {
        card: "0.9rem",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.9)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pop-in": "pop-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
