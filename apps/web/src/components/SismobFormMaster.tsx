"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";

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
  const [options, setOptions] = useState<any>({}); // Armazena dados de lookups (Unidades, Bancos, etc)

  useEffect(() => {
    if (!tenant?.id) return;

    // 1. CARGA DE DADOS PARA EDIÇÃO
    if (idEdicao) {
      api
        .get(`${endpoint}/${idEdicao}`, {
          params: { imobiliariaId: tenant.id },
        })
        .then((res) => setFormData(res.data));
    }

    // 2. AUTO-LOOKUP: Busca opções para todos os selects do formulário
    sections.forEach((section: any) => {
      section.fields.forEach(async (field: any) => {
        if (field.type === "select" && !field.options) {
          // Lógica Industrial: Busca na API baseado no nome do campo (ex: unidade_id -> unidades)
          const entity = field.name.replace("_id", "s");
          const res = await api.get(`/configuracoes/${entity}`, {
            params: { imobiliariaId: tenant.id },
          });
          setOptions((prev: any) => ({ ...prev, [field.name]: res.data }));
        }
      });
    });
  }, [idEdicao, tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`${endpoint}/save`, {
        ...formData,
        imobiliariaId: tenant?.id,
      });
      router.back();
    } catch (err) {
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">
          {idEdicao ? "Editar" : "Novo"} {title}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section: any, sIdx: number) => (
          <div
            key={sIdx}
            className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-8"
          >
            <h2 className="text-xl font-black text-gray-800 border-l-4 border-indigo-600 pl-4 uppercase tracking-widest">
              {section.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.fields.map((field: any) => (
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
                      className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold"
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                    >
                      <option value="">Selecione...</option>
                      {(field.options || options[field.name] || []).map(
                        (o: any) => (
                          <option key={o.id || o.value} value={o.id || o.value}>
                            {o.nome || o.label || o.descricao}
                          </option>
                        ),
                      )}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className="w-full p-5 bg-gray-50 rounded-3xl border-none font-bold"
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
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-center">
          <SismobButton loading={loading}>
            SALVAR {title.toUpperCase()}
          </SismobButton>
        </div>
      </form>
    </div>
  );
}
