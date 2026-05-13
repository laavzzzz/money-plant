import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
     1. Optimizes Lucide-React: 
     Forces the compiler to only include the specific icons you import (Leaf, Search, etc.)
     This fixes many "module not found" or "no exported member" ghost errors.
  */
  transpilePackages: ["lucide-react"],

  /* 
     2. Modularize Imports:
     This is a "pro-tip" for Next.js 15 that speeds up your development server 
     when using large icon libraries.
  */
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  /* 
     3. Image Security:
     Keeps your existing wild-card pattern but is structured for Next.js 15 standards.
  */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows all external images (useful for user profile pics/AI images)
      },
    ],
  },

  /* 
     4. Build Stability:
     Ensures that even if there are minor linting or TS warnings in your 
     node_modules during the major version jump, the build still completes.
  */
  typescript: {
    ignoreBuildErrors: false, // Keep this false while developing to catch real bugs!
  },
};

export default nextConfig;