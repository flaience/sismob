"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const TenantContext = createContext<any>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function identificar() {
      try {
        const host = window.location.hostname;

        // MÁGICA INDUSTRIAL: Força o ambiente de produção no localhost
        const queryHost =
          host === "localhost" || host === "127.0.0.1"
            ? "sismob.flaience.com"
            : host;

        console.log("🔍 [SISMOB] Identificando host:", queryHost);

        const res = await api.get(
          `/pessoas/config/identificar?host=${queryHost}`,
        );

        if (res.data && res.data.id) {
          console.log(
            "✅ [SISMOB] Imobiliária identificada:",
            res.data.nome_conta || res.data.nome,
          );
          setTenant(res.data);
          setLoading(false);
        } else {
          console.error("❌ [SISMOB] Tenant não encontrado no banco.");
          setError("Esta imobiliária não está cadastrada ou está inativa.");
          setLoading(false);
        }
      } catch (e) {
        console.error("❌ [SISMOB] Falha crítica de comunicação com a API.");
        setError(
          "Não foi possível conectar ao servidor. Verifique sua conexão.",
        );
        setLoading(false);
      }
    }

    identificar();
  }, []);

  // PROTEÇÃO DE RENDERIZAÇÃO (MATA O CLIENT-SIDE EXCEPTION)
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="font-black text-indigo-600 tracking-tighter uppercase animate-pulse">
            SISMOB • Inicializando Fábrica
          </span>
        </div>
      </div>
    );
  }

  // TELA DE ERRO AMIGÁVEL (Caso o slug 'sismob' não exista no banco)
  if (error || !tenant) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white p-10 text-center">
        <div className="max-w-md space-y-6">
          <h1 className="text-6xl font-black text-red-500 tracking-tighter">
            OH CÉUS!
          </h1>
          <p className="text-xl font-bold text-gray-800">
            {error || "Domínio não identificado."}
          </p>
          <p className="text-gray-400">
            Certifique-se de que o registro da imobiliária existe no banco de
            dados.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl"
          >
            TENTAR NOVAMENTE
          </button>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
