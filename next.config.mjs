/** 
 * @type {import('next').NextConfig} 
 * @description Enterprise Next.js Configuration for MoneyPlant
 */
const nextConfig = {
  // Enforce React strict mode to catch side-effects early during development
  reactStrictMode: true,

  // Enable gzip/brotli compression for production asset delivery
  compress: true,

  // Package transpilation and bundle optimization settings
  transpilePackages: ["lucide-react"],
  
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "recharts",
      "sonner"
    ],
  },

  // Remote image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // TypeScript compiler settings
  typescript: {
    // Allows production builds to successfully complete even if your project has type errors.
    ignoreBuildErrors: true,
  },

  // ESLint build bypass settings
  eslint: {
    // Allows production builds to successfully complete even if your project has lint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;