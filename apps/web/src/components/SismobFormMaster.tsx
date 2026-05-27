"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, X, Plus, ChevronDown, Sparkles } from "lucide-react"; // Adicionado Sparkles
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import SismobButton from "./SismobButton";
import SismobUpload from "./SismobUpload";
import SismobAttributePicker from "./SismobAttributePicker"; // Import do
import SismobPaymentBuilder from "./SismobPaymentBuilder"; // Import
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

  // 1. INICIALIZAÇÃO BLINDADA: Resolve o problema do CEP inativo
  // Iniciamos o formData com o initialData (papel) e a estrutura de endereço pronta
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

  const [options, setOptions] = useState<any>({});
  const [errors, setErrors] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [showAttrPicker, setShowAttrPicker] = useState(false);

  // 2. SINCRONIA DE IDENTIDADE:
  // Garante que se você mudar de "Leads" para "Proprietários", o formulário
  // receba o novo 'papel' imediatamente sem precisar recarregar.
  useEffect(() => {
    if (initialData) {
      setFormData((prev: any) => ({
        ...prev,
        ...initialData,
        // Preserva o endereço se o usuário já começou a digitar
        endereco: prev.endereco || {
          cep: "",
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
        },
      }));
    }
  }, [initialData]);

  // 3. ATUALIZADOR INDUSTRIAL DE CAMPOS (Suporta 'endereco.cep')
  const updateField = (name: string, val: any) => {
    // 1. Mantém a sua lógica de limpar o erro visual
    setErrors((prev) => prev.filter((f) => f !== name));

    // 2. LÓGICA DE CAMADA (Suporte a endereco.cep, endereco.logradouro, etc.)
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev: any) => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}), // Preserva o que já foi digitado no endereço
          [child]: val, // Atualiza apenas o campo específico (ex: cep)
        },
      }));
    } else {
      // 3. LÓGICA SIMPLES (Para campos como 'nome', 'email', 'papel')
      setFormData((prev: any) => ({ ...prev, [name]: val }));
    }
  };

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
    // MOTOR DE AUTO-LOOKUP INDUSTRIAL v225
    sections?.forEach((section: any) => {
      section.fields.forEach(async (field: any) => {
        // 1. Só buscamos se for um Select/Checklist e não tiver opções fixas
        if (
          (field.type === "select" || field.type === "checklist") &&
          !field.options
        ) {
          try {
            let endpointLookup = "";
            let params: any = { imobiliariaId: tenant.id };

            // 2. REGRA DE ROTEAMENTO (Onde buscar cada dado)

            // Caso A: Busca o PAI (Categorias)
            if (field.name === "categoria_id") {
              endpointLookup = "/configuracoes/categorias-atributos";
            }
            // Caso B: Busca Proprietários (Papel 3)
            else if (field.name === "proprietario_id") {
              endpointLookup = "/pessoas";
              params.papel = "3";
            }
            // Caso C: Busca Unidades/Filiais
            else if (field.name === "unidade_id") {
              endpointLookup = "/configuracoes/unidades";
            }
            // Caso D: Regra Genérica (Remove o _id e pluraliza)
            else {
              const entity =
                field.entity ||
                field.name.replace("_id", "s").replace("_", "-");
              endpointLookup = `/configuracoes/${entity}`;
            }

            console.log(
              `📡 [SISMOB] Carregando lookup para ${field.label} em: ${endpointLookup}`,
            );

            const res = await api.get(endpointLookup, { params });

            // 3. GARANTIA DE FORMATO (Trata Array ou Objeto Único)
            const dados = Array.isArray(res.data)
              ? res.data
              : res.data
                ? [res.data]
                : [];

            setOptions((prev: any) => ({ ...prev, [field.name]: dados }));
          } catch (e) {
            console.warn(
              `⚠️ [SISMOB] Falha ao carregar opções para: ${field.name}`,
            );
          }
        }
      });
    });
  }, [tenant?.id, idEdicao, sections, endpoint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant?.id && !endpoint.includes("saas")) {
      alert("❌ ERRO CRÍTICO: Imobiliária não identificada.");
      return;
    }

    setLoading(true);

    try {
      // 1. HIGIENIZAÇÃO DO ENDEREÇO
      const cleanEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;

      // 2. MONTAGEM DA CARGA (PAYLOAD)
      const dadosParaEnviar = {
        ...formData,
        imobiliariaId: tenant?.id, // Injeta o ID da imobiliária logada
      };

      console.log(
        `🏭 [SISMOB] Enviando para: ${cleanEndpoint}`,
        dadosParaEnviar,
      );

      // 3. O DISPARO REAL (USANDO A VARIÁVEL CORRETA)
      const res = await api.post(cleanEndpoint, dadosParaEnviar);

      alert("✅ Registro salvo com sucesso!");
      router.back();
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message;
      alert(`⚠️ FALHA NO SERVIDOR (${status}):\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase leading-none">
              {idEdicao ? "Editar" : "Novo"} {title}
            </h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Engenharia Sismob • {tenant?.nome_conta || "Sismob"}
            </p>
          </div>
        </div>

        {/* BOTÃO DE AJUDA IA (MCP) */}
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
                // Lógica para valores aninhados (ex: endereco.cep) ou simples (ex: nome)
                const nameParts = field.name.split(".");
                const value = field.name.includes(".")
                  ? formData[nameParts[0]]?.[nameParts[1]] || ""
                  : formData[field.name] || "";

                // Define se o campo ocupa a linha toda (Mídia, Listas e Builders sempre ocupam)
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

                    {/* A. ATALHO DE IMAGEM / GALERIA */}
                    {field.type === "image" || field.type === "gallery" ? (
                      <SismobUpload
                        label={field.label}
                        value={formData[field.name]}
                        multiple={field.type === "gallery"}
                        onChange={(val: any) => updateField(field.name, val)}
                      />
                    ) : /* B. CARDÁPIO DE ATRIBUTOS (REUSÁVEL NO PORTAL) */
                    field.type === "checklist" ? (
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
                                  className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2 animate-in zoom-in"
                                >
                                  {attr?.quantidade}x {attr?.nome}
                                  <X
                                    size={12}
                                    className="cursor-pointer"
                                    onClick={() => {
                                      const newValue = formData[
                                        field.name
                                      ].filter((x: any) => x !== id);
                                      updateField(field.name, newValue);
                                    }}
                                  />
                                </span>
                              );
                            })
                          ) : (
                            <p className="text-slate-400 text-xs font-bold italic py-2 ml-4">
                              Nenhum diferencial selecionado ainda...
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAttrPicker(true)}
                          className="w-full p-8 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-4 group"
                        >
                          <Plus className="text-indigo-600 group-hover:rotate-90 transition-transform" />
                          <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">
                            Abrir Cardápio de Atributos
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
                    ) : /* C. PAYMENT BUILDER (O CORAÇÃO DA NEGOCIAÇÃO) */
                    field.type === "payment-builder" ? (
                      <SismobPaymentBuilder
                        value={formData[field.name]}
                        onChange={(val: any) => updateField(field.name, val)}
                      />
                    ) : /* D. SELEÇÃO (AUTO-LOOKUPS) */
                    field.type === "select" ? (
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
                      /* E. INPUTS PADRÃO (TEXTO, NÚMERO, DATA) */
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

        {/* 3. RODAPÉ COM BOTÃO INDUSTRIAL */}
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
