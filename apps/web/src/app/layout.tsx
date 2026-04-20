import type { Metadata } from "next";
import "./globals.css";
import { TenantProvider } from "@/context/TenantContext";

export const metadata: Metadata = {
  title: "Sismob - Sistema Imobiliário 360",
};

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
