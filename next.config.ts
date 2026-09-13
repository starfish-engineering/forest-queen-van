import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The devbox dev server is reached through a cloudflared tunnel, not localhost.
  // Without every origin listed here the page renders but never hydrates.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
