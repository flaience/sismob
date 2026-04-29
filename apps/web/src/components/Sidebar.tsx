"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Home,
  Settings,
  Plus,
  ChevronRight,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

// 1. DEFINIÇÃO DE TIPO PARA O MANTALIDADE INDUSTRIAL
interface MenuItem {
  title: string;
  icon: any;
  href: string; // Obrigatório para evitar o erro TS(2322)
  group?: string;
}

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const canSee = (allowedCargos: string[]) => {
    if (user?.papel === "0") return true; // Super-Admin vê TUDO
    return allowedCargos.includes(user?.cargo || "");
  };

  const menu = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      visible: true,
    },
    {
      title: "Financeiro",
      icon: CreditCard,
      href: "/financeiro/caixa",
      visible: canSee(["financeiro", "gerente"]), // Só o financeiro e gerente vêem
    },
    {
      title: "Nova Imobiliária",
      icon: Plus,
      href: "/onboarding",
      visible: user?.papel === "0", // SÓ O LUIS VÊ
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  // 2. ARRAY DE MENU COM HREFS GARANTIDOS

  return (
    <aside
      style={{ width: isExpanded ? 260 : 84 }}
      className="fixed left-6 top-6 bottom-6 z-50 bg-white shadow-2xl rounded-[2.5rem] flex flex-col p-4 transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* LOGO / HOME ICON */}
      <div className="bg-indigo-600 p-3 rounded-2xl text-white w-fit mb-8 shadow-lg shadow-indigo-100">
        <Home size={24} />
      </div>

      {/* NAVEGAÇÃO PRINCIPAL */}
      <nav className="flex-1 space-y-2">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.title}
              href={item.href} // Agora o TS sabe que sempre existirá uma string
              className={`
                flex items-center gap-4 p-4 rounded-2xl transition-all group
                ${isActive ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100" : "text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"}
              `}
            >
              <item.icon
                size={22}
                className={
                  isActive ? "text-white" : "group-hover:text-indigo-600"
                }
              />
              {isExpanded && (
                <span className="font-bold text-sm whitespace-nowrap">
                  {item.title}
                </span>
              )}
            </Link>
          );
        })}

        {/* ÁREA EXCLUSIVA SUPER-ADMIN (LUIS PAPEL 0) */}
        {user?.papel === "0" && (
          <div className="mt-8 pt-6 border-t border-gray-50 space-y-2">
            {isExpanded && (
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4 mb-2">
                SaaS Flaience
              </p>
            )}
            <Link
              href="/flaience/onboarding"
              className={`
                flex items-center gap-4 p-4 rounded-2xl transition-all
                ${pathname === "/flaience/onboarding" ? "bg-orange-500 text-white shadow-orange-100" : "bg-gray-50 text-gray-500 hover:bg-orange-50 hover:text-orange-600"}
              `}
            >
              <Plus size={22} />
              {isExpanded && (
                <span className="font-bold text-sm whitespace-nowrap">
                  Nova Imobiliária
                </span>
              )}
            </Link>
          </div>
        )}
      </nav>

      {/* BOTÃO DE EXPANDIR (CONTROLE VISUAL) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-auto flex items-center justify-center p-4 bg-gray-50 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all"
      >
        <ChevronRight
          size={20}
          className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>
    </aside>
  );
}
