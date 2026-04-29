"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Importando o objeto constante
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Garante que o componente só renderize no cliente (Mata o Application Error)
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert("Erro ao entrar: " + error.message);
        setLoading(false);
      } else {
        // Redirecionamento forçado para limpar o cache de erro
        window.location.href = "/dashboard";
      }
    } catch (err) {
      alert("Falha na conexão com o servidor.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-lg border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">
            SIS<span className="text-indigo-600">MOB</span>
          </h1>
          <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">
            Acesse sua imobiliária
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">
              E-mail
            </label>
            <input
              type="email"
              required
              className="w-full p-5 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-indigo-600 font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-4">
              Senha
            </label>
            <input
              type="password"
              required
              className="w-full p-5 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-indigo-600 font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center"
          >
            {loading ? "CARREGANDO..." : "ENTRAR NO SISTEMA"}
          </button>
        </form>
      </div>
    </div>
  );
}
