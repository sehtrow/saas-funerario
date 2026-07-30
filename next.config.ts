import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Permitir peticiones dev/HMR desde la IP de tu celular/red local
  allowedDevOrigins: [
    '192.168.100.3',
    '192.168.100.3:3000',
    'localhost:3000',
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: [
        '192.168.100.3:3000',
        '192.168.100.3',
        'localhost:3000',
        'localhost',
      ],
    },
  },

  async headers() {
    return [
      {
        source: "/_next/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
};

export default nextConfig;