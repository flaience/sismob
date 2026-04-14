"use client";
import { useState, useEffect, Suspense } from "react";
import { User, MapPin, Save, ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useTenant } from "@/context/TenantContext";

// Componente interno para lidar com os parâmetros da URL
function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const papel = searchParams.get("papel") || "2";
  const idEdicao = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    documento: "",
    telefone: "",
    tipo: "f",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  // CARREGAR DADOS SE FOR EDIÇÃO
  useEffect(() => {
    if (idEdicao && tenant?.id) {
      api.get(`/pessoas/${idEdicao}`).then((res) => {
        const p = res.data;
        const e = p.enderecos?.[0] || {};
        setFormData({
          nome: p.nome,
          email: p.email,
          documento: p.documento,
          telefone: p.telefone,
          tipo: p.tipo,
          cep: e.cep || "",
          logradouro: e.logradouro || "",
          numero: e.numero || "",
          bairro: e.bairro || "",
          cidade: e.cidade || "",
          estado: e.estado || "",
        });
      });
    }
  }, [idEdicao, tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return alert("Imobiliária não identificada.");
    setLoading(true);
    try {
      const payload = { ...formData, papel, imobiliariaId: tenant.id };
      if (idEdicao) {
        await api.patch(`/pessoas/${idEdicao}`, payload);
        alert("Registro atualizado!");
      } else {
        await api.post("/pessoas", payload);
        alert("Registro criado com sucesso!");
      }
      router.back();
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-3xl font-black text-gray-900">
          {idEdicao ? "Editar Registro" : "Novo Cadastro"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
            <User size={20} /> Identificação
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Nome / Razão"
              className="p-4 bg-gray-50 rounded-2xl"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />
            <input
              required
              placeholder="E-mail"
              className="p-4 bg-gray-50 rounded-2xl"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              placeholder="CPF / CNPJ"
              className="p-4 bg-gray-50 rounded-2xl"
              value={formData.documento}
              onChange={(e) =>
                setFormData({ ...formData, documento: e.target.value })
              }
            />
            <select
              className="p-4 bg-gray-50 rounded-2xl"
              value={formData.tipo}
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value })
              }
            >
              <option value="f">Pessoa Física</option>
              <option value="j">Pessoa Jurídica</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
            <MapPin size={20} /> Endereço
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input
              placeholder="CEP"
              className="p-4 bg-gray-50 rounded-2xl"
              value={formData.cep}
              onChange={(e) =>
                setFormData({ ...formData, cep: e.target.value })
              }
            />
            <input
              placeholder="Rua"
              className="md:col-span-2 p-4 bg-gray-50 rounded-2xl"
              value={formData.logradouro}
              onChange={(e) =>
                setFormData({ ...formData, logradouro: e.target.value })
              }
            />
            <input
              placeholder="Nº"
              className="p-4 bg-gray-50 rounded-2xl"
              value={formData.numero}
              onChange={(e) =>
                setFormData({ ...formData, numero: e.target.value })
              }
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save />} SALVAR
          REGISTRO
        </button>
      </form>
    </div>
  );
}

// Página principal com Suspense (Exigência do Next.js para usar useSearchParams)
export default function NovoCadastroPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <FormContent />
    </Suspense>
  );
}
