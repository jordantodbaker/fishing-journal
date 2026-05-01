import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: ["\"Fraunces\"", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        moss: {
          50: "#f4f7f1",
          100: "#e6ede0",
          200: "#cbdac0",
          300: "#a6bf95",
          400: "#7fa169",
          500: "#5e844b",
          600: "#476938",
          700: "#39522e",
          800: "#2f4227",
          900: "#283821",
          950: "#141e10",
        },
        bark: {
          50: "#f8f5f0",
          100: "#ebe2d2",
          200: "#d8c4a3",
          300: "#bfa172",
          400: "#a78352",
          500: "#8d6b40",
          600: "#735436",
          700: "#5a4230",
          800: "#3f2f23",
          900: "#2a2018",
        },
        river: {
          50: "#eef6f7",
          100: "#d3e7ea",
          200: "#a8cfd4",
          300: "#76b1ba",
          400: "#4d929d",
          500: "#357884",
          600: "#2a606b",
          700: "#244c55",
          800: "#1f3d44",
          900: "#162a30",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 30, 16, 0.06), 0 4px 16px rgba(20, 30, 16, 0.06)",
      },
    },
  },
  plugins: [],
} satisfies Config;
