"use client";
import { useState, useEffect } from "react";
import {
  Camera,
  Save,
  MapPin,
  Plus,
  Trash2,
  Home,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { PAPEIS } from "@/lib/constants";
import { useTenant } from "@/context/TenantContext";

export default function NovoImovelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [proprietarios, setProprietarios] = useState([]);

  // Estados do Formulário
  const [dados, setDados] = useState({
    titulo: "",
    descricao: "",
    tipo: "casa",
    precoVenda: "",
    areaPrivativa: "",
    enderecoOriginal: "",
    proprietarioId: "",
  });

  const [infra, setInfra] = useState({
    temAguaQuente: false,
    temEsperaSplit: false,
    mobiliado: false,
  });

  const [files, setFiles] = useState<File[]>([]);
  const [foto360Index, setFoto360Index] = useState<number | null>(null);

  const { tenant } = useTenant(); // Você já tem o tenant aqui

  useEffect(() => {
    async function carregarProprietarios() {
      if (!tenant?.id) return; // Espera o domínio ser identificado

      try {
        // Agora passamos o imobiliariaId direto na URL para a API aberta
        const res = await api.get("/pessoas", {
          params: {
            papel: "3",
            imobiliariaId: tenant.id, // <--- O SEGREDO DA VITÓRIA
          },
        });

        console.log("💎 Proprietários carregados com sucesso!");
        setProprietarios(res.data);
      } catch (error: any) {
        console.error(
          "❌ Falha ao buscar:",
          error.response?.data || error.message,
        );
      }
    }
    carregarProprietarios();
  }, [tenant]); // Executa assim que o tenant for descoberto

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removerFoto = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    if (foto360Index === index) setFoto360Index(null);
  };

  // 2. Envio do Formulário (Multipart/Form-Data)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // Anexa dados básicos
      Object.entries(dados).forEach(([key, val]) => formData.append(key, val));

      // Anexa infraestrutura como string (o NestJS vai converter)
      formData.append("temAguaQuente", String(infra.temAguaQuente));
      formData.append("temEsperaSplit", String(infra.temEsperaSplit));
      formData.append("mobiliado", String(infra.mobiliado));

      // Anexa arquivos e identifica qual é o 360
      files.forEach((file, index) => {
        formData.append("imagens", file);
        if (foto360Index === index) {
          formData.append("is360", file.name); // Envia o nome do arquivo que é 360
        }
      });

      await api.post("/imoveis", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Imóvel cadastrado com sucesso!");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar imóvel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
            Novo Imóvel
          </h1>
          <p className="text-gray-500">
            Cadastre os detalhes e prepare a experiência 360°.
          </p>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* COLUNA ESQUERDA: DADOS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Home size={20} className="text-indigo-600" /> Informações Básicas
            </h3>

            <input
              required
              placeholder="Título do Anúncio (Ex: Linda Cobertura no Centro)"
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) => setDados({ ...dados, titulo: e.target.value })}
            />

            <textarea
              placeholder="Descrição detalhada para o cliente..."
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 h-32"
              onChange={(e) =>
                setDados({ ...dados, descricao: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Preço de Venda (R$)"
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
                onChange={(e) =>
                  setDados({ ...dados, precoVenda: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Área Privativa (m²)"
                className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
                onChange={(e) =>
                  setDados({ ...dados, areaPrivativa: e.target.value })
                }
              />
            </div>

            <div className="relative">
              <MapPin
                className="absolute left-4 top-4 text-gray-400"
                size={20}
              />
              <input
                placeholder="Endereço Completo"
                className="w-full pl-12 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
                onChange={(e) =>
                  setDados({ ...dados, enderecoOriginal: e.target.value })
                }
              />
            </div>

            <select
              required
              className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setDados({ ...dados, proprietarioId: e.target.value })
              }
            >
              <option value="">Selecione o Proprietário...</option>
              {proprietarios.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.documento})
                </option>
              ))}
            </select>
          </div>

          {/* UPLOAD DE IMAGENS */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <Camera size={20} className="text-indigo-600" /> Galeria e Tour
              Virtual
            </h3>

            <div className="border-2 border-dashed border-gray-200 rounded-[2rem] p-10 text-center hover:border-indigo-400 transition-colors cursor-pointer relative">
              <input
                type="file"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <Plus className="mx-auto text-gray-300 mb-2" size={40} />
              <p className="text-gray-400 font-medium">
                Clique ou arraste as fotos aqui
              </p>
              <p className="text-xs text-gray-300 mt-1">
                Sua foto 360° também deve ser enviada aqui.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={`relative group rounded-2xl overflow-hidden border-2 ${foto360Index === index ? "border-indigo-600" : "border-transparent"}`}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    className="h-32 w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFoto360Index(index)}
                      className={`p-2 rounded-full ${foto360Index === index ? "bg-indigo-600 text-white" : "bg-white text-gray-900"} text-xs font-bold`}
                    >
                      {foto360Index === index ? "É TOUR 360" : "MARCAR 360"}
                    </button>
                    <button
                      type="button"
                      onClick={() => removerFoto(index)}
                      className="p-2 bg-red-500 text-white rounded-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: INFRA E SAVE */}
        <div className="space-y-6">
          <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl space-y-6">
            <h3 className="font-bold text-lg">Infraestrutura</h3>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-none bg-indigo-800"
                onChange={(e) =>
                  setInfra({ ...infra, temAguaQuente: e.target.checked })
                }
              />
              <span className="text-indigo-200 group-hover:text-white transition-colors">
                Água Quente
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-none bg-indigo-800"
                onChange={(e) =>
                  setInfra({ ...infra, temEsperaSplit: e.target.checked })
                }
              />
              <span className="text-indigo-200 group-hover:text-white transition-colors">
                Espera para Split
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="w-5 h-5 rounded border-none bg-indigo-800"
                onChange={(e) =>
                  setInfra({ ...infra, mobiliado: e.target.checked })
                }
              />
              <span className="text-indigo-200 group-hover:text-white transition-colors">
                Totalmente Mobiliado
              </span>
            </label>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:bg-gray-400"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={24} />
            )}
            SALVAR IMÓVEL
          </button>
        </div>
      </form>
    </div>
  );
}
