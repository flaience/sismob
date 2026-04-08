"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Camera,
  Map,
  Building2,
  ChevronRight,
  ChevronLeft,
  LogIn,
  LogOut,
  PlusCircle,
  LayoutDashboard,
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

  // Escuta o estado do login em tempo real
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

  return (
    <motion.aside
      animate={{ width: isExpanded ? 260 : 84 }}
      className="fixed left-6 top-6 bottom-6 z-50 bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-white/20 flex flex-col p-4"
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-10 px-2 pt-2">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shrink-0">
          <Building2 size={24} />
        </div>
        {isExpanded && (
          <span className="font-black text-xl text-gray-800 uppercase tracking-tighter">
            SIS<span className="text-indigo-600">MOB</span>
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {/* ITENS PÚBLICOS */}
        <Link
          href="/"
          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === "/" ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
        >
          <Search size={22} />
          {isExpanded && <span className="text-sm font-bold">Explorar</span>}
        </Link>

        {/* ITENS PRIVADOS (Apenas se logado) */}
        <AnimatePresence>
          {session && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-2 pt-4 mt-4 border-t border-gray-100"
            >
              <Link
                href="/admin/imoveis/novo"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === "/admin/imoveis/novo" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <PlusCircle size={22} />
                {isExpanded && (
                  <span className="text-sm font-bold">Novo Imóvel</span>
                )}
              </Link>
              <Link
                href="/admin/proprietarios"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === "/admin/proprietarios" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <LayoutDashboard size={22} />
                {isExpanded && (
                  <span className="text-sm font-bold">Gestão</span>
                )}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* BOTÃO DE LOGIN/LOGOUT */}
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
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </motion.aside>
  );
}
