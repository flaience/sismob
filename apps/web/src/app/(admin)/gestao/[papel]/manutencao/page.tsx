"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Save, ArrowLeft, Loader2, User, MapPin, Building } from "lucide-react";
import api from "@/lib/api";
import { useTenant } from "@/context/TenantContext";
import { PAPEIS, PAPEIS_LABELS } from "@/lib/constants";

function FormPessoa() {
  const { papel: slug } = useParams();
  const searchParams = useSearchParams();
  const idEdicao = searchParams.get("id");
  const papelId = searchParams.get("papel"); // O número do papel
  const { tenant } = useTenant();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [unidades, setUnidades] = useState([]);
  const [formData, setFormData] = useState<any>({
    nome: "",
    email: "",
    documento: "",
    telefone: "",
    tipo: "f",
    unidade_id: "",
    endereco: {
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });

  const precisaEndereco = papelId !== PAPEIS.INTERESSADO;

  useEffect(() => {
    if (tenant?.id) {
      // Carrega unidades para o lookup
      api
        .get("/configuracoes/unidades", {
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
      const payload = {
        ...formData,
        papel: papelId,
        imobiliariaId: tenant?.id,
      };
      await api.post("/pessoas/save", payload);
      router.back();
    } catch (err) {
      alert("Erro ao salvar dados");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <header className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100"
        >
          <ArrowLeft />
        </button>
        <h1 className="text-3xl font-black text-gray-900">
          Manutenção: {PAPEIS_LABELS[papelId as string]}
        </h1>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: DADOS BÁSICOS */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            <User size={20} /> Dados Identificação
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Nome Completo
              </label>
              <input
                required
                className="w-full p-4 bg-gray-50 rounded-2xl"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
              />
            </div>

            {/* SE FOR EQUIPE (1), NÃO MOSTRA PF/PJ, MOSTRA CARGO */}
            {papelId === PAPEIS.EQUIPE ? (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Cargo / Função
                </label>
                <select
                  className="w-full p-4 bg-gray-50 rounded-2xl"
                  value={formData.cargo}
                  onChange={(e) =>
                    setFormData({ ...formData, cargo: e.target.value })
                  }
                >
                  <option value="corretor">Corretor</option>
                  <option value="secretaria">Secretária</option>
                  <option value="financeiro">Financeiro</option>
                  <option value="gerente">Gerente</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Tipo
                </label>
                <select
                  className="w-full p-4 bg-gray-50 rounded-2xl"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                >
                  <option value="f">Pessoa Física</option>
                  <option value="j">Pessoa Jurídica</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">
                CPF / Documento
              </label>
              <input
                required
                className="w-full p-4 bg-gray-50 rounded-2xl"
                value={formData.documento}
                onChange={(e) =>
                  setFormData({ ...formData, documento: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">
                Unidade / Filial
              </label>
              <select
                required
                className="w-full p-4 bg-gray-50 rounded-2xl"
                value={formData.unidade_id}
                onChange={(e) =>
                  setFormData({ ...formData, unidade_id: e.target.value })
                }
              >
                <option value="">Selecione a Filial...</option>
                {unidades.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: ENDEREÇO (CONDICIONAL) */}
        {precisaEndereco && (
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 font-bold">
              <MapPin size={20} /> Localização
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <input
                placeholder="CEP"
                className="p-4 bg-gray-50 rounded-2xl"
                value={formData.endereco?.cep}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endereco: { ...formData.endereco, cep: e.target.value },
                  })
                }
              />
              <div className="md:col-span-2">
                <input
                  placeholder="Logradouro"
                  className="p-4 bg-gray-50 rounded-2xl w-full"
                  value={formData.endereco?.logradouro}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endereco: {
                        ...formData.endereco,
                        logradouro: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <input
                placeholder="Nº"
                className="p-4 bg-gray-50 rounded-2xl"
                value={formData.endereco?.numero}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endereco: { ...formData.endereco, numero: e.target.value },
                  })
                }
              />
              <input
                placeholder="Bairro"
                className="p-4 bg-gray-50 rounded-2xl"
                value={formData.endereco?.bairro}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endereco: { ...formData.endereco, bairro: e.target.value },
                  })
                }
              />
              <input
                placeholder="Cidade"
                className="p-4 bg-gray-50 rounded-2xl"
                value={formData.endereco?.cidade}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endereco: { ...formData.endereco, cidade: e.target.value },
                  })
                }
              />
              <input
                placeholder="UF"
                className="p-4 bg-gray-50 rounded-2xl"
                value={formData.endereco?.estado}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    endereco: { ...formData.endereco, estado: e.target.value },
                  })
                }
              />
            </div>
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black shadow-xl hover:scale-[1.02] transition-all"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            "SALVAR REGISTRO COMPLETO"
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
