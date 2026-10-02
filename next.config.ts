import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
  },
  async redirects() {
    // The 2026 landing page lives at the root now.
    return [{ source: "/devfest", destination: "/", permanent: false }];
  },
};

export default nextConfig;
