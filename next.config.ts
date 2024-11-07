import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {}, // Allows for server actions if needed
  },
  reactStrictMode: true,
  swcMinify: true, // Optimizes builds with SWC
  images: {
    domains: ['your-image-source.com'], // Add external domains for images
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig
 