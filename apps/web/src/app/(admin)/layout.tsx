"use client";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // Enquanto carrega, mostra apenas o spinner
  if (loading)
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white font-black text-indigo-600 animate-pulse">
        SISMOB • CARREGANDO...
      </div>
    );

  // Se não tem usuário após o loading, manda pro login
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-[84px] p-4 md:p-10">{children}</main>
    </div>
  );
}
