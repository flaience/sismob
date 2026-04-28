"use client";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { ShieldCheck, Building2, User } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
            Olá,{" "}
            <span className="text-indigo-600">
              {user?.nome?.split(" ")[0] || "Usuário"}
            </span>
          </h1>
          <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">
            Nível de Acesso:{" "}
            {user?.papel === "0" ? "SUPER-ADMIN FLAIENCE" : "ADMIN IMOBILIÁRIA"}
          </p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-3xl text-indigo-600">
          <ShieldCheck size={40} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="bg-blue-50 p-5 rounded-2xl text-blue-600">
            <Building2 />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
              Empresa Ativa
            </p>
            <h3 className="text-xl font-bold text-gray-800">
              {tenant?.nome_conta}
            </h3>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="bg-purple-50 p-5 rounded-2xl text-purple-600">
            <User />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
              Login
            </p>
            <h3 className="text-xl font-bold text-gray-800">{user?.email}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
