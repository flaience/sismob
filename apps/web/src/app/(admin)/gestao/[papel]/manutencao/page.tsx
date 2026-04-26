"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Save, ArrowLeft, Loader2, User, MapPin, Building } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { PAPEIS_LABELS } from "@/lib/constants";

function FormPessoa() {
  const { papel } = useParams();
  const searchParams = useSearchParams();
  const idEdicao = searchParams.get("id");
  const { tenant } = useTenant();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [unidades, setUnidades] = useState([]); // Lista de filiais
  const [formData, setFormData] = useState<any>({
    nome: "",
    email: "",
    documento: "",
    telefone: "",
    unidade_id: "",
    tipo_entidade: "f",
  });

  // 1. CARREGA DADOS (Edição e Lista de Unidades)
  useEffect(() => {
    if (tenant?.id) {
      // Busca as filiais da imobiliária para o select
      api
        .get(`/configuracoes/unidades`, {
          params: { imobiliariaId: tenant.id },
        })
        .then((res) => setUnidades(res.data));

      if (idEdicao) {
        api
          .get(`/pessoas/${idEdicao}`, { params: { imobiliariaId: tenant.id } })
          .then((res) => setFormData(res.data));
      }
    }
  }, [idEdicao, tenant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, papel, imobiliariaId: tenant?.id };
      await api.post("/pessoas/save", payload);
      alert("Registro salvo!");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-3xl font-black text-gray-900">
          Manutenção de {PAPEIS_LABELS[papel as string]}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
            <User /> Dados Principais
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              placeholder="Nome / Razão"
              className="p-4 bg-gray-50 rounded-2xl outline-none"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
            />

            {/* SELECT DE UNIDADES (FILIAIS) */}
            <div className="relative">
              <Building
                className="absolute left-4 top-4 text-gray-400"
                size={18}
              />
              <select
                className="w-full pl-12 p-4 bg-gray-50 rounded-2xl outline-none appearance-none"
                value={formData.unidade_id}
                onChange={(e) =>
                  setFormData({ ...formData, unidade_id: e.target.value })
                }
              >
                <option value="">Selecionar Unidade/Filial</option>
                {unidades.map((un: any) => (
                  <option key={un.id} value={un.id}>
                    {un.nome}
                  </option>
                ))}
              </select>
            </div>

            <input
              required
              placeholder="E-mail"
              className="p-4 bg-gray-50 rounded-2xl outline-none"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <input
              placeholder="Telefone"
              className="p-4 bg-gray-50 rounded-2xl outline-none"
              value={formData.telefone}
              onChange={(e) =>
                setFormData({ ...formData, telefone: e.target.value })
              }
            />
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "SALVAR REGISTRO"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ManutencaoPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <FormPessoa />
    </Suspense>
  );
}
