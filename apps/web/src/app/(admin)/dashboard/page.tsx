"use client";
import { Home, Users, Target, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTenant } from "@/context/TenantContext";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading } = useTenant();

  // 1. Guardião de Carregamento
  if (authLoading || tenantLoading) {
    return (
      <div className="h-[80vh] w-full flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
        <p className="text-gray-400 font-black uppercase text-xs tracking-widest">
          Sincronizando...
        </p>
      </div>
    );
  }

  // 2. Proteção de Dados (Caso o login falhe ou o banco esteja vazio)
  if (!user || !tenant) {
    return (
      <div className="p-10 bg-red-50 rounded-[3rem] border border-red-100 text-center">
        <h2 className="text-red-600 font-black text-2xl">
          DADOS NÃO ENCONTRADOS
        </h2>
        <p className="text-red-400">
          Verifique se o seu perfil existe na tabela 'pessoas'.
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: "Imóveis",
      value: "12",
      icon: Home,
      href: "/imoveis",
      color: "bg-blue-500",
    },
    {
      label: "Proprietários",
      value: "05",
      icon: Users,
      href: "/gestao/proprietarios",
      color: "bg-indigo-500",
    },
    {
      label: "Interessados",
      value: "08",
      icon: Target,
      href: "/gestao/leads",
      color: "bg-orange-500",
    },
  ];

  // 3. Tratamento seguro do Nome para evitar o Application Error
  const nomeExibicao = user?.nome
    ? user.nome.split(" ")[0].toUpperCase()
    : "USUÁRIO";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
          OLÁ, <span className="text-indigo-600">{nomeExibicao}</span>
        </h1>
        <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mt-2">
          Painel de Gestão • {tenant.nome_conta || "Imobiliária"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all group"
          >
            <div
              className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform`}
            >
              <item.icon size={28} />
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
              {item.label}
            </p>
            <p className="text-5xl font-black text-gray-900 mt-2 tracking-tighter">
              {item.value}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
