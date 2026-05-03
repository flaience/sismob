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

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-[84px] p-4 md:p-10 h-screen overflow-y-auto">
        {authLoading || tenantLoading ? (
          <div className="p-20 text-center animate-pulse font-black text-indigo-600 uppercase">
            Sincronizando Ecossistema...
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">{children}</div>
        )}
      </main>
    </div>
  );
}
