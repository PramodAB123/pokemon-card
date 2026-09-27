/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Bebas Neue'", "'Orbitron'", "monospace"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        orbitron: ["'Orbitron'", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        floatSmall: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.7", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        cardReveal: {
          from: { opacity: "0", transform: "scale(0.92) rotateY(-8deg)" },
          to: { opacity: "1", transform: "scale(1) rotateY(0deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        pokeball: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        stepFadeIn: {
          from: { opacity: "0", transform: "translateX(-8px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        counterUp: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        barFill: {
          from: { width: "0%" },
          to: { width: "var(--bar-width)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        floatSmall: "floatSmall 3s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s ease-in-out infinite",
        slideUp: "slideUp 0.5s ease forwards",
        fadeIn: "fadeIn 0.4s ease forwards",
        cardReveal: "cardReveal 0.6s cubic-bezier(0.22,1,0.36,1) forwards",
        shimmer: "shimmer 2s linear infinite",
        pokeball: "pokeball 1s linear infinite",
        stepFadeIn: "stepFadeIn 0.3s ease forwards",
        barFill: "barFill 0.8s ease forwards",
      },
    },
  },
  plugins: [],
};
