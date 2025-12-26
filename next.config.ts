import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience and error detection
  reactStrictMode: true,

  // Remove X-Powered-By header for security
  poweredByHeader: false,

  // Image optimization configuration
  images: {
    // Allow images from external domains used by the Tarkov API
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.tarkov.dev",
      },
      {
        protocol: "https",
        hostname: "**.tarkov.dev",
      },
    ],
    // Optimize images for better performance
    formats: ["image/avif", "image/webp"],
    // Image quality settings
    minimumCacheTTL: 86400, // 24 hours
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  // Compress responses
  compress: true,

  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["@tabler/icons-react"],
  },

  // Environment variable validation (optional but recommended)
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
  },
};

export default nextConfig;
