"use client";
import { useState, useEffect } from "react"; // 1. Adicionado para controle de montagem
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";
import { Users, Home, TrendingUp, Zap, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false); // 2. Estado para evitar erro de hidratação
  const { user, loading } = useAuth();
  const { tenant } = useTenant();

  // 3. O SEGREDO: Só ativa o Dashboard após o navegador estar pronto
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="h-[70vh] w-full flex flex-col items-center justify-center gap-4 text-indigo-600 font-black animate-pulse">
        <Loader2 className="animate-spin" size={40} />
        <span className="uppercase tracking-[0.3em] text-xs">
          Sincronizando Ecossistema...
        </span>
      </div>
    );
  }

  // 4. PROTEÇÃO DE STRINGS: Evita que o site exploda se o nome vier nulo
  const nomeExibicao = (user?.nome || user?.email || "SuperAdm").toUpperCase();
  const nomeImobiliaria = tenant?.nome_conta || "Sismob Holding";

  const stats = [
    {
      label: "Interessados",
      val: "12",
      icon: TrendingUp,
      color: "bg-emerald-500",
      href: "/gestao/leads",
    },
    {
      label: "Imóveis Ativos",
      val: "45",
      icon: Home,
      color: "bg-blue-500",
      href: "/gestao/imoveis",
    },
    {
      label: "Proprietários",
      val: "08",
      icon: Users,
      color: "bg-brand",
      href: "/gestao/proprietarios",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <header className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase">
            Olá, <span className="text-indigo-600">{nomeExibicao}</span>
          </h1>
          <p className="text-slate-400 font-bold mt-2 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
            <Zap size={14} className="text-amber-500 fill-amber-500" />
            Ecossistema Ativo • {nomeImobiliaria}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((item, i) => (
          <Link
            href={item.href}
            key={i}
            className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group"
          >
            <div
              className={`${item.color} w-16 h-16 rounded-3xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-lg`}
            >
              <item.icon size={32} />
            </div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
              {item.label}
            </p>
            <p className="text-6xl font-black text-slate-900 tracking-tighter mt-2">
              {item.val}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
