"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, Sparkles } from "lucide-react"; // Adicionado Sparkles
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";
import SismobUpload from "./SismobUpload";

interface SismobFormProps {
  title: string;
  endpoint: string;
  sections: any[];
  initialData?: any;
  aiHelp?: string; // Corrigido para CamelCase
}

export default function SismobFormMaster({
  title,
  endpoint,
  sections,
  initialData,
  aiHelp,
}: SismobFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const idEdicao = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(initialData || {});
  const [options, setOptions] = useState<any>({});
  const [errors, setErrors] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!tenant?.id) return;

    // 1. CARGA DE DADOS PARA EDIÇÃO
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

    // 2. MOTOR DE AUTO-LOOKUP INDUSTRIAL
    sections?.forEach((section: any) => {
      section.fields.forEach(async (field: any) => {
        if (
          (field.type === "select" || field.type === "checklist") &&
          !field.options
        ) {
          try {
            let endpointLookup = "";
            let params: any = { imobiliariaId: tenant.id };

            if (field.name === "proprietario_id") {
              endpointLookup = "/pessoas";
              params.papel = "3";
            } else if (
              field.name === "atributos" ||
              field.entity === "atributos"
            ) {
              endpointLookup = "/configuracoes/atributos";
            } else if (field.name === "unidade_id") {
              endpointLookup = "/configuracoes/unidades";
            } else {
              const entity = field.entity || field.name.replace("_id", "s");
              endpointLookup = `/configuracoes/${entity}`;
            }

            const res = await api.get(endpointLookup, { params });
            const dados = Array.isArray(res.data)
              ? res.data
              : res.data
                ? [res.data]
                : [];
            setOptions((prev: any) => ({ ...prev, [field.name]: dados }));
          } catch (e) {
            console.warn(`⚠️ [SISMOB] Falha no lookup: ${field.name}`);
          }
        }
      });
    });
  }, [tenant?.id, idEdicao, sections, endpoint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missingFields: string[] = [];
    sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        if (field.required && !formData[field.name]) {
          missingFields.push(field.name);
        }
      });
    });

    if (missingFields.length > 0) {
      setErrors(missingFields);
      alert("⚠️ Preencha os campos obrigatórios marcados em vermelho.");
      return;
    }

    setLoading(true);
    try {
      await api.post(endpoint, { ...formData, imobiliariaId: tenant?.id });
      router.back();
    } catch (err: any) {
      alert(`❌ Erro: ${err.response?.data?.message || "Falha na gravação"}`);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name: string, val: any) => {
    setErrors((prev) => prev.filter((f) => f !== name));
    setFormData((prev: any) => ({ ...prev, [name]: val }));
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">
              {idEdicao ? "Editar" : "Novo"} {title}
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Engenharia Sismob • {tenant?.nome_conta || "Sismob"}
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

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-12">
        {sections?.map((section: any, sIdx: number) => (
          <div
            key={sIdx}
            className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-10"
          >
            <h2 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-6 uppercase tracking-tighter">
              {section.title}
            </h2>

            <div className="flex flex-wrap gap-x-6 gap-y-8">
              {section.fields?.map((field: any) => {
                const nameParts = field.name.split(".");
                const value = field.name.includes(".")
                  ? formData[nameParts[0]]?.[nameParts[1]] || ""
                  : formData[field.name] || "";

                const isWide =
                  field.fullWidth ||
                  field.type === "checklist" ||
                  field.type === "gallery" ||
                  field.type === "image";
                const isInvalid = errors.includes(field.name);

                return (
                  <div
                    key={field.name}
                    className={`${isWide ? "w-full" : "flex-1 min-w-[280px]"}`}
                  >
                    <label
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ml-6 mb-3 block ${isInvalid ? "text-red-500" : "text-slate-400"}`}
                    >
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {field.type === "image" || field.type === "gallery" ? (
                      <SismobUpload
                        label={field.label}
                        value={formData[field.name]}
                        multiple={field.type === "gallery"}
                        onChange={(val: any) => updateField(field.name, val)}
                      />
                    ) : field.type === "checklist" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        {(options[field.name] || []).map((opt: any) => (
                          <label
                            key={opt.id}
                            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm cursor-pointer hover:ring-2 ring-indigo-600 transition-all group border border-transparent"
                          >
                            <input
                              type="checkbox"
                              className="w-6 h-6 rounded-xl border-none ring-1 ring-slate-300 checked:bg-indigo-600 transition-all cursor-pointer"
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
                            <div className="flex items-center gap-2">
                              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-1 rounded-lg shrink-0">
                                {opt.quantidade}x
                              </span>
                              <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 uppercase tracking-tighter truncate">
                                {opt.nome}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : field.type === "select" ? (
                      <div className="relative">
                        <select
                          className={`w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 transition-all outline-none appearance-none cursor-pointer focus:ring-2 ${isInvalid ? "ring-2 ring-red-500" : "focus:ring-indigo-600"}`}
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
                                  o.nome_fantasia ||
                                  o.banco_nome}
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
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.label}
                        className={`w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 transition-all outline-none focus:ring-2 ${isInvalid ? "ring-2 ring-red-500 bg-red-50" : "focus:ring-indigo-600"}`}
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

        <div className="flex flex-col items-center gap-6 pt-10">
          <div className="w-full max-w-md">
            <SismobButton loading={loading}>
              SALVAR REGISTRO COMPLETO
            </SismobButton>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="h-px w-12 bg-slate-200"></div>
            <p className="text-[9px] font-bold uppercase tracking-[0.4em]">
              Sismob High-End Real Estate Engine
            </p>
            <div className="h-px w-12 bg-slate-200"></div>
          </div>
        </div>
      </form>
    </div>
  );
}
