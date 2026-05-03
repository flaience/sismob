//src/context/TenantContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const TenantContext = createContext<any>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FAILSAFE: Se a API travar, libera o sistema em 3 segundos
    const timer = setTimeout(() => {
      if (loading) {
        console.warn(
          "⚠️ [SISMOB] Timeout na identificação. Forçando liberação.",
        );
        setLoading(false);
      }
    }, 15000);

    async function identificar() {
      try {
        const host = window.location.hostname;
        const queryHost =
          host === "localhost" || host === "127.0.0.1"
            ? "sismob.flaience.com"
            : host;

        const res = await api.get(
          `/pessoas/config/identificar?host=${queryHost}`,
        );

        // TRATAMENTO DE ARRAY: Se o backend mandou [{...}], pega o primeiro
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        if (data) {
          console.log("✅ [SISMOB] Tenant Identificado:", data.nome_conta);
          setTenant(data);
        }
      } catch (e) {
        console.error("❌ [SISMOB] Erro ao identificar tenant.");
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    }

    identificar();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => {
  const context = useContext(TenantContext);
  // Se o contexto ainda não existe (momento do build), retorna um objeto seguro
  if (!context) {
    return { tenant: null, loading: true };
  }
  return context;
};
