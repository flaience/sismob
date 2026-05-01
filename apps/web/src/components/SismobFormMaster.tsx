"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";

export default function SismobFormMaster({
  title,
  endpoint,
  sections,
  aiHelp,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const idEdicao = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [options, setOptions] = useState<any>({}); // Armazena dados de lookups

  useEffect(() => {
    if (!tenant?.id) return;

    // 1. CARGA DE DADOS PARA EDIÇÃO
    if (idEdicao) {
      api
        .get(`${endpoint}/${idEdicao}`, {
          params: { imobiliariaId: tenant.id },
        })
        .then((res) => {
          // Se o backend devolver um array, pegamos o primeiro item
          const data = Array.isArray(res.data) ? res.data[0] : res.data;
          setFormData(data || {});
        });
    }

    // 2. AUTO-LOOKUP INDUSTRIAL: Busca opções para todos os selects do formulário
    sections.forEach((section: any) => {
      section.fields.forEach(async (field: any) => {
        if (field.type === "select" && !field.options) {
          try {
            // Mágica: unidade_id vira endpoint /configuracoes/unidades
            const entity = field.name.replace("_id", "s");
            const res = await api.get(`/configuracoes/${entity}`, {
              params: { imobiliariaId: tenant.id },
            });
            setOptions((prev: any) => ({ ...prev, [field.name]: res.data }));
          } catch (e) {
            console.warn(`⚠️ Falha ao carregar lookup para ${field.name}`);
          }
        }
      });
    });
  }, [idEdicao, tenant, endpoint, sections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Envia o objeto completo com o ID da imobiliária do contexto
      await api.post(`${endpoint}`, {
        ...formData,
        imobiliariaId: tenant?.id,
      });
      router.back();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao persistir dados. Verifique a conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* CABEÇALHO INDUSTRIAL */}
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
              Manutenção • {tenant?.nome_conta || "Sismob"}
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">
          <Sparkles size={16} /> MCP AI Ready
        </div>
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
              {section.fields.map((field: any) => (
                <div
                  key={field.name}
                  className={
                    field.fullWidth ? "md:col-span-2 lg:col-span-3" : ""
                  }
                >
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6 mb-3 block">
                    {field.label}
                  </label>

                  {field.type === "select" ? (
                    <select
                      className="w-full p-5 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 transition-all outline-none appearance-none cursor-pointer"
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
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
                      placeholder={field.label}
                      className="w-full p-5 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-indigo-600 font-bold text-slate-700 transition-all outline-none"
                      value={formData[field.name] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.name]: e.target.value,
                        })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* BOTÃO DE SALVAMENTO COM ESTILO INDUSTRIAL */}
        <div className="flex justify-center pt-10">
          <div className="w-full max-w-md">
            <SismobButton loading={loading}>
              SALVAR {title.toUpperCase()}
            </SismobButton>
          </div>
        </div>
      </form>
    </div>
  );
}
