/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable all optimizations for error pages
  reactStrictMode: false,
  // Use a separate output directory for error pages
  distDir: '.next-error',
  // Only include error pages
  pageExtensions: ['js'],
  // Disable all webpack optimizations
  webpack: (config) => {
    // Disable all optimization for error pages
    config.optimization.minimize = false;
    return config;
  },
  // Disable static optimization
  experimental: {
    // Disable all experimental features
    externalDir: false,
  },
  // Disable image optimization
  images: {
    disableStaticImages: true,
  },
};

module.exports = nextConfig;
