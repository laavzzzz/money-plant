/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // 🎨 The core engine for Tailwind v4
    "@tailwindcss/postcss": {},
    
    // 🛠️ Automatically adds vendor prefixes (-webkit, -moz) 
    // This is essential for the "grain-overlay" and "vibe-canvas" to work on Safari/iOS
    "autoprefixer": {},
  },
};

export default config;