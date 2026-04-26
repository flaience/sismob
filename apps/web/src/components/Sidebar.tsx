"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  Home,
  Camera,
  CreditCard,
  Landmark,
  Settings,
  ChevronDown,
  Search,
  Target,
  FileCheck,
  ShieldAlert,
  BarChart3,
  Database,
} from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openGroup, setOpenGroup] = useState("");

  const menu = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    {
      title: "CRM Comercial",
      icon: Users,
      group: "crm",
      sub: [
        { label: "Leads / Interessados", href: "/gestao/leads" }, // PAPEL 2
        { label: "Clientes Compradores", href: "/gestao/compradores" }, // PAPEL 7
        { label: "Proprietários", href: "/gestao/proprietarios" }, // PAPEL 3
        { label: "Inquilinos", href: "/gestao/inquilinos" }, // PAPEL 4
      ],
    },
    {
      title: "Operacional",
      icon: Home,
      group: "ops",
      sub: [
        { label: "Equipe", href: "/gestao/equipe" }, // PAPEL 1 - Nome simplificado
        { label: "Gestão de Imóveis", href: "/imoveis" },
      ],
    },
    {
      title: "Configurações",
      icon: Settings,
      group: "cfg",
      sub: [
        { label: "Unidades / Filiais", href: "/configuracoes/unidades" }, // Caminho corrigido
        { label: "Atributos Imóveis", href: "/configuracoes/atributos" },
        { label: "Grupos de Caixa", href: "/configuracoes/grupos-caixa" },
      ],
    },
  ];
  const adminMenu = [
    { icon: LayoutDashboard, label: "Painel Geral", href: "/dashboard" },
    { icon: UserCog, label: "Proprietários", href: "/gestao/proprietarios" }, // Slug: proprietarios
    { icon: Users, label: "Inquilinos", href: "/gestao/clientes" }, // Slug: clientes
    { icon: Target, label: "Interessados", href: "/gestao/leads" }, // Slug: leads
    { icon: Briefcase, label: "Minha Equipe", href: "/gestao/equipe" }, // Slug: equipe
  ];

  return (
    <aside
      style={{ width: isExpanded ? 260 : 84 }}
      className="fixed left-6 top-6 bottom-6 z-50 bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-gray-100 flex flex-col p-4 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-8 px-2 pt-2">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white">
          <Home size={24} />
        </div>
        {isExpanded && (
          <span className="font-black text-xl text-gray-800 tracking-tighter uppercase">
            SIS<span className="text-indigo-600">MOB</span>
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto">
        {menu.map((item) => (
          <div key={item.title}>
            <button
              onClick={() => {
                setIsExpanded(true);
                setOpenGroup(openGroup === item.group ? "" : item.group || "");
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl text-gray-400 hover:bg-indigo-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <item.icon size={22} />
                {isExpanded && (
                  <span className="text-sm font-bold">{item.title}</span>
                )}
              </div>
              {isExpanded && item.sub && <ChevronDown size={14} />}
            </button>

            {isExpanded && openGroup === item.group && item.sub && (
              <div className="ml-12 flex flex-col gap-2 pb-4">
                {item.sub.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="text-xs text-gray-500 hover:text-indigo-600 font-bold uppercase"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
