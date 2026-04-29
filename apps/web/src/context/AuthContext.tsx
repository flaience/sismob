"use client";
import { createContext, useContext, useEffect, useState } from "react";
// 1. IMPORTAÇÃO DO TIPO QUE ESTAVA FALTANDO
import { createClient, type Session } from "@supabase/supabase-js";
import api from "@/lib/api";

const AuthContext = createContext<any>(undefined);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2. FUNÇÃO DE SINCRONIZAÇÃO (Agora com o tipo Session reconhecido)
  const fetchProfile = async (session: Session | null) => {
    try {
      if (session?.user) {
        console.log("🔑 [SISMOB] Sincronizando UUID:", session.user.id);

        // Chamada para buscar papel/cargo no nosso banco
        const res = await api
          .get(`/pessoas/${session.user.id}`)
          .catch(() => ({ data: null }));

        const dbData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (dbData) {
          console.log("✅ [SISMOB] Perfil DB encontrado:", dbData.nome);
          setUser({ ...session.user, ...dbData });
        } else {
          console.log(
            "ℹ️ [SISMOB] Perfil não está no DB, usando dados do Auth.",
          );
          setUser(session.user); // Se não achar no banco, usa o e-mail do Supabase
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ [SISMOB] Erro na sincronização");
    } finally {
      setLoading(false); // DESTRAVA A TELA DE "SINCROZINANDO"
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
    <AuthContext.Provider value={{ user, loading, signOut, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) return { user: null, loading: true };
  return context;
};
