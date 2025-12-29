/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // PWA Configuration
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
};

module.exports = nextConfig;
