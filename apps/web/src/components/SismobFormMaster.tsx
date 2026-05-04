"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
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
  const [errors, setErrors] = useState<string[]>([]);

  // 1. CARGA DE DADOS
  useEffect(() => {
    if (idEdicao && tenant?.id) {
      api
        .get(`${endpoint}/${idEdicao}`, {
          params: { imobiliariaId: tenant.id },
        })
        .then((res) =>
          setFormData(Array.isArray(res.data) ? res.data[0] : res.data),
        );
    }
  }, [idEdicao, tenant, endpoint]);

  // 2. MOTOR DE CONSISTÊNCIA (VALIDAÇÃO)
  const validate = () => {
    const missing: string[] = [];
    sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        const value = field.name.includes(".")
          ? formData[field.name.split(".")[0]]?.[field.name.split(".")[1]]
          : formData[field.name];

        if (field.required && (!value || value === "")) {
          missing.push(field.name);
        }
      });
    });
    setErrors(missing);
    return missing.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      alert("⚠️ Existem campos obrigatórios não preenchidos!");
      return;
    }

    setLoading(true);
    try {
      // O FRONTEND envia 'imobiliariaId' para o Backend
      await api.post(endpoint, { ...formData, imobiliariaId: tenant?.id });
      router.back();
    } catch (err: any) {
      alert(
        `❌ Erro no Servidor: ${err.response?.data?.message || "Falha na gravação"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // 3. HANDLER DE CAMPOS (Suporta endereco.logradouro)
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

  return (
    <div className="max-w-5xl mx-auto p-10 space-y-10 animate-in fade-in duration-500">
      <header className="flex items-center gap-6 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <button
          onClick={() => router.back()}
          className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-200 transition-all"
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
              {section.fields.map((field: any) => {
                const isInvalid = errors.includes(field.name);
                return (
                  <div
                    key={field.name}
                    className={
                      field.fullWidth ? "md:col-span-2 lg:col-span-3" : ""
                    }
                  >
                    <label
                      className={`text-[10px] font-black uppercase tracking-widest ml-6 mb-2 block ${isInvalid ? "text-red-500" : "text-slate-400"}`}
                    >
                      {field.label} {field.required && "*"}
                    </label>
                    <input
                      type={field.type}
                      className={`w-full p-5 rounded-3xl border-none font-bold outline-none transition-all ${isInvalid ? "bg-red-50 ring-2 ring-red-500" : "bg-slate-50 focus:ring-2 ring-indigo-600"}`}
                      value={
                        field.name.includes(".")
                          ? formData[field.name.split(".")[0]]?.[
                              field.name.split(".")[1]
                            ] || ""
                          : formData[field.name] || ""
                      }
                      onChange={(e) => updateField(field.name, e.target.value)}
                    />
                  </div>
                );
              })}
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
