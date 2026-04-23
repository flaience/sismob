"use client";
import { useState, useEffect, Suspense } from "react";
import {
  Home,
  Camera,
  Map,
  CheckCircle2,
  Save,
  Loader2,
  Plus,
  Trash2,
  Star,
  MapPin,
  Youtube,
  Ruler,
} from "lucide-react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useTenant } from "@/context/TenantContext";

function FormImovel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const idEdicao = searchParams.get("id");

  const [tab, setTab] = useState(1);
  const [loading, setLoading] = useState(false);
  const [proprietarios, setProprietarios] = useState([]);
  const [todosAtributos, setTodosAtributos] = useState([]);

  // ESTADOS DO FORMULÁRIO
  const [dados, setDados] = useState({
    titulo: "",
    descricao: "",
    tipo: "casa",
    preco_venda: "",
    area_privativa: "",
    endereco_original: "",
    proprietario_id: "",
    video_url: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [foto360Index, setFoto360Index] = useState<number | null>(null);
  const [capaIndex, setCapaIndex] = useState(0);
  const [selecionadosIds, setSelecionadosIds] = useState<number[]>([]);
  const [instrucoes, setInstrucoes] = useState([
    { ordem: 1, titulo: "", descricao: "" },
  ]);

  // 1. CARGA DE DADOS (Proprietários e Atributos)
  useEffect(() => {
    if (tenant?.id) {
      api
        .get("/pessoas", { params: { papel: "3", imobiliariaId: tenant.id } })
        .then((res) => setProprietarios(res.data));
      api
        .get("/configuracoes/atributos", {
          params: { imobiliariaId: tenant.id },
        })
        .then((res) => setTodosAtributos(res.data));

      if (idEdicao) {
        api
          .get(`/imoveis/${idEdicao}`, { params: { imobiliariaId: tenant.id } })
          .then((res) => {
            const i = res.data;
            setDados({ ...i });
            setInstrucoes(
              i.instrucoes || [{ ordem: 1, titulo: "", descricao: "" }],
            );
            setSelecionadosIds(
              i.atributos?.map((a: any) => a.atributo_id) || [],
            );
          });
      }
    }
  }, [tenant, idEdicao]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return alert("Tenant não identificado");
    setLoading(true);

    const formData = new FormData();
    formData.append("imobiliariaId", tenant.id);
    if (idEdicao) formData.append("id", idEdicao);

    // Anexa Dados Básicos
    Object.entries(dados).forEach(([key, val]) =>
      formData.append(key, String(val)),
    );

    // Anexa Atributos e Instruções
    formData.append("atributosIds", JSON.stringify(selecionadosIds));
    formData.append("instrucoes", JSON.stringify(instrucoes));

    // Anexa Mídias
    files.forEach((file, index) => {
      const field = foto360Index === index ? "foto360" : "galeria";
      formData.append(field, file);
      if (capaIndex === index) formData.append("capaNome", file.name);
    });

    try {
      await api.post("/imoveis", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Imóvel Salvo com Sucesso!");
      router.push("/");
    } catch (err) {
      alert("Erro ao salvar imóvel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
        {idEdicao ? "Editar Imóvel" : "Novo Imóvel"}
      </h1>

      {/* NAVEGAÇÃO POR ABAS */}
      <div className="flex bg-white p-2 rounded-[2rem] shadow-sm border border-gray-100 overflow-x-auto">
        {[
          { id: 1, label: "Dados", icon: Home },
          { id: 2, label: "Mídia", icon: Camera },
          { id: 3, label: "Atributos", icon: CheckCircle2 },
          { id: 4, label: "Percurso", icon: Map },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold transition-all whitespace-nowrap ${tab === t.id ? "bg-indigo-600 text-white shadow-lg" : "text-gray-400"}`}
          >
            <t.icon size={18} /> {t.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-50 min-h-[500px] relative"
      >
        {/* ABA 1: DADOS BÁSICOS */}
        {tab === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <input
              required
              placeholder="Título"
              className="w-full p-5 bg-gray-50 rounded-2xl"
              value={dados.titulo}
              onChange={(e) => setDados({ ...dados, titulo: e.target.value })}
            />
            <textarea
              placeholder="Descrição"
              className="w-full p-5 bg-gray-50 rounded-2xl h-32"
              value={dados.descricao}
              onChange={(e) =>
                setDados({ ...dados, descricao: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Preço"
                className="p-5 bg-gray-50 rounded-2xl"
                value={dados.preco_venda}
                onChange={(e) =>
                  setDados({ ...dados, preco_venda: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="m²"
                className="p-5 bg-gray-50 rounded-2xl"
                value={dados.area_privativa}
                onChange={(e) =>
                  setDados({ ...dados, area_privativa: e.target.value })
                }
              />
            </div>
            <select
              required
              className="w-full p-5 bg-gray-50 rounded-2xl"
              value={dados.proprietario_id}
              onChange={(e) =>
                setDados({ ...dados, proprietario_id: e.target.value })
              }
            >
              <option value="">Selecionar Proprietário</option>
              {proprietarios.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ABA 2: MÍDIAS */}
        {tab === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-2 border-dashed border-gray-100 p-10 rounded-[2rem] text-center">
              <input
                type="file"
                multiple
                className="hidden"
                id="upload"
                onChange={(e) =>
                  e.target.files &&
                  setFiles([...files, ...Array.from(e.target.files)])
                }
              />
              <label
                htmlFor="upload"
                className="cursor-pointer text-indigo-600 font-bold"
              >
                Clique para subir fotos normais e 360°
              </label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {files.map((f, i) => (
                <div
                  key={i}
                  className={`relative rounded-2xl overflow-hidden h-32 border-4 ${foto360Index === i ? "border-indigo-500" : "border-transparent"}`}
                >
                  <img
                    src={URL.createObjectURL(f)}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFoto360Index(i)}
                    className="absolute top-2 left-2 bg-white p-1 rounded-lg shadow-sm"
                  >
                    <Camera size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCapaIndex(i)}
                    className={`absolute top-2 right-2 p-1 rounded-lg shadow-sm ${capaIndex === i ? "bg-yellow-400" : "bg-white"}`}
                  >
                    <Star size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 3: ATRIBUTOS DINÂMICOS */}
        {tab === 3 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in">
            {todosAtributos.map((at: any) => (
              <label
                key={at.id}
                className={`p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${selecionadosIds.includes(at.id) ? "border-indigo-600 bg-indigo-50" : "border-gray-100"}`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selecionadosIds.includes(at.id)}
                  onChange={() => {
                    setSelecionadosIds((prev) =>
                      prev.includes(at.id)
                        ? prev.filter((x) => x !== at.id)
                        : [...prev, at.id],
                    );
                  }}
                />
                <span className="text-sm font-bold">{at.nome}</span>
              </label>
            ))}
          </div>
        )}

        {/* BOTÃO SALVAR FIXO NO RODAPÉ DO FORM */}
        <div className="mt-10 pt-10 border-t border-gray-50 flex justify-end">
          <button
            disabled={loading}
            className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save />} SALVAR
            IMÓVEL
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ManutencaoImovelPage() {
  return (
    <Suspense>
      <FormImovel />
    </Suspense>
  );
}
