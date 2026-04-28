"use client";
import { LayoutDashboard, Home, Users, Briefcase, Target } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const stats = [
    {
      label: "Imóveis",
      value: "12",
      icon: Home,
      href: "/",
      color: "bg-blue-500",
    },
    {
      label: "Proprietários",
      value: "05",
      icon: Users,
      href: "/admin/proprietarios",
      color: "bg-indigo-500",
    },
    {
      label: "Interessados",
      value: "08",
      icon: Target,
      href: "/admin/interessados",
      color: "bg-orange-500",
    },
  ];

  if (!user || !tenant) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
        OLÁ, <span className="text-indigo-600">{user.nome?.toUpperCase()}</span>
      </h1>
      <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
        Painel de Gestão • {tenant.nome_conta}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all"
          >
            <div
              className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}
            >
              <item.icon size={24} />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              {item.label}
            </p>
            <p className="text-4xl font-black text-gray-900 mt-1">
              {item.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
