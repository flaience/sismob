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
    const missing: string[] = [];
    sections.forEach((s: any) =>
      s.fields.forEach((f: any) => {
        if (f.required && !formData[f.name]) missing.push(f.name);
      }),
    );

    if (missing.length > 0) {
      setErrors(missing);
      alert(
        "⚠️ Por favor, preencha os campos obrigatórios marcados em vermelho.",
      );
      return;
    }

    setLoading(true);
    try {
      await api.post(endpoint, { ...formData, imobiliariaId: tenant?.id });
      router.back();
    } catch (err) {
      alert("❌ Falha na gravação. Verifique o console.");
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      {(options[field.name] || []).map((opt: any) => (
                        <label
                          key={opt.id}
                          className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm cursor-pointer hover:ring-2 ring-brand transition-all"
                        >
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border-none ring-1 ring-slate-300 checked:bg-brand"
                            checked={formData[field.name]?.includes(opt.id)}
                            onChange={(e) => {
                              const cur = formData[field.name] || [];
                              updateField(
                                field.name,
                                e.target.checked
                                  ? [...cur, opt.id]
                                  : cur.filter((x: any) => x !== opt.id),
                              );
                            }}
                          />
                          <span className="text-xs font-black text-slate-600 uppercase">
                            {opt.quantidade} {opt.nome}
                          </span>
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
