"use client";
import { useState, useEffect } from "react";
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
  LayoutGrid,
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

  const menu = [
    { label: "Proprietários", href: "/admin/proprietarios" },
    { label: "Inquilinos", href: "/admin/clientes" },
    { label: "Corretores", href: "/admin/corretores" },
    { label: "Interessados", href: "/admin/interessados" },
  ];

  return (
    <aside
      style={{ width: isExpanded ? 260 : 84 }}
      className="hidden md:flex fixed left-6 top-6 bottom-6 z-50 bg-white/95 backdrop-blur-xl shadow-2xl rounded-[2.5rem] border border-gray-100 flex flex-col p-4 transition-all duration-300 overflow-hidden"
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
        <Link
          href="/"
          className={`flex items-center gap-4 p-4 rounded-2xl ${pathname === "/" ? "bg-indigo-600 text-white" : "text-gray-400"}`}
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
              className="w-full flex items-center justify-between p-4 text-gray-400"
            >
              <div className="flex items-center gap-4">
                <User size={22} />
                {isExpanded && (
                  <span className="text-sm font-bold">Cadastros</span>
                )}
              </div>
              {isExpanded && <ChevronDown size={16} />}
            </button>

            {isExpanded && showCadastros && (
              <div className="pl-12 flex flex-col gap-3 pb-4">
                {menu.map((m) => (
                  <Link
                    key={m.href}
                    href={m.href}
                    className="text-xs text-gray-500 font-bold uppercase hover:text-indigo-600"
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-auto flex items-center justify-center p-3 bg-gray-50 rounded-2xl text-gray-400"
      >
        {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
    </aside>
  );
}
