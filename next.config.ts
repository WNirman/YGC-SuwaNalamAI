import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large file uploads for medical documents
  serverExternalPackages: ['pdf-parse'],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
