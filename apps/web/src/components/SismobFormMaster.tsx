"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";
import SismobUpload from "./SismobUpload";

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
  const [errors, setErrors] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

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

    // MOTOR DE AUTO-LOOKUP INDUSTRIAL
    sections.forEach((section: any) => {
      section.fields.forEach(async (field: any) => {
        // 1. Só agimos se o campo precisar buscar dados no banco
        if (
          (field.type === "select" || field.type === "checklist") &&
          !field.options
        ) {
          try {
            let endpointLookup = "";
            let params: any = { imobiliariaId: tenant.id };

            // 2. REGRA DE ROTEAMENTO (Onde buscar cada dado)

            // Caso A: É o proprietário do imóvel
            if (field.name === "proprietario_id") {
              endpointLookup = "/pessoas";
              params.papel = "3"; // Filtra apenas donos de imóveis
            }
            // Caso B: São os atributos (Cardápio de Itens)
            else if (
              field.name === "atributos" ||
              field.entity === "atributos"
            ) {
              endpointLookup = "/configuracoes/atributos";
            }
            // Caso C: São as unidades/filiais
            else if (field.name === "unidade_id") {
              endpointLookup = "/configuracoes/unidades";
            }
            // Caso D: Regra Genérica (Bancos, Grupos de Caixa, etc)
            else {
              const entity = field.entity || field.name.replace("_id", "s");
              endpointLookup = `/configuracoes/${entity}`;
            }

            console.log(`📡 [SISMOB] Carregando lookup para ${field.label}...`);

            const res = await api.get(endpointLookup, { params });

            // 3. GARANTIA DE FORMATO (Array)
            const dados = Array.isArray(res.data)
              ? res.data
              : res.data
                ? [res.data]
                : [];

            // 4. ATUALIZA O ESTADO
            setOptions((prev: any) => ({ ...prev, [field.name]: dados }));
          } catch (e) {
            console.warn(`⚠️ [SISMOB] Falha no campo ${field.name}:`, e);
          }
        }
      });
    });
  }, [tenant?.id, idEdicao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. MOTOR DE CONSISTÊNCIA
    const missingFields: string[] = [];
    sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        if (field.required && !formData[field.name]) {
          missingFields.push(field.name);
        }
      });
    });

    if (missingFields.length > 0) {
      setErrors(missingFields); // Pintará os campos de vermelho
      // Foca no primeiro campo com erro
      const firstErrorField = document.getElementsByName(missingFields[0])[0];
      firstErrorField?.focus();

      alert(
        "⚠️ Atenção: Preencha todos os campos obrigatórios marcados em vermelho.",
      );
      return;
    }

    setLoading(true);
    try {
      await api.post(endpoint, { ...formData, imobiliariaId: tenant?.id });
      router.back();
    } catch (err: any) {
      console.error(err);
      alert(
        `❌ Erro no Servidor: ${err.response?.data?.message || "Erro desconhecido"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (name: string, val: any) => {
    setErrors((prev) => prev.filter((f) => f !== name));
    setFormData((prev: any) => ({ ...prev, [name]: val }));
  };

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-10 animate-in fade-in duration-500">
      <header className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <button
          onClick={() => router.back()}
          className="p-4 bg-slate-50 rounded-2xl"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-4xl font-black text-slate-900 uppercase">
          {title}
        </h1>
      </header>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        {sections.map((section: any, sIdx: number) => (
          <div
            key={sIdx}
            className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-8"
          >
            <h2 className="text-xl font-black text-slate-800 border-l-4 border-brand pl-6 uppercase">
              {section.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.fields.map((field: any) => (
                <div
                  key={field.name}
                  className={
                    field.fullWidth || field.type === "checklist"
                      ? "md:col-span-2 lg:col-span-3"
                      : ""
                  }
                >
                  <label
                    className={`text-[10px] font-black uppercase ml-6 mb-2 block ${errors.includes(field.name) ? "text-red-500" : "text-slate-400"}`}
                  >
                    {field.label} {field.required && "*"}
                  </label>

                  {field.type === "checklist" ? (
                    <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-8 rounded-[3.5rem] border border-slate-100">
                      {(options[field.name] || []).map((opt: any) => (
                        <label
                          key={opt.id}
                          className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm cursor-pointer hover:ring-2 ring-indigo-600 transition-all group"
                        >
                          <input
                            type="checkbox"
                            className="w-6 h-6 rounded-xl border-none ring-1 ring-slate-200 checked:bg-indigo-600 cursor-pointer"
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
                            {/* EXIBIÇÃO DA QUANTIDADE + NOME (O SEU CARDÁPIO) */}
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                              {opt.quantidade}x
                            </span>
                            <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900 uppercase">
                              {opt.nome}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "image" || field.type === "gallery" ? (
                    <SismobUpload
                      label={field.label}
                      value={formData[field.name]}
                      multiple={field.type === "gallery"}
                      onChange={(v: any) => updateField(field.name, v)}
                    />
                  ) : field.type === "select" ? (
                    <select
                      className={`w-full p-5 bg-slate-50 rounded-3xl border-none font-bold focus:ring-2 ${errors.includes(field.name) ? "ring-2 ring-red-500" : "ring-brand"}`}
                      value={formData[field.name] || ""}
                      onChange={(e) => updateField(field.name, e.target.value)}
                    >
                      <option value="">Selecione...</option>
                      {(field.options || options[field.name] || []).map(
                        (o: any) => (
                          <option key={o.id || o.value} value={o.id || o.value}>
                            {o.nome ||
                              o.label ||
                              o.banco_nome ||
                              o.nome_fantasia}
                          </option>
                        ),
                      )}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className={`w-full p-5 bg-slate-50 rounded-3xl border-none font-bold focus:ring-2 ${errors.includes(field.name) ? "ring-2 ring-red-500" : "ring-brand"}`}
                      value={formData[field.name] || ""}
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
