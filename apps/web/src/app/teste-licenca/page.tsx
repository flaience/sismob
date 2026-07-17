"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type LicenseResult = {
  allowed?: boolean;
  state?: string;
  tenantId?: string | null;
  product?: string;
  situation?: string;
  provisioningStatus?: string;
  administrativeBypass?: boolean;
  message?: string;
};

export default function TesteLicencaPage() {
  const [result, setResult] = useState<LicenseResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function testarLicenca() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.get<LicenseResult>("/license/current");

      setResult(response.data);
    } catch (err: any) {
      console.error("Erro ao testar licença:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Não foi possível testar a licença.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    testarLicenca();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-black text-slate-900">
          Teste de licença Flaience
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Esta página consulta a licença do usuário autenticado.
        </p>

        <button
          type="button"
          onClick={testarLicenca}
          disabled={loading}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {loading ? "Testando..." : "Testar novamente"}
        </button>

        {loading && (
          <div className="mt-6 rounded-xl bg-slate-100 p-4">
            <p className="font-semibold text-slate-600">
              Consultando a base Flaience...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="font-bold text-red-700">Falha no teste</p>

            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div
            className={`mt-6 rounded-xl border p-5 ${
              result.allowed
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p
              className={`text-lg font-black ${
                result.allowed ? "text-green-700" : "text-amber-700"
              }`}
            >
              {result.allowed ? "Licença liberada" : "Licença bloqueada"}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Mensagem:</strong> {result.message || "—"}
              </p>

              <p>
                <strong>Estado:</strong> {result.state || "—"}
              </p>

              <p>
                <strong>Produto:</strong> {result.product || "—"}
              </p>

              <p>
                <strong>Tenant:</strong> {result.tenantId || "—"}
              </p>

              <p>
                <strong>Situação:</strong> {result.situation || "—"}
              </p>

              <p>
                <strong>Provisionamento:</strong>{" "}
                {result.provisioningStatus || "—"}
              </p>

              <p>
                <strong>Bypass administrativo:</strong>{" "}
                {result.administrativeBypass ? "Sim" : "Não"}
              </p>
            </div>

            <details className="mt-5">
              <summary className="cursor-pointer font-bold text-slate-700">
                Ver resposta completa
              </summary>

              <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </main>
  );
}
