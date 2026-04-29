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
  const { tenant, loading: tenantLoading } = useTenant();

  // DEBUG NO CONSOLE PARA VOCÊ VER QUEM ESTÁ TRAVANDO
  console.log("ESTADO ATUAL:", {
    authLoading,
    tenantLoading,
    hasUser: !!user,
    hasTenant: !!tenant,
  });

  if (authLoading || tenantLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          {authLoading ? "Aguardando Usuário... " : ""}
          {tenantLoading ? "Aguardando Imobiliária..." : ""}
        </div>
      </div>
    );
  }

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
