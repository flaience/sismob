"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Save, ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";

interface Section {
  title: string;
  fields: any[];
}

export default function SismobFormMaster({
  title,
  endpoint,
  sections,
  aiHelp,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const idEdicao = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [unidades, setUnidades] = useState([]);

  // 1. CARGA DE DADOS INICIAL
  useEffect(() => {
    if (tenant?.id) {
      // Carrega unidades para todos os forms (se houver o campo)
      api
        .get("/configuracoes/unidades", {
          params: { imobiliariaId: tenant.id },
        })
        .then((res) => {
          setUnidades(res.data);
          if (res.data.length === 1)
            setFormData((p: any) => ({ ...p, unidade_id: res.data[0].id }));
        });

      if (idEdicao) {
        api
          .get(`${endpoint}/${idEdicao}`, {
            params: { imobiliariaId: tenant.id },
          })
          .then((res) => setFormData(res.data));
      }
    }
  }, [idEdicao, tenant]);

  // 2. SALVAMENTO ATÔMICO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, imobiliariaId: tenant?.id };
      await api.post(`${endpoint}/save`, payload);
      router.back();
    } catch (err) {
      alert("Erro ao processar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-8 pb-20">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            {idEdicao ? "Editar" : "Novo"} {title}
          </h1>
        </div>
        {/* BOTÃO DE AJUDA IA (MCP) */}
        <button className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-xs uppercase">
          Ajuda IA
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section: Section, sIdx: number) => (
          <div
            key={sIdx}
            className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-8"
          >
            <h2 className="text-xl font-black text-gray-800 border-l-4 border-indigo-600 pl-4 uppercase tracking-widest">
              {section.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.fields.map((field: any) => {
                // Lógica de Unidade: Esconde se for apenas 1 filial
                if (field.name === "unidade_id" && unidades.length <= 1)
                  return null;

                return (
                  <div
                    key={field.name}
                    className={
                      field.fullWidth ? "md:col-span-2 lg:col-span-3" : ""
                    }
                  >
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block">
                      {field.label}
                    </label>

                    {field.type === "select" ? (
                      <select
                        className="w-full p-5 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-indigo-600 font-bold"
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                      >
                        <option value="">Selecione...</option>
                        {field.options
                          ? field.options.map((o: any) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))
                          : field.name === "unidade_id"
                            ? unidades.map((u: any) => (
                                <option key={u.id} value={u.id}>
                                  {u.nome}
                                </option>
                              ))
                            : null}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.label}
                        className="w-full p-5 bg-gray-50 rounded-3xl border-none focus:ring-2 focus:ring-indigo-600 font-bold"
                        value={formData[field.name] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* BOTÃO DE SALVAMENTO INDUSTRIAL (Luis Standard) */}
        <div className="flex justify-center pt-10">
          <button
            disabled={loading}
            className="group relative w-full max-w-md bg-indigo-600 text-white py-8 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-indigo-700 transition-all overflow-hidden"
          >
            <span className={loading ? "opacity-0" : "opacity-100"}>
              SALVAR {title.toUpperCase()}
            </span>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-800">
                <Loader2 className="animate-spin" size={32} />
                <span className="ml-4 text-sm font-black uppercase tracking-widest">
                  Processando...
                </span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
