"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import api from "@/lib/api";

const AuthContext = createContext<any>(null);

// 1. Validação de Segurança das chaves
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERRO: Variáveis de ambiente do Supabase não encontradas!");
}

const supabase = createClient(supabaseUrl || "", supabaseKey || "");

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (session: Session | null) => {
    try {
      if (session?.user) {
        console.log("🔑 Usuário autenticado no Supabase:", session.user.email);

        // Chamada à nossa API com tratamento de erro granulado
        const res = await api
          .get(`/pessoas/${session.user.id}`)
          .catch((err) => {
            console.warn(
              "⚠️ Perfil não encontrado na tabela 'pessoas'. Criando objeto básico.",
            );
            return { data: { papel: "1", nome: session.user.email } }; // Fallback para não crashar
          });

        setUser({ ...session.user, ...res.data });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Erro fatal no fetchProfile:", error);
    } finally {
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

  return (
    <AuthContext.Provider value={{ user, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
