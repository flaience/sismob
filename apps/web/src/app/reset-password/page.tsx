"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1); // 1: Pedir E-mail, 2: Validar Código e Trocar Senha
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(""); // Código de 6 dígitos
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // FASE 1: Solicitar Código
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Envia o e-mail de recuperação do Supabase (ele manda um código de 6 dígitos por padrão se configurado)
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      alert("Erro ao solicitar protocolo: " + error.message);
    } else {
      setStep(2);
    }
    setLoading(false);
  };

  // FASE 2: Validar Código e Atualizar Senha
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("As senhas não coincidem.");

    setLoading(true);
    try {
      // 1. Valida o código de 6 dígitos enviado ao e-mail
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });

      if (verifyError) throw new Error("Código inválido ou expirado.");

      // 2. Com a identidade confirmada, atualiza a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      alert(
        "✅ PROTOCOLO CONCLUÍDO: Identidade confirmada e credencial atualizada.",
      );
      router.push("/login");
    } catch (err: any) {
      alert("Falha na validação: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl space-y-8 border border-slate-100">
        <div className="text-center space-y-2">
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-900">
            Protocolo de Acesso
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            Sismob High-End Security
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-6">
            <p className="text-slate-500 text-sm text-center">
              Informe seu e-mail corporativo para receber o código de
              verificação.
            </p>
            <div className="relative">
              <Mail
                className="absolute left-4 top-4 text-slate-300"
                size={20}
              />
              <input
                required
                type="email"
                placeholder="E-mail"
                className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-slate-900 font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black shadow-xl hover:bg-brand transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <KeyRound size={18} />
              )}
              SOLICITAR CÓDIGO
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleVerifyAndReset}
            className="space-y-6 animate-in slide-in-from-right-4 duration-500"
          >
            <div className="bg-emerald-50 p-4 rounded-2xl flex gap-3 text-emerald-700 text-[10px] font-black uppercase">
              <CheckCircle2 size={16} /> Código enviado para {email}
            </div>

            <div className="space-y-4">
              <input
                required
                placeholder="Código de 6 dígitos"
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
                placeholder="Confirme a Nova Senha"
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              className="w-full bg-brand text-white py-5 rounded-[2rem] font-black shadow-xl hover:scale-[1.02] transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "CONFIRMAR E ALTERAR"
              )}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
            >
              Não recebi o código
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
