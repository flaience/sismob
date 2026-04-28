"use client";
import { Home, Users, Target } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  // Dados estáticos para teste de renderização
  const stats = [
    {
      label: "Imóveis",
      value: "12",
      icon: Home,
      href: "/imoveis",
      color: "bg-blue-500",
    },
    {
      label: "Proprietários",
      value: "05",
      icon: Users,
      href: "/gestao/proprietarios",
      color: "bg-indigo-500",
    },
    {
      label: "Interessados",
      value: "08",
      icon: Target,
      href: "/gestao/leads",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
          OLÁ,{" "}
          <span className="text-indigo-600">
            {(user?.nome || "USUÁRIO").toUpperCase()}
          </span>
        </h1>
        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2">
          Painel de Gestão • {tenant?.nome_conta || "Sismob"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all"
          >
            <div
              className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}
            >
              <item.icon size={28} />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              {item.label}
            </p>
            <p className="text-5xl font-black text-gray-900 mt-2 tracking-tighter">
              {item.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
