import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // self-contained server bundle (node server.js) – used for the ready-to-run local package
  output: "standalone",
  // logos are already optimised PNGs; avoids the native "sharp" dependency
  images: { unoptimized: true },
};

export default nextConfig;
