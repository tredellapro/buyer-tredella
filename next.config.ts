import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    // Old /category/... URLs → new root-level slugs (/electronics/...)
    return [
      {
        source: "/category/:slug*",
        destination: "/:slug*",
        permanent: true,
      },
      {
        source: "/wholesale/category/:slug*",
        destination: "/wholesale/:slug*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
