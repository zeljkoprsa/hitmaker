/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui"],
  images: {
    domains: ['images.prismic.io'],
  },
  experimental: {
    // This is experimental but can be enabled to allow importing from outside the app directory
    externalDir: true,
  },
}

module.exports = nextConfig
