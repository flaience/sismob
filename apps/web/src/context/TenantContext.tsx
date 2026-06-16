"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

// Iniciamos o contexto com um valor padrão para evitar o erro de destruturação
const TenantContext = createContext<any>({ tenant: null, loading: true });

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // PROTEÇÃO: Next.js tenta rodar isso no build (servidor), onde window não existe
    if (typeof window === "undefined") return;

    async function identificar() {
      try {
        const host = window.location.hostname;
        // Se estiver em localhost, simula o domínio oficial para testes
        const queryHost =
          host.includes("localhost") || host.includes("vercel.app")
            ? "sismob.flaience.com"
            : host;

        const res = await api.get(
          `/pessoas/config/identificar?host=${queryHost}`,
        );
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        if (data) {
          setTenant(data);
        } else {
          setTenant({ id: null, nome_fantasia: "Sismob" });
        }
      } catch (e) {
        console.error("❌ Falha na identificação do Tenant.");
        setTenant({ id: null, nome_fantasia: "Sismob Offline" });
      } finally {
        setLoading(false);
      }
    }
    identificar();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {/* 
         Durante o Build, o loading sempre será true no início. 
         Não bloqueamos o children para que o Next possa "enxergar" as páginas no prerender.
      */}
      {children}
    </TenantContext.Provider>
  );
}

// HOOK BLINDADO: Se o contexto for null, ele retorna um objeto vazio em vez de crashar
export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    return { tenant: null, loading: false };
  }
  return context;
};
