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
    async function checkSession() {
      // 1. No fluxo implicit, o Supabase processa o '#' e cria a sessão sozinho
      // Vamos esperar até 3 segundos pela sessão
      let attempts = 0;
      const interval = setInterval(async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log("✅ [SISMOB] Sessão recuperada com sucesso!");
          setReady(true);
          clearInterval(interval);
        }
        if (attempts > 6) {
          // Se em 3s não logou, o link é inválido
          if (!data.session)
            setErrorMsg("Sessão de recuperação não encontrada.");
          clearInterval(interval);
        }
        attempts++;
      }, 500);
    }
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("As senhas não conferem.");

    setLoading(true);
    // 2. Com a sessão ativa, o updateUser funciona direto
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert("Erro ao atualizar: " + error.message);
    } else {
      alert("✅ Senha alterada com sucesso!");
      await supabase.auth.signOut();
      router.push("/login");
    }
    setLoading(false);
  };

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-xl text-center space-y-4">
          <AlertCircle size={48} className="mx-auto text-red-500" />
          <h2 className="text-xl font-bold">Link Inválido</h2>
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
          {!ready && (
            <p className="text-indigo-600 text-xs animate-pulse font-bold">
              VALIDANDO ACESSO SEGURO...
            </p>
          )}
        </div>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Nova Senha"
            disabled={!ready}
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold disabled:opacity-30"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirme a Senha"
            disabled={!ready}
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold disabled:opacity-30"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading || !ready}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl disabled:bg-slate-100"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "REDEFINIR SENHA"
          )}
        </button>
      </form>
    </div>
  );
}
