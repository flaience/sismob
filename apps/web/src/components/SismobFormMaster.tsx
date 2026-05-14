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

    // 1. HIGIENIZAÇÃO INDUSTRIAL: Limpa o array de atributos (converte para números puros)
    const atributosLimpos: number[] = Array.isArray(formData.atributos)
      ? formData.atributos
          .map((a: any) => (typeof a === "object" ? a.id : a))
          .map((val: any) => Number(val)) // Garante conversão numérica
          .filter((id: number) => !isNaN(id)) // <--- TIPAGEM ADICIONADA AQUI (Mata o erro TS7006)
      : [];

    // 2. MONTAGEM DO PAYLOAD: O que vai de fato para o servidor
    const dadosParaEnviar = {
      ...formData,
      atributos: atributosLimpos,
      imobiliariaId: tenant?.id,
    };

    // 3. MOTOR DE CONSISTÊNCIA: Valida no objeto higienizado
    const missingFields: string[] = [];
    sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        // Checa se o campo é obrigatório e se está vazio no dadosParaEnviar
        if (field.required && !dadosParaEnviar[field.name]) {
          missingFields.push(field.name);
        }
      });
    });

    if (missingFields.length > 0) {
      setErrors(missingFields);
      alert(
        "⚠️ Atenção: Preencha todos os campos obrigatórios marcados em vermelho.",
      );

      // Foca no primeiro campo com erro para agilidade industrial
      const firstError = document.getElementsByName(missingFields[0])[0];
      firstError?.focus();
      return;
    }

    // 4. TIRO DE MISERICÓRDIA: Envia os dados limpos
    setLoading(true);
    try {
      console.log("🏭 [SISMOB] Enviando dados higienizados:", dadosParaEnviar);

      await api.post(endpoint, dadosParaEnviar);

      alert("✅ Registro salvo com sucesso!");
      router.back();
    } catch (err: any) {
      console.error("❌ [ERRO DE GRAVAÇÃO]:", err);
      alert(
        `❌ Erro no Servidor: ${err.response?.data?.message || "Falha na persistência"}`,
      );
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
            className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {/* TÍTULO DA SEÇÃO COM IDENTIDADE SISMOB */}
            <h2 className="text-xl font-black text-slate-800 border-l-4 border-indigo-600 pl-6 uppercase tracking-tighter">
              {section.title}
            </h2>

            {/* CONTAINER FLEXÍVEL: Impede o caos de sobreposição */}
            <div className="flex flex-wrap gap-x-6 gap-y-10">
              {section.fields?.map((field: any) => {
                // Lógica para valores aninhados (ex: endereco.cep) ou simples (ex: nome)
                const nameParts = field.name.split(".");
                const value = field.name.includes(".")
                  ? formData[nameParts[0]]?.[nameParts[1]] || ""
                  : formData[field.name] || "";

                // Define se o campo ocupa a linha toda (Mídia e Listas sempre ocupam)
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
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ml-6 mb-3 block ${
                        isInvalid ? "text-red-500" : "text-slate-400"
                      }`}
                    >
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>

                    {/* 1. ATALHO DE IMAGEM / GALERIA */}
                    {field.type === "image" || field.type === "gallery" ? (
                      <SismobUpload
                        label={field.label}
                        value={formData[field.name]}
                        multiple={field.type === "gallery"}
                        onChange={(val: any) => updateField(field.name, val)}
                      />
                    ) : /* 2. CARDÁPIO DE ATRIBUTOS (O SEGREDO DA AGILIDADE) */
                    field.type === "checklist" ? (
                      <div className="w-full space-y-4">
                        <div className="flex justify-between items-end mb-2 px-6">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                            Toque nos itens para selecionar
                          </p>
                          <span className="bg-indigo-600 text-white text-[10px] px-4 py-1.5 rounded-full font-black shadow-lg">
                            {Array.isArray(formData[field.name])
                              ? formData[field.name].length
                              : 0}{" "}
                            SELECIONADOS
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-slate-100 p-8 rounded-[3.5rem] border border-slate-200 shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
                          {(options[field.name] || []).map((opt: any) => {
                            // GARANTIA DE TIPO: Forçamos ID numérico para o banco não dar erro de FK
                            const optId = Number(opt.id);
                            const currentSelection = Array.isArray(
                              formData[field.name],
                            )
                              ? formData[field.name]
                              : [];
                            const isSelected = currentSelection.includes(optId);

                            return (
                              <div
                                key={opt.id}
                                onClick={() => {
                                  const newValue = isSelected
                                    ? currentSelection.filter(
                                        (id: any) => Number(id) !== optId,
                                      )
                                    : [...currentSelection, optId];
                                  updateField(field.name, newValue);
                                }}
                                className={`
                          relative cursor-pointer p-5 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all duration-300 border-2
                          ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-400 shadow-xl scale-95"
                              : "bg-white border-transparent hover:border-indigo-200 shadow-sm hover:scale-105"
                          }
                        `}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                                  </div>
                                )}
                                <span
                                  className={`text-[10px] font-black uppercase mb-1 ${isSelected ? "text-indigo-200" : "text-indigo-600"}`}
                                >
                                  {opt.quantidade}x
                                </span>
                                <span
                                  className={`text-xs font-black uppercase tracking-tighter leading-none ${isSelected ? "text-white" : "text-slate-700"}`}
                                >
                                  {opt.nome}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : /* 3. SELEÇÃO (AUTO-LOOKUPS) */
                    field.type === "select" ? (
                      <div className="relative">
                        <select
                          className={`w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 transition-all outline-none appearance-none cursor-pointer focus:ring-2 ${
                            isInvalid
                              ? "ring-2 ring-red-500"
                              : "focus:ring-indigo-600"
                          }`}
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
                      /* 4. INPUTS PADRÃO (TEXTO, NÚMERO, DATA) */
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.label}
                        className={`w-full p-5 bg-slate-50 rounded-3xl border-none font-bold text-slate-700 transition-all outline-none focus:ring-2 ${
                          isInvalid
                            ? "ring-2 ring-red-500 bg-red-50"
                            : "focus:ring-indigo-600"
                        }`}
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
