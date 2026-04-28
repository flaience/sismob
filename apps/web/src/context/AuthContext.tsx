"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClient, type Session } from "@supabase/supabase-js";
import api from "@/lib/api";

const AuthContext = createContext<any>(null);

// Inicialização do cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 1. FUNÇÃO DE LOGOUT (Resolvendo o erro TS18004)
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  // 2. BUSCA PERFIL NO BANCO (Pessoas)
  const fetchProfile = async (session: Session | null) => {
    if (session?.user) {
      try {
        console.log("🔑 Sincronizando Perfil UUID:", session.user.id);
        const res = await api.get(`/pessoas/${session.user.id}`);

        // Unifica os dados do Auth com os dados de Negócio (Papel/Cargo)
        setUser({ ...session.user, ...res.data });
      } catch (error) {
        console.warn(
          "⚠️ Perfil não encontrado no banco. Usando dados básicos.",
        );
        setUser(session.user);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Checa sessão ao carregar
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session);
    });

    // Escuta mudanças de estado (Login/Logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, supabase, signOut }}>
      {/* GUARD DE RENDERIZAÇÃO: Impede o Dashboard de explodir antes de ter o usuário */}
      {loading ? (
        <div className="h-screen w-full flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">
              Autenticando...
            </span>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
