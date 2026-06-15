"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";
import { useTenant } from "./TenantContext"; // 1. IMPORTAÇÃO DO TENANT

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2. DECLARAÇÃO DO TENANT (Mata o erro 'Cannot find name tenant')
  const { tenant } = useTenant();

  const fetchProfile = async (session: Session | null) => {
    try {
      // 3. O SEGREDO: Só busca o perfil se tiver Usuário logado E Imobiliária identificada
      if (session?.user && tenant?.id) {
        console.log(
          `🔍 [SISMOB] Sincronizando ${session.user.email} na imobiliária ${tenant.nome_conta}`,
        );

        const res = await api
          .get(`/pessoas/${session.user.id}`, {
            params: { imobiliariaId: tenant.id }, // Passa o ID correto para a API
          })
          .catch(() => ({ data: null }));

        const dbData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (dbData) {
          console.log("✅ [SISMOB] Perfil DB sincronizado.");
          setUser({ ...session.user, ...dbData });
        } else {
          console.warn(
            "ℹ️ [SISMOB] Perfil não localizado, usando dados do Auth.",
          );
          setUser(session.user);
        }
        setLoading(false);
      } else if (!session?.user) {
        // Se não há login, para o loading
        setUser(null);
        setLoading(false);
      }
    } catch (error) {
      console.error("❌ [SISMOB] Erro na sincronização de perfil.");
      setLoading(false);
    }
  };

  useEffect(() => {
    // 4. SINCRONIA REATIVA:
    // Este efeito roda sempre que o 'tenant.id' mudar.
    // No momento que o sistema descobre a imobiliária, ele busca o perfil do Luis.
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, [tenant?.id]); // <--- DEPENDÊNCIA VITAL

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
