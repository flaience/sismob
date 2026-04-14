"use client";
import { useState } from "react";
import { User, MapPin, Save, ArrowLeft, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useTenant } from "@/context/TenantContext";
import Link from "next/link";

export default function NovoCadastroPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();
  const papel = searchParams.get("papel") || "2";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant?.id) return alert("Imobiliária não identificada.");
    setLoading(true);
    try {
      await api.post("/pessoas", {
        ...formData,
        papel,
        imobiliariaId: tenant.id,
      });
      alert("Sucesso!");
      router.back();
    } catch (error) {
      alert("Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
          Novo Cadastro
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* DADOS CADASTRAIS */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 mb-4 text-indigo-600 font-bold">
            <User /> Identificação
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Nome / Razão Social"
              className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />
            <input
              required
              placeholder="E-mail"
              type="email"
              className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              placeholder="CPF / CNPJ"
              className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, documento: e.target.value })
              }
            />
            <select
              className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value })
              }
            >
              <option value="f">Física</option>
              <option value="j">Jurídica</option>
            </select>
          </div>
        </div>

        {/* ENDEREÇO */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 mb-4 text-indigo-600 font-bold">
            <MapPin /> Localização
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input
              placeholder="CEP"
              className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, cep: e.target.value })
              }
            />
            <input
              placeholder="Logradouro"
              className="md:col-span-2 p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, logradouro: e.target.value })
              }
            />
            <input
              placeholder="Nº"
              className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, numero: e.target.value })
              }
            />
            <input
              placeholder="Bairro"
              className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, bairro: e.target.value })
              }
            />
            <input
              placeholder="Cidade"
              className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, cidade: e.target.value })
              }
            />
            <input
              placeholder="UF"
              maxLength={2}
              className="p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600"
              onChange={(e) =>
                setFormData({ ...formData, estado: e.target.value })
              }
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save />} SALVAR
          REGISTRO
        </button>
      </form>
    </div>
  );
}
