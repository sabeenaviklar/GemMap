import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Cream / Sand Canvas
        canvas: {
          50: "#FCFAF7",
          100: "#FAF7F2",
          200: "#F4EFEA",
          300: "#ECE5DC",
          400: "#DFD6C8",
          500: "#CFC3B0",
        },
        // Forest / Spruce Teal (signature brand color from theme)
        brand: {
          50: "#EFF8F7",
          100: "#D9EFEB",
          200: "#B4DDD6",
          300: "#7EC2B7",
          400: "#4D9F94",
          500: "#2F8479",
          600: "#266B66", // primary teal
          700: "#1F5753",
          800: "#1A4542",
          900: "#153835",
          950: "#0B2120",
        },
        // Warm Terracotta / Clay / Rust
        terracotta: {
          50: "#FCF5F2",
          100: "#FAECE4",
          200: "#F5D6C7",
          300: "#EBB59D",
          400: "#DF8D6C",
          500: "#D96B43", // primary warm rust
          600: "#C85A32",
          700: "#A84422",
          800: "#8B371B",
          900: "#722E17",
        },
        sunset: {
          50: "#FCF5F2",
          100: "#FAECE4",
          500: "#D96B43",
          600: "#C85A32",
        },
        // Deep Charcoal / Ink
        ink: {
          50: "#F5F6F8",
          100: "#E9EBEF",
          200: "#D0D4DD",
          300: "#A4ACB9",
          400: "#6B7280",
          500: "#4B5563",
          600: "#374151",
          700: "#2B303A", // primary dark
          800: "#22262F", // footer dark
          900: "#1A1D24",
          950: "#121419",
        },
        sand: {
          50: "#FAF9F6",
          100: "#F5F2EB",
          200: "#EFECE6",
          300: "#E5DFC",
          400: "#D8D0C5",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-cal)", "var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(43, 48, 58, 0.04)",
        card: "0 8px 24px -4px rgba(43, 48, 58, 0.08)",
        glow: "0 0 20px -3px rgba(217, 107, 67, 0.25)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
