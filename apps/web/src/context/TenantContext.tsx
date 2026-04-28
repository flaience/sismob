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
        const queryHost =
          host === "localhost" || host === "127.0.0.1"
            ? "sismob.flaience.com"
            : host;

        console.log("🔍 Identificando:", queryHost);
        const res = await api.get(
          `/pessoas/config/identificar?host=${queryHost}`,
        );

        if (res.data) {
          setTenant(res.data);
        }
      } catch (e) {
        console.error("❌ Erro na identificação do Tenant");
      } finally {
        setLoading(false);
      }
    }
    identificar();
  }, []);

  // SEGREDO: Se ainda estiver carregando, não libera os filhos para não dar erro de undefined
  if (loading)
    return (
      <div style={{ padding: "20px", color: "gray" }}>
        SISMOB: Identificando Imobiliária...
      </div>
    );

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
