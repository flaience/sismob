"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  Home,
  Settings,
  CreditCard,
  Landmark,
  ShieldCheck,
  LogOut,
  Building2,
  Receipt,
  Handshake,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { getSismobPermissions } from "@/lib/permissions";

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

  const permissions = getSismobPermissions(user);

  const menuGroups: any[] = [];

  if (permissions.canAccessBrokerHub) {
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
        {
          label: "Proprietários",
          href: "/gestao/proprietarios",
          icon: UserCog,
        },
        { label: "Leads / Interessados", href: "/gestao/leads", icon: Users },
        {
          label: "Compradores",
          href: "/gestao/compradores",
          icon: ShieldCheck,
        },
      ],
    });
  }

  if (permissions.canSeeFinancial) {
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

  if (permissions.canSeeAdministration) {
    const adminItems = [
      ...(permissions.canManageUsers
        ? [
            {
              label: "Minha Equipe",
              href: "/gestao/equipe",
              icon: Briefcase,
            },
          ]
        : []),

      ...(permissions.canManageUnits
        ? [
            {
              label: "Unidades / Filiais",
              href: "/gestao/unidades",
              icon: Building2,
            },
          ]
        : []),

      ...(permissions.canManageBankAccounts
        ? [
            {
              label: "Contas Bancárias",
              href: "/gestao/contas-bancarias",
              icon: Landmark,
            },
          ]
        : []),

      ...(permissions.canManageAttributes
        ? [
            {
              label: "Itens / Atributos",
              href: "/gestao/atributos-itens",
              icon: Settings,
            },
          ]
        : []),
    ];

    if (adminItems.length > 0) {
      menuGroups.push({
        title: "ADMINISTRAÇÃO",
        icon: Settings,
        group: "adm",
        items: adminItems,
      });
    }
  }

  return (
    <>
      <aside
        style={{ width: isExpanded ? 280 : 84 }}
        className="hidden md:flex fixed left-6 top-6 bottom-6 z-[999] bg-white shadow-2xl rounded-[2.5rem] flex-col p-4 transition-all duration-500 border border-slate-100 overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-brand p-3 rounded-2xl text-white shadow-lg min-w-[48px] h-12 flex items-center justify-center">
            {tenant?.url_logo ? (
              <img
                src={tenant.url_logo}
                className="w-full h-full object-contain"
                alt="Logo"
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
                    : "text-slate-400 hover:bg-slate-50"
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
                      <item.icon size={16} />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="pt-4 border-t border-slate-50">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center p-3 text-slate-300 hover:text-brand font-black"
          >
            {isExpanded ? "RECOLHER" : ">>>"}
          </button>

          <button
            onClick={signOut}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 transition-all mt-2"
          >
            <LogOut size={22} />

            {isExpanded && (
              <span className="font-bold text-xs uppercase">Sair</span>
            )}
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 z-[1000] flex items-center overflow-x-auto px-6 rounded-t-[2rem] shadow-2xl no-scrollbar">
        <div className="flex items-center gap-8 min-w-max mx-auto">
          {(menuGroups[0]?.items || []).slice(0, 5).map((item: any) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition-all ${
                pathname === item.href
                  ? "text-brand scale-110"
                  : "text-slate-300"
              }`}
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
            <span className="text-[10px] font-black uppercase">Sair</span>
          </button>
        </div>
      </nav>
    </>
  );
}
