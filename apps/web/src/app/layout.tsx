"use client";
import "./globals.css";
import { TenantProvider } from "@/context/TenantContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-slate-50 antialiased">
        <TenantProvider>{children}</TenantProvider>
      </body>
    </html>
  );
}
