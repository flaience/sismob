"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, UserCog, Briefcase, Home, Settings, 
  ChevronDown, Target, Plus, CreditCard, Landmark, ShieldCheck, 
  LogOut, Building2, BarChart3, Receipt, Handshake
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [openGroup, setOpenGroup] = useState("corretor"); // Inicia aberto no Hub
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { tenant } = useTenant();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !user) return null;

  const isLuis = user?.papel == "0" || user?.email === "luis@flaience.com";
  const podeVerFinanceiro = isLuis || user?.papel == "6" || user?.cargo === "gerente" || user?.cargo === "financeiro";
  const isGestor = isLuis || user?.papel == "6" || user?.cargo === "gerente";

  const menuGroups = [
    {
      title: "HUB DO CORRETOR", // <--- FOCO TOTAL EM VENDAS
      icon: Handshake,
      group: "corretor",
      items: [
        { label: "Painel Geral", href: "/dashboard", icon: LayoutDashboard },
        { label: "Estoque de Imóveis", href: "/gestao/imoveis", icon: Home },
        { label: "Minhas Negociações", href: "/gestao/negociacoes", icon: Target },
        { label: "Proprietários", href: "/gestao/proprietarios", icon: UserCog },
        { label: "Interessados (Leads)", href: "/gestao/leads", icon: Users },
        { label: "Clientes Compradores", href: "/gestao/compradores", icon: ShieldCheck },
      ],
    },
  ];

  // 1. GESTÃO FINANCEIRA (SÓ PARA PERFIS AUTORIZADOS)
  if (podeVerFinanceiro) {
    menuGroups.push({
      title: "TESOURARIA",
      icon: Landmark,
      group: "fin",
      items: [
        { label: "Contas Pagar/Receber", href: "/gestao/titulos", icon: Receipt },
        { label: "Movimentação Caixa", href: "/gestao/livro-caixa", icon: CreditCard },
      ],
    });
  }

  // 2. CONFIGURAÇÕES E EQUIPE (SÓ PARA GESTORES)
  if (isGestor) {
    menuGroups.push({
      title: "ADMINISTRAÇÃO",
      icon: Settings,
      group: "adm",
      items: [
        { label: "Minha Equipe", href: "/gestao/equipe", icon: Briefcase },
        { label: "Unidades / Filiais", href: "/gestao/unidades", icon: Building2 },
        { label: "Contas Bancárias", href: "/gestao/contas-bancarias", icon: Landmark },
        { label: "Itens / Comodidades", href: "/gestao/atributos-itens", icon: Settings },
        { label: "Formas de Pagto", href: "/gestao/formas-pagamento", icon: Receipt },
        { label: "Regras de Prazo", href: "/gestao/condicoes-pagamento", icon: BarChart3 },
      ],
    });
  }

  // 3. MÓDULO SUPER-ADMIN FLAIENCE
  if (isLuis) {
    menuGroups.push({
      title: "ADMIN FLAIENCE",
      icon: ShieldCheck,
      group: "flaience",
      items: [
        { label: "Gestão de Imobiliárias", href: "/gestao/imobiliarias", icon: Building2 },
        { label: "Faturamento SaaS", href: "/gestao/faturamento", icon: BarChart3 },
      ],
    });
  }

  return (
    <aside
      style={{ width: isExpanded ? 280 : 84 }}
      className="fixed left-6 top-6 bottom-6 z-[999] bg-white shadow-2xl rounded-[2.5rem] flex flex-col p-4 transition-all duration-300 border border-slate-100"
    >
      {/* LOGO DINÂMICA DA IMOBILIÁRIA */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="bg-brand p-3 rounded-2xl text-white shadow-lg min-w-[48px] h-12 flex items-center justify-center overflow-hidden">
          {tenant?.url_logo ? <img src={tenant.url_logo} className="w-full h-full object-contain" /> : <Home size={24} />}
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
            {isExpanded && (
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4 mt-4 mb-2">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    pathname === item.href ? "bg-brand text-white shadow-xl shadow-indigo-100" : "text-slate-400 hover:bg-slate-50 hover:text-brand"
                  }`}
                >
                  <item.icon size={22} className={pathname === item.href ? "text-white" : ""} />
                  {isExpanded && <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-50 space-y-2">
        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-center p-3 text-slate-300 hover:text-brand">
          <ChevronDown className={`transition-transform duration-500 ${isExpanded ? 'rotate-90' : '-rotate-90'}`} />
        </button>
        <button onClick={signOut} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-50 transition-all">
          <LogOut size={22} />
          {isExpanded && <span className="font-bold text-sm">Sair</span>}
        </button>
      </div>
    </aside>
  );
}