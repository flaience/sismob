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
  const { user, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Se não montou no navegador, mostra apenas o fundo para não dar tela branca
  if (!mounted) return <div className="min-h-screen bg-slate-50" />;

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* 1. SIDEBAR SEMPRE PRESENTE */}
      <Sidebar />

      {/* 2. CONTEÚDO COM MARGEM DINÂMICA */}
      <main className="flex-1 ml-[84px] p-4 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="p-20 text-center animate-pulse font-black text-slate-300 uppercase">
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
