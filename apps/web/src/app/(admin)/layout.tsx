"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Se não montou no navegador, não renderiza para evitar erro de hidratação
  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-[280px] p-4 md:p-10 transition-all">
        {children}
      </main>
    </div>
  );
}
