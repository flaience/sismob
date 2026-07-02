"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🚀 COMANDO DIRETO PARA O BACKEND
      await api.post("/pessoas/reset-direto", { email, novaSenha: password });
      alert(
        "✅ SUCESSO: A credencial foi atualizada diretamente no banco de dados.",
      );
      router.push("/login");
    } catch (err: any) {
      alert(
        "ERRO: " + (err.response?.data?.message || "E-mail não encontrado."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <form
        onSubmit={handleReset}
        className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl space-y-8"
      >
        <div className="text-center">
          <div className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">
            Módulo de Recuperação
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase">
            Acesso Administrador Sismob
          </p>
        </div>

        <div className="space-y-4">
          <input
            required
            type="email"
            placeholder="E-mail do usuário"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-red-600 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Nova Senha"
            className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold focus:ring-2 focus:ring-red-600 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black shadow-xl hover:bg-red-700 transition-all"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "EXECUTAR TROCA DE SENHA"
          )}
        </button>
      </form>
    </div>
  );
}
