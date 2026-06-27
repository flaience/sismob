"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();

  // 1. VERIFICAÇÃO DE SEGURANÇA: O link é válido?
  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setHasSession(true);
      }
    }
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    // 🚀 O COMANDO INDUSTRIAL: Atualiza o usuário que entrou pelo link
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      alert(
        "Erro ao atualizar: " +
          error.message +
          ". Tente solicitar um novo link de recuperação.",
      );
    } else {
      alert("✅ Senha atualizada com sucesso! Entre com sua nova senha.");
      // Limpa a sessão para forçar login limpo
      await supabase.auth.signOut();
      router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={handleReset}
        className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl space-y-8 animate-in fade-in duration-500"
      >
        <div className="text-center space-y-2">
          <div className="bg-brand w-16 h-16 rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Nova Senha
          </h1>
          <p className="text-slate-400 text-sm">
            Defina sua nova credencial de acesso.
          </p>
        </div>

        {!hasSession && (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-700 text-xs font-bold animate-pulse">
            <AlertCircle className="shrink-0" />
            Link de recuperação expirado ou inválido. Por favor, solicite um
            novo na tela de login.
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
              Digite a nova senha
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-4 text-slate-300"
                size={20}
              />
              <input
                required
                type="password"
                className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-4">
              Confirme a nova senha
            </label>
            <div className="relative">
              <Lock
                className="absolute left-4 top-4 text-slate-300"
                size={20}
              />
              <input
                required
                type="password"
                className="w-full pl-12 p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-brand font-bold"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button
          disabled={loading || !hasSession}
          className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black shadow-xl hover:bg-brand transition-all disabled:bg-slate-200 disabled:shadow-none"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "FINALIZAR E ENTRAR"
          )}
        </button>
      </form>
    </div>
  );
}
