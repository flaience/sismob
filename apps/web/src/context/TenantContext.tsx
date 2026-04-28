//sr

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

        console.log("🔍 Tentando identificar host:", queryHost);
        const res = await api.get(
          `/pessoas/config/identificar?host=${queryHost}`,
        );
        console.log("🔍 Resposta da API de Identificação:", res.data);
        if (!res.data) {
          console.error(
            "❌ A API não encontrou nenhuma imobiliária para o host:",
            queryHost,
          );
        }
        if (res.data) {
          console.log("✅ Imobiliária identificada:", res.data.nome);
          setTenant(res.data);
        } else {
          console.warn("⚠️ Domínio não cadastrado no banco.");
        }
      } catch (e) {
        console.error("❌ Falha na comunicação com a API de identificação.");
      } finally {
        setLoading(false); // <--- OBRIGATÓRIO: Libera o site independente do resultado
      }
    }
    // ...
    identificar();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, loading }}>
      {!loading && children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
