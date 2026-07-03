//src/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";
import { useTenant } from "./TenantContext";

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { tenant, loading: tenantLoading } = useTenant();

  const fetchProfile = async (session: any) => {
    try {
      if (!session?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      // 🛡️ RECONQUISTA DO PODER (O SEGREDO)
      const isLuis = session.user.email === "luis@flaience.com";

      if (tenant?.id) {
        // Fluxo Normal: Busca o perfil da pessoa naquela imobiliária
        const res = await api
          .get(`/pessoas/${session.user.id}`, {
            params: { imobiliariaId: tenant.id },
          })
          .catch(() => ({ data: null }));

        const dbData = Array.isArray(res.data) ? res.data[0] : res.data;
        setUser({ ...session.user, ...dbData });
      } else if (isLuis) {
        // 🚀 BYPASS INDUSTRIAL: Se for o Luis, libera o menu mesmo sem Tenant
        setUser({
          ...session.user,
          papel: "0",
          cargo: "gerente",
          nome: "Luis Admin",
        });
      } else {
        setUser(session.user);
      }
    } finally {
      // 🏁 O Loading NUNCA fica preso aqui
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tenantLoading) {
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => fetchProfile(session));
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session);
    });
    return () => subscription.unsubscribe();
  }, [tenant?.id, tenantLoading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut: () => supabase.auth.signOut(),
        supabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) return { user: null, loading: true };
  return context;
};
