import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    instrumentationHook: true, 
  },
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
