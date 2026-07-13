import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  // 🎯 Production-optimized content scanning matrix
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // 🌙 Class-based dark mode architecture for structural layout toggles
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // 🎨 THE FANUM / MONEY-PLANT CORE BRAND SYSTEM
        vibe: {
          purple: {
            DEFAULT: "#C3ACFF",
            dark: "#9066FF",
            light: "#E1D6FF"
          },
          pink: {
            DEFAULT: "#FFB5E8",
            dark: "#FF6BCE"
          },
          blue: {
            DEFAULT: "#ACE7FF",
            dark: "#57CEFF"
          },
          mint: {
            DEFAULT: "#B2F2BB",
            dark: "#2B8A3E"
          },
          yellow: {
            DEFAULT: "#FFF1AC", // Brand "Money Yellow" baseline
            dark: "#E5C100"
          },
          dark: "#0F0F11",
          // Enhanced opacity indexes to block component background bleed-through
          card: "rgba(255, 255, 255, 0.92)",
          "card-dark": "rgba(24, 24, 27, 0.85)",
        },

        // ⚡️ SYSTEM INTERACTION ALIASES (WCAG AA Contrast Compliant Updates)
        primary: {
          DEFAULT: "#6D28D9", // Hardened Violet anchor for readable layout boundaries
          light: "#C3ACFF",
          dark: "#4C1D95",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFB5E8",
          dark: "#DB2777",
          foreground: "#1F2937"
        },
        accent: {
          DEFAULT: "#FFF1AC",
          dark: "#B45309", // Clear deep-amber for accessible alert states
        },
        money: {
          yellow: {
            DEFAULT: "#FFF1AC",
            text: "#78350F"
          },
          green: {
            DEFAULT: "#B2F2BB",
            text: "#064E3B"
          },
        },
        // 👁️ CRITICAL READABILITY FIX: High contrast typography matrix
        text: {
          main: "#0F172A",  // Slate-900 (Guarantees crisp reading on light card profiles)
          light: "#475569", // Slate-600 (Maintains hierarchy without fading out)
          dark: "#F8FAFC",  // Slate-50 for high contrast dark-mode strings
          muted: "#64748B", // Slate-500 secondary structural label anchor
        },
        danger: {
          DEFAULT: "#EF4444", // Refactored high-visibility warning standard
          light: "#FF9B9B",
          dark: "#7F1D1D"
        }
      },

      // 🔲 RADIUS LAYOUT MATRIX
      borderRadius: {
        vibe: "28px",     // Base bento component wrapper
        "vibe-lg": "36px",  // External frame modules
        "vibe-sm": "18px",  // Buttons, badges, actionable interface indicators
        full: "9999px",
      },

      // 🌫 SHADOW MAP DEFINITIONS
      boxShadow: {
        vibe: "0 10px 30px -5px rgba(109, 40, 217, 0.15)",
        "vibe-soft": "0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
        "money-glow": "0 12px 32px -6px rgba(217, 119, 6, 0.25)",
        float: "0 20px 48px -8px rgba(219, 221, 226, 0.12)",
        "inner-glass": "inset 0 1px 0 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 0 rgba(0, 0, 0, 0.04)",
        "inner-glass-dark": "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 0 rgba(0, 0, 0, 0.6)",
      },

      // 🎬 KINETIC TRANSITION SUITE
      animation: {
        float: "float 6s ease-in-out infinite",
        "subtle-zoom": "subtle-zoom 20s infinite alternate",
        shimmer: "shimmer 2.5s infinite linear",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "water-drop": "water-drop 1.5s ease-out forwards",
        "bounce-low": "bounce-low 3s infinite",
        "vibe-float": "float 5s ease-in-out infinite",
        "grow-progress": "grow-progress 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },

      // 🧪 INTERPOLATION MATRIX KEYFRAMES
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "subtle-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.04)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "water-drop": {
          "0%": { transform: "translateY(-10px) scale(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(30px) scale(1)", opacity: "0" },
        },
        "bounce-low": {
          "0%, 100%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(-6%)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        "grow-progress": {
          from: { width: "0%" },
        },
      },

      // 🖼 CUSTOM GRADIENT CONFIGURATIONS
      backgroundImage: {
        "mesh-gradient": "url('/images/illustrations/mesh-bg.png')",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.15) 100%)",
        "money-gradient":
          "linear-gradient(180deg, #FFF1AC 0%, #F4D03F 100%)",
      },
    },
  },

  // 🛠 PREMIUM TYPE-SAFE SCALABILITY EXTENSIONS
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        // Prevent scrollbar layouts from forcing element shifts on micro-devices
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        // Fluid component structural sizing mapping utilities
        ".aspect-vibe": {
          aspectRatio: "1 / 1.1",
        },
        // Normalizes responsive user interactions on mobile devices
        ".tap-none": {
          "-webkit-tap-highlight-color": "transparent",
          "touch-action": "manipulation",
        },
        // Premium glassmorphism overlay utility
        ".glass-blur": {
          "backdrop-filter": "blur(20px) saturate(190%)",
          "-webkit-backdrop-filter": "blur(20px) saturate(190%)",
        },
        // Centering layout configuration shortcuts
        ".flex-center": {
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
        },
      });
    }),
  ],
};

export default config;