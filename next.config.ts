import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dev.chat.ktsf.ru",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
