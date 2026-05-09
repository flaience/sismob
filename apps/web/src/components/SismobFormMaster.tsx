"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, ChevronDown } from "lucide-react";
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

  // 1. CARREGAMENTO DE DADOS
  useEffect(() => {
    if (!tenant?.id) return;
    if (idEdicao) {
      api
        .get(`${endpoint}/${idEdicao}`, {
          params: { imobiliariaId: tenant.id },
        })
        .then((res) =>
          setFormData(Array.isArray(res.data) ? res.data[0] : res.data),
        );
    }
    // Auto-lookup para Selects e Checklists
    sections.forEach((section: any) => {
      section.fields.forEach(async (field: any) => {
        if (
          (field.type === "select" || field.type === "attribute-grid") &&
          !field.options
        ) {
          const slug = field.name === "unidade_id" ? "unidades" : "atributos";
          const res = await api.get(`/configuracoes/${slug}`, {
            params: { imobiliariaId: tenant.id },
          });
          setOptions((p: any) => ({ ...p, [field.name]: res.data }));
        }
      });
    });
  }, [tenant?.id, idEdicao]);

  const updateField = (name: string, value: any) => {
    if (name.includes(".")) {
      const [p, c] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [p]: { ...prev[p], [c]: value },
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
    } catch (err) {
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-12 animate-in fade-in duration-700">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-100 transition-all"
          >
            <ArrowLeft />
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            {title}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-12">
        {sections.map((section: any, sIdx: number) => (
          <div
            key={sIdx}
            className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <h2 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-6 mb-10 uppercase tracking-tighter">
              {section.title}
            </h2>

            {/* CONTAINER FLEXÍVEL: Impede a sobreposição de campos */}
            <div className="flex flex-wrap gap-x-6 gap-y-10">
              {section.fields.map((field: any) => {
                // Lógica de largura: campos de mídia e listas ocupam a linha toda
                const isWide =
                  field.fullWidth ||
                  field.type === "gallery" ||
                  field.type === "image" ||
                  field.type === "checklist";

                // Lógica de valor para campos aninhados (ex: endereco.logradouro)
                const val = field.name.includes(".")
                  ? formData[field.name.split(".")[0]]?.[
                      field.name.split(".")[1]
                    ]
                  : formData[field.name];

                return (
                  <div
                    key={field.name}
                    className={`${isWide ? "w-full" : "flex-1 min-w-[280px]"}`}
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2 block">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {/* 1. ATALHOS DE MÍDIA (Logo / Galeria de Fotos) */}
                    {field.type === "image" || field.type === "gallery" ? (
                      <SismobUpload
                        label={field.label}
                        value={formData[field.name]}
                        multiple={field.type === "gallery"}
                        onChange={(v: any) => updateField(field.name, v)}
                      />
                    ) : /* 2. CARDÁPIO DE ATRIBUTOS (O que você pediu: Checkbox com Qtd) */
                    field.type === "checklist" ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                        {(options[field.name] || []).map((opt: any) => (
                          <label
                            key={opt.id}
                            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm cursor-pointer hover:ring-2 ring-indigo-600 transition-all group"
                          >
                            <input
                              type="checkbox"
                              className="w-6 h-6 rounded-lg border-none ring-1 ring-slate-200 checked:bg-indigo-600 transition-all cursor-pointer"
                              checked={
                                Array.isArray(formData[field.name]) &&
                                formData[field.name].includes(opt.id)
                              }
                              onChange={(e) => {
                                const current = Array.isArray(
                                  formData[field.name],
                                )
                                  ? formData[field.name]
                                  : [];
                                const newValue = e.target.checked
                                  ? [...current, opt.id]
                                  : current.filter((id: any) => id !== opt.id);
                                updateField(field.name, newValue);
                              }}
                            />
                            <div className="flex flex-col leading-tight">
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                                {opt.quantidade}x
                              </span>
                              <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 uppercase">
                                {opt.nome}
                              </span>
                            </div>
                          </label>
                        ))}
                        {(!options[field.name] ||
                          options[field.name].length === 0) && (
                          <p className="col-span-full text-center py-4 text-xs font-bold text-slate-400 italic">
                            Nenhum item cadastrado em {field.label}.
                          </p>
                        )}
                      </div>
                    ) : /* 3. SELEÇÃO (Lookups) */
                    field.type === "select" ? (
                      <div className="relative">
                        <select
                          className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 outline-none appearance-none focus:ring-2 ring-indigo-600 transition-all cursor-pointer"
                          value={val || ""}
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
                                  o.banco_nome ||
                                  o.nome_fantasia ||
                                  o.descricao}
                              </option>
                            ),
                          )}
                        </select>
                        <ChevronDown
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                          size={20}
                        />
                      </div>
                    ) : (
                      /* 4. INPUTS PADRÃO (Texto, Número, Data) */
                      <input
                        type={field.type}
                        placeholder={field.label}
                        className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-600 transition-all placeholder:text-slate-200"
                        value={val || ""}
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

        {/* BOTÃO DE SALVAMENTO INDUSTRIAL */}
        <div className="flex justify-center pt-10">
          <div className="w-full max-w-md">
            <SismobButton loading={loading}>
              SALVAR REGISTRO COMPLETO
            </SismobButton>
          </div>
        </div>
      </form>
    </div>
  );
}
