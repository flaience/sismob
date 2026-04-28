"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();
  const router = useRouter();

  // REDIRECIONAMENTO SEGURO: Apenas dentro do useEffect
  useEffect(() => {
    if (!authLoading && !tenantLoading) {
      if (!user || !tenant) {
        router.push("/login");
      }
    }
  }, [user, tenant, authLoading, tenantLoading, router]);

  // Enquanto carrega, mostra tela limpa (Evita crash de leitura de null)
  if (authLoading || tenantLoading || !user || !tenant) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 ml-[84px] p-4 md:p-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
