"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  ChevronDown,
  User,
  PlusCircle,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard, // Adicionado
  Users, // Adicionado
  Target, // Adicionado para Interessados
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCadastros, setShowCadastros] = useState(false);
  const [session, setSession] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Definição do menu conforme a sua estrutura de pastas
  const menuItens = [
    // Se a pasta é (admin)/dashboard/page.tsx, o link é /dashboard
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },

    // Se a pasta é (admin)/proprietarios/page.tsx, o link é /proprietarios
    { label: "Proprietários", href: "/proprietarios", icon: User },

    // Se a pasta é (admin)/clientes/page.tsx, o link é /clientes
    { label: "Clientes", href: "/clientes", icon: User },

    // Se a pasta é (admin)/interessados/page.tsx, o link é /interessados
    { label: "Interessados", href: "/interessados", icon: Target },

    // Se a pasta é (admin)/clientes/page.tsx, o link é /clientes
    { label: "Inquilinos", href: "/clientes", icon: Users },

    // Se a pasta é (admin)/imoveis/novo/page.tsx, o link é /imoveis/novo
    { label: "Novo Imóvel", href: "/imoveis/novo", icon: PlusCircle },
  ];

  return (
    <aside
      style={{ width: isExpanded ? 260 : 84 }}
      className="hidden md:flex fixed left-6 top-6 bottom-6 z-50 bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-gray-100 flex flex-col p-4 transition-all duration-300 overflow-hidden"
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-10 px-2 pt-2">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white">
          <Building2 size={24} />
        </div>
        {isExpanded && (
          <span className="font-black text-xl text-gray-800 uppercase">
            SIS<span className="text-indigo-600">MOB</span>
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <Link
          href="/"
          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === "/" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
        >
          <Search size={22} />
          {isExpanded && <span className="text-sm font-bold">Explorar</span>}
        </Link>

        {session && (
          <div className="space-y-1">
            <button
              onClick={() => {
                setIsExpanded(true);
                setShowCadastros(!showCadastros);
              }}
              className="w-full flex items-center justify-between p-4 text-gray-400 hover:bg-gray-50 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <LayoutDashboard size={22} />
                {isExpanded && (
                  <span className="text-sm font-bold">Gestão Interna</span>
                )}
              </div>
              {isExpanded && (
                <ChevronDown
                  size={16}
                  className={showCadastros ? "rotate-180" : ""}
                />
              )}
            </button>

            {isExpanded && showCadastros && (
              <div className="pl-12 flex flex-col gap-3 pb-4">
                {menuItens.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                      pathname === item.href
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                    }`}
                  >
                    {/* ADICIONAMOS O ÍCONE AQUI PARA ELE APARECER NO MENU */}
                    <item.icon size={22} className="shrink-0" />

                    {isExpanded && (
                      <span className="text-sm font-bold whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* RODAPÉ */}
      <div className="mt-auto flex flex-col gap-2">
        {!session ? (
          <Link
            href="/login"
            className="flex items-center gap-4 p-4 bg-green-50 text-green-600 rounded-2xl"
          >
            <LogIn size={22} />
            {isExpanded && <span className="text-sm font-bold">Entrar</span>}
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 p-4 bg-red-50 text-red-500 rounded-2xl"
          >
            <LogOut size={22} />
            {isExpanded && <span className="text-sm font-bold">Sair</span>}
          </button>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  );
}
