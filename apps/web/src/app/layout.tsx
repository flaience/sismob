import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { TenantProvider } from "@/context/TenantContext";

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
        <TenantProvider>
          <Sidebar />
          {/* 
              O SEGREDO ESTÁ AQUI: 
              pl-0 (celular) 
              md:pl-32 (computador/tablet)
          */}
          <main className="pl-0 md:pl-32 min-h-screen transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6 py-10 pb-28 md:pb-10">
              {children}
            </div>
          </main>
        </TenantProvider>
      </body>
    </html>
  );
}
