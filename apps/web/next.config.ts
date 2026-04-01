import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Autoriza as fotos do nosso teste
      },
      {
        protocol: "https",
        hostname: "**.supabase.co", // Autoriza as fotos que você vai subir no seu Supabase
      },
      {
        protocol: "https",
        hostname: "renderstuff.com", // Autoriza o domínio do exemplo de 360
      },
    ],
  },
};

export default nextConfig;
