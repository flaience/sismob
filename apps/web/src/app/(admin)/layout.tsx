"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Só redireciona se o carregamento terminou E não tem usuário
    if (!loading && mounted && !user) {
      console.log("🚫 [SISMOB] Acesso negado, voltando para login");
      router.push("/login");
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white font-black text-indigo-600 animate-pulse uppercase italic">
        Sincronizando Ecossistema...
      </div>
    );
  }

  // Se não tem usuário, não renderiza nada enquanto o useEffect faz o push
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[84px] md:ml-[280px] p-4 md:p-10 h-screen overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
