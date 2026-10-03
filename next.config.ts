import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
  },
  // react-pdf ships its own font/layout engines; keep it out of the server bundle.
  serverExternalPackages: ["@react-pdf/renderer"],
  // Files read from disk when rendering ticket PDFs.
  outputFileTracingIncludes: {
    "/api/tickets/order/[reference]/pdf": ["./lib/tickets/pdf-fonts/**", "./lib/tickets/templates/**", "./public/images/gdglogo.png"],
    "/api/tickets/[code]/image": ["./lib/tickets/templates/**"],
    "/opengraph-image": ["./lib/og/**", "./public/divider.svg"],
    "/tickets/opengraph-image": ["./lib/og/**", "./public/divider.svg"],
    "/volunteers/opengraph-image": ["./lib/og/**", "./public/divider.svg"],
  },
  async redirects() {
    // The 2026 landing page lives at the root now.
    return [{ source: "/devfest", destination: "/", permanent: false }];
  },
};

export default nextConfig;
