"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ImovelCard from "@/components/ImovelCard";
import { useTenant } from "@/context/TenantContext";
import { Building2, Home } from "lucide-react";

export default function HomePage() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tenant, loading: tenantLoading } = useTenant();

  // 1. Função de busca isolada para ser usada no carregamento e no refresh (lixeira)
  const fetchImoveis = async () => {
    if (!tenant?.id) {
      if (!tenantLoading) setLoading(false);
      return;
    }

    try {
      const response = await api.get("/imoveis", {
        params: { imobiliariaId: tenant.id },
      });
      setImoveis(response.data);
    } catch (error) {
      console.error("Erro ao carregar imóveis:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Dispara a busca sempre que o tenant for identificado
  useEffect(() => {
    if (!tenantLoading) {
      fetchImoveis();
    }
  }, [tenant, tenantLoading]);

  return (
    <main className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <div className="inline-block p-3 bg-indigo-100 rounded-2xl text-indigo-600 mb-4">
            <Building2 size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
            Sismob - Portal Imobiliário
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            Explore imóveis com{" "}
            <span className="text-indigo-600 font-bold text-lg">
              Tour Virtual 360°
            </span>{" "}
            nativo e auxílio de percurso guiado.
          </p>
        </header>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-gray-100"></div>
            <span className="text-gray-400 font-bold animate-pulse">
              Sincronizando com a base de dados...
            </span>
          </div>
        ) : (
          <>
            {imoveis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imoveis.map((imovel: any) => (
                  <ImovelCard
                    key={imovel.id}
                    imovel={imovel}
                    refresh={fetchImoveis}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-gray-100">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <Home size={40} />
                </div>
                <p className="text-gray-500 text-xl font-bold">
                  Nenhum imóvel disponível para esta imobiliária.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Acesse a área restrita para cadastrar sua primeira unidade.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
