import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ai-tutor",
        destination: "https://tutorgetedunextcom.vercel.app/",
      },
      {
        source: "/ai-tutor/:path*",
        destination: "https://tutorgetedunextcom.vercel.app/:path*",
      },
    ];
  },
};

export default nextConfig;
