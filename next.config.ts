import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["http://localhost:3000", "192.168.1.14"],
};

export default nextConfig;
