"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (session: any) => {
    try {
      if (session?.user) {
        console.log(
          "🔍 [SISMOB] Buscando perfil do banco para UUID:",
          session.user.id,
        );

        // Tentativa de buscar papel/cargo na tabela 'pessoas'
        const res = await api
          .get(`/pessoas/${session.user.id}`)
          .catch((err) => {
            console.warn(
              "⚠️ [SISMOB] Perfil não encontrado no banco. Erro:",
              err.message,
            );
            return { data: null };
          });

        if (res.data) {
          console.log("✅ [SISMOB] Perfil sincronizado com sucesso!");
          setUser({ ...session.user, ...res.data });
        } else {
          console.log("ℹ️ [SISMOB] Usando apenas dados básicos do Auth.");
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ [SISMOB] Erro fatal na sincronização:", error);
    } finally {
      // OBRIGATÓRIO: Destrava a tela de 'Sincronizando' independente do resultado
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    return { user: null, loading: true, signOut: () => {} };
  return context;
};
