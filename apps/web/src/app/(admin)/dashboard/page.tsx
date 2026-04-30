"use client";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { Users, Home, TrendingUp, Zap } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  return (
    <div className="space-y-10">
      {/* HEADER DE BOAS VINDAS */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">
            BEM-VINDO,{" "}
            <span className="text-brand">
              {(user?.nome || "SuperAdm").toUpperCase()}
            </span>
          </h1>
          <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-[0.2em] flex items-center gap-2">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            Ecossistema Ativo • {tenant?.nome_conta || "Carregando..."}
          </p>
        </div>
        <div className="flex -space-x-4">
          {/* Avatar Placeholder para dar profundidade ao UI */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-12 h-12 rounded-full border-4 border-white bg-slate-200"
            />
          ))}
        </div>
      </header>

      {/* CARDS DE PERFORMANCE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            label: "Leads Novos",
            val: "24",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            label: "Imóveis 360",
            val: "158",
            icon: Home,
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            label: "Colaboradores",
            val: "09",
            icon: Users,
            color: "text-brand",
            bg: "bg-indigo-50",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
          >
            <div
              className={`${item.bg} ${item.color} w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}
            >
              <item.icon size={32} strokeWidth={2.5} />
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
              {item.label}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-6xl font-black text-slate-900 tracking-tighter">
                {item.val}
              </p>
              <span className="text-emerald-500 font-bold">+12%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
