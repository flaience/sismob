"use client";
import { useState } from "react";
import { Building2, ArrowRight, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Erro ao logar: " + error.message);
      setLoading(false);
    } else {
      router.push("/"); // Redireciona para a home
      router.refresh(); // Atualiza a sidebar para mostrar o menu admin
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100">
        <div className="text-center mb-10">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-200">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Acesso Restrito</h1>
          <p className="text-gray-400 mt-2">
            Área exclusiva para corretores e administradores Sismob.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="email"
              placeholder="Seu e-mail corporativo"
              className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="password"
              placeholder="Sua senha secreta"
              className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all group">
            ACESSAR PAINEL
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </form>
      </div>
    </div>
  );
}
