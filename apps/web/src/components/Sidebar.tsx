"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  Home,
  Settings,
  ChevronDown,
  Target,
  Plus,
  CreditCard,
  Landmark,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openGroup, setOpenGroup] = useState("");
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || !user) return null;

  // ESTRUTURA DE MENU ALINHADA COM AS PASTAS [papel] e [slug]
  const menuGroups = [
    {
      title: "CRM Comercial",
      icon: Users,
      group: "crm",
      items: [
        { label: "Interessados (Leads)", href: "/gestao/leads", icon: Target },
        {
          label: "Clientes Compradores",
          href: "/gestao/compradores",
          icon: ShieldCheck,
        },
        {
          label: "Proprietários",
          href: "/gestao/proprietarios",
          icon: UserCog,
        },
        { label: "Inquilinos", href: "/gestao/inquilinos", icon: Users },
      ],
    },
    {
      title: "Operacional",
      icon: Home,
      group: "ops",
      items: [
        { label: "Meus Imóveis", href: "/imoveis", icon: Home }, // Pasta física: app/imoveis
        { label: "Minha Equipe", href: "/gestao/equipe", icon: Briefcase },
      ],
    },
    {
      title: "Configurações",
      icon: Settings,
      group: "cfg",
      items: [
        {
          label: "Unidades / Filiais",
          href: "/configuracoes/unidades",
          icon: Landmark,
        },
        { label: "Bancos", href: "/configuracoes/bancos", icon: CreditCard },
      ],
    },
  ];

  return (
    <aside
      style={{ width: isExpanded ? 280 : 84 }}
      className="fixed left-6 top-6 bottom-6 z-50 bg-white shadow-2xl rounded-[2.5rem] flex flex-col p-4 transition-all duration-300 overflow-hidden border border-slate-100"
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
          <Home size={24} />
        </div>
        {isExpanded && (
          <span className="font-black text-xl text-slate-900 tracking-tighter uppercase">
            SIS<span className="text-indigo-600">MOB</span>
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
        {/* DASHBOARD SEMPRE VISÍVEL */}
        <Link
          href="/dashboard"
          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === "/dashboard" ? "bg-indigo-600 text-white shadow-xl" : "text-slate-400 hover:bg-slate-50"}`}
        >
          <LayoutDashboard size={22} />
          {isExpanded && (
            <span className="font-bold text-sm">Dashboard Principal</span>
          )}
        </Link>

        {/* GRUPOS DINÂMICOS */}
        {menuGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <button
              onClick={() => {
                setIsExpanded(true);
                setOpenGroup(openGroup === group.group ? "" : group.group);
              }}
              className="w-full flex items-center justify-between p-4 rounded-2xl text-slate-400 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-4">
                <group.icon size={22} />
                {isExpanded && (
                  <span className="font-bold text-sm">{group.title}</span>
                )}
              </div>
              {isExpanded && (
                <ChevronDown
                  size={14}
                  className={openGroup === group.group ? "rotate-180" : ""}
                />
              )}
            </button>

            {isExpanded && openGroup === group.group && (
              <div className="ml-4 flex flex-col gap-1 animate-in slide-in-from-top-2 duration-300">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 p-3 rounded-xl text-xs font-bold uppercase tracking-widest ${pathname === item.href ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600"}`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* MÓDULO SUPER-ADMIN (SÓ PARA O LUIS) */}
        {isExpanded && user?.papel === "0" && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] ml-4 mb-4">
              Administração SaaS
            </p>
            <Link
              href="/onboarding"
              className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 text-white shadow-xl hover:bg-indigo-600 transition-all group"
            >
              <Plus
                size={20}
                className="group-hover:rotate-90 transition-transform"
              />
              <span className="text-sm font-bold">Nova Imobiliária</span>
            </Link>
          </div>
        )}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={signOut}
        className="mt-auto flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 transition-all"
      >
        <LogOut size={22} />
        {isExpanded && (
          <span className="font-bold text-sm">Sair do Sistema</span>
        )}
      </button>
    </aside>
  );
}
