//src/app/(admin)/pessoas/manutencao/page.tsx
"use client";
import { useState, useEffect, Suspense } from "react";
import {
  User,
  MapPin,
  Save,
  ArrowLeft,
  Loader2,
  Phone,
  Fingerprint,
} from "lucide-react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useTenant } from "@/context/TenantContext";

function FormPessoa() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();

  // Captura o Papel (1, 2, 3 ou 4) e o ID (caso seja edição)
  const papel = searchParams.get("papel");
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

  // 1. CARREGA DADOS CASO SEJA EDIÇÃO
  useEffect(() => {
    if (idEdicao && tenant?.id) {
      api
        .get(`/pessoas/${idEdicao}`, { params: { imobiliariaId: tenant.id } })
        .then((res) => {
          const p = res.data;
          const e = p.enderecos?.[0] || {};
          setFormData({
            nome: p.nome || "",
            email: p.email || "",
            documento: p.documento || "",
            telefone: p.telefone || "",
            tipo: p.tipo || "f",
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

  // 2. ENVIO DOS DADOS (O que resolve o Erro 400)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return alert("Imobiliária não identificada.");

    setLoading(true);
    try {
      // O segredo do SaaS: Enviamos o papel e o ID da imobiliária dona do dado
      const payload = {
        ...formData,
        papel: papel || "2", // Default para Cliente caso falhe
        imobiliariaId: tenant.id,
      };

      if (idEdicao) {
        await api.patch(`/pessoas/${idEdicao}`, payload);
        alert("Alteração salva com sucesso!");
      } else {
        await api.post("/pessoas", payload);
        alert("Cadastro realizado com sucesso!");
      }
      router.back(); // Volta para o Grid (Proprietários/Clientes/etc)
    } catch (error: any) {
      const msg = error.response?.data?.message || "Erro desconhecido";
      alert("Erro 400/500: " + JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
          {idEdicao ? "Editar Registro" : "Novo Cadastro"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BLOCO 1: DADOS PESSOAIS */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
            <User size={20} /> Identificação Básica
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Nome Completo / Razão Social"
              className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />
            <input
              required
              placeholder="E-mail principal"
              type="email"
              className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              placeholder="CPF ou CNPJ"
              className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
              value={formData.documento}
              onChange={(e) =>
                setFormData({ ...formData, documento: e.target.value })
              }
            />
            <input
              placeholder="Telefone com DDD"
              className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
            />
          </div>
        </div>

        {/* BLOCO 2: ENDEREÇO */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
            <MapPin size={20} /> Endereço Completo
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input
              placeholder="CEP"
              className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
              value={formData.cep}
              onChange={(e) =>
                setFormData({ ...formData, cep: e.target.value })
              }
            />
            <input
              placeholder="Logradouro"
              className="md:col-span-2 p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
              value={formData.logradouro}
              onChange={(e) =>
                setFormData({ ...formData, logradouro: e.target.value })
              }
            />
            <input
              placeholder="Nº"
              className="p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-600"
              value={formData.numero}
              onChange={(e) =>
                setFormData({ ...formData, numero: e.target.value })
              }
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
          SALVAR DADOS NO SISMOB
        </button>
      </form>
    </div>
  );
}

// Exportação com Suspense obrigatório para o Next.js 15
export default function ManutencaoPage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center animate-pulse font-bold text-gray-400">
          Carregando interface...
        </div>
      }
    >
      <FormPessoa />
    </Suspense>
  );
}
