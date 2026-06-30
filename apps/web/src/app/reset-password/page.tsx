"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      // No fluxo 'implicit', o Supabase processa a URL e cria a sessão sozinho.
      // Esperamos um pouco para a sessão ser injetada no navegador.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
      } else {
        // Se não tem sessão, aguardamos 2 segundos (tempo do hash ser lido)
        setTimeout(async () => {
          const { data: retry } = await supabase.auth.getSession();
          if (retry.session) setReady(true);
          else
            setErrorMsg(
              "Sessão de segurança não encontrada. Peça um novo link.",
            );
        }, 2000);
      }
    }
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("As senhas não conferem!");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert("Erro ao atualizar: " + error.message);
    } else {
      alert("✅ Senha atualizada com sucesso!");
      await supabase.auth.signOut();
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
          <ShieldCheck size={48} className="mx-auto text-indigo-600 mb-4" />
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Nova Senha
          </h1>
          {!ready && !errorMsg && (
            <p className="text-indigo-600 animate-pulse text-xs font-bold">
              VALIDANDO LINK...
            </p>
          )}
          {errorMsg && (
            <p className="text-red-500 text-xs font-bold">{errorMsg}</p>
          )}
        </div>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="Nova Senha"
            disabled={!ready}
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold disabled:opacity-20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirme a Senha"
            disabled={!ready}
            className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600 font-bold disabled:opacity-20"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          disabled={loading || !ready}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl disabled:bg-slate-200"
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
