"use client";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Loader2,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import api from "@/lib/api";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState(1); // 1: Enviar Código, 2: Digitar Código e Senha
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // FASE 1: Solicitar o Código (Enviado pelo Supabase, mas processado por NÓS)
  const handleRequestCode = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) alert("Erro: " + error.message);
    else setStep(2);
    setLoading(false);
  };

  // FASE 2: A Mágica do Controle Total (DB + Admin Bypass)
  const handleFinalReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("As senhas não conferem.");

    setLoading(true);
    try {
      // 🛡️ PASSO 1: Validamos o código de 6 dígitos que chegou no e-mail
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });

      if (verifyError) throw new Error("Código inválido ou expirado.");

      // 🛡️ PASSO 2: Chamamos o SEU Backend para forçar a troca no banco e no auth
      // Isso ignora qualquer problema de redirecionamento de link
      await api.post("/pessoas/reset-direto", { email, novaSenha: password });

      alert("✅ PROTOCOLO CONCLUÍDO: Senha atualizada com sucesso.");
      router.push("/login");
    } catch (err: any) {
      alert("Falha no Protocolo: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">
            Segurança Sismob
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Protocolo para: {email}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-6 text-center">
            <p className="text-slate-500 text-sm">
              Clique abaixo para receber o código de 6 dígitos no seu e-mail.
            </p>
            <button
              onClick={handleRequestCode}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black shadow-xl hover:bg-brand transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "ENVIAR CÓDIGO DE ACESSO"
              )}
            </button>
            <button
              onClick={() => router.back()}
              className="text-[10px] font-black text-slate-400 uppercase flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft size={12} /> Voltar ao login
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleFinalReset}
            className="space-y-6 animate-in slide-in-from-right-4 duration-500"
          >
            <div className="bg-emerald-50 p-4 rounded-2xl flex gap-3 text-emerald-700 text-[10px] font-black uppercase">
              <CheckCircle2 size={16} /> Digite o código enviado ao e-mail
            </div>
            <input
              required
              placeholder="CÓDIGO (6 DÍGITOS)"
              className="w-full p-4 bg-slate-50 rounded-2xl text-center text-2xl font-black tracking-[0.5em] focus:ring-2 focus:ring-brand outline-none"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
            />
            <input
              required
              type="password"
              placeholder="Nova Senha"
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              required
              type="password"
              placeholder="Confirmar Senha"
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              disabled={loading}
              className="w-full bg-brand text-white py-5 rounded-[2rem] font-black shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "CONFIRMAR E ALTERAR"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
