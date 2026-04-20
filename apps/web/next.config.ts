import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "renderstuff.com" },
    ],
  },
  transpilePackages: ["lucide-react"],

  // Se o erro persistir, adicione esta regra de exclusão:
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native$": false,
      "expo-router$": false, // <--- ADICIONE ESTA LINHA EXATAMENTE AQUI
      "lucide-react-native$": false, // <--- E ESTA TAMBÉM
    };
    return config;
  },
};

export default nextConfig;
