"use client";
import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const TenantContext = createContext<any>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SEGREDO: Se a API não responder em 5s, libera o sistema de qualquer jeito
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 5000);

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
        if (data) setTenant(data);
      } catch (e) {
        console.error("Falha na identificação");
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
  return context || { tenant: null, loading: false };
};
