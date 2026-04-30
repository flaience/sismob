"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogIn, ShieldCheck, Loader2 } from "lucide-react";

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
      window.location.href = "/dashboard";
    }
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
              className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 ring-brand font-bold transition-all outline-none"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha de acesso"
              required
              className="w-full p-5 bg-slate-50 rounded-2xl border-none focus:ring-2 ring-brand font-bold transition-all outline-none"
              onChange={(e) => setPassword(e.target.value)}
            />
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
      </div>
    </div>
  );
}
