import type { NextConfig } from "next";

const apiOrigin = new URL(
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:4000/graphql"
);

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // review photos are served by the API host
    remotePatterns: [
      {
        protocol: apiOrigin.protocol.replace(":", "") as "http" | "https",
        hostname: apiOrigin.hostname,
        port: apiOrigin.port,
        pathname: "/uploads/**",
      },
    ],
  },
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
