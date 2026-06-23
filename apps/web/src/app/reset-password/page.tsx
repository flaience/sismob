"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🚀 O SEGREDO: O Supabase já logou o usuário via link do e-mail.
    // Basta dar o update na senha agora.
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert("Erro ao atualizar senha: " + error.message);
    } else {
      alert("✅ Senha atualizada com sucesso! Você já pode entrar.");
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={handleReset}
        className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl space-y-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tighter">NOVA SENHA</h1>
          <p className="text-slate-400 text-sm">
            Defina sua nova credencial de acesso ao Sismob.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
            Nova Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
            <input
              required
              type="password"
              className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "ATUALIZAR SENHA"
          )}
        </button>
      </form>
    </div>
  );
}
