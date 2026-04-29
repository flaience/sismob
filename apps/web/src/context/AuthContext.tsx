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
        const res = await api.get(`/pessoas/${session.user.id}`);

        // MÁGICA INDUSTRIAL: Se vier um Array, pega o primeiro. Se não, usa o objeto.
        const userData = Array.isArray(res.data) ? res.data[0] : res.data;

        if (userData) {
          console.log("✅ Perfil identificado:", userData.nome);
          setUser({ ...session.user, ...userData });
        } else {
          setUser(session.user);
        }
      }
    } catch (e) {
      console.error("❌ Erro na sincronização");
    } finally {
      setLoading(false); // DESTRAVA A TELA
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
