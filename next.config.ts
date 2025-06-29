import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['gravatar.com'],
  },
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
