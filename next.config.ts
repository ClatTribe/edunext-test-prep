import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/ai-tutor",
        destination: "https://tutorgetedunextcom.vercel.app/ai-tutor",
      },
      {
        source: "/ai-tutor/:path*",
        destination: "https://tutorgetedunextcom.vercel.app/ai-tutor/:path*",
      },
    ];
  },
};

export default nextConfig;
