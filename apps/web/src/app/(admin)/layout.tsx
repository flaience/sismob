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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[84px] lg:ml-[100px] p-4 md:p-10 pb-32 md:pb-10 transition-all">
        {/* ml-0 no mobile, ml-[84px] no desktop. pb-32 garante espaço para a bottom bar */}
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
