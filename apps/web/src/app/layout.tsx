import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { TenantProvider } from "@/context/TenantContext"; // 1. Importamos o provedor

export const metadata: Metadata = {
  title: "Sismob - Sistema Imobiliário 360",
  description: "Tour virtual e auxílio de chegada de última geração",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-slate-50 antialiased overflow-x-hidden">
        {/* 2. Envolvemos todo o conteúdo com o TenantProvider */}
        <TenantProvider>
          <Sidebar />
          {/* O padding garante que o conteúdo não fique sob o menu flutuante */}
          <main className="pl-24 md:pl-32 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-10">{children}</div>
          </main>
        </TenantProvider>
      </body>
    </html>
  );
}
