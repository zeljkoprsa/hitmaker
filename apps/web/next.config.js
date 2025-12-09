/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  images: {
    domains: ['images.prismic.io'],
  },
  // Disable prerendering for error pages to avoid React context errors
  exportPathMap: async function (defaultPathMap) {
    // Remove error pages from static export
    delete defaultPathMap['/500'];
    delete defaultPathMap['/404'];
    delete defaultPathMap['/_error'];
    return defaultPathMap;
  },
  // Use separate output directories for development and production
  distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next-dev',
  // Configure rewrites for the hitmaker app
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      // In development, proxy to the standalone hitmaker app
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
    } else {
      // In production, we don't need rewrites as they're handled by vercel.json
      return [];
    }
  },
  experimental: {
    // This is experimental but can be enabled to allow importing from outside the app directory
    externalDir: true,
  },
}

module.exports = nextConfig
