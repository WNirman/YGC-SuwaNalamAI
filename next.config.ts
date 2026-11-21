import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large file uploads for medical documents
  serverExternalPackages: ['pdf-parse'],
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
