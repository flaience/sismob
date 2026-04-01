import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
        <Sidebar />
        {/* Usamos padding-top 0 para o conteúdo colar no topo */}
        <main className="pl-24 md:pl-32 min-h-screen">
          <div className="max-w-7xl mx-auto px-6 py-10">{children}</div>
        </main>
      </body>
    </html>
  );
}
