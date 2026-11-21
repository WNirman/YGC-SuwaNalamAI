import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse and its native/worker dependencies external for Vercel serverless
  serverExternalPackages: ['pdf-parse', 'pdfjs-dist', '@napi-rs/canvas'],
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
