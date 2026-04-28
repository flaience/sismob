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

  // 1. Evita erro de hidratação
  if (!mounted) return null;

  // 2. Enquanto autentica, mostra um estado neutro
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white font-black text-indigo-600 animate-pulse">
        SISMOB • AUTENTICANDO
      </div>
    );
  }

  // 3. Se não logou, manda pro login de forma segura
  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-[84px] p-4 md:p-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
