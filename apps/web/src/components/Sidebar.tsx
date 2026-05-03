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
  Building2,
  BarChart3,
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

  // 1. FAILSAFE: Se o componente ainda não montou, não renderiza (evita erro de hidratação)
  if (!mounted) return null;

  // 2. MAPEAMENTO DE MENUS OPERACIONAIS
  const menuGroups = [
    {
      title: "CRM Comercial",
      icon: Users,
      group: "crm",
      items: [
        { label: "Leads / Interessados", href: "/gestao/leads", icon: Target },
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
        { label: "Gestão de Imóveis", href: "/gestao/imoveis", icon: Home },
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
          href: "/gestao/unidades",
          icon: Landmark,
        },
        { label: "Bancos", href: "/gestao/bancos", icon: CreditCard },
        {
          label: "Itens / Atributos",
          href: "/gestao/atributos-itens",
          icon: Settings,
        },
      ],
    },
  ];

  // 3. O SEGREDO DO LUIS (Usamos == em vez de === para ignorar se é String ou Número)
  if (user?.papel == "0") {
    menuGroups.push({
      title: "Admin Flaience",
      icon: ShieldCheck,
      group: "flaience",
      items: [
        {
          label: "Gestão de Imobiliárias",
          href: "/gestao/imobiliarias",
          icon: Building2,
        },
        {
          label: "Faturamento SaaS",
          href: "/gestao/faturamento",
          icon: BarChart3,
        },
      ],
    });
  }

  return (
    <aside
      style={{ width: isExpanded ? 280 : 84 }}
      className="fixed left-6 top-6 bottom-6 z-[999] bg-white shadow-2xl rounded-[2.5rem] flex flex-col p-4 transition-all duration-300 border border-slate-100"
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

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        <Link
          href="/dashboard"
          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
            pathname === "/dashboard"
              ? "bg-indigo-600 text-white shadow-xl"
              : "text-slate-400 hover:bg-slate-50"
          }`}
        >
          <LayoutDashboard size={22} />
          {isExpanded && (
            <span className="font-bold text-sm">Painel Geral</span>
          )}
        </Link>

        {menuGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <button
              onClick={() => {
                setIsExpanded(true);
                setOpenGroup(openGroup === group.group ? "" : group.group);
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                openGroup === group.group
                  ? "bg-slate-50 text-indigo-600"
                  : "text-slate-400 hover:bg-slate-50"
              }`}
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
                    className={`flex items-center gap-4 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      pathname === item.href
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-slate-400 hover:text-indigo-600"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* DEBUG PARA O LUIS (Removeremos depois) */}
      {isExpanded && (
        <div className="p-4 bg-slate-50 rounded-2xl mb-4 border border-dashed border-slate-200">
          <p className="text-[9px] font-black text-slate-400 uppercase">
            Acesso: {user?.nome}
          </p>
          <p className="text-[9px] font-bold text-indigo-600 uppercase">
            Nível: {user?.papel || "Nulo"}
          </p>
        </div>
      )}

      {/* FOOTER / LOGOUT */}
      <div className="pt-4 border-t border-slate-50 space-y-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-3 text-slate-300 hover:text-indigo-600"
        >
          <ChevronDown
            className={`transition-transform duration-500 ${isExpanded ? "rotate-90" : "-rotate-90"}`}
          />
        </button>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 transition-all"
        >
          <LogOut size={22} />
          {isExpanded && <span className="font-bold text-sm">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
