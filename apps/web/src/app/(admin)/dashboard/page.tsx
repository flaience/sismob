//src/app/(admin)/dashboard/page.tsx
"use client";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { Loader2, UserCheck, ShieldAlert } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { tenant } = useTenant();

  if (loading) {
    return (
      <div className="p-10 flex items-center gap-2 text-indigo-600 font-bold">
        <Loader2 className="animate-spin" /> SINCRONIZANDO PERFIL...
      </div>
    );
  }

  return (
    <div className="p-10 space-y-6">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
          PAINEL:{" "}
          <span className="text-indigo-600">
            {tenant?.nome_conta || "SISMOB"}
          </span>
        </h1>

        <div className="mt-6 flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
          {user?.nome ? (
            <UserCheck className="text-green-500" />
          ) : (
            <ShieldAlert className="text-orange-500" />
          )}
          <div>
            <p className="text-xs font-black text-gray-400 uppercase">
              Usuário Autenticado
            </p>
            <p className="font-bold text-gray-800">
              {user?.nome ||
                user?.email ||
                "Perfil não encontrado no banco de dados"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-indigo-600 rounded-[2rem] text-white font-black text-center shadow-xl shadow-indigo-100">
        STATUS DO SISTEMA: ONLINE • PORTA 3005
      </div>
    </div>
  );
}
