import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'preview-chat-949c47f5-d2e3-482b-b322-2886afb6f732.space.z.ai',
    'preview-chat-e7d6afe1-3810-4c9c-a0b1-fd268daf29d0.space.z.ai',
    '.space.z.ai',
    '.z.ai',
    'localhost',
  ],
};

export default nextConfig;
