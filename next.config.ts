import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.test.chat.ktsf.ru",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
