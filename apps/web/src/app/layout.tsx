import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { TenantProvider } from "@/context/TenantContext";

export const metadata: Metadata = {
  title: "Sismob - Sistema Imobiliário 360",
  description: "Tour virtual e auxílio de chegada de última geração",
  // manifest: "/manifest.json", // Importante para o PWA
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sismob",
  },
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
          <main className="pl-0 md:pl-32 transition-all duration-500">
            <div className="w-full px-2 md:px-10 py-6">
              {" "}
              {/* px-2 garante bordas finas no mobile */}
              {children}
            </div>
          </main>
        </TenantProvider>
      </body>
    </html>
  );
}
