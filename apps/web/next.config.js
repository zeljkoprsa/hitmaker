/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  images: {
    domains: ['images.prismic.io'],
  },
  // Use separate output directories for development and production
  distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next-dev',
  // Configure rewrites for the hitmaker app in development
  async rewrites() {
    return [
      {
        source: '/hitmaker',
        destination: 'http://localhost:3001/hitmaker',
      },
      {
        source: '/hitmaker/:path*',
        destination: 'http://localhost:3001/hitmaker/:path*',
      },
    ];
  },
  experimental: {
    // This is experimental but can be enabled to allow importing from outside the app directory
    externalDir: true,
  },
  // Add rewrites for the hitmaker app
  async rewrites() {
    return process.env.NODE_ENV === 'development' ? [
      // In development, proxy to the standalone hitmaker app
      {
        source: '/hitmaker',
        destination: 'http://localhost:3456',
      },
      {
        source: '/hitmaker/:path*',
        destination: 'http://localhost:3456/:path*',
      },
      // Handle static assets from hitmaker app
      {
        source: '/static/:path*',
        destination: 'http://localhost:3456/static/:path*',
      },
    ] : [];
  },
}

module.exports = nextConfig
