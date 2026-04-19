"use client";
import { LayoutDashboard, Home, Users, Briefcase } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
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
      label: "Corretores",
      value: "03",
      icon: Briefcase,
      href: "/admin/corretores",
      color: "bg-emerald-500",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-gray-900">
        Painel de <span className="text-indigo-600">Gestão</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
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
