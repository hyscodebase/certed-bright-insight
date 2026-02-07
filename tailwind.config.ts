import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        /**
         * ⚠️ IMPORTANT: Brand primary color - DO NOT CONVERT TO HSL
         * This must remain as HEX "#3769FC" for brand consistency.
         * Never change this to hsl() format under any circumstances.
         */
        ring: "#3769FC",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        /**
         * ⚠️ IMPORTANT: Brand primary color - DO NOT CONVERT TO HSL
         * This must remain as HEX "#3769FC" for brand consistency.
         * Never change this to hsl() format under any circumstances.
         */
        primary: {
          DEFAULT: "#3769FC", // ⚠️ DO NOT CONVERT TO HSL - Brand color
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /**
         * ⚠️ IMPORTANT: Sidebar colors - DO NOT CONVERT TO HSL
         * primary, primary-foreground, accent, accent-foreground, ring
         * must remain as HEX values for brand consistency.
         */
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "#3769FC", // ⚠️ DO NOT CONVERT TO HSL - Brand color
          "primary-foreground": "#FFFFFF",
          accent: "#EEF2FF",
          "accent-foreground": "#3769FC", // ⚠️ DO NOT CONVERT TO HSL - Brand color
          border: "hsl(var(--sidebar-border))",
          ring: "#3769FC", // ⚠️ DO NOT CONVERT TO HSL - Brand color
        },
        /**
         * ⚠️ IMPORTANT: Chart colors - DO NOT CONVERT TO HSL
         * primary and secondary must remain as HEX "#3769FC" for brand consistency.
         */
        chart: {
          primary: "#3769FC", // ⚠️ DO NOT CONVERT TO HSL - Brand color
          secondary: "#3769FC", // ⚠️ DO NOT CONVERT TO HSL - Brand color
          muted: "hsl(var(--chart-muted))",
        },
        highlight: "hsl(var(--input-highlight))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      width: {
        sidebar: "var(--sidebar-width)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
