"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Home,
  Target,
  ShieldCheck,
  Landmark,
  Settings,
  LogOut,
  ChevronDown,
  Briefcase,
  Receipt,
  BarChart3,
  Building2,
  Handshake,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openGroup, setOpenGroup] = useState("corretor");
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { tenant } = useTenant();

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || !user) return null;

  // --- LÓGICA DE PERMISSÕES ---
  const isLuis = user?.papel == "0";
  const podeVerFinanceiro =
    isLuis ||
    user?.papel == "6" ||
    user?.cargo === "gerente" ||
    user?.cargo === "financeiro";
  const isGestor = isLuis || user?.papel == "6" || user?.cargo === "gerente";

  // 1. MAPEAMENTO DE GRUPOS E SUBMENUS
  const menuGroups = [
    {
      title: "HUB DO CORRETOR",
      icon: Handshake,
      group: "corretor",
      items: [
        { label: "Painel Geral", href: "/dashboard", icon: LayoutDashboard },
        { label: "Estoque de Imóveis", href: "/gestao/imoveis", icon: Home },
        {
          label: "Minhas Negociações",
          href: "/gestao/negociacoes",
          icon: Target,
        },
        { label: "Interessados (Leads)", href: "/gestao/leads", icon: Users },
      ],
    },
  ];

  if (podeVerFinanceiro) {
    menuGroups.push({
      title: "TESOURARIA",
      icon: Landmark,
      group: "fin",
      items: [
        {
          label: "Contas Pagar/Receber",
          href: "/gestao/titulos",
          icon: Receipt,
        },
        {
          label: "Movimentação Caixa",
          href: "/gestao/livro-caixa",
          icon: CreditCard,
        },
      ],
    });
  }

  if (isGestor) {
    menuGroups.push({
      title: "ADMINISTRAÇÃO",
      icon: Settings,
      group: "adm",
      items: [
        { label: "Minha Equipe", href: "/gestao/equipe", icon: Briefcase },
        {
          label: "Unidades / Filiais",
          href: "/gestao/unidades",
          icon: Building2,
        },
        {
          label: "Itens / Comodidades",
          href: "/gestao/atributos-itens",
          icon: Settings,
        },
      ],
    });
  }

  if (isLuis) {
    menuGroups.push({
      title: "ADMIN FLAIENCE",
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

  // Função para abrir grupo e expandir sidebar simultaneamente
  const toggleGroup = (groupName: string) => {
    setIsExpanded(true);
    setOpenGroup(openGroup === groupName ? "" : groupName);
  };

  return (
    <>
      {/* --- SIDEBAR DESKTOP --- */}
      <aside
        style={{ width: isExpanded ? 280 : 84 }}
        className="hidden md:flex fixed left-6 top-6 bottom-6 z-[999] bg-white shadow-2xl rounded-[2.5rem] flex flex-col p-4 transition-all duration-500 border border-slate-100 overflow-hidden"
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-brand p-3 rounded-2xl text-white shadow-lg min-w-[48px] h-12 flex items-center justify-center overflow-hidden">
            {tenant?.url_logo ? (
              <img
                src={tenant.url_logo}
                className="w-full h-full object-contain"
              />
            ) : (
              <Home size={24} />
            )}
          </div>
          {isExpanded && (
            <span className="font-black text-xl text-slate-900 tracking-tighter uppercase italic truncate">
              {tenant?.nome_fantasia || "SISMOB"}
            </span>
          )}
        </div>

        {/* NAVEGAÇÃO COM SUBMENUS */}
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {menuGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {/* ÍCONE PAI (Gatilho do Submenu) */}
              <button
                onClick={() => toggleGroup(group.group)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                  openGroup === group.group
                    ? "bg-slate-50 text-brand"
                    : "text-slate-400 hover:bg-slate-50 hover:text-brand"
                }`}
              >
                <div className="flex items-center gap-4">
                  <group.icon
                    size={22}
                    className={openGroup === group.group ? "text-brand" : ""}
                  />
                  {isExpanded && (
                    <span className="font-bold text-sm whitespace-nowrap">
                      {group.title}
                    </span>
                  )}
                </div>
                {isExpanded && (
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${openGroup === group.group ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {/* SUBMENU (Só aparece se o grupo estiver aberto e a sidebar expandida) */}
              {isExpanded && openGroup === group.group && (
                <div className="ml-6 flex flex-col gap-1 py-2 animate-in slide-in-from-top-2 duration-300">
                  {group.items.map((item: any) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        pathname === item.href
                          ? "bg-indigo-50 text-brand shadow-sm"
                          : "text-slate-400 hover:text-brand"
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

        {/* FOOTER */}
        <div className="pt-4 border-t border-slate-50 space-y-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center p-3 text-slate-300 hover:text-brand transition-all"
          >
            <ChevronDown
              className={`transition-transform duration-500 ${isExpanded ? "rotate-90" : "-rotate-90"}`}
            />
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      {/* --- VERSÃO MOBILE (Mantida conforme sua preferência de agilidade) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 z-[1000] flex items-center overflow-x-auto px-6 rounded-t-[2rem] shadow-2xl no-scrollbar">
        <div className="flex items-center gap-8 min-w-max mx-auto">
          {menuGroups[0].items.map((item: any) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${pathname === item.href ? "text-brand scale-110" : "text-slate-300"}`}
            >
              <item.icon size={24} />
              <span className="text-[10px] font-black uppercase">
                {item.label.split(" ")[0]}
              </span>
            </Link>
          ))}
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-1 text-red-300 px-4"
          >
            <LogOut size={24} />
            <span className="text-[10px] font-black uppercase tracking-tighter">
              Sair
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
