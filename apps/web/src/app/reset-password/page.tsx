"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
          window.history.replaceState({}, document.title, "/reset-password");
        }
      }

      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setCanReset(!!data.session);
      setReady(true);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setCanReset(true);
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      alert("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      alert("As senhas não conferem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert("Erro ao atualizar senha: " + error.message);
      return;
    }

    await supabase.auth.signOut();

    alert("Senha atualizada com sucesso. Faça login novamente.");
    router.push("/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-900" size={32} />
      </div>
    );
  }

  if (!canReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl space-y-6 text-center">
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto">
            <ShieldCheck size={32} />
          </div>

          <h1 className="text-2xl font-black tracking-tighter uppercase">
            Link inválido ou expirado
          </h1>

          <p className="text-slate-400 text-sm font-bold">
            Solicite um novo link de recuperação na tela de login.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl"
          >
            VOLTAR AO LOGIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto">
            <ShieldCheck size={32} />
          </div>

          <h1 className="text-2xl font-black tracking-tighter uppercase">
            Nova Senha
          </h1>

          <p className="text-slate-400 text-[10px] font-black uppercase">
            Defina sua nova credencial de acesso
          </p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="bg-emerald-50 p-4 rounded-2xl flex gap-3 text-emerald-700 text-[10px] font-black uppercase">
            <CheckCircle2 size={16} /> Identidade confirmada
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              required
              type="password"
              placeholder="Nova senha"
              className="w-full p-5 pl-12 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              required
              type="password"
              placeholder="Confirmar nova senha"
              className="w-full p-5 pl-12 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full bg-brand text-white py-6 rounded-2xl font-black shadow-xl flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "SALVAR NOVA SENHA"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
