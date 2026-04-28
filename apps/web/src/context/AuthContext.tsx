"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient, type User } from "@supabase/supabase-js";
import api from "@/lib/api";

const AuthContext = createContext<any>(null);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (id: string, baseUser: User) => {
    try {
      // Busca Papel e Cargo na nossa tabela 'pessoas'
      const res = await api.get(`/pessoas/${id}`);
      setUser({ ...baseUser, ...res.data });
    } catch (e) {
      console.warn("⚠️ Perfil não encontrado no banco, usando dados básicos.");
      setUser(baseUser);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id, session.user);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchProfile(session.user.id, session.user);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signOut: () => supabase.auth.signOut() }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
