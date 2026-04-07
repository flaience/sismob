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
        // Se estiver local, simulamos o domínio oficial para o banco achar os dados
        const queryHost =
          host === "localhost" || host === "127.0.0.1"
            ? "sismob.flaience.com"
            : host;

        const res = await api.get(
          `/pessoas/config/identificar?host=${queryHost}`,
        );
        setTenant(res.data);
      } catch (e) {
        console.error("🚨 Imobiliária não identificada.");
      } finally {
        setLoading(false);
      }
    }
    identificar();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {!loading && children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
