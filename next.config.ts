import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // ✅ يخفي علامة Next.js اللي بتظهر
  devIndicators: false,

  // ✅ يسمح بـ ngrok و IP
  allowedDevOrigins: [
    "unglue-heaviness-frenzy.ngrok-free.dev",
    "*.ngrok-free.dev",
    "10.2.18.16",
    "localhost",
  ],

  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,
};

export default nextConfig;