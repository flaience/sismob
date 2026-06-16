"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading: authLoading } = useAuth();
  const [safetyRelease, setSafetyRelease] = useState(false);

  // LIBERAÇÃO DE EMERGÊNCIA: Se em 2 segundos não carregar, a gente abre na marra.
  useEffect(() => {
    const timer = setTimeout(() => setSafetyRelease(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Só mostra o loading se o Auth ainda estiver carregando E a liberação de emergência não ocorreu
  const isStuck = authLoading && !safetyRelease;

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[84px] p-4 md:p-10 pb-24 md:pb-10 transition-all">
        {isStuck ? (
          <div className="p-20 text-center animate-pulse font-black text-indigo-600 uppercase tracking-widest">
            Sincronizando Ecossistema...
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">{children}</div>
        )}
      </main>
    </div>
  );
}
