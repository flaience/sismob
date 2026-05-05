"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";

export default function SismobFormMaster({
  title,
  endpoint,
  sections,
  initialData,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const idEdicao = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(initialData || {});
  const [options, setOptions] = useState<any>({});

  useEffect(() => {
    if (!tenant?.id) return;

    // CARREGA DADOS DE EDIÇÃO
    if (idEdicao) {
      api
        .get(`${endpoint}/${idEdicao}`, {
          params: { imobiliariaId: tenant.id },
        })
        .then((res) => {
          // Garantia de objeto único
          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          setFormData(data || {});
        });
    }

    // AUTO-LOOKUP DE FILIAIS E OUTROS SELECTS
    // AUTO-LOOKUP INDUSTRIAL: Busca opções para todos os selects do formulário
    sections.forEach((section: any) => {
      section.fields.forEach(async (field: any) => {
        if (field.type === "select" && !field.options) {
          try {
            let endpointLookup = "";

            // 1. REGRA PARA UNIDADES
            if (field.name === "unidade_id") {
              endpointLookup = "/configuracoes/unidades";
            }
            // 2. REGRA PARA PROPRIETÁRIOS (PAPEL 3)
            else if (field.name === "proprietario_id") {
              endpointLookup = "/pessoas"; // Buscamos na rota de pessoas
            }
            // 3. REGRA PARA CATEGORIAS DE ATRIBUTOS
            else if (field.name === "categoria_id") {
              endpointLookup = "/configuracoes/atributos";
            }
            // 4. REGRA GENÉRICA (ex: banco_id -> /configuracoes/bancos)
            else {
              endpointLookup = `/configuracoes/${field.name.replace("_id", "s")}`;
            }

            console.log(
              `📡 [SISMOB] Carregando lookup para ${field.name}: ${endpointLookup}`,
            );

            const res = await api.get(endpointLookup, {
              params: {
                imobiliariaId: tenant.id,
                // Se for proprietário, força o filtro de papel 3 na API
                ...(field.name === "proprietario_id" ? { papel: "3" } : {}),
              },
            });

            // Garantia de formato de array para o .map do select
            const dados = Array.isArray(res.data)
              ? res.data
              : res.data
                ? [res.data]
                : [];

            setOptions((prev: any) => ({ ...prev, [field.name]: dados }));
          } catch (e) {
            console.warn(
              `⚠️ [SISMOB] Falha ao carregar opções para o campo: ${field.name}`,
            );
          }
        }
      });
    });
  }, [tenant?.id, idEdicao]);

  const updateField = (name: string, value: any) => {
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(endpoint, { ...formData, imobiliariaId: tenant?.id });
      router.back();
    } catch (err: any) {
      alert(`Erro: ${err.response?.data?.message || "Falha na gravação"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-10 animate-in fade-in duration-500">
      <header className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <button
          onClick={() => router.back()}
          className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-200 transition-all text-slate-600"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
          {title}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section: any, sIdx: number) => (
          <div
            key={sIdx}
            className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-8"
          >
            <h2 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-6 uppercase tracking-tighter">
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2 block">
                    {field.label}
                  </label>

                  {field.type === "select" ? (
                    <select
                      className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold outline-none focus:ring-2 ring-indigo-600"
                      value={
                        field.name.includes(".")
                          ? formData[field.name.split(".")[0]]?.[
                              field.name.split(".")[1]
                            ]
                          : formData[field.name] || ""
                      }
                      onChange={(e) => updateField(field.name, e.target.value)}
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
                      className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold outline-none focus:ring-2 ring-indigo-600"
                      value={
                        field.name.includes(".")
                          ? formData[field.name.split(".")[0]]?.[
                              field.name.split(".")[1]
                            ] || ""
                          : formData[field.name] || ""
                      }
                      onChange={(e) => updateField(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-center">
          <SismobButton loading={loading}>SALVAR REGISTRO</SismobButton>
        </div>
      </form>
    </div>
  );
}
