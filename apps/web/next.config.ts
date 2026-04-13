import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  // skipWaiting foi movido para dentro do motor workbox em versões novas,
  // mas o padrão da biblioteca já cuida disso. Removi para limpar o erro.
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https", // O TS pode pedir 'as const' aqui se o erro persistir
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "renderstuff.com",
      },
    ],
  },
};

// Usamos 'as any' no retorno para evitar a briga de tipos entre o plugin e o Next 15
export default withPWA(nextConfig as any);
