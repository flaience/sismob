"use client";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  Home,
  Settings,
  ChevronDown,
  Target,
  ShieldAlert,
  Plus,
} from "lucide-react";
import { Link } from "expo-router";
import { usePathname } from "next/navigation";
// Importe seu hook de autenticação para saber quem é o usuário
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openGroup, setOpenGroup] = useState("");
  const pathname = usePathname();
  const { user } = useAuth(); // Pega o usuário logado (Papel 0, 1, 6...)

  const menu = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    {
      title: "CRM Comercial",
      icon: Users,
      group: "crm",
      sub: [
        { label: "Leads / Interessados", href: "/gestao/leads" },
        { label: "Clientes Compradores", href: "/gestao/compradores" },
        { label: "Proprietários", href: "/gestao/proprietarios" },
        { label: "Inquilinos", href: "/gestao/inquilinos" },
      ],
    },
    {
      title: "Operacional",
      icon: Home,
      group: "ops",
      sub: [
        { label: "Equipe", href: "/gestao/equipe" },
        { label: "Gestão de Imóveis", href: "/imoveis" },
      ],
    },
    {
      title: "Configurações",
      icon: Settings,
      group: "cfg",
      sub: [
        { label: "Unidades / Filiais", href: "/configuracoes/unidades" },
        { label: "Atributos Imóveis", href: "/configuracoes/atributos" },
        { label: "Grupos de Caixa", href: "/configuracoes/grupos-caixa" },
      ],
    },
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

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
        {/* MENU DINÂMICO DA IMOBILIÁRIA */}
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
                    className={`text-xs font-bold uppercase ${pathname === s.href ? "text-indigo-600" : "text-gray-400"}`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* MÓDULO EXCLUSIVO FLAIENCE (SÓ APARECE PARA O LUIS - PAPEL 0) */}
        {isExpanded && user?.papel === "0" && (
          <div className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-4 mb-4">
              Administração SaaS
            </p>
            <Link
              href="/flaience/onboarding"
              className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              <Plus size={20} />
              <span className="text-sm font-bold">Nova Imobiliária</span>
            </Link>
          </div>
        )}
      </nav>
    </aside>
  );
}
