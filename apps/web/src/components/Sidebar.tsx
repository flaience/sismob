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
  Receipt,
  Handshake,
  ReceiptText,
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

  // --- BYPASS DE SEGURANÇA MESTRE (Luis sempre vê tudo) ---
  const isAdminReal = user?.email === "luis@flaience.com" || user?.papel == "0";
  const podeVerFin =
    isAdminReal || user?.cargo === "financeiro" || user?.cargo === "gerente";
  const isGestor = isAdminReal || user?.cargo === "gerente";

  // 1. MAPEAMENTO DE TODOS OS GRUPOS
  const menuGroups: any[] = [];

  // GRUPO: HUB DO CORRETOR (Sempre Visível)
  menuGroups.push({
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
      { label: "Proprietários", href: "/gestao/proprietarios", icon: UserCog },
      { label: "Interessados (Leads)", href: "/gestao/leads", icon: Users },
      { label: "Compradores", href: "/gestao/compradores", icon: ShieldCheck },
    ],
  });

  // GRUPO: TESOURARIA
  if (podeVerFin) {
    menuGroups.push({
      title: "TESOURARIA",
      icon: Landmark,
      group: "fin",
      items: [
        {
          label: "Contas Pagar/Receber",
          href: "/gestao/titulos",
          icon: ReceiptText,
        },
        {
          label: "Movimentação Caixa",
          href: "/gestao/livro-caixa",
          icon: CreditCard,
        },
      ],
    });
  }

  // GRUPO: ADMINISTRAÇÃO
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
          label: "Contas Bancárias",
          href: "/gestao/contas-bancarias",
          icon: Landmark,
        },
        {
          label: "Itens / Comodidades",
          href: "/gestao/atributos-itens",
          icon: Settings,
        },
      ],
    });
  }

  // GRUPO: ADMIN FLAIENCE (EXCLUSIVO)
  if (isAdminReal) {
    menuGroups.push({
      title: "ADMIN FLAIENCE",
      icon: ShieldCheck,
      group: "flaience",
      items: [
        {
          label: "Imobiliárias",
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
      className="fixed left-6 top-6 bottom-6 z-[999] bg-white shadow-2xl rounded-[2.5rem] flex flex-col p-4 transition-all duration-500 border border-slate-100 overflow-hidden"
    >
      {/* SELO DE VERSÃO (Para provar que o código mudou) */}
      {isExpanded && (
        <div className="absolute top-0 right-0 bg-brand text-white text-[8px] px-2 py-1 rounded-bl-xl font-black">
          v2.2 STABLE
        </div>
      )}

      {/* LOGO */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="bg-brand p-3 rounded-2xl text-white shadow-lg min-w-[48px] h-12 flex items-center justify-center">
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

      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {menuGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <button
              onClick={() => {
                setIsExpanded(true);
                setOpenGroup(openGroup === group.group ? "" : group.group);
              }}
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
                  className={openGroup === group.group ? "rotate-180" : ""}
                />
              )}
            </button>

            {isExpanded && openGroup === group.group && (
              <div className="ml-6 flex flex-col gap-1 mt-2 animate-in slide-in-from-top-2 duration-300">
                {group.items.map((item: any) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      pathname === item.href
                        ? "text-brand bg-indigo-50"
                        : "text-slate-400 hover:text-brand"
                    }`}
                  >
                    <item.icon size={16} /> {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="pt-4 border-t border-slate-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center p-3 text-slate-300 hover:text-brand"
        >
          {isExpanded ? "RECOLHER" : ">>>"}
        </button>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 transition-all"
        >
          <LogOut size={22} />
          {isExpanded && (
            <span className="font-bold text-xs uppercase font-black">Sair</span>
          )}
        </button>
      </div>
    </aside>
  );
}
