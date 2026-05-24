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
  ChevronRight,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [mounted, setMounted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || !user) return null;

  // 1. DEFINIÇÃO DOS LINKS PARA O MOBILE (AQUELES QUE O CORRETOR USA NA RUA)
  const mobileMenu = [
    { label: "Início", href: "/dashboard", icon: LayoutDashboard },
    { label: "Vendas", href: "/gestao/negociacoes", icon: Target },
    { label: "Imóveis", href: "/gestao/imoveis", icon: Home },
    { label: "Leads", href: "/gestao/leads", icon: Users },
    { label: "Equipe", href: "/gestao/equipe", icon: Briefcase },
    { label: "Bancos", href: "/gestao/bancos", icon: Landmark },
  ];

  return (
    <>
      {/* --- VERSÃO DESKTOP (SIDEBAR LATERAL) --- */}
      <aside
        style={{ width: isExpanded ? 280 : 84 }}
        className="hidden md:flex fixed left-6 top-6 bottom-6 z-[999] bg-white shadow-2xl rounded-[2.5rem] flex-col p-4 transition-all duration-500 border border-slate-100 overflow-hidden"
      >
        <div className="bg-indigo-600 p-3 rounded-2xl text-white w-fit mb-8 shadow-lg">
          <Home size={24} />
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
          {mobileMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === item.href ? "bg-indigo-600 text-white shadow-xl" : "text-slate-400 hover:bg-slate-50"}`}
            >
              <item.icon size={22} />
              {isExpanded && (
                <span className="font-bold text-sm whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          ))}

          {user?.papel == "0" && (
            <Link
              href="/gestao/imobiliarias"
              className="flex items-center gap-4 p-4 mt-6 rounded-2xl bg-slate-900 text-white hover:bg-indigo-600 transition-all"
            >
              <ShieldCheck size={22} />
              {isExpanded && (
                <span className="font-bold text-sm">SaaS Flaience</span>
              )}
            </Link>
          )}
        </nav>

        <div className="pt-4 border-t border-slate-50 space-y-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center p-3 text-slate-300 hover:text-indigo-600"
          >
            <ChevronRight
              className={`transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center p-4 text-red-400 hover:bg-red-50 rounded-2xl"
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      {/* --- VERSÃO MOBILE (BOTTOM BAR COM SCROLL LATERAL) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 z-[1000] flex items-center overflow-x-auto snap-x snap-mandatory px-6 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] no-scrollbar">
        <div className="flex items-center gap-8 min-w-max mx-auto">
          {mobileMenu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 snap-center transition-all ${pathname === item.href ? "text-indigo-600 scale-110" : "text-slate-300"}`}
            >
              <item.icon
                size={24}
                strokeWidth={pathname === item.href ? 3 : 2}
              />
              <span className="text-[10px] font-black uppercase tracking-tighter">
                {item.label}
              </span>
            </Link>
          ))}
          {/* BOTÃO SAIR NO MOBILE */}
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
