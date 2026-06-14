import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const noStoreHeaders = [
      { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
      { key: "CDN-Cache-Control", value: "no-store" },
      { key: "Vary", value: "Cookie, Authorization, Accept-Encoding" },
    ];

    return [
      {
        source: "/",
        headers: noStoreHeaders,
      },
      {
        source: "/services",
        headers: noStoreHeaders,
      },
      {
        source: "/services/:path*",
        headers: noStoreHeaders,
      },
      {
        source: "/pricing",
        headers: noStoreHeaders,
      },
      {
        source: "/about",
        headers: noStoreHeaders,
      },
      {
        source: "/contact",
        headers: noStoreHeaders,
      },
      {
        source: "/blog",
        headers: noStoreHeaders,
      },
      {
        source: "/api-docs",
        headers: noStoreHeaders,
      },
      {
        source: "/careers",
        headers: noStoreHeaders,
      },
      {
        source: "/features",
        headers: noStoreHeaders,
      },
      {
        source: "/privacy-policy",
        headers: noStoreHeaders,
      },
      {
        source: "/terms-of-service",
        headers: noStoreHeaders,
      },
      {
        source: "/security",
        headers: noStoreHeaders,
      },
      {
        source: "/unauthorized",
        headers: noStoreHeaders,
      },
    ];
  },


  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    dangerouslyAllowSVG: true, // ⚠️ Only if you really need SVGs from trusted sources
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
