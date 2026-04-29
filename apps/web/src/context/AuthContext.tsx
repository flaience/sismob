"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";

const AuthContext = createContext<any>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (session: any) => {
    try {
      if (session?.user) {
        const res = await api
          .get(`/pessoas/${session.user.id}`)
          .catch(() => ({ data: null }));
        const userData = Array.isArray(res.data) ? res.data[0] : res.data;
        setUser({ ...session.user, ...userData });
      }
    } finally {
      setLoading(false);
    }
  };

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
