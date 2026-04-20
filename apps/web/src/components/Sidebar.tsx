"use client";
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
  Layers, // <--- VERIFIQUE ESTES
  Target, // <--- VERIFIQUE ESTES
  Camera,
  Map as MapIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCadastros, setShowCadastros] = useState(false);
  const [session, setSession] = useState<any>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));
  }, []);

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
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === "/" ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
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
                <div className="pl-12 flex flex-col gap-2 pb-4">
                  <Link
                    href="/admin/proprietarios"
                    className="text-xs text-gray-500 hover:text-indigo-600 font-bold uppercase"
                  >
                    Proprietários
                  </Link>
                  <Link
                    href="/admin/clientes"
                    className="text-xs text-gray-500 hover:text-indigo-600 font-bold uppercase"
                  >
                    Inquilinos
                  </Link>
                  <Link
                    href="/admin/corretores"
                    className="text-xs text-gray-500 hover:text-indigo-600 font-bold uppercase"
                  >
                    Corretores
                  </Link>
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
          {!session && (
            <Link
              href="/login"
              className="flex items-center gap-4 p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100"
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex justify-around p-4 pb-8 shadow-2xl">
        <Link href="/" className="p-2">
          <Search size={28} color="#6366f1" />
        </Link>
        {session ? (
          <Link href="/admin/proprietarios" className="p-2">
            <Layers size={28} color="#4b5563" />
          </Link>
        ) : (
          <Link href="/login" className="p-2">
            <LogIn size={28} color="#10b981" />
          </Link>
        )}
      </nav>
    </>
  );
}
