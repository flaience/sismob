"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import api from "@/lib/api";
import { useTenant } from "./TenantContext";

const AuthContext = createContext<any>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();

  useEffect(() => {
    const sync = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Se já temos a sessão, mas o tenant ainda não chegou, liberamos o básico
        if (tenant?.id) {
          try {
            const res = await api.get(`/pessoas/${session.user.id}`, {
              params: { imobiliariaId: tenant.id },
            });
            const dbData = Array.isArray(res.data) ? res.data[0] : res.data;
            setUser({ ...session.user, ...dbData });
          } catch (e) {
            setUser(session.user);
          }
        } else {
          setUser(session.user);
        }
      }
      setLoading(false);
    };

    sync();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => sync());
    return () => subscription.unsubscribe();
  }, [tenant?.id]); // Re-tenta quando o tenant chegar

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

export const useAuth = () =>
  useContext(AuthContext) || { user: null, loading: false };
