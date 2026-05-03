"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";
import api from "@/lib/api";
import { useTenant } from "./TenantContext"; // <--- IMPORTANTE

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant(); // Pegamos a imobiliária identificada

  const fetchProfile = async (session: Session | null) => {
    // 1. O SEGREDO: Se tem sessão mas ainda não identificou a imobiliária, ESPERA.
    if (!session?.user?.id || !tenant?.id) {
      console.log("⏳ [SISMOB] Aguardando dados para sincronizar perfil...");
      return;
    }
    try {
      if (session?.user && tenant?.id) {
        console.log(
          `🔍 [AUTH] Buscando perfil de ${session.user.email} na imobiliária ${tenant.nome_conta}`,
        );

        const res = await api.get(`/pessoas/${session.user.id}`, {
          params: { imobiliariaId: tenant.id },
        });

        // O seu backend já retorna objeto, mas o casting aqui é por segurança industrial
        const userData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (userData) {
          console.log(
            "✅ [AUTH] Luis identificado como Papel:",
            userData.papel,
          );
          setUser({ ...session.user, ...userData });
        } else {
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ [AUTH] Erro na sincronização");
    } finally {
      setLoading(false);
    }
  };

  // RE-SINCRONIZA toda vez que a imobiliária ou a sessão mudar
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => fetchProfile(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) =>
      fetchProfile(session),
    );

    return () => subscription.unsubscribe();
  }, [tenant?.id]); // <--- A MÁGICA: O perfil é buscado assim que o Tenant chega

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
