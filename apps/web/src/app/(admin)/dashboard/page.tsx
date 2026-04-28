"use client";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  return (
    <div className="p-12 bg-white rounded-[3rem] shadow-xl border border-gray-100">
      <h1 className="text-5xl font-black text-gray-900 tracking-tighter">
        SISTEMA <span className="text-indigo-600">ATIVO</span>
      </h1>
      <div className="mt-8 p-6 bg-indigo-50 rounded-2xl">
        <p className="text-indigo-900 font-bold">
          Usuário: {user?.email || "Não identificado"}
        </p>
        <p className="text-indigo-900 font-bold">
          Imobiliária: {tenant?.nome_conta || "Não identificada"}
        </p>
      </div>
    </div>
  );
}
