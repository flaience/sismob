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

        console.log("🔍 Identificando:", queryHost);
        const res = await api.get(
          `/pessoas/config/identificar?host=${queryHost}`,
        );

        // Se a API retornar objeto ou array, tratamos:
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        if (data) setTenant(data);
      } catch (e) {
        console.error("❌ Erro na API. Destravando para modo offline/admin.");
      } finally {
        // OBRIGATÓRIO: Libera o site em 1 segundo de qualquer jeito
        setTimeout(() => setLoading(false), 1000);
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

export const useTenant = () =>
  useContext(TenantContext) || { tenant: null, loading: false };
