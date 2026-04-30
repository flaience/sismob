"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase"; // <--- USANDO O SEU SINGLETON PARA EVITAR MULTIPLAS INSTÂNCIAS
import api from "@/lib/api";

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (session: Session | null) => {
    try {
      if (session?.user) {
        // Log para auditoria e sincronia de banco
        console.log("🔑 [SISMOB] Sincronizando UUID:", session.user.id);

        const res = await api
          .get(`/pessoas/${session.user.id}`)
          .catch(() => ({ data: null }));

        // TRATAMENTO INDUSTRIAL: Resolve o conflito de Lista vs Objeto do Drizzle
        const dbData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (dbData) {
          console.log("✅ [SISMOB] Perfil DB encontrado:", dbData.nome);
          setUser({ ...session.user, ...dbData });
        } else {
          console.warn(
            "ℹ️ [SISMOB] Perfil não está no DB, usando e-mail do Auth.",
          );
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ [SISMOB] Erro fatal na sincronização de perfil.");
    } finally {
      // OBRIGATÓRIO: Destrava o Dashboard independente de sucesso ou erro
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Pegando a sessão inicial de forma tipada (Matando erro TS7031)
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        fetchProfile(session);
      });

    // 2. Escutando mudanças de auth (Matando erro TS7006)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        fetchProfile(session);
      },
    );

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
  // Proteção para o hook nunca retornar null durante o boot do React
  if (context === undefined)
    return { user: null, loading: true, signOut: () => {} };
  return context;
};
