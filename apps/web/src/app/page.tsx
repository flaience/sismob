"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ImovelCard from "@/components/ImovelCard";
import { useTenant } from "@/context/TenantContext";

export default function HomePage() {
  const [imoveis, setImoveis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pegamos o ID da imobiliária que criamos no script de popular (ex: 77777777-...)
  const IMOBILIARIA_ID = "77777777-7777-7777-7777-777777777777";

  const { tenant } = useTenant(); // Pega o tenant do contexto

  useEffect(() => {
    async function fetchImoveis() {
      if (!tenant?.id) return; // Só busca se tiver identificado a imobiliária

      try {
        // Passamos o imobiliariaId como filtro para o backend
        const response = await api.get("/imoveis", {
          params: { imobiliariaId: tenant.id },
        });
        setImoveis(response.data);
      } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchImoveis();
  }, [tenant]); // Executa sempre que o tenant for identificado

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Sismob - Portal Imobiliário
          </h1>
          <p className="text-xl text-gray-600">
            Diferencial exclusivo: Tour Virtual 360° e Auxílio de Chegada.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-500 text-lg">
              Carregando imóveis...
            </span>
          </div>
        ) : (
          <>
            {imoveis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {imoveis.map((imovel: any) => (
                  <ImovelCard key={imovel.id} imovel={imovel} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-inner border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-lg">
                  Nenhum imóvel encontrado no banco de dados.
                </p>
                <p className="text-sm text-gray-300">
                  Certifique-se de que a API está rodando e o banco tem dados.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
