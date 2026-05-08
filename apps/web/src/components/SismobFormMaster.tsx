"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ChevronDown, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";

export default function SismobFormMaster({
  title,
  endpoint,
  sections,
  initialData,
  aiHelp,
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
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* HEADER DA FÁBRICA */}
      <header className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.back()}
            className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-200 transition-all text-slate-600"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              {idEdicao ? "Editar" : "Novo"} {title}
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Operação Industrial • {tenant?.nome_conta || "Sismob"}
            </p>
          </div>
        </div>

        {/* BOTÃO DE AJUDA IA (MCP) */}
        <button
          type="button"
          onClick={() =>
            alert(
              `🤖 AGENTE SISMOB (RAG): \n\n${aiHelp || "Otimizando preenchimento para conversão..."}`,
            )
          }
          className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
        >
          <Sparkles size={16} /> IA READY
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section: any, sIdx: number) => (
          <div
            key={sIdx}
            className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-10"
          >
            <h2 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-6 uppercase tracking-tighter">
              {section.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {section.fields.map((field: any) => {
                const nameParts = field.name.split(".");
                const value = field.name.includes(".")
                  ? formData[nameParts[0]]?.[nameParts[1]] || ""
                  : formData[field.name] || "";

                return (
                  <div
                    key={field.name}
                    className={
                      field.fullWidth || field.type === "checklist"
                        ? "md:col-span-2 lg:col-span-3"
                        : ""
                    }
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6 mb-3 block">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {/* LÓGICA DE CHECKLIST (ATRIBUTOS DINÂMICOS) */}
                    {field.type === "checklist" ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                        {(options[field.name] || []).map((opt: any) => (
                          <label
                            key={opt.id}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              className="w-6 h-6 rounded-xl border-none ring-1 ring-slate-300 checked:bg-indigo-600 transition-all cursor-pointer"
                              checked={
                                Array.isArray(formData[field.name]) &&
                                formData[field.name].includes(opt.id)
                              }
                              onChange={(e) => {
                                const current = formData[field.name] || [];
                                const newValue = e.target.checked
                                  ? [...current, opt.id]
                                  : current.filter((x: any) => x !== opt.id);
                                updateField(field.name, newValue);
                              }}
                            />
                            <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                              {opt.nome}
                            </span>
                          </label>
                        ))}
                        {(!options[field.name] ||
                          options[field.name].length === 0) && (
                          <p className="col-span-full text-xs font-bold text-slate-400 italic text-center">
                            Nenhum item cadastrado em "{field.label}".
                          </p>
                        )}
                      </div>
                    ) : field.type === "select" ? (
                      <div className="relative">
                        <select
                          className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 transition-all outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-600"
                          value={value}
                          onChange={(e) =>
                            updateField(field.name, e.target.value)
                          }
                        >
                          <option value="">Selecione...</option>
                          {(field.options || options[field.name] || []).map(
                            (o: any) => (
                              <option
                                key={o.id || o.value}
                                value={o.id || o.value}
                              >
                                {o.nome ||
                                  o.label ||
                                  o.descricao ||
                                  o.banco_nome}
                              </option>
                            ),
                          )}
                        </select>
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <ChevronDown size={20} />
                        </div>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.label}
                        className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 transition-all outline-none focus:ring-2 focus:ring-indigo-600 placeholder:text-slate-300"
                        value={value}
                        onChange={(e) =>
                          updateField(field.name, e.target.value)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* RODAPÉ COM BOTÃO DE IMPACTO */}
        <div className="flex flex-col items-center gap-4 pt-10">
          <div className="w-full max-w-md">
            <SismobButton loading={loading}>
              SALVAR {title.toUpperCase()}
            </SismobButton>
          </div>
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            Engenharia de Precisão Sismob v2.0
          </p>
        </div>
      </form>
    </div>
  );
}
