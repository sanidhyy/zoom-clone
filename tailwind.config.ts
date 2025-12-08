import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-open-sans)", "Helvetica", "Arial", "sans-serif"],
        heading: ["var(--font-roboto)", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        // Apple-inspired dark palette
        dark: {
          1: "#1d1d1f",
          2: "#000000",
          3: "#2d2d2f",
          4: "#3d3d3f",
        },
        // Apple blue accent
        blue: {
          1: "#0071e3",
          2: "#147ce5",
          3: "#2997ff",
        },
        // Subtle grays
        gray: {
          1: "#86868b",
          2: "#f5f5f7",
          3: "#424245",
        },
        sky: {
          1: "#C9DDFF",
          2: "#ECF0FF",
          3: "#F5FCFF",
        },
        orange: {
          1: "#FF742E",
        },
        purple: {
          1: "#bf5af2",
        },
        yellow: {
          1: "#ffd60a",
        },
        green: {
          1: "#30d158",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        hero: "url('/images/hero-background.png')",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      boxShadow: {
        apple: "0 4px 12px rgba(0, 0, 0, 0.15)",
        "apple-lg": "0 8px 30px rgba(0, 0, 0, 0.12)",
        "apple-xl": "0 20px 50px rgba(0, 0, 0, 0.15)",
        glow: "0 0 20px rgba(0, 113, 227, 0.3)",
        "glow-lg": "0 0 40px rgba(0, 113, 227, 0.4)",
      },
      borderRadius: {
        apple: "12px",
        "apple-lg": "18px",
        "apple-xl": "24px",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

