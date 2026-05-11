import type { Config } from "tailwindcss";

const config: Config = {
  // 🎯 Scans all relevant files for classes
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  // 🌙 Class-based dark mode for the "Night Vibe" toggle
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        // 🎨 THE MONEYPLANT GEN Z PALETTE
        vibe: {
          purple: "#C3ACFF",
          pink: "#FFB5E8",
          blue: "#ACE7FF",
          mint: "#B2F2BB",
          yellow: "#FFF1AC", // The "Money Yellow"
          dark: "#121214",
          card: "rgba(255, 255, 255, 0.7)",
          "card-dark": "rgba(18, 18, 20, 0.6)",
        },

        // ⚡️ SEMANTIC ALIASES
        primary: {
          DEFAULT: "#C3ACFF", // Vibe Purple
          dark: "#A385FF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFB5E8", // Vibe Pink
        },
        accent: {
          DEFAULT: "#FFF1AC", // Money Yellow as default accent
          dark: "#F4D03F",
        },
        money: {
          yellow: "#FFF1AC",
          green: "#B2F2BB",
        },
        text: {
          main: "#121214",
          light: "#666666",
        },
        danger: "#FF9B9B",
      },

      // 🔲 THE "SQUIRCLE" RADIUS SYSTEM
      borderRadius: {
        vibe: "28px", // Standard cards
        "vibe-lg": "36px", // Sections
        "vibe-sm": "18px", // Buttons/Chips
        full: "9999px",
      },

      // 🌫 DEPTH & GLASSMORPISM
      boxShadow: {
        vibe: "0 8px 30px rgba(195, 172, 255, 0.25)",
        "vibe-soft": "0 4px 20px rgba(0, 0, 0, 0.05)",
        "money-glow": "0 10px 40px rgba(255, 241, 172, 0.3)",
        float: "0 20px 40px rgba(0, 0, 0, 0.1)",
        "inner-glass": "inset 0 0 0 1px rgba(255, 255, 255, 0.4)",
      },

      // 🎬 ANIMATION SUITE
      animation: {
        float: "float 6s ease-in-out infinite",
        "subtle-zoom": "subtle-zoom 20s infinite alternate",
        shimmer: "shimmer 2s infinite linear",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "water-drop": "water-drop 1.5s ease-out forwards",
        "bounce-low": "bounce-low 3s infinite",
        "vibe-float": "float 5s ease-in-out infinite",
        "grow-progress": "grow-progress 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },

      // 🧪 ADVANCED KEYFRAMES
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "subtle-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "water-drop": {
          "0%": { transform: "translateY(-20px) scale(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(40px) scale(1)", opacity: "0" },
        },
        "bounce-low": {
          "0%, 100%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(-10%)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
        "grow-progress": {
          from: { width: "0%" },
        },
      },

      // 🖼 CUSTOM GRADIENTS
      backgroundImage: {
        "mesh-gradient": "url('/images/illustrations/mesh-bg.png')",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
        "money-gradient":
          "linear-gradient(180deg, #FFF1AC 0%, #FFE566 100%)",
      },
    },
  },

  // 🛠 PREMIUM UTILITY PLUGINS
  plugins: [
    function ({ addUtilities }: any) {
      addUtilities({
        // Hide scrollbars while keeping swipe logic
        ".no-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        // Perfect squircle for profile pics or plant cards
        ".aspect-vibe": {
          aspectRatio: "1 / 1.1",
        },
        // Native mobile feel: removes the blue highlight box on tap
        ".tap-none": {
          "-webkit-tap-highlight-color": "transparent",
          "touch-action": "manipulation",
        },
        // Premium glassmorphism
        ".glass-blur": {
          "backdrop-filter": "blur(16px) saturate(180%)",
          "-webkit-backdrop-filter": "blur(16px) saturate(180%)",
        },
        // One-tap centering
        ".flex-center": {
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
        },
      });
    },
  ],
};

export default config;