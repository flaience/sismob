"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Lock,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false); // Libera o formulário
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  // 🚀 MOTOR DE VALIDAÇÃO DE SESSÃO (PADRÃO INDUSTRIAL)
  useEffect(() => {
    async function prepareSession() {
      const url = new URL(window.location.href);

      // 1. Tenta o fluxo PKCE (?code=...)
      const code = url.searchParams.get("code");
      if (code) {
        console.log("🔑 [SISMOB] Trocando código por sessão...");
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setErrorMsg("Link inválido ou expirado. Peça um novo acesso.");
          return;
        }
        setReady(true);
        return;
      }

      // 2. Tenta o fluxo de Token no Hash (#access_token=...)
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        console.log("🔑 [SISMOB] Validando tokens do link...");
        setReady(true);
        return;
      }

      // 3. Verifica se já existe uma sessão ativa
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
      } else {
        setErrorMsg(
          "Sessão de segurança não encontrada. Inicie o processo novamente.",
        );
      }
    }

    prepareSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword)
      return setErrorMsg("As senhas não conferem.");
    if (password.length < 6) return setErrorMsg("Mínimo de 6 caracteres.");

    setLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMsg("Falha ao salvar: " + error.message);
    } else {
      setSuccessMsg("Senha atualizada! Entrando...");
      // Limpa para forçar login limpo
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/login");
      }, 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <div className="bg-brand w-16 h-16 rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900">
            Nova Senha
          </h1>
          <p className="text-slate-400 text-sm">
            Sismob v6.0 • Redefinição de Acesso
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-3 text-red-700 text-xs font-bold animate-shake">
            <AlertCircle className="shrink-0" size={16} /> {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex gap-3 text-emerald-700 text-xs font-bold">
            <CheckCircle2 className="shrink-0" size={16} /> {successMsg}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
              Senha
            </label>
            <input
              required
              type="password"
              disabled={!ready || loading}
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold disabled:opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
              Confirmar
            </label>
            <input
              required
              type="password"
              disabled={!ready || loading}
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold disabled:opacity-50"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            disabled={!ready || loading}
            className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black shadow-xl hover:bg-brand transition-all disabled:bg-slate-200"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "REDEFINIR AGORA"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
