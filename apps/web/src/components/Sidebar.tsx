"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Building2,
  ChevronDown,
  User,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPessoas, setShowPessoas] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: isExpanded ? 260 : 84 }}
      className="hidden md:flex fixed left-6 top-6 bottom-6 z-50 bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-white/20 flex flex-col p-4 overflow-hidden"
    >
      {/* LOGO */}
      <div className="flex items-center gap-3 mb-10 px-2 pt-2">
        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-200">
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
          className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === "/" ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
        >
          <Search size={22} />
          {isExpanded && <span className="text-sm font-bold">Explorar</span>}
        </Link>

        {/* SUBMENU PESSOAS (AGRUPADO) */}
        <div className="space-y-1">
          <button
            onClick={() => {
              setIsExpanded(true);
              setShowPessoas(!showPessoas);
            }}
            className="w-full flex items-center justify-between p-4 rounded-2xl text-gray-400 hover:bg-gray-50 transition-all"
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
                className={`transition-transform ${showPessoas ? "rotate-180" : ""}`}
              />
            )}
          </button>

          {isExpanded && showPessoas && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="pl-12 space-y-1"
            >
              <Link
                href="/admin/corretores"
                className="block p-2 text-sm text-gray-500 hover:text-indigo-600 font-medium"
              >
                Corretores
              </Link>
              <Link
                href="/admin/proprietarios"
                className="block p-2 text-sm text-gray-500 hover:text-indigo-600 font-medium"
              >
                Proprietários
              </Link>
              <Link
                href="/admin/clientes"
                className="block p-2 text-sm text-gray-500 hover:text-indigo-600 font-medium"
              >
                Inquilinos
              </Link>
              <Link
                href="/admin/interessados"
                className="block p-2 text-sm text-gray-500 hover:text-indigo-600 font-medium"
              >
                Interessados (Leads)
              </Link>
            </motion.div>
          )}
        </div>

        <Link
          href="/admin/imoveis/novo"
          className="flex items-center gap-4 p-4 rounded-2xl text-gray-400 hover:bg-gray-50"
        >
          <PlusCircle size={22} />
          {isExpanded && <span className="text-sm font-bold">Novo Imóvel</span>}
        </Link>
      </nav>

      {/* BOTÃO TOGGLE */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-auto flex items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400"
      >
        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </motion.aside>
  );
}
