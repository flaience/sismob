"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. O SEGREDO: Se não montou no navegador, mostra apenas o fundo para não crashar
  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* 2. SIDEBAR SEMPRE VISÍVEL (Fim do loop de invisibilidade) */}
      <Sidebar />

      <main className="flex-1 ml-[84px] md:ml-[280px] p-4 md:p-10 h-screen overflow-y-auto transition-all">
        <div className="max-w-7xl mx-auto">
          {/* 3. Apenas o conteúdo interno mostra o loading, o site continua vivo */}
          {loading ? (
            <div className="p-20 text-center animate-pulse font-black text-indigo-600 uppercase tracking-widest">
              Sincronizando Ecossistema...
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
