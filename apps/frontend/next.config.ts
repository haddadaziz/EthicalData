import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['@fortawesome/react-fontawesome', 'framer-motion'],
  },
  compress: true,
};

export default nextConfig;
