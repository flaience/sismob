import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isso permite que o build complete mesmo com avisos de lint
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Isso permite que o build complete mesmo com erros de tipo TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "renderstuff.com" },
    ],
  },
};

export default nextConfig;
