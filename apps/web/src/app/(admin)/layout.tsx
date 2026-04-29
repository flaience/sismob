"use client";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading: authLoading } = useAuth();
  const { loading: tenantLoading } = useTenant();

  // EM VEZ DE BLOQUEAR A TELA TODA, MOSTRA UMA BARRA DISCRETA
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-[84px] p-4 md:p-10">
        {(authLoading || tenantLoading) && (
          <div className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 animate-pulse z-[9999]" />
        )}
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
