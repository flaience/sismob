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

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || !user) return null;

  const isLuis = user?.papel == "0" || user?.email === "luis@flaience.com";
  const podeVerFinanceiro =
    isLuis ||
    user?.papel == "6" ||
    user?.cargo === "gerente" ||
    user?.cargo === "financeiro";
  const isGestor = isLuis || user?.papel == "6" || user?.cargo === "gerente";

  const menuGroups = [
    {
      title: "HUB DO CORRETOR", // <--- FOCO TOTAL EM VENDAS
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
        { label: "Interessados (Leads)", href: "/gestao/leads", icon: Users },
        {
          label: "Clientes Compradores",
          href: "/gestao/compradores",
          icon: ShieldCheck,
        },
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

  // 2. CONFIGURAÇÕES E EQUIPE (SÓ PARA GESTORES)
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
        {
          label: "Formas de Pagto",
          href: "/gestao/formas-pagamento",
          icon: Receipt,
        },
        {
          label: "Regras de Prazo",
          href: "/gestao/condicoes-pagamento",
          icon: BarChart3,
        },
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
    // Altere o container principal da sua Aside:
    <aside
      style={{ width: isExpanded ? 280 : 84 }}
      className={`
    /* NO DESKTOP: Mantém como está */
    hidden md:flex fixed left-6 top-6 bottom-6 z-[999] bg-white shadow-2xl rounded-[2.5rem] flex-col p-4 transition-all duration-300 border border-slate-100
    
    /* NO MOBILE: Vira uma barra fixa no topo ou embaixo */
    fixed bottom-0 left-0 right-0 h-20 w-full rounded-t-[2rem] flex flex-row items-center justify-around bg-white border-t border-slate-100 z-[1000] md:hidden
  `}
    >
      {/* No mobile, mostramos apenas os 4 ícones principais sem texto */}
      <Link href="/dashboard" className="p-3 text-indigo-600">
        <LayoutDashboard size={24} />
      </Link>
      <Link href="/gestao/imoveis" className="p-3 text-slate-400">
        <Home size={24} />
      </Link>
      <Link href="/gestao/negociacoes" className="p-3 text-slate-400">
        <Target size={24} />
      </Link>
      <Link href="/gestao/equipe" className="p-3 text-slate-400">
        <Users size={24} />
      </Link>
    </aside>
  );
}
