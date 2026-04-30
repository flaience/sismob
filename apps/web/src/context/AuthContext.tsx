"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (session: Session | null) => {
    // TIMER DE EMERGÊNCIA: Se a API travar, libera o Dashboard em 4s de qualquer jeito
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.warn(
          "⚠️ [SISMOB] Timeout de sincronização! Forçando liberação...",
        );
        setLoading(false);
      }
    }, 4000);

    try {
      if (session?.user) {
        console.log("🔍 [SISMOB] Buscando perfil para:", session.user.id);

        // Chamada à API com timeout implícito pelo catch
        const res = await api
          .get(`/pessoas/${session.user.id}`)
          .catch((err) => {
            console.error("❌ [SISMOB] Erro na API /pessoas:", err.message);
            return { data: null };
          });

        const dbData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (dbData) {
          console.log("✅ [SISMOB] Perfil DB OK:", dbData.nome);
          setUser({ ...session.user, ...dbData });
        } else {
          console.warn("ℹ️ [SISMOB] Perfil não encontrado no banco.");
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ [SISMOB] Erro fatal no AuthContext");
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false); // DESTRAVA A TELA
    }
  };

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => fetchProfile(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) => {
      fetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
  // Se o contexto falhar, retorna um estado que não trava a tela
  if (context === undefined) return { user: null, loading: false };
  return context;
};
