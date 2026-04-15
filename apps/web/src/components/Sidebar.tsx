"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Users,
  UserCog,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [session, setSession] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const adminMenu = [
    { icon: LayoutDashboard, label: "Painel", href: "/admin" },
    { icon: PlusCircle, label: "Novo Imóvel", href: "/admin/imoveis/novo" },
    { icon: UserCog, label: "Proprietários", href: "/admin/proprietarios" },
    { icon: Users, label: "Clientes", href: "/admin/clientes" },
  ];

  return (
    <>
      {/* 1. VERSÃO DESKTOP (Lateral) - Aparece apenas em telas MAIORES que 768px (md) */}
      <motion.aside
        animate={{ width: isExpanded ? 260 : 84 }}
        className="hidden md:flex fixed left-6 top-6 bottom-6 z-[9999] bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-gray-100 flex flex-col p-4 overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-10 px-2 pt-2">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
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

          {session &&
            adminMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === item.href ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <item.icon size={22} />
                {isExpanded && (
                  <span className="text-sm font-bold">{item.label}</span>
                )}
              </Link>
            ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          {session ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100"
            >
              <LogOut size={22} />
              {isExpanded && <span className="text-sm font-bold">Sair</span>}
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-4 p-4 bg-green-50 text-green-600 rounded-2xl"
            >
              <LogIn size={22} />
              {isExpanded && <span className="text-sm font-bold">Entrar</span>}
            </Link>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400"
          >
            {isExpanded ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </motion.aside>

      {/* 2. VERSÃO MOBILE (Barra Inferior) - Aparece apenas em telas MENORES que 768px (md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-100 flex justify-around items-center p-4 pb-8 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <Link
          href="/"
          className={`p-3 rounded-2xl ${pathname === "/" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400"}`}
        >
          <Search size={28} />
        </Link>

        {session ? (
          <>
            <Link
              href="/admin/imoveis/novo"
              className={`p-3 rounded-2xl ${pathname === "/admin/imoveis/novo" ? "bg-gray-900 text-white" : "text-gray-400"}`}
            >
              <PlusCircle size={28} />
            </Link>
            <Link
              href="/admin/proprietarios"
              className={`p-3 rounded-2xl ${pathname.includes("/admin") && pathname !== "/admin/imoveis/novo" ? "bg-gray-900 text-white" : "text-gray-400"}`}
            >
              <Layers size={28} />
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className={`p-3 rounded-2xl ${pathname === "/login" ? "bg-green-600 text-white" : "text-gray-400"}`}
          >
            <LogIn size={28} />
          </Link>
        )}
      </nav>
    </>
  );
}
