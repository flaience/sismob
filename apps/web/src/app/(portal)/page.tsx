"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ImovelCard from "@/components/ImovelCard";
import { useTenant } from "@/context/TenantContext";
import { Home, Building2 } from "lucide-react";

export default function HomePage() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const { tenant, loading: tenantLoading } = useTenant();

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

  useEffect(() => {
    if (!tenantLoading) fetchImoveis();
  }, [tenant, tenantLoading]);

  return (
    <div className="p-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">
          Encontre o seu Imóvel
        </h1>
        <p className="text-gray-500 font-medium">
          Explore as melhores opções com Tour Virtual 360°.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20 animate-pulse text-indigo-600 font-bold">
          Sincronizando com a imobiliária...
        </div>
      ) : imoveis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {imoveis.map((imovel: any) => (
            <ImovelCard
              key={imovel.id}
              imovel={imovel}
              refresh={fetchImoveis}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
          <p className="text-gray-400">Nenhum imóvel disponível no momento.</p>
        </div>
      )}
    </div>
  );
}
