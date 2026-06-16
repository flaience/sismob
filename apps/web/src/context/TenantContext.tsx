"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const TenantContext = createContext<any>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function identificar() {
      try {
        const host = window.location.hostname;
        const queryHost = host.includes("localhost")
          ? "sismob.flaience.com"
          : host;

        const res = await api.get(
          `/pessoas/config/identificar?host=${queryHost}`,
        );
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        if (data) {
          setTenant(data);
        } else {
          // Fallback caso a API responda 200 mas sem dados
          setTenant({ id: null, nome_fantasia: "Sismob Offline" });
        }
      } catch (e) {
        console.error(
          "❌ Falha na identificação do Tenant. Usando modo de segurança.",
        );
        setTenant({ id: null, nome_fantasia: "Admin Local" });
      } finally {
        setLoading(false); // Liberação imediata
      }
    }
    identificar();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {!loading ? (
        children
      ) : (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 font-bold animate-pulse">
              Sincronizando Sismob v6.0...
            </p>
          </div>
        </div>
      )}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
