"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ChevronDown, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";
import SismobUpload from "./SismobUpload";

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

    // 1. CARGA DE DADOS PARA EDIÇÃO (Se houver ID na URL)
    if (idEdicao) {
      api
        .get(`${endpoint}/${idEdicao}`, {
          params: { imobiliariaId: tenant.id },
        })
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          setFormData(data || {});
        });
    }

    // AUTO-LOOKUP DE FILIAIS E OUTROS SELECTS
    // AUTO-LOOKUP INDUSTRIAL: Busca opções para todos os selects do formulário
    sections.forEach((section: any) => {
      section.fields.forEach(async (field: any) => {
        // Só buscamos se for select/checklist e NÃO tiver opções fixas no mapa
        if (
          (field.type === "select" || field.type === "checklist") &&
          !field.options
        ) {
          try {
            let endpointLookup = "";

            // --- REGRAS DE ROTEAMENTO DE LOOKUP ---

            // Unidades / Filiais
            if (field.name === "unidade_id") {
              endpointLookup = "/configuracoes/unidades";
            }
            // Proprietários (Papel 3)
            else if (field.name === "proprietario_id") {
              endpointLookup = "/pessoas";
            }
            // Atributos / Itens (Checklist do Imóvel)
            else if (
              field.name === "atributos" ||
              field.name === "categoria_id"
            ) {
              endpointLookup = "/configuracoes/atributos";
            }
            // Regra Genérica (Ex: banco_id -> /configuracoes/bancos)
            else {
              // Se o campo tiver uma 'entity' definida no mapa, usa ela, senão tenta adivinhar o plural
              const entitySlug =
                field.entity ||
                field.name.replace("_id", "s").replace("_", "-");
              endpointLookup = `/configuracoes/${entitySlug}`;
            }

            console.log(
              `📡 [SISMOB] Carregando lookup para ${field.name} em: ${endpointLookup}`,
            );

            const res = await api.get(endpointLookup, {
              params: {
                imobiliariaId: tenant.id,
                // Filtro especial se for busca de pessoas
                ...(field.name === "proprietario_id" ? { papel: "3" } : {}),
              },
            });

            // Garantia de formato de array
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
  }, [tenant?.id, idEdicao, sections, endpoint]);

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
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* HEADER DA FÁBRICA */}
      <header className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <button
            type="button"
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
              `🤖 AGENTE SISMOB (MCP): \n\n${aiHelp || "Otimizando preenchimento para conversão..."}`,
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
                // Lógica para capturar valores aninhados (ex: endereco.cep)
                const nameParts = field.name.split(".");
                const value = field.name.includes(".")
                  ? formData[nameParts[0]]?.[nameParts[1]] || ""
                  : formData[field.name] || "";

                // Define se o campo ocupa a linha toda (galerias e checklists sempre ocupam)
                const isFullWidth =
                  field.fullWidth ||
                  field.type === "checklist" ||
                  field.type === "gallery" ||
                  field.type === "image";

                return (
                  <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    {/* 1. CABEÇALHO DA FÁBRICA */}
                    <header className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                      <div className="flex items-center gap-6">
                        <button
                          type="button"
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
                            Operação Industrial •{" "}
                            {tenant?.nome_conta || "Sismob"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            `🤖 AGENTE SISMOB (MCP): \n\n${aiHelp || "Otimizando para conversão..."}`,
                          )
                        }
                        className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                      >
                        <Sparkles size={16} /> IA READY
                      </button>
                    </header>

                    {/* 2. FORMULÁRIO DINÂMICO */}
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
                              // Lógica para valores aninhados (ex: endereco.logradouro) ou simples (ex: titulo)
                              const nameParts = field.name.split(".");
                              const value = field.name.includes(".")
                                ? formData[nameParts[0]]?.[nameParts[1]] || ""
                                : formData[field.name] || "";

                              const isWide =
                                field.fullWidth ||
                                field.type === "attribute-grid" ||
                                field.type === "gallery" ||
                                field.type === "image";

                              return (
                                <div
                                  key={field.name}
                                  className={
                                    isWide ? "md:col-span-2 lg:col-span-3" : ""
                                  }
                                >
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6 mb-3 block">
                                    {field.label}{" "}
                                    {field.required && (
                                      <span className="text-red-500">*</span>
                                    )}
                                  </label>

                                  {/* A. ATRIBUTOS COM QUANTIDADE (O que você pediu) */}
                                  {field.type === "attribute-grid" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                      {(options["atributos"] || []).map(
                                        (attr: any) => {
                                          const currentAttr = Array.isArray(
                                            formData.atributos,
                                          )
                                            ? formData.atributos.find(
                                                (a: any) => a.id === attr.id,
                                              )
                                            : null;

                                          return (
                                            <div
                                              key={attr.id}
                                              className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm group hover:ring-2 ring-indigo-100 transition-all"
                                            >
                                              <span className="flex-1 text-sm font-bold text-slate-600">
                                                {attr.nome}
                                              </span>
                                              <input
                                                type="text"
                                                placeholder="Qtd"
                                                className="w-16 p-2 bg-slate-50 rounded-xl text-center font-black text-indigo-600 border-none outline-none focus:ring-2 ring-indigo-500"
                                                value={currentAttr?.valor || ""}
                                                onChange={(e) => {
                                                  const current = Array.isArray(
                                                    formData.atributos,
                                                  )
                                                    ? formData.atributos
                                                    : [];
                                                  const otherAttrs =
                                                    current.filter(
                                                      (a: any) =>
                                                        a.id !== attr.id,
                                                    );
                                                  const newValue =
                                                    e.target.value === ""
                                                      ? otherAttrs
                                                      : [
                                                          ...otherAttrs,
                                                          {
                                                            id: attr.id,
                                                            valor:
                                                              e.target.value,
                                                          },
                                                        ];
                                                  updateField(
                                                    "atributos",
                                                    newValue,
                                                  );
                                                }}
                                              />
                                            </div>
                                          );
                                        },
                                      )}
                                    </div>
                                  ) : /* B. UPLOAD DE MÍDIA (Logo ou Galeria) */
                                  field.type === "image" ||
                                    field.type === "gallery" ? (
                                    <SismobUpload
                                      label={field.label}
                                      value={formData[field.name]}
                                      multiple={field.type === "gallery"}
                                      onChange={(val: any) =>
                                        updateField(field.name, val)
                                      }
                                    />
                                  ) : /* C. SELEÇÃO (Auto-Lookups) */
                                  field.type === "select" ? (
                                    <div className="relative">
                                      <select
                                        className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 transition-all outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-600"
                                        value={value}
                                        onChange={(e) =>
                                          updateField(
                                            field.name,
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="">Selecione...</option>
                                        {(
                                          field.options ||
                                          options[field.name] ||
                                          []
                                        ).map((o: any) => (
                                          <option
                                            key={o.id || o.value}
                                            value={o.id || o.value}
                                          >
                                            {o.nome ||
                                              o.label ||
                                              o.descricao ||
                                              o.nome_fantasia ||
                                              o.banco_nome}
                                          </option>
                                        ))}
                                      </select>
                                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronDown size={20} />
                                      </div>
                                    </div>
                                  ) : (
                                    /* D. CAMPOS DE TEXTO / DATA / NÚMERO */
                                    <input
                                      type={field.type}
                                      placeholder={field.label}
                                      className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 transition-all outline-none focus:ring-2 focus:ring-indigo-600 placeholder:text-slate-200"
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

                      {/* 3. RODAPÉ INDUSTRIAL */}
                      <div className="flex flex-col items-center gap-4 pt-10">
                        <div className="w-full max-w-md">
                          <SismobButton loading={loading}>
                            SALVAR REGISTRO COMPLETO
                          </SismobButton>
                        </div>
                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
                          Sismob High-End Real Estate Engine
                        </p>
                      </div>
                    </form>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* RODAPÉ COM BOTÃO INDUSTRIAL */}
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
