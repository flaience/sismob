"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // O usuário já está logado via Cookie (feito pela rota /auth/confirm)
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert("Falha na atualização: " + error.message);
    } else {
      alert("✅ Senha alterada com sucesso! Entre novamente.");
      await supabase.auth.signOut();
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={handleReset}
        className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-xl space-y-8"
      >
        <div className="text-center">
          <ShieldCheck size={48} className="mx-auto text-indigo-600 mb-4" />
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Nova Senha
          </h1>
          <p className="text-slate-400 text-sm">
            Sua identidade foi validada pelo servidor.
          </p>
        </div>
        <input
          required
          type="password"
          placeholder="Digite a nova senha"
          className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "REDEFINIR E ENTRAR"
          )}
        </button>
      </form>
    </div>
  );
}
