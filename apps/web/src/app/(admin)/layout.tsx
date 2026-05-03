"use client";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { tenant } = useTenant();

  // 1. Enquanto carrega o básico, mostra um fundo neutro
  if (authLoading) {
    return <div className="h-screen w-full bg-slate-50 animate-pulse" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* 2. A SIDEBAR (Ocupa espaço fixo de 84px ou 280px) */}
      <Sidebar />

      {/* 3. ÁREA DE CONTEÚDO (O ml-[84px] garante que a sidebar não cubra o texto) */}
      <main className="flex-1 ml-[84px] p-4 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
