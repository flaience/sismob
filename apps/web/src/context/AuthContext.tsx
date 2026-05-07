"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";
import api from "@/lib/api";

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // 1. Tenta buscar o perfil (Se falhar, não trava o login!)
      // Note que aqui não passamos o tenantId no primeiro momento para evitar o loop
      const res = await api
        .get(`/pessoas/${session.user.id}`)
        .catch(() => ({ data: null }));
      const dbData = Array.isArray(res.data) ? res.data[0] : res.data;

      setUser({ ...session.user, ...dbData });
    } catch (error) {
      setUser(session.user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 2. O SEGREDO: Roda apenas UMA vez no início
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => fetchProfile(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, session) => {
      fetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []); // <--- REMOVIDO O [tenant.id] PARA ACABAR COM O LOOP

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
  return context || { user: null, loading: false };
};
