"use client";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      <Sidebar />

      {/* O SEGREDO: ml-0 no mobile, ml-[84px] no desktop. pb-24 no mobile para a barra inferior */}
      <main className="flex-1 ml-0 md:ml-[84px] p-4 md:p-10 pb-24 md:pb-10 transition-all">
        {loading ? (
          <div className="p-20 text-center animate-pulse font-black text-indigo-600 uppercase tracking-widest">
            Sincronizando Ecossistema...
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">{children}</div>
        )}
      </main>
    </div>
  );
}
