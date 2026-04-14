"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  ChevronRight,
  ChevronLeft,
  LogIn,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  Users,
  UserCog,
  Briefcase,
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

  // Menu de Gestão (Apenas para logados)
  const adminMenu = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: PlusCircle, label: "Novo Imóvel", href: "/admin/imoveis/novo" },
    { icon: UserCog, label: "Proprietários", href: "/admin/proprietarios" },
    { icon: Users, label: "Clientes", href: "/admin/clientes" },
    { icon: Briefcase, label: "Corretores", href: "/admin/corretores" },
  ];

  return (
    <>
      {/* 1. SIDEBAR DESKTOP */}
      <motion.aside
        animate={{ width: isExpanded ? 260 : 84 }}
        className="hidden md:flex fixed left-6 top-6 bottom-6 z-50 bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-white/20 flex flex-col p-4 overflow-hidden"
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-10 px-2 pt-2">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shrink-0">
            <Building2 size={24} />
          </div>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-black text-xl text-gray-800 uppercase tracking-tighter"
            >
              SIS<span className="text-indigo-600">MOB</span>
            </motion.span>
          )}
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {/* LINK PÚBLICO */}
          <Link
            href="/"
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === "/" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
          >
            <Search size={22} />
            {isExpanded && <span className="text-sm font-bold">Explorar</span>}
          </Link>

          {/* ÁREA DE GESTÃO */}
          <AnimatePresence>
            {session && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2"
              >
                {isExpanded && (
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2">
                    Gestão
                  </p>
                )}

                {adminMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === item.href ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}
                  >
                    <item.icon size={22} />
                    {isExpanded && (
                      <span className="text-sm font-bold">{item.label}</span>
                    )}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* RODAPÉ SIDEBAR */}
        <div className="mt-auto flex flex-col gap-3">
          {session ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
            >
              <LogOut size={22} />
              {isExpanded && <span className="text-sm font-bold">Sair</span>}
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-4 p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all"
            >
              <LogIn size={22} />
              {isExpanded && (
                <span className="text-sm font-bold">Área Restrita</span>
              )}
            </Link>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-indigo-600 transition-all"
          >
            {isExpanded ? (
              <ChevronLeft size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
          </button>
        </div>
      </motion.aside>

      {/* 2. BOTTOM NAV MOBILE (Focado nos atalhos principais) */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50 bg-white/80 backdrop-blur-xl border border-gray-100 flex justify-around p-3 rounded-[2rem] shadow-2xl">
        <Link
          href="/"
          className={`p-4 rounded-2xl ${pathname === "/" ? "bg-indigo-600 text-white" : "text-gray-400"}`}
        >
          <Search size={24} />
        </Link>

        {session ? (
          <>
            <Link
              href="/admin/imoveis/novo"
              className={`p-4 rounded-2xl ${pathname === "/admin/imoveis/novo" ? "bg-gray-900 text-white" : "text-gray-400"}`}
            >
              <PlusCircle size={24} />
            </Link>
            <Link
              href="/admin/proprietarios"
              className={`p-4 rounded-2xl ${pathname.includes("admin") && pathname !== "/admin/imoveis/novo" ? "bg-gray-900 text-white" : "text-gray-400"}`}
            >
              <Layers size={24} />
            </Link>
          </>
        ) : (
          <Link
            href="/login"
            className={`p-4 rounded-2xl ${pathname === "/login" ? "bg-green-600 text-white" : "text-gray-400"}`}
          >
            <LogIn size={24} />
          </Link>
        )}
      </nav>
    </>
  );
}
