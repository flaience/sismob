//src/app/login/page.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, ShieldCheck, Loader2, KeyRound } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Falha no acesso: " + error.message);
      setLoading(false);
    } else {
      console.log("✅ [SISMOB] Login Sucesso!");
      // Pequena pausa para os cookies assentarem
      window.location.href = "/dashboard";
    }
  };

  const handleForgotPassword = async () => {
    // 1. Validação de segurança
    if (!email) {
      alert(
        "Por favor, digite seu e-mail no campo correspondente antes de solicitar a recuperação.",
      );
      return;
    }

    // 2. Confirmação industrial
    const confirmReset = confirm(
      `Deseja enviar um link de recuperação para o e-mail: ${email}?`,
    );
    if (!confirmReset) return;

    setLoading(true);

    // 3. Disparo do Reset
    // O window.location.origin garante que o link aponte para localhost ou Vercel automaticamente
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // 🚀 MANDA PARA A ROTA DE CONFIRMAÇÃO QUE CRIAMOS
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });

    if (error) {
      alert("Erro ao processar recuperação: " + error.message);
    } else {
      alert("✅ Link de recuperação enviado! Verifique sua caixa de entrada.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-12 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="bg-brand w-16 h-16 rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-200">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
            SIS<span className="text-brand">MOB</span>
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
            Acesso Industrial Flaience
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="E-mail corporativo"
              required
              value={email}
              className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 ring-brand font-bold transition-all outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Senha de acesso"
                required
                value={password}
                className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 ring-brand font-bold transition-all outline-none"
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end px-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black text-slate-400 hover:text-brand transition-colors flex items-center gap-1 uppercase tracking-widest"
                >
                  <KeyRound size={12} /> Esqueci minha senha
                </button>
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl hover:bg-brand transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            )}
            ENTRAR NO SISTEMA
          </button>
        </form>

        <div className="pt-4 text-center">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Sismob Real Estate Engine v6.0
          </p>
        </div>
      </div>
    </div>
  );
}
