"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Building2,
  ChevronDown,
  User,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Layers,
  Target,
  Camera, // <--- GARANTA QUE TODOS ESTÃO AQUI
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

  const menu = [
    { label: "Proprietários", href: "/admin/proprietarios" },
    { label: "Inquilinos", href: "/admin/clientes" },
    { label: "Corretores", href: "/admin/corretores" },
    { label: "Interessados", href: "/admin/interessados" },
  ];

  return (
    <>
      <motion.aside
        animate={{ width: isExpanded ? 260 : 84 }}
        className="hidden md:flex fixed left-6 top-6 bottom-6 z-50 bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-gray-100 flex flex-col p-4 overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-10 px-2 pt-2">
          <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
            <Building2 size={24} />
          </div>
          {isExpanded && (
            <span className="font-black text-xl text-gray-800 uppercase tracking-tighter">
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
                className="w-full flex items-center justify-between p-4 rounded-2xl text-gray-400 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <User size={22} />
                  {isExpanded && (
                    <span className="text-sm font-bold">Cadastros</span>
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
                  {menu.map((m) => (
                    <Link
                      key={m.href}
                      href={m.href}
                      className="text-xs text-gray-500 hover:text-indigo-600 font-bold uppercase"
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/admin/imoveis/novo"
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === "/admin/imoveis/novo" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <PlusCircle size={22} />
                {isExpanded && (
                  <span className="text-sm font-bold">Novo Imóvel</span>
                )}
              </Link>
            </div>
          )}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          {!session ? (
            <Link
              href="/login"
              className="flex items-center gap-4 p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all"
            >
              <LogIn size={22} />
              {isExpanded && <span className="text-sm font-bold">Entrar</span>}
            </Link>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
            >
              <LogOut size={22} />
              {isExpanded && <span className="text-sm font-bold">Sair</span>}
            </button>
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex justify-around p-4 pb-8 shadow-2xl">
        <Link href="/">
          <Search size={28} color="#6366f1" />
        </Link>
        {session ? (
          <Link href="/admin/proprietarios">
            <Layers size={28} color="#4b5563" />
          </Link>
        ) : (
          <Link href="/login">
            <LogIn size={28} color="#10b981" />
          </Link>
        )}
      </nav>
    </>
  );
}
