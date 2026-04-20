import type { Metadata } from "next";
import "./globals.css";
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
          {/* Aqui não vai Sidebar nem Main, apenas o conteúdo dinâmico */}
          {children}
        </TenantProvider>
      </body>
    </html>
  );
}
