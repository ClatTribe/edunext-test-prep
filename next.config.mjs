/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
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
