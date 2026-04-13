import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Design tokens — Sabbah de Babel
      colors: {
        // Neutral scale
        ink: {
          DEFAULT: "#1a1625",
          50:  "#f5f4f7",
          100: "#eae8f0",
          200: "#d4d0e1",
          300: "#b3adca",
          400: "#8d84b0",
          500: "#6d6397",
          600: "#574f7d",
          700: "#453e66",
          800: "#2f2a4d",
          900: "#1a1625",
          950: "#0e0b18",
        },
        // Accent — warm mauve/violet (from logo palette)
        mauve: {
          DEFAULT: "#7d5fa0",
          50:  "#f7f3fb",
          100: "#ede5f5",
          200: "#dccbeb",
          300: "#c3a3db",
          400: "#a87ac8",
          500: "#7d5fa0",
          600: "#6a4d88",
          700: "#563d6e",
          800: "#432f55",
          900: "#30213d",
        },
        // Warm cream — light mode surfaces
        cream: {
          DEFAULT: "#f9f6f0",
          50:  "#fdfcfa",
          100: "#f9f6f0",
          200: "#f0e9db",
          300: "#e4d5c0",
          400: "#d4bfa0",
        },
        // Semantic CSS-var tokens (resolved in globals.css)
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        surface:    "var(--color-surface)",
        border:     "var(--color-border)",
        muted:      "var(--color-muted)",
        accent:     "var(--color-accent)",
        "accent-fg":"var(--color-accent-fg)",
      },
      fontFamily: {
        serif: ["EB Garamond", "Georgia", "serif"],
        sans:  ["Inter", "system-ui", "sans-serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        xs:    ["0.75rem",  { lineHeight: "1.125rem" }],
        sm:    ["0.875rem", { lineHeight: "1.375rem" }],
        base:  ["1rem",     { lineHeight: "1.75rem" }],
        lg:    ["1.125rem", { lineHeight: "1.875rem" }],
        xl:    ["1.25rem",  { lineHeight: "2rem" }],
        "2xl": ["1.5rem",   { lineHeight: "2.25rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.5rem" }],
        "4xl": ["2.25rem",  { lineHeight: "2.75rem" }],
        "5xl": ["3rem",     { lineHeight: "3.5rem" }],
        "6xl": ["3.75rem",  { lineHeight: "4.25rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
        "42": "10.5rem",
        "46": "11.5rem",
      },
      maxWidth: {
        prose:      "68ch",
        "prose-lg": "80ch",
        content:    "1100px",
        wide:       "1400px",
      },
      borderRadius: {
        sm:      "3px",
        DEFAULT: "6px",
        md:      "8px",
        lg:      "12px",
        xl:      "16px",
      },
      transitionTimingFunction: {
        "ease-book": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      animation: {
        "fade-in":  "fadeIn 0.4s ease-in forwards",
        "slide-up": "slideUp 0.35s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
