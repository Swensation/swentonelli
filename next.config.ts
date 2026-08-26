import type { NextConfig } from "next";

process.env.TZ = "UTC";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

