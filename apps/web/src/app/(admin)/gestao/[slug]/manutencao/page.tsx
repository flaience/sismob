"use client";
import { useState, useEffect, Suspense } from "react";
import { User, MapPin, Save, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import api from "@/lib/api";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useTenant } from "@/context/TenantContext";

function FormPessoa() {
  const router = useRouter();
  const { slug } = useParams(); // 'corretores', 'proprietarios', etc.
  const searchParams = useSearchParams();
  const { tenant } = useTenant();

  const idEdicao = searchParams.get("id");
  const papel = searchParams.get("papel"); // '1', '2', '3', '4'

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({
    nome: "",
    email: "",
    documento: "",
    telefone: "",
    tipo_entidade: "f",
    cargo: "",
    senha: "",
    is_admin: false,
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  // 1. CARREGAMENTO INTELIGENTE
  useEffect(() => {
    if (idEdicao && tenant?.id) {
      api
        .get(`/pessoas/${idEdicao}`, { params: { imobiliariaId: tenant.id } })
        .then((res) =>
          setFormData({ ...res.data, ...res.data.enderecos?.[0] }),
        );
    }
  }, [idEdicao, tenant]);

  // 2. GRAVAÇÃO ASSERTIVA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // O método .save agora é único no backend (Inclusão ou Alteração)
      await api.post("/pessoas/save", {
        ...formData,
        papel,
        imobiliariaId: tenant.id,
      });
      alert("Registro salvo com sucesso!");
      router.back();
    } catch (error) {
      alert("Erro ao processar dados.");
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
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
          Manutenção de {slug}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold mb-4">
            <User /> Identificação
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
            {/* Se for Equipe (Papel 1), mostra campo de cargo e senha */}
            {papel === "1" && (
              <>
                <select
                  className="p-4 bg-gray-50 rounded-2xl"
                  value={formData.cargo}
                  onChange={(e) =>
                    setFormData({ ...formData, cargo: e.target.value })
                  }
                >
                  <option value="corretor">Corretor</option>
                  <option value="secretaria">Secretária</option>
                  <option value="financeiro">Financeiro</option>
                </select>
                {!idEdicao && (
                  <input
                    type="password"
                    placeholder="Senha de Acesso"
                    className="p-4 bg-gray-50 rounded-2xl"
                    onChange={(e) =>
                      setFormData({ ...formData, senha: e.target.value })
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
        {/* Adicione o bloco de endereço aqui (reutilizando o que já tínhamos) */}
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

export default function ManutencaoUniversal() {
  return (
    <Suspense>
      <FormPessoa />
    </Suspense>
  );
}
