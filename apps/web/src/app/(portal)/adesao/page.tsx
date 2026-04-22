"use client";
import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  FileText,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";

export default function AdesaoAutomatizadaPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    nomeImobiliaria: "",
    cnpj: "",
    emailFinanceiro: "",
    nomeGestor: "",
    telefone: "",
  });

  const handleFinalizarAdesao = async () => {
    setLoading(true);
    try {
      // Chamada para o motor de Onboarding que criamos no NestJS
      const res = await api.post("/auth/register-tenant", {
        ...dados,
        emailAdmin: dados.emailFinanceiro,
        nomeAdmin: dados.nomeGestor,
        senhaAdmin: "Sismob@Trial", // Senha temporária
        isTrial: true,
      });

      setStep(3); // Vai para a tela de "Sucesso e Verifique seu E-mail"
    } catch (e) {
      alert("Erro ao processar adesão. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* PROGRESSO */}
        <div className="flex justify-center mb-12 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-20 rounded-full ${step >= i ? "bg-indigo-600" : "bg-gray-200"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Dados da sua Imobiliária
            </h2>
            <p className="text-gray-500 mb-8">
              Esses dados serão usados para a geração automática do contrato.
            </p>

            <div className="space-y-4">
              <input
                placeholder="Nome Fantasia"
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
                onChange={(e) =>
                  setDados({ ...dados, nomeImobiliaria: e.target.value })
                }
              />
              <input
                placeholder="CNPJ"
                className="w-full p-5 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
                onChange={(e) => setDados({ ...dados, cnpj: e.target.value })}
              />
              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2"
              >
                PRÓXIMO PASSO <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-6 text-indigo-600">
              <ShieldCheck size={32} />
              <h2 className="text-3xl font-black text-gray-900">
                Termos e Condições
              </h2>
            </div>

            <div className="h-64 bg-gray-50 rounded-2xl p-6 overflow-y-auto text-sm text-gray-600 mb-8 border border-gray-200">
              <h3 className="font-bold mb-2 uppercase text-[10px] tracking-widest">
                Contrato de Licenciamento Sismob / Flaience
              </h3>
              <p>
                Ao clicar no botão abaixo, você concorda com o uso do sistema em
                modo TRIAL por 30 dias. Os dados de {dados.nomeImobiliaria}{" "}
                (CNPJ: {dados.cnpj}) serão utilizados para faturamento após o
                período de teste...
              </p>
              {/* O texto completo do contrato entraria aqui */}
            </div>

            <button
              disabled={loading}
              onClick={handleFinalizarAdesao}
              className="w-full bg-green-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-green-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <FileText size={20} />
              )}
              ACEITAR TERMOS E INICIAR MEU TESTE
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center bg-white p-16 rounded-[4rem] shadow-2xl border border-gray-100">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Parabéns!
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              O ambiente da <strong>{dados.nomeImobiliaria}</strong> foi
              provisionado com sucesso. Enviamos um e-mail para{" "}
              <strong>{dados.emailFinanceiro}</strong> para você criar sua senha
              de acesso.
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="text-indigo-600 font-bold hover:underline"
            >
              Voltar para o portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
