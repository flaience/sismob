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
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Se terminou de carregar e não tem usuário, tchau.
  if (!loading && !user) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[84px] lg:ml-[280px] p-4 md:p-10 pb-24 md:pb-10 transition-all">
        {loading ? (
          <div className="p-20 text-center animate-pulse font-black text-indigo-600">
            SINCRONIZANDO...
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
