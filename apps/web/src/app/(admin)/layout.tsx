"use client";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // Se o usuário ainda não existe após o loading, manda pro login
  // Mas NÃO bloqueamos a renderização se o usuário já estiver lá (mesmo carregando perfil)
  if (!loading && !user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[84px] md:ml-[280px] p-4 md:p-10 transition-all h-screen overflow-y-auto">
        {loading && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 animate-pulse z-[9999]" />
        )}
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
