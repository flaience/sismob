"use client";
import { useState, Suspense } from "react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, Loader2, CheckCircle2 } from "lucide-react";

function ResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState(1); // 1: Enviar Código, 2: Validar e Trocar
  const [token, setToken] = useState(""); // 6 dígitos
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    setLoading(true);
    try {
      await api.post("/pessoas/solicitar-codigo", { email });
      setStep(2);
    } catch (err) {
      alert("Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/pessoas/reset-direto", {
        email,
        token,
        novaSenha: password,
      });
      alert("✅ Identidade confirmada. Credencial atualizada com sucesso.");
      router.push("/login");
    } catch (err: any) {
      alert("Falha: " + (err.response?.data?.message || "Código inválido"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[3rem] shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">
            Verificação de Segurança
          </h1>
          <p className="text-slate-400 text-[10px] font-black uppercase">
            ID: {email}
          </p>
        </div>

        {step === 1 ? (
          <button
            onClick={handleSendCode}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black shadow-xl hover:bg-brand transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "SOLICITAR CÓDIGO DE 6 DÍGITOS"
            )}
          </button>
        ) : (
          <form onSubmit={handleFinalReset} className="space-y-6">
            <div className="bg-emerald-50 p-4 rounded-2xl flex gap-3 text-emerald-700 text-[10px] font-black uppercase">
              <CheckCircle2 size={16} /> Digite o código enviado ao seu e-mail
            </div>
            <input
              required
              placeholder="CÓDIGO DE 6 DÍGITOS"
              className="w-full p-4 bg-slate-50 rounded-2xl text-center text-2xl font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-brand"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              maxLength={6}
            />
            <input
              required
              type="password"
              placeholder="Nova Senha Profissional"
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-brand"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              disabled={loading}
              className="w-full bg-brand text-white py-6 rounded-2xl font-black shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin mx-auto" />
              ) : (
                "CONFIRMAR IDENTIDADE E SALVAR"
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
      <ResetContent />
    </Suspense>
  );
}
