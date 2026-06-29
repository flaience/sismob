"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function validateLink() {
      // 1. LOG DE SEGURANÇA: Vamos ver o que tem na URL no milissegundo que a página abre
      console.log("🔗 [SISMOB URL]:", window.location.href);

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      // 2. Se já tiver sessão ativa, o link funcionou automaticamente (comum em alguns navegadores)
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log("✅ [SISMOB] Sessão detectada!");
        setReady(true);
        return;
      }

      // 3. Se não tem sessão mas tem código, troca agora
      if (code) {
        console.log("🔑 [SISMOB] Trocando código...");
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("❌ [SISMOB ERROR]:", error.message);
          setErrorMsg("Link expirado ou já processado pelo sistema.");
        } else {
          setReady(true);
        }
      } else {
        setErrorMsg("Nenhum código de recuperação encontrado na URL.");
      }
    }

    validateLink();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Senhas diferentes!");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert("Erro ao atualizar: " + error.message);
    } else {
      alert("✅ Senha alterada! Faça login novamente.");
      await supabase.auth.signOut();
      router.push("/login");
    }
    setLoading(false);
  };

  if (errorMsg && !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-500" />
          <h2 className="text-xl font-bold">Falha na Recuperação</h2>
          <p className="text-slate-500 text-sm">{errorMsg}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-600 font-bold uppercase text-xs"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={handleReset}
        className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl space-y-8"
      >
        <div className="text-center">
          <ShieldCheck size={48} className="mx-auto text-indigo-600 mb-4" />
          <h1 className="text-3xl font-black tracking-tighter">NOVA SENHA</h1>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            disabled={!ready}
            placeholder="Nova Senha"
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            disabled={!ready}
            placeholder="Confirme a Senha"
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading || !ready}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl disabled:bg-slate-200"
        >
          {loading ? "PROCESSANDO..." : "REDEFINIR SENHA"}
        </button>
      </form>
    </div>
  );
}
