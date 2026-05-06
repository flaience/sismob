"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";
import api from "@/lib/api";
import { useTenant } from "./TenantContext";

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();

  const fetchProfile = async (session: Session | null) => {
    // 1. FAILSAFE: Se não tem sessão, para de carregar imediatamente
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    // 2. AGUARDAR TENANT: Se tem sessão mas não tem imobiliária, espera o próximo ciclo
    if (!tenant?.id) {
      console.log("⏳ [AUTH] Aguardando identificação da imobiliária...");
      return;
    }

    try {
      console.log(
        `🔍 [AUTH] Sincronizando ${session.user.email} em ${tenant.nome_conta}`,
      );

      const res = await api
        .get(`/pessoas/${session.user.id}`, {
          params: { imobiliariaId: tenant.id },
        })
        .catch(() => ({ data: null }));

      const dbData = Array.isArray(res.data) ? res.data[0] : res.data;

      if (dbData) {
        setUser({ ...session.user, ...dbData });
      } else {
        console.warn(
          "⚠️ [AUTH] Perfil não localizado no banco. Usando dados básicos.",
        );
        setUser(session.user);
      }
    } catch (error) {
      console.error("❌ [AUTH] Erro na sincronização de perfil.");
      setUser(session.user);
    } finally {
      // 3. GARANTIA DE DESTRAVAMENTO
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sincroniza sempre que a sessão ou a imobiliária mudar
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => fetchProfile(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) => {
      fetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, [tenant?.id]); // <--- RE-EXECUTA QUANDO O TENANT CHEGAR

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
