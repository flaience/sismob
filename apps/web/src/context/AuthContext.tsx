"use client";
import { createContext, useContext, useEffect, useState } from "react";
// Importação base do Supabase (mais estável para Monorepos)
import { createClient, type User, type Session } from "@supabase/supabase-js";
import api from "@/lib/api";

const AuthContext = createContext<any>(null);

// Inicializa o cliente fora para evitar recriações
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Função Tipada para buscar o perfil no nosso Banco (Pessoas)
    const fetchProfile = async (session: Session | null) => {
      if (session?.user) {
        try {
          // Buscamos o papel/cargo na tabela 'pessoas' usando o UUID do login
          const res = await api.get(`/pessoas/${session.user.id}`);

          // Unificamos o objeto de Auth com os dados de Negócio (Papel/Cargo)
          setUser({ ...session.user, ...res.data });
        } catch (error) {
          console.error(
            "⚠️ Usuário autenticado, mas perfil não encontrado no banco.",
          );
          setUser(session.user); // Mantém o usuário básico se o perfil falhar
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    // 2. Checa sessão atual ao carregar a página
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session);
    });

    // 3. Escuta mudanças (Login, Logout, Troca de Senha)
    // Tipamos explicitamente para matar os erros 7031 e 7006
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
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
