"use client";
import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("As senhas não conferem!");

    setLoading(true);
    try {
      // 🚀 CHAMA O SEU BACKEND (O motor que criamos no PessoasService)
      await api.post("/pessoas/reset-direto", { email, novaSenha: password });
      alert("✅ Senha alterada com sucesso via Motor Sismob!");
      router.push("/login");
    } catch (err: any) {
      alert(
        "Erro: " + (err.response?.data?.message || "E-mail não localizado."),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <form
        onSubmit={handleReset}
        className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl space-y-6"
      >
        <h1 className="text-3xl font-black text-center tracking-tighter">
          RESET INDUSTRIAL
        </h1>
        <p className="text-slate-400 text-center text-xs uppercase font-bold">
          Retome o controle do seu acesso
        </p>

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 text-slate-300" size={20} />
            <input
              type="email"
              placeholder="Seu e-mail"
              required
              className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
            <input
              type="password"
              placeholder="Nova Senha"
              required
              className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <input
            type="password"
            placeholder="Confirme a Nova Senha"
            required
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "ALTERAR NO BANCO DE DADOS"
          )}
        </button>
      </form>
    </div>
  );
}
