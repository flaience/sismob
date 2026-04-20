// src/app/layout.tsx (O PAI DE TODOS)
import type { Metadata } from "next";
import "./globals.css";
import { TenantProvider } from "@/context/TenantContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-slate-50 antialiased overflow-x-hidden">
        <TenantProvider>
          {children} {/* <--- APENAS ISSO! Nada de Sidebar aqui. */}
        </TenantProvider>
      </body>
    </html>
  );
}
