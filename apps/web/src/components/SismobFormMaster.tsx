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

      <form onSubmit={handleSubmit} className="space-y-10">
        {sections.map((section: any, sIdx: number) => (
          <div
            key={sIdx}
            className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100"
          >
            <h2 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-6 mb-10 uppercase tracking-tighter">
              {section.title}
            </h2>

            {/* O SEGREDO: O container do Grid é flexível */}
            <div className="flex flex-wrap gap-x-6 gap-y-8">
              {section.fields.map((field: any) => {
                const isFullWidth =
                  field.fullWidth ||
                  field.type === "gallery" ||
                  field.type === "image" ||
                  field.type === "attribute-grid";
                const val = field.name.includes(".")
                  ? formData[field.name.split(".")[0]]?.[
                      field.name.split(".")[1]
                    ]
                  : formData[field.name];

                return (
                  <div
                    key={field.name}
                    className={`${isFullWidth ? "w-full" : "flex-1 min-w-[280px]"}`}
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-6 mb-2 block">
                      {field.label}
                    </label>

                    {/* RENDERIZAÇÃO POR TIPO */}
                    {field.type === "image" || field.type === "gallery" ? (
                      <SismobUpload
                        label={field.label}
                        value={formData[field.name]}
                        multiple={field.type === "gallery"}
                        onChange={(v: any) => updateField(field.name, v)}
                      />
                    ) : field.type === "attribute-grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-[2.5rem]">
                        {(options["atributos"] || []).map((attr: any) => (
                          <div
                            key={attr.id}
                            className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm"
                          >
                            <span className="flex-1 text-sm font-bold text-slate-600">
                              {attr.nome}
                            </span>
                            <input
                              type="text"
                              placeholder="0"
                              className="w-12 p-2 bg-slate-50 rounded-xl text-center font-black text-indigo-600 border-none outline-none"
                              value={
                                formData.atributos?.find(
                                  (a: any) => a.id === attr.id,
                                )?.valor || ""
                              }
                              onChange={(e) => {
                                const cur = formData.atributos || [];
                                const other = cur.filter(
                                  (a: any) => a.id !== attr.id,
                                );
                                updateField(
                                  "atributos",
                                  e.target.value === ""
                                    ? other
                                    : [
                                        ...other,
                                        { id: attr.id, valor: e.target.value },
                                      ],
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    ) : field.type === "select" ? (
                      <div className="relative">
                        <select
                          className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 outline-none appearance-none focus:ring-2 ring-indigo-600"
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
                                  o.nome_fantasia}
                              </option>
                            ),
                          )}
                        </select>
                        <ChevronDown
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={20}
                        />
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.label}
                        className="w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-600"
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
        <div className="flex justify-center pt-10">
          <SismobButton loading={loading}>SALVAR REGISTRO</SismobButton>
        </div>
      </form>
    </div>
  );
}
