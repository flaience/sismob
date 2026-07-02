"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🚀 CHAMA SEU BACKEND DIRETAMENTE
      await api.post("/pessoas/reset-direto", { email, novaSenha: password });
      alert("✅ SENHA ALTERADA COM SUCESSO!");
      router.push("/login");
    } catch (err: any) {
      alert(
        "Erro: " + (err.response?.data?.message || "E-mail não encontrado"),
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
          <ShieldCheck size={48} className="mx-auto text-indigo-600 mb-4" />
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Reset Industrial
          </h1>
          <p className="text-slate-400 text-sm">
            Altere sua senha diretamente no motor Sismob.
          </p>
        </div>
        <div className="space-y-4">
          <input
            required
            type="email"
            placeholder="Seu E-mail"
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            required
            type="password"
            placeholder="Nova Senha"
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "GRAVAR NOVA SENHA"
          )}
        </button>
      </form>
    </div>
  );
}
