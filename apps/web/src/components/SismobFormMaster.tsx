"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, X, Plus, ChevronDown, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";
import SismobUpload from "./SismobUpload";
import SismobAttributePicker from "./SismobAttributePicker";
import SismobPaymentBuilder from "./SismobPaymentBuilder";

interface SismobFormProps {
  title: string;
  endpoint: string;
  sections: any[];
  initialData?: any;
  aiHelp?: string;
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
  const [showAttrPicker, setShowAttrPicker] = useState(false);
  const [options, setOptions] = useState<any>({});
  const [errors, setErrors] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // 1. ESTADO INICIAL: Garante que o objeto de endereço exista para o React não travar os inputs
  const [formData, setFormData] = useState<any>({
    ...initialData,
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });

  // 2. SINCRONIA: Atualiza se o papel mudar na URL (ex: Lead -> Proprietário)
  useEffect(() => {
    if (initialData) {
      setFormData((prev: any) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // 3. CARGA DE DADOS E LOOKUPS
  useEffect(() => {
    if (!tenant?.id) return;

    // A. Busca dados para Edição
    if (idEdicao) {
      setLoading(true);
      api
        .get(`${endpoint}/${idEdicao}`, {
          params: { imobiliariaId: tenant?.id },
        })
        .then((res) => {
          // LOG DE FRONTEIRA: Abra o F12 e veja se o JSON aparece aqui!
          console.log("📂 [SISMOB UI] O que chegou da API:", res.data);

          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          if (data) {
            setFormData(data);
          }
        })
        .finally(() => setLoading(false));
    }

    // B. Motor de Auto-Lookup (Preenche selects e checklists)
    sections?.forEach((section) => {
      section.fields?.forEach(async (field: any) => {
        if (
          (field.type === "select" || field.type === "checklist") &&
          !field.options
        ) {
          try {
            let urlLookup =
              field.name === "unidade_id"
                ? "/configuracoes/unidades"
                : field.name === "proprietario_id"
                  ? "/pessoas"
                  : field.name === "atributos" || field.entity === "atributos"
                    ? "/configuracoes/atributos"
                    : `/configuracoes/${field.entity || field.name.replace("_id", "s").replace("_", "-")}`;

            const params: any = { imobiliariaId: tenant.id };
            if (field.name === "proprietario_id") params.papel = "3";

            const res = await api.get(urlLookup, { params });
            const list = Array.isArray(res.data)
              ? res.data
              : res.data
                ? [res.data]
                : [];
            setOptions((prev: any) => ({ ...prev, [field.name]: list }));
          } catch (e) {
            console.warn("Falha no lookup:", field.name);
          }
        }
      });
    });
  }, [tenant?.id, idEdicao, endpoint, sections]);

  // 4. MOTOR DE CEP AUTOMÁTICO (ViaCEP)
  useEffect(() => {
    const cep = formData.endereco?.cep || formData.cep;
    if (cep?.length === 8) {
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            if (formData.endereco) {
              updateField("endereco.logradouro", data.logradouro);
              updateField("endereco.bairro", data.bairro);
              updateField("endereco.cidade", data.localidade);
              updateField("endereco.estado", data.uf);
            } else {
              updateField("logradouro", data.logradouro);
              updateField("bairro", data.bairro);
              updateField("cidade", data.localidade);
              updateField("estado", data.uf);
            }
          }
        });
    }
  }, [formData.endereco?.cep, formData.cep]);

  // 5. ATUALIZADOR DE CAMPOS (Suporta 'a.b' para objetos aninhados)
  const updateField = (name: string, val: any) => {
    setErrors((prev) => prev.filter((f) => f !== name));
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: { ...(prev[parent] || {}), [child]: val },
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;
      await api.post(cleanEndpoint, { ...formData, imobiliariaId: tenant?.id });
      alert("✅ Registro salvo com sucesso!");
      router.back();
    } catch (err: any) {
      alert(`❌ Erro: ${err.response?.data?.message || "Falha na gravação"}`);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              {idEdicao ? "Editar" : "Novo"} {title}
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Sismob Industrial • {tenant?.nome_conta}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            alert(`🤖 AGENTE SISMOB: \n\n${aiHelp || "Otimizando..."}`)
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
            className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <h2 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-6 uppercase tracking-tighter">
              {section.title}
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-10">
              {section.fields?.map((field: any) => {
                const nameParts = field.name.split(".");
                const value = field.name.includes(".")
                  ? formData[nameParts[0]]?.[nameParts[1]] || ""
                  : formData[field.name] || "";
                const isWide =
                  field.fullWidth ||
                  field.type === "checklist" ||
                  field.type === "gallery" ||
                  field.type === "image" ||
                  field.type === "payment-builder";
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
                      <div className="w-full space-y-4">
                        <div className="flex flex-wrap gap-2 mb-2 min-h-[50px] p-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          {formData[field.name]?.length > 0 ? (
                            formData[field.name].map((id: number) => {
                              const attr = options[field.name]?.find(
                                (o: any) => o.id === id,
                              );
                              return (
                                <span
                                  key={id}
                                  className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2"
                                >
                                  {attr?.quantidade}x {attr?.nome}
                                  <X
                                    size={12}
                                    className="cursor-pointer"
                                    onClick={() =>
                                      updateField(
                                        field.name,
                                        formData[field.name].filter(
                                          (x: any) => x !== id,
                                        ),
                                      )
                                    }
                                  />
                                </span>
                              );
                            })
                          ) : (
                            <p className="text-slate-400 text-xs font-bold italic py-2 ml-4">
                              Nenhum diferencial selecionado.
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAttrPicker(true)}
                          className="w-full p-8 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-indigo-600 transition-all flex items-center justify-center gap-4"
                        >
                          <Plus className="text-indigo-600" />
                          <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                            Abrir Cardápio
                          </span>
                        </button>
                        {showAttrPicker && (
                          <SismobAttributePicker
                            tenantId={tenant.id}
                            selectedIds={formData[field.name] || []}
                            onClose={() => setShowAttrPicker(false)}
                            onConfirm={(newIds: number[]) => {
                              updateField(field.name, newIds);
                              setShowAttrPicker(false);
                            }}
                          />
                        )}
                      </div>
                    ) : field.type === "payment-builder" ? (
                      <SismobPaymentBuilder
                        value={formData[field.name]}
                        onChange={(val: any) => updateField(field.name, val)}
                      />
                    ) : field.type === "select" ? (
                      <div className="relative">
                        <select
                          className={`w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 transition-all outline-none appearance-none focus:ring-2 ${isInvalid ? "ring-2 ring-red-500" : "focus:ring-indigo-600"}`}
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
                        className={`w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 outline-none focus:ring-2 ${isInvalid ? "ring-2 ring-red-500 bg-red-50" : "focus:ring-indigo-600"}`}
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
          <SismobButton loading={loading} className="w-full max-w-md">
            SALVAR REGISTRO COMPLETO
          </SismobButton>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
            Sismob High-End Real Estate Engine
          </p>
        </div>
      </form>
    </div>
  );
}
