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
    try {
      if (session?.user) {
        // Tentativa de busca com timeout de 5 segundos
        const res = await api
          .get(`/pessoas/${session.user.id}`, { timeout: 5000 })
          .catch(() => ({ data: null }));

        const dbData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (dbData) {
          setUser({ ...session.user, ...dbData });
        } else {
          // Se não achou no banco, loga com os dados básicos do Supabase
          setUser(session.user);
        }
      } else {
        setUser(null);
      }
    } finally {
      // ESTA LINHA É O SEU "BOTÃO DE PÂNICO" - ELA DESTRAVA A TELA
      setLoading(false);
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
