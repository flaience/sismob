"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // REDIRECIONAMENTO SEGURO
  useEffect(() => {
    if (mounted && !loading && !user) {
      console.log("🚫 [SISMOB] Sessão não encontrada. Indo para login...");
      router.replace("/login");
    }
  }, [mounted, loading, user, router]);

  if (!mounted || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white font-black text-indigo-600 animate-pulse">
        SISMOB • SINCRONIZANDO...
      </div>
    );
  }

  // Se não tem usuário, não renderiza nada para evitar flash de conteúdo
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[84px] md:ml-[280px] p-4 md:p-10 transition-all overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
