/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["lucide-react"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  eslint: {
    // Allows production builds to successfully complete even if your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allows production builds to successfully complete even if your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;