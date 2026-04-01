//src/components/Sidebar.tsx
"use client";
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Map,
  Camera,
  Building2,
  ChevronRight,
  ChevronLeft,
  LogIn,
  Settings,
  UserCog,
  LayoutDashboard,
  Users, // <--- ADICIONADO
  Briefcase, // <--- ADICIONADO
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ... restante do componente igual ao anterior

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState<any>(null); // Estado para simular login
  const pathname = usePathname();

  // Itens que SEMPRE aparecem (Público)
  const publicItems = [
    { icon: Search, label: "Filtrar Imóveis", href: "/" },
    { icon: Camera, label: "Tour Virtual", href: "/tours" },
    { icon: Map, label: "Percursos", href: "/percursos" },
  ];

  // Itens de GESTÃO (Só aparecem para Papel 1 ou 5)
  const adminItems = [
    { icon: UserCog, label: "Proprietários", href: "/admin/proprietarios" },
    { icon: Users, label: "Clientes", href: "/admin/clientes" },
    { icon: Briefcase, label: "Corretores", href: "/admin/corretores" },
  ];

  return (
    <motion.aside
      animate={{ width: isExpanded ? 260 : 84 }}
      className="fixed left-6 top-6 bottom-6 z-50 bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-white/20 flex flex-col p-4"
    >
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
        {publicItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${pathname === item.href ? "bg-indigo-600 text-white" : "text-gray-400 hover:bg-gray-50"}`}
          >
            <item.icon size={22} />
            {isExpanded && (
              <span className="text-sm font-bold">{item.label}</span>
            )}
          </Link>
        ))}

        {/* ÁREA RESTRITA (Só aparece se logado) */}
        {user && (
          <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-2">
            <Link
              href="/admin"
              className="flex items-center gap-4 p-4 rounded-2xl text-gray-400 hover:bg-indigo-50"
            >
              <LayoutDashboard size={22} />
              {isExpanded && (
                <span className="text-sm font-bold">Gestão Interna</span>
              )}
            </Link>
          </div>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <Link
          href="/login"
          className="flex items-center gap-4 p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100 transition-all"
        >
          <LogIn size={22} />
          {isExpanded && <span className="text-sm font-bold">Entrar</span>}
        </Link>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400"
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </motion.aside>
  );
}
