"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
  Home,
  Settings,
  Target,
  ShieldCheck,
  LogOut,
  Landmark,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { tenant } = useTenant();

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || !user) return null;

  // Lógica de visibilidade
  const isLuis = user?.papel == "0";

  return (
    <>
      {/* 1. VERSÃO DESKTOP (Lateral) */}
      <aside
        style={{ width: isExpanded ? 280 : 84 }}
        className="hidden md:flex fixed left-6 top-6 bottom-6 z-[999] bg-white shadow-2xl rounded-[2.5rem] flex-col p-4 transition-all duration-300 border border-slate-100"
      >
        <div className="bg-brand p-3 rounded-2xl text-white w-fit mb-8 shadow-lg">
          <Home size={24} />
        </div>

        <nav className="flex-1 space-y-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-50"
          >
            <LayoutDashboard size={22} />
            {isExpanded && <span className="font-bold text-sm">Painel</span>}
          </Link>
          <Link
            href="/gestao/imoveis"
            className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-50"
          >
            <Home size={22} />
            {isExpanded && <span className="font-bold text-sm">Imóveis</span>}
          </Link>
          <Link
            href="/gestao/negociacoes"
            className="flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-50"
          >
            <Target size={22} />
            {isExpanded && <span className="font-bold text-sm">Vendas</span>}
          </Link>

          {isLuis && (
            <Link
              href="/gestao/imobiliarias"
              className="mt-10 flex items-center gap-4 p-4 rounded-2xl bg-slate-900 text-white shadow-xl"
            >
              <ShieldCheck size={22} />
              {isExpanded && <span className="font-bold text-sm">Admin</span>}
            </Link>
          )}
        </nav>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-auto p-4 text-slate-300 hover:text-brand font-black"
        >
          {isExpanded ? "RECOLHER" : ">>>"}
        </button>
      </aside>

      {/* 2. VERSÃO MOBILE (Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 z-[1000] flex items-center justify-around px-6 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Link
          href="/dashboard"
          className={`p-3 ${pathname === "/dashboard" ? "text-brand" : "text-slate-300"}`}
        >
          <LayoutDashboard size={28} />
        </Link>
        <Link
          href="/gestao/imoveis"
          className={`p-3 ${pathname === "/gestao/imoveis" ? "text-brand" : "text-slate-300"}`}
        >
          <Home size={28} />
        </Link>
        <Link
          href="/gestao/negociacoes"
          className={`p-3 ${pathname === "/gestao/negociacoes" ? "text-brand" : "text-slate-300"}`}
        >
          <Target size={28} />
        </Link>
        <Link
          href="/gestao/equipe"
          className={`p-3 ${pathname === "/gestao/equipe" ? "text-brand" : "text-slate-300"}`}
        >
          <Users size={28} />
        </Link>
      </nav>
    </>
  );
}
